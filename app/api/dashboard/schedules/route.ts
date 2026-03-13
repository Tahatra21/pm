import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const now = new Date();

        // Upcoming meetings
        const upcomingMeetings = await db.tbl_meetings.findMany({
            where: {
                startTime: { gte: now }
            },
            take: 5
        });

        // Urgent tasks due soon
        const pendingTasks = await db.tbl_tasks.findMany({
            where: {
                dueDate: { gte: now }
            },
            take: 5
        });

        return NextResponse.json({
            meetings: upcomingMeetings,
            tasks: pendingTasks
        });
    } catch (error) {
        console.error("Schedules API Error:", error);
        return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
    }
}
