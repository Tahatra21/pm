import { db } from "@/lib/db";
import { tasks, projects } from "@/lib/db/schema";
import { eq, isNotNull, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const streamId = searchParams.get("streamId");
        const useStreamFilter = streamId && streamId !== "all";

        const conditions = [isNotNull(tasks.startDate)];
        if (useStreamFilter) {
            conditions.push(eq(projects.streamId, streamId));
        }

        const timelineTasks = await db.select({
            id: tasks.id,
            title: tasks.title,
            startDate: tasks.startDate,
            dueDate: tasks.dueDate,
            status: tasks.status,
            projectId: tasks.projectId,
        })
            .from(tasks)
            .innerJoin(projects, eq(tasks.projectId, projects.id))
            .where(and(...conditions));
            
        return NextResponse.json(timelineTasks);
    } catch (error) {
        console.error("Timeline API Error:", error);
        return NextResponse.json({ error: "Failed to fetch timeline tasks" }, { status: 500 });
    }
}
