import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "u1";
    const contactId = searchParams.get("contactId");

    try {
        if (contactId) {
            // Fetch history between two users
            const results = await db.tbl_inbox_messages.findMany({
                where: {
                    OR: [
                        { senderId: userId, receiverId: contactId },
                        { senderId: contactId, receiverId: userId }
                    ]
                },
                include: {
                    users_inbox_messages_sender_idTousers: {
                        select: {
                            name: true,
                            avatar: true
                        }
                    }
                },
                orderBy: { createdAt: "asc" }
            });

            const formattedMessages = results.map(m => ({
                id: m.id,
                subject: m.subject,
                message: m.message,
                status: m.status,
                createdAt: m.createdAt,
                senderId: m.senderId,
                senderName: m.users_inbox_messages_sender_idTousers?.name || "Unknown",
                senderAvatar: m.users_inbox_messages_sender_idTousers?.avatar || "",
            }));

            return NextResponse.json(formattedMessages);
        }

        // Default: Fetch all received messages (inbox list)
        const results = await db.tbl_inbox_messages.findMany({
            where: { receiverId: userId },
            include: {
                users_inbox_messages_sender_idTousers: {
                    select: {
                        name: true,
                        avatar: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        const formattedMessages = results.map(m => ({
            id: m.id,
            subject: m.subject,
            message: m.message,
            status: m.status,
            createdAt: m.createdAt,
            senderId: m.senderId,
            senderName: m.users_inbox_messages_sender_idTousers?.name || "Unknown",
            senderAvatar: m.users_inbox_messages_sender_idTousers?.avatar || "",
        }));

        return NextResponse.json(formattedMessages);
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

        const newMessage = await db.tbl_inbox_messages.create({
            data: {
                id: randomUUID(),
                senderId,
                receiverId,
                subject,
                message,
                status: "unread",
                createdAt: new Date(),
            }
        });

        return NextResponse.json(newMessage);
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

        const updated = await db.tbl_inbox_messages.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json(updated);
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

        await db.tbl_inbox_messages.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Inbox DELETE Error:", error);
        return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
    }
}
