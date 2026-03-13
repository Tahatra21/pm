import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

// GET /api/comments?taskId=xxx
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const taskId = searchParams.get("taskId");
        if (!taskId) return NextResponse.json({ error: "taskId is required" }, { status: 400 });

        const results = await db.tbl_comments.findMany({
            where: { taskId },
            include: {
                users: {
                    select: {
                        name: true,
                        color: true
                    }
                }
            },
            orderBy: { createdAt: "asc" }
        });

        const formattedResults = results.map(c => ({
            id: c.id,
            taskId: c.taskId,
            userId: c.userId,
            content: c.content,
            type: c.type,
            createdAt: c.createdAt,
            userName: c.users.name,
            userColor: c.users.color,
        }));

        return NextResponse.json(formattedResults);
    } catch (error) {
        console.error("Comments GET error:", error);
        return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
    }
}

// POST /api/comments — create comment
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { taskId, userId, content, type } = body;
        if (!taskId || !userId || !content) {
            return NextResponse.json({ error: "taskId, userId, and content are required" }, { status: 400 });
        }

        const id = randomUUID();
        const comment = await db.tbl_comments.create({
            data: {
                id,
                taskId,
                userId,
                content,
                type: type || "comment",
                createdAt: new Date(),
            },
            include: {
                users: {
                    select: {
                        name: true,
                        color: true
                    }
                }
            }
        });

        return NextResponse.json({
            id: comment.id,
            taskId: comment.taskId,
            userId: comment.userId,
            content: comment.content,
            type: comment.type,
            createdAt: comment.createdAt.toISOString(),
            userName: comment.users.name || "Unknown",
            userColor: comment.users.color || "#6366f1",
        }, { status: 201 });
    } catch (error) {
        console.error("Comments POST error:", error);
        return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
    }
}
