import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

// GET /api/tasks?projectId=xxx
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get("projectId");
        const assigneeId = searchParams.get("assigneeId");
        const status = searchParams.get("status");

        const results = await db.tbl_tasks.findMany({
            where: {
                ...(projectId && { projectId }),
                ...(assigneeId && { assigneeId }),
                ...(status && { status }),
            }
        });

        return NextResponse.json(results);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
    }
}

// POST /api/tasks — create a new task
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { projectId, title, description, status: taskStatus, priority, assigneeId, dueDate, startDate, tags, gitLink } = body;

        if (!projectId || !title) return NextResponse.json({ error: "projectId and title are required" }, { status: 400 });

        const id = randomUUID();
        const created = await db.tbl_tasks.create({
            data: {
                id,
                projectId,
                title,
                description: description || "",
                status: taskStatus || "todo",
                priority: priority || "medium",
                assigneeId: assigneeId || null,
                dueDate: dueDate ? new Date(dueDate) : null,
                startDate: startDate ? new Date(startDate) : null,
                tags: tags ? JSON.stringify(tags) : null,
                gitLink: gitLink || null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        });

        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
    }
}
