import { db } from "@/lib/db";
import { comments, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

// GET /api/comments?taskId=xxx
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const taskId = searchParams.get("taskId");
        if (!taskId) return NextResponse.json({ error: "taskId is required" }, { status: 400 });

        const results = await db
            .select({
                id: comments.id,
                taskId: comments.taskId,
                userId: comments.userId,
                content: comments.content,
                type: comments.type,
                createdAt: comments.createdAt,
                userName: users.name,
                userColor: users.color,
            })
            .from(comments)
            .leftJoin(users, eq(comments.userId, users.id))
            .where(eq(comments.taskId, taskId))
            .orderBy(comments.createdAt);

        return NextResponse.json(results);
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
        await db.insert(comments).values({
            id, taskId, userId, content, type: type || "comment", createdAt: new Date(),
        });

        // Return the comment with user info
        const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        const user = userResult[0];

        return NextResponse.json({
            id, taskId, userId, content, type: type || "comment",
            createdAt: new Date().toISOString(),
            userName: user?.name || "Unknown",
            userColor: user?.color || "#6366f1",
        }, { status: 201 });
    } catch (error) {
        console.error("Comments POST error:", error);
        return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
    }
}
