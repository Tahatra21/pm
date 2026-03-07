import { db } from "@/lib/db";
import { subtasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

// GET /api/subtasks?taskId=xxx
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const taskId = searchParams.get("taskId");
        if (!taskId) return NextResponse.json({ error: "taskId is required" }, { status: 400 });

        const results = await db.select().from(subtasks).where(eq(subtasks.taskId, taskId));
        // Sort by sortOrder
        results.sort((a, b) => parseInt(a.sortOrder || "0") - parseInt(b.sortOrder || "0"));

        return NextResponse.json(results.map(s => ({
            ...s,
            completed: s.completed === "true",
            sortOrder: parseInt(s.sortOrder || "0"),
        })));
    } catch (error) {
        console.error("Subtasks GET error:", error);
        return NextResponse.json({ error: "Failed to fetch subtasks" }, { status: 500 });
    }
}

// POST /api/subtasks — create subtask
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { taskId, title } = body;
        if (!taskId || !title) return NextResponse.json({ error: "taskId and title are required" }, { status: 400 });

        const id = randomUUID();
        // Get current count for sort order
        const existing = await db.select().from(subtasks).where(eq(subtasks.taskId, taskId));
        const sortOrder = String(existing.length);

        await db.insert(subtasks).values({
            id, taskId, title, completed: "false", sortOrder, createdAt: new Date(),
        });

        return NextResponse.json({ id, taskId, title, completed: false, sortOrder: parseInt(sortOrder), createdAt: new Date().toISOString() }, { status: 201 });
    } catch (error) {
        console.error("Subtasks POST error:", error);
        return NextResponse.json({ error: "Failed to create subtask" }, { status: 500 });
    }
}
