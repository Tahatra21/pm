import { db } from "@/lib/db";
import { subtasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// PUT /api/subtasks/[id] — toggle completed or update title
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updateData: Record<string, unknown> = {};
        if (body.completed !== undefined) updateData.completed = body.completed ? "true" : "false";
        if (body.title !== undefined) updateData.title = body.title;

        await db.update(subtasks).set(updateData).where(eq(subtasks.id, id));

        const result = await db.select().from(subtasks).where(eq(subtasks.id, id)).limit(1);
        const item = result[0];
        if (!item) return NextResponse.json({ error: "Subtask not found" }, { status: 404 });

        return NextResponse.json({
            ...item,
            completed: item.completed === "true",
            sortOrder: parseInt(item.sortOrder || "0"),
        });
    } catch (error) {
        console.error("Subtask PUT error:", error);
        return NextResponse.json({ error: "Failed to update subtask" }, { status: 500 });
    }
}

// DELETE /api/subtasks/[id]
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await db.delete(subtasks).where(eq(subtasks.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Subtask DELETE error:", error);
        return NextResponse.json({ error: "Failed to delete subtask" }, { status: 500 });
    }
}
