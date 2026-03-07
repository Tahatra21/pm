import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

// GET /api/tasks?projectId=xxx
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get("projectId");
        const assigneeId = searchParams.get("assigneeId");
        const status = searchParams.get("status");

        let query = db.select().from(tasks);

        let results = query.all();

        if (projectId) results = results.filter((t) => t.projectId === projectId);
        if (assigneeId) results = results.filter((t) => t.assigneeId === assigneeId);
        if (status) results = results.filter((t) => t.status === status);

        return NextResponse.json(results);
    } catch (error) {
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
        db.insert(tasks).values({
            id, projectId, title,
            description: description || "",
            status: taskStatus || "todo",
            priority: priority || "medium",
            assigneeId: assigneeId || null,
            dueDate: dueDate || null,
            startDate: startDate || null,
            tags: tags ? JSON.stringify(tags) : null,
            gitLink: gitLink || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }).run();

        const created = db.select().from(tasks).where(eq(tasks.id, id)).get();
        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
    }
}
