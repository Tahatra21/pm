import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// PUT /api/subtasks/[id] — toggle completed or update title
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updateData: Record<string, any> = {};
        if (body.completed !== undefined) updateData.completed = body.completed ? "true" : "false";
        if (body.title !== undefined) updateData.title = body.title;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No update data provided" }, { status: 400 });
        }

        const item = await db.tbl_subtasks.update({
            where: { id },
            data: updateData
        });

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
        await db.tbl_subtasks.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Subtask DELETE error:", error);
        return NextResponse.json({ error: "Failed to delete subtask" }, { status: 500 });
    }
}
