import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inboxMessages, users } from "@/lib/db/schema";
import { eq, or, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "u1"; 
    const contactId = searchParams.get("contactId");

    try {
        if (contactId) {
            // Fetch history between two users
            const messages = await db.select({
                id: inboxMessages.id,
                subject: inboxMessages.subject,
                message: inboxMessages.message,
                status: inboxMessages.status,
                createdAt: inboxMessages.createdAt,
                senderId: inboxMessages.senderId,
                senderName: users.name,
                senderAvatar: users.avatar,
            })
            .from(inboxMessages)
            .leftJoin(users, eq(inboxMessages.senderId, users.id))
            .where(
                or(
                    and(eq(inboxMessages.senderId, userId), eq(inboxMessages.receiverId, contactId)),
                    and(eq(inboxMessages.senderId, contactId), eq(inboxMessages.receiverId, userId))
                )
            )
            .orderBy(inboxMessages.createdAt);

            return NextResponse.json(messages);
        }

        // Default: Fetch all received messages (inbox list)
        const messages = await db.select({
            id: inboxMessages.id,
            subject: inboxMessages.subject,
            message: inboxMessages.message,
            status: inboxMessages.status,
            createdAt: inboxMessages.createdAt,
            senderId: inboxMessages.senderId,
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

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
        }

        await db.delete(inboxMessages).where(eq(inboxMessages.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Inbox DELETE Error:", error);
        return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
    }
}
