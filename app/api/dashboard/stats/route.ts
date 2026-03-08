import { db } from "@/lib/db";
import { projects, tasks, timeLogs, users } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const streamId = searchParams.get("streamId");
        const period = searchParams.get("period") || "weekly"; // weekly, monthly, yearly
        const useStreamFilter = streamId && streamId !== "all";

        // Calculate sinceDate based on period
        const sinceDate = new Date();
        if (period === "monthly") sinceDate.setMonth(sinceDate.getMonth() - 1);
        else if (period === "yearly") sinceDate.setFullYear(sinceDate.getFullYear() - 1);
        else sinceDate.setDate(sinceDate.getDate() - 7); // Default to weekly (7 days)

        // 1. Total Work Hours (filtered by period)
        const hoursConditions = [sql`${timeLogs.date} >= ${sinceDate.toISOString()}`];
        if (useStreamFilter) {
            hoursConditions.push(eq(projects.streamId, streamId));
        }
        
        const allTimeLogs = await db.select({ hours: timeLogs.hours })
            .from(timeLogs)
            .innerJoin(tasks, eq(timeLogs.taskId, tasks.id))
            .innerJoin(projects, eq(tasks.projectId, projects.id))
            .where(and(...hoursConditions));
            
        const totalHoursValue = allTimeLogs.reduce((acc, curr) => acc + parseFloat(curr.hours), 0);
        
        // 2. Tasks Completed (filtered by period)
        const tasksConditions = [
            eq(tasks.status, "done"),
            sql`${tasks.updatedAt} >= ${sinceDate.toISOString()}`
        ];
        if (useStreamFilter) {
            tasksConditions.push(eq(projects.streamId, streamId));
        }
        
        const completedTasks = await db.select({ id: tasks.id })
            .from(tasks)
            .innerJoin(projects, eq(tasks.projectId, projects.id))
            .where(and(...tasksConditions));
        
        // 3. Total Active Projects (projects modified or tasks modified in period)
        const projectConditions = [
            sql`(${projects.updatedAt} >= ${sinceDate.toISOString()} OR ${projects.createdAt} >= ${sinceDate.toISOString()})`
        ];
        if (useStreamFilter) {
            projectConditions.push(eq(projects.streamId, streamId));
        }
        
        const allProjects = await db.select({ id: projects.id })
            .from(projects)
            .where(and(...projectConditions));
        
        // 4. Attendance Rate (Users who logged time in selected period / Total Users)
        const totalUsers = await db.select({ id: users.id }).from(users);
        
        const activeUsersCount = await db.select({ userId: sql`distinct ${timeLogs.userId}` })
            .from(timeLogs)
            .where(sql`${timeLogs.date} >= ${sinceDate.toISOString()}`);
            
        const attendanceRate = totalUsers.length > 0 
            ? Math.round((activeUsersCount.length / totalUsers.length) * 100) 
            : 0;
 
        // 5. Completion Rate (Done Tasks in period / Total Tasks modified/created in period)
        const rateConditions = [
            sql`(${tasks.updatedAt} >= ${sinceDate.toISOString()} OR ${tasks.createdAt} >= ${sinceDate.toISOString()})`
        ];
        if (useStreamFilter) {
            rateConditions.push(eq(projects.streamId, streamId));
        }

        const allTasksForRate = await db.select({ status: tasks.status })
            .from(tasks)
            .innerJoin(projects, eq(tasks.projectId, projects.id))
            .where(and(...rateConditions));
            
        const doneTasksCount = allTasksForRate.filter(t => t.status === "done").length;
        const completionRate = allTasksForRate.length > 0
            ? Math.round((doneTasksCount / allTasksForRate.length) * 100)
            : 0;
            
        // 6. Budget Utilization (Keep existing logic or refine)
        const budgetUsage = Math.min(Math.round((totalHoursValue * 50 / 5000) * 100), 100);

        return NextResponse.json({
            totalWorkHours: totalHoursValue,
            tasksCompleted: completedTasks.length,
            activeProjects: allProjects.length,
            budgetUtilization: budgetUsage,
            attendanceRate,
            completionRate,
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
    }
}
