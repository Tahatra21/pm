import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inboxMessages, users } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "u1"; // Default to u1 for demo

    try {
        const messages = await db.select({
            id: inboxMessages.id,
            subject: inboxMessages.subject,
            message: inboxMessages.message,
            status: inboxMessages.status,
            createdAt: inboxMessages.createdAt,
            senderName: users.name,
            senderAvatar: users.avatar,
        })
        .from(inboxMessages)
        .leftJoin(users, eq(inboxMessages.senderId, users.id))
        .where(eq(inboxMessages.receiverId, userId))
        .orderBy(inboxMessages.createdAt);

        return NextResponse.json(messages);
    } catch (error) {
        console.error("Inbox GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { senderId, receiverId, subject, message } = body;

        if (!senderId || !receiverId || !subject || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newMessage = await db.insert(inboxMessages).values({
            id: randomUUID(),
            senderId,
            receiverId,
            subject,
            message,
            status: "unread",
            createdAt: new Date(),
        }).returning();

        return NextResponse.json(newMessage[0]);
    } catch (error) {
        console.error("Inbox POST Error:", error);
        return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const updated = await db.update(inboxMessages)
            .set({ status })
            .where(eq(inboxMessages.id, id))
            .returning();

        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error("Inbox PATCH Error:", error);
        return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
    }
}
