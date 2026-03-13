import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/users — list all users (exclude password hash)
export async function GET() {
    try {
        const allUsers = await db.tbl_users.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                color: true,
            }
        });

        return NextResponse.json(allUsers);
    } catch (error) {
        console.error("Users GET error:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
