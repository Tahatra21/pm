import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from "date-fns";

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
        const logs = await (db as any).tbl_time_logs.findMany({
            where: {
                ...(useStreamFilter && {
                    tasks: {
                        projects: {
                            streamId: streamId
                        }
                    }
                })
            },
            select: {
                id: true,
                date: true,
                hours: true
            }
        });

        const activeUsers = await (db as any).tbl_users.findMany({
            where: { status: "active" }
        });
        const teamSize = Math.max(activeUsers.length, 1);
        const dailyCapacity = teamSize * 8;

        const chartData = days.map(day => {
            const formatStr = intervalType === 'days' ? "yyyy-MM-dd" : "yyyy-MM";
            const dayStr = format(day, formatStr);
            const label = intervalType === 'days' ? format(day, "EEE") : format(day, "MMM");

            const matches = logs.filter((l: any) => format(new Date(l.date), formatStr) === dayStr);
            const totalHours = matches.reduce((acc: number, curr: any) => acc + parseFloat(curr.hours || "0"), 0);
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
