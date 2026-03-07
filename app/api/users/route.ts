import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET /api/users — list all users (exclude password hash)
export async function GET() {
    try {
        const allUsers = db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                avatar: users.avatar,
                color: users.color,
                createdAt: users.createdAt,
            })
            .from(users)
            .all();

        return NextResponse.json(allUsers);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
