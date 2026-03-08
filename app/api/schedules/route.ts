import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { schedules, projects, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    try {
        let query = db.select({
            id: schedules.id,
            title: schedules.title,
            startTime: schedules.startTime,
            endTime: schedules.endTime,
            projectId: schedules.projectId,
            projectTitle: projects.title,
            assignedTo: schedules.assignedTo,
            assignedName: users.name,
        })
        .from(schedules)
        .leftJoin(projects, eq(schedules.projectId, projects.id))
        .leftJoin(users, eq(schedules.assignedTo, users.id));

        if (projectId) {
            query = (query as any).where(eq(schedules.projectId, projectId));
        }

        const data = await query.orderBy(schedules.startTime);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Schedules GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { projectId, title, startTime, endTime, assignedTo } = body;

        if (!title || !startTime || !endTime) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newSchedule = await db.insert(schedules).values({
            id: randomUUID(),
            projectId,
            title,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            assignedTo,
            createdAt: new Date(),
        }).returning();

        return NextResponse.json(newSchedule[0]);
    } catch (error) {
        console.error("Schedules POST Error:", error);
        return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 });
    }
}
