import { db } from "@/lib/db";
import { timeLogs, employeesTable, tasks, projects } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isWithinInterval } from "date-fns";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const streamId = searchParams.get("streamId");
        const period = searchParams.get("period") || "weekly";
        const useStreamFilter = streamId && streamId !== "all";

        const now = new Date();
        let start: Date;
        let end = now;
        let intervalType: 'days' | 'months' = 'days';

        if (period === "monthly") {
            start = new Date();
            start.setDate(now.getDate() - 30);
        } else if (period === "yearly") {
            start = new Date();
            start.setFullYear(now.getFullYear() - 1);
            intervalType = 'months';
        } else {
            // Default weekly
            start = startOfWeek(now, { weekStartsOn: 1 });
            end = endOfWeek(now, { weekStartsOn: 1 });
        }
        
        const days = intervalType === 'days' 
            ? eachDayOfInterval({ start, end })
            : Array.from({ length: 12 }, (_, i) => {
                const d = new Date(start);
                d.setMonth(start.getMonth() + i + 1);
                return d;
            });
        
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
            const formatStr = intervalType === 'days' ? "yyyy-MM-dd" : "yyyy-MM";
            const dayStr = format(day, formatStr);
            const label = intervalType === 'days' ? format(day, "EEE") : format(day, "MMM");
            
            const matches = logs.filter(l => format(new Date(l.date), formatStr) === dayStr);
            const totalHours = matches.reduce((acc, curr) => acc + parseFloat(curr.hours || "0"), 0);
            const utilization = Math.round((totalHours / dailyCapacity) * 100);
            
            return {
                day: label,
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
