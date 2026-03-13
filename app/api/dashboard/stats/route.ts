import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Check for VIEW_DATA permission
        if (!session.permissions?.includes("VIEW_DATA")) {
            return NextResponse.json({ error: "No permission to view data" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        let streamId = searchParams.get("streamId");
        const period = searchParams.get("period") || "weekly"; // weekly, monthly, yearly

        const level = session.hierarchyLevel || "L4";
        let useStreamFilter = false;
        let effectiveStreamFilter: any = {};
        let userSpecificFilter: any = {};

        if (level === "L1") {
            if (streamId && streamId !== "all") {
                useStreamFilter = true;
                effectiveStreamFilter = { streamId };
            }
        } else if (level === "L2" || level === "L3") {
            const currentUser = await (db as any).tbl_users.findUnique({
                where: { id: session.id },
                include: { user_streams: { select: { streamId: true } } }
            });
            
            const authorizedIds = currentUser?.user_streams.map((us: any) => us.streamId) || [];
            if (streamId && streamId !== "all") {
                if (authorizedIds.includes(streamId)) {
                    useStreamFilter = true;
                    effectiveStreamFilter = { streamId };
                } else {
                    return NextResponse.json({ totalWorkHours: 0, tasksCompleted: 0, activeProjects: 0, attendanceRate: 0, completionRate: 0 });
                }
            } else {
                useStreamFilter = true;
                effectiveStreamFilter = { streamId: { in: authorizedIds } };
            }
        } else {
            // L4: Staff only see their own data
            userSpecificFilter = { userId: session.id };
            // For tasks/projects, they must be a member or assigned
            // But stats usually show personal metrics for L4
        }

        // Calculate sinceDate based on period
        const sinceDate = new Date();
        if (period === "monthly") sinceDate.setMonth(sinceDate.getMonth() - 1);
        else if (period === "yearly") sinceDate.setFullYear(sinceDate.getFullYear() - 1);
        else sinceDate.setDate(sinceDate.getDate() - 7); // Default to weekly (7 days)

        // 1. Total Work Hours
        const allTimeLogs = await (db as any).tbl_time_logs.findMany({
            where: {
                date: { gte: sinceDate },
                ...(level === "L4" ? { userId: session.id } : {}),
                ...(useStreamFilter && { tasks: { projects: effectiveStreamFilter } })
            },
            select: { hours: true }
        });
        const totalHoursValue = allTimeLogs.reduce((acc: number, curr: any) => acc + parseFloat(curr.hours || "0"), 0);

        // 2. Tasks Completed
        const completedTasksCount = await (db as any).tbl_tasks.count({
            where: {
                status: "done",
                updatedAt: { gte: sinceDate },
                ...(level === "L4" ? { assigneeId: session.id } : {}),
                ...(useStreamFilter && { projects: effectiveStreamFilter })
            }
        });

        // 3. Total Active Projects
        const activeProjectsCount = await (db as any).tbl_projects.count({
            where: {
                OR: [
                    { updatedAt: { gte: sinceDate } },
                    { createdAt: { gte: sinceDate } }
                ],
                ...(level === "L4" ? { project_members: { some: { userId: session.id } } } : {}),
                ...(useStreamFilter && effectiveStreamFilter)
            }
        });

        // 4. Attendance Rate (Only for Managers+)
        let attendanceRate = 0;
        if (level === "L1" || level === "L2" || level === "L3") {
            const totalUsersCount = await (db as any).tbl_users.count();
            const activeUsers = await (db as any).tbl_time_logs.groupBy({
                by: ['userId'],
                where: { date: { gte: sinceDate } }
            });
            attendanceRate = totalUsersCount > 0 ? Math.round((activeUsers.length / totalUsersCount) * 100) : 0;
        } else {
            // For L4, maybe individual attendance consistency? Let's just return 100 if logged in recently or 0.
            const myLogs = await (db as any).tbl_time_logs.count({ where: { userId: session.id, date: { gte: sinceDate } } });
            attendanceRate = myLogs > 0 ? 100 : 0;
        }

        // 5. Completion Rate
        const allTasksForRate = await (db as any).tbl_tasks.findMany({
            where: {
                OR: [
                    { updatedAt: { gte: sinceDate } },
                    { createdAt: { gte: sinceDate } }
                ],
                ...(level === "L4" ? { assigneeId: session.id } : {}),
                ...(useStreamFilter && { projects: effectiveStreamFilter })
            },
            select: { status: true }
        });
        const doneTasksCount = allTasksForRate.filter((t: any) => t.status === "done").length;
        const completionRate = allTasksForRate.length > 0 ? Math.round((doneTasksCount / allTasksForRate.length) * 100) : 0;

        return NextResponse.json({
            totalWorkHours: totalHoursValue,
            tasksCompleted: completedTasksCount,
            activeProjects: activeProjectsCount,
            attendanceRate,
            completionRate,
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
    }
}