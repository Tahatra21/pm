import { db } from "@/lib/db";
import { tasks, projects } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const streamId = searchParams.get("streamId");
        const useStreamFilter = streamId && streamId !== "all";

        const conditions = [];
        if (useStreamFilter) {
            conditions.push(eq(projects.streamId, streamId));
        }

        const allTasks = await db.select({ status: tasks.status })
            .from(tasks)
            .innerJoin(projects, eq(tasks.projectId, projects.id))
            .where(and(...conditions));
        
        const total = allTasks.length;
        const counts = {
            todo: allTasks.filter(t => t.status === "todo").length,
            review: allTasks.filter(t => t.status === "review").length,
            "in-progress": allTasks.filter(t => t.status === "in-progress").length,
            done: allTasks.filter(t => t.status === "done").length,
        };

        const percentages = {
            todo: total > 0 ? Math.round((counts.todo / total) * 100) : 0,
            review: total > 0 ? Math.round((counts.review / total) * 100) : 0,
            progress: total > 0 ? Math.round((counts["in-progress"] / total) * 100) : 0,
            done: total > 0 ? Math.round((counts.done / total) * 100) : 0,
        };

        return NextResponse.json({
            total,
            counts,
            percentages
        });
    } catch (error) {
        console.error("Summary API Error:", error);
        return NextResponse.json({ error: "Failed to fetch project summary" }, { status: 500 });
    }
}
