import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

// GET /api/subtasks?taskId=xxx  OR  ?projectId=xxx
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const taskId = searchParams.get("taskId");
        const projectId = searchParams.get("projectId");

        if (!taskId && !projectId) {
            return NextResponse.json({ error: "taskId or projectId is required" }, { status: 400 });
        }

        let results;
        if (projectId) {
            // Fetch all subtasks for all tasks belonging to a project
            results = await db.tbl_subtasks.findMany({
                where: {
                    tasks: {
                        projectId,
                    }
                },
                select: {
                    id: true,
                    taskId: true,
                    completed: true,
                    sortOrder: true,
                },
                orderBy: { sortOrder: "asc" }
            });
        } else {
            results = await db.tbl_subtasks.findMany({
                where: { taskId: taskId! },
                orderBy: { sortOrder: "asc" }
            });
        }

        return NextResponse.json(results.map((s: any) => ({
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

        // Get current count for sort order
        const count = await db.tbl_subtasks.count({
            where: { taskId }
        });
        const sortOrder = String(count);

        const newSubtask = await db.tbl_subtasks.create({
            data: {
                id: randomUUID(),
                taskId,
                title,
                completed: "false",
                sortOrder,
                createdAt: new Date(),
            }
        });

        return NextResponse.json({
            ...newSubtask,
            completed: false,
            sortOrder: parseInt(sortOrder),
            createdAt: newSubtask.createdAt.toISOString()
        }, { status: 201 });
    } catch (error) {
        console.error("Subtasks POST error:", error);
        return NextResponse.json({ error: "Failed to create subtask" }, { status: 500 });
    }
}
