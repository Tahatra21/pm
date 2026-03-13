import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    try {
        const results = await db.tbl_schedules.findMany({
            where: {
                ...(projectId && { projectId })
            },
            include: {
                projects: {
                    select: {
                        title: true
                    }
                },
                users: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: { startTime: "asc" }
        });

        const formattedResults = results.map(s => ({
            id: s.id,
            title: s.title,
            startTime: s.startTime,
            endTime: s.endTime,
            projectId: s.projectId,
            projectTitle: s.projects?.title || null,
            assignedTo: s.assignedTo,
            assignedName: s.users?.name || null,
        }));

        return NextResponse.json(formattedResults);
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

        const newSchedule = await db.tbl_schedules.create({
            data: {
                id: randomUUID(),
                projectId,
                title,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                assignedTo,
                createdAt: new Date(),
            }
        });

        return NextResponse.json(newSchedule);
    } catch (error) {
        console.error("Schedules POST Error:", error);
        return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 });
    }
}
