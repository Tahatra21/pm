import { db } from "@/lib/db";
import { timeLogs, employeesTable, tasks, projects } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isWithinInterval } from "date-fns";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const streamId = searchParams.get("streamId");
        const useStreamFilter = streamId && streamId !== "all";

        const now = new Date();
        const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
        const end = endOfWeek(now, { weekStartsOn: 1 });
        
        const days = eachDayOfInterval({ start, end });
        
        // Fetch logs with stream filtering if applicable
        let logsQuery = db.select({
            id: timeLogs.id,
            date: timeLogs.date,
            hours: timeLogs.hours,
        })
        .from(timeLogs)
        .innerJoin(tasks, eq(timeLogs.taskId, tasks.id))
        .innerJoin(projects, eq(tasks.projectId, projects.id));

        if (useStreamFilter) {
            logsQuery = logsQuery.where(eq(projects.streamId, streamId)) as any;
        }

        const logs = await logsQuery;
        const activeEmployees = await db.select().from(employeesTable).where(eq(employeesTable.status, "active"));
        const teamSize = Math.max(activeEmployees.length, 1);
        const dailyCapacity = teamSize * 8;
        
        const chartData = days.map(day => {
            const dayStr = format(day, "yyyy-MM-dd");
            const dayLogs = logs.filter(l => format(new Date(l.date), "yyyy-MM-dd") === dayStr);
            const totalHours = dayLogs.reduce((acc, curr) => acc + parseFloat(curr.hours || "0"), 0);
            const utilization = Math.round((totalHours / dailyCapacity) * 100);
            
            return {
                day: format(day, "EEE"),
                date: dayStr,
                hours: totalHours,
                percentage: Math.min(utilization || 0, 100),
                utilization: utilization || 0
            };
        });

        const weekLogs = chartData.filter(d => d.hours > 0);
        const totalWeeklyHours = weekLogs.reduce((acc, curr) => acc + curr.hours, 0);
        
        let peakDay = { day: "N/A", utilization: 0 };
        let lowestDay = { day: "N/A", utilization: 0 };

        if (weekLogs.length > 0) {
            const sorted = [...weekLogs].sort((a, b) => b.utilization - a.utilization);
            peakDay = { day: sorted[0].day, utilization: sorted[0].utilization };
            lowestDay = { day: sorted[sorted.length - 1].day, utilization: sorted[sorted.length - 1].utilization };
        }

        const overloadedCount = weekLogs.filter(d => d.utilization > 90).length;
        const underutilizedCount = weekLogs.filter(d => d.utilization < 70).length;

        const response = {
            chart: chartData,
            stats: {
                totalWeeklyHours,
                peakDay,
                lowestDay,
                workloadBalance: {
                    overloaded: overloadedCount,
                    underutilized: underutilizedCount,
                    optimal: Math.max(teamSize - overloadedCount - underutilizedCount, 0)
                }
            },
            debug: {
                now: format(now, "yyyy-MM-dd HH:mm:ss"),
                start: format(start, "yyyy-MM-dd"),
                end: format(end, "yyyy-MM-dd"),
                totalLogsInDb: logs.length,
                teamSize,
                streamId: streamId || "all"
            }
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Productivity API Error:", error);
        return NextResponse.json({ error: "Failed to fetch productivity data", details: String(error) }, { status: 500 });
    }
}
