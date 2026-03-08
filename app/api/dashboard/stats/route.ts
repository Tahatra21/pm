import { db } from "@/lib/db";
import { projects, tasks, timeLogs } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const streamId = searchParams.get("streamId");
        const useStreamFilter = streamId && streamId !== "all";

        // 1. Total Work Hours
        const hoursConditions = [];
        if (useStreamFilter) {
            hoursConditions.push(eq(projects.streamId, streamId));
        }
        
        const allTimeLogs = await db.select({ hours: timeLogs.hours })
            .from(timeLogs)
            .innerJoin(tasks, eq(timeLogs.taskId, tasks.id))
            .innerJoin(projects, eq(tasks.projectId, projects.id))
            .where(and(...hoursConditions));
            
        const totalHoursValue = allTimeLogs.reduce((acc, curr) => acc + parseFloat(curr.hours), 0);
        
        // 2. Tasks Completed
        const tasksConditions = [eq(tasks.status, "done")];
        if (useStreamFilter) {
            tasksConditions.push(eq(projects.streamId, streamId));
        }
        
        const completedTasks = await db.select({ id: tasks.id })
            .from(tasks)
            .innerJoin(projects, eq(tasks.projectId, projects.id))
            .where(and(...tasksConditions));
        
        // 3. Total Active Projects
        const projectConditions = [];
        if (useStreamFilter) {
            projectConditions.push(eq(projects.streamId, streamId));
        }
        
        const allProjects = await db.select({ id: projects.id })
            .from(projects)
            .where(and(...projectConditions));
        
        // 4. Budget Utilization (Dummy logic: hours * 50 / 5000)
        const budgetUsage = Math.min(Math.round((totalHoursValue * 50 / 5000) * 100), 100);

        return NextResponse.json({
            totalWorkHours: totalHoursValue,
            tasksCompleted: completedTasks.length,
            activeProjects: allProjects.length,
            budgetUtilization: budgetUsage,
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
    }
}
