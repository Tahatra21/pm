import { db } from "@/lib/db";
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

        const count = await db.tbl_inbox_messages.count({
            where: {
                receiverId: user.id,
                status: "unread"
            }
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error("Inbox Count API Error:", error);
        return NextResponse.json({ count: 0 });
    }
}
