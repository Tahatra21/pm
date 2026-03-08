import { db } from "@/lib/db";
import { meetings, tasks } from "@/lib/db/schema";
import { gte, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const now = new Date();
        
        // Upcoming meetings
        const upcomingMeetings = await db.select().from(meetings)
            .where(gte(meetings.startTime, now))
            .limit(5);
            
        // Urgent tasks due soon
        const pendingTasks = await db.select().from(tasks)
            .where(gte(tasks.dueDate, now))
            .limit(5);

        return NextResponse.json({
            meetings: upcomingMeetings,
            tasks: pendingTasks
        });
    } catch (error) {
        console.error("Schedules API Error:", error);
        return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
    }
}
