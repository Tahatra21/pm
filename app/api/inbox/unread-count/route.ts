import { db } from "@/lib/db";
import { inboxMessages } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("session_token")?.value;
        if (!token) return NextResponse.json({ count: 0 });

        const user = await getSession(token);
        if (!user) return NextResponse.json({ count: 0 });

        const unreadCount = await db.select({ count: sql`count(*)` })
            .from(inboxMessages)
            .where(
                and(
                    eq(inboxMessages.receiverId, user.id),
                    eq(inboxMessages.status, "unread")
                )
            );

        // Drizzle sql count returns as string or object depending on driver, 
        // but for pg-core usually we need to handle it or use a simpler approach if possible
        const count = await db.$count(inboxMessages, and(
            eq(inboxMessages.receiverId, user.id),
            eq(inboxMessages.status, "unread")
        ));

        return NextResponse.json({ count });
    } catch (error) {
        console.error("Inbox Count API Error:", error);
        return NextResponse.json({ count: 0 });
    }
}
