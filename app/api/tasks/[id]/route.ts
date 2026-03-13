import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/tasks/[id]
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const task = await db.tbl_tasks.findUnique({
            where: { id }
        });
        if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
        return NextResponse.json(task);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
    }
}

// PUT /api/tasks/[id] — update task (including status changes for drag-and-drop)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updateData: any = { updatedAt: new Date() };
        const allowedFields = ["title", "description", "status", "priority", "assigneeId", "dueDate", "startDate", "tags", "gitLink"];
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                if (field === "tags") {
                    updateData[field] = typeof body[field] === "string" ? body[field] : JSON.stringify(body[field]);
                } else if (field === "dueDate" || field === "startDate") {
                    updateData[field] = body[field] ? new Date(body[field]) : null;
                } else {
                    updateData[field] = body[field];
                }
            }
        }

        const updated = await db.tbl_tasks.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
    }
}

// DELETE /api/tasks/[id]
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await db.tbl_tasks.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
    }
}
