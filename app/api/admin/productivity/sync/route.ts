import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { endOfDay, startOfDay, subDays } from "date-fns";

/**
 * API to synchronize productivity data for a specific date.
 * If no date is provided, it defaults to yesterday.
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const targetDate = body.date ? new Date(body.date) : subDays(new Date(), 1);
        
        const start = startOfDay(targetDate);
        const end = endOfDay(targetDate);

        // 1. Get all users
        const users = await (db as any).tbl_users.findMany({
            select: { id: true }
        });

        const results = [];

        for (const user of users) {
            // 2. Aggregate time logs for this user on target date
            const logs = await (db as any).tbl_time_logs.findMany({
                where: {
                    userId: user.id,
                    date: {
                        gte: start,
                        lte: end
                    }
                }
            });

            const totalHours = logs.reduce((sum: number, log: any) => {
                const h = parseFloat(log.hours || "0");
                return sum + (isNaN(h) ? 0 : h);
            }, 0);

            if (totalHours > 0) {
                // Assuming 8 hours is 100% utilization
                const utilization = (totalHours / 8) * 100;

                // 3. Upsert to productivity table
                const record = await (db as any).tbl_productivity_daily.upsert({
                    where: {
                        userId_date: {
                            userId: user.id,
                            date: start
                        }
                    },
                    update: {
                        totalHours: totalHours.toFixed(2),
                        utilizationRate: utilization.toFixed(2)
                    },
                    create: {
                        userId: user.id,
                        date: start,
                        totalHours: totalHours.toFixed(2),
                        utilizationRate: utilization.toFixed(2)
                    }
                });
                results.push(record);
            }
        }

        // Log the sync action
        await (db as any).tbl_audit_logs.create({
            data: {
                userId: session.id,
                action: "PRODUCTIVITY_SYNC",
                resource: "analytics",
                details: `Synced productivity for ${start.toISOString().split('T')[0]}. Updated ${results.length} records.`
            }
        });

        return NextResponse.json({ 
            success: true, 
            date: start, 
            updatedCount: results.length 
        });

    } catch (error: any) {
        console.error("Productivity sync failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
