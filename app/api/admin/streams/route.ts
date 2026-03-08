import { db } from "@/lib/db";
import { streams } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { desc } from "drizzle-orm";

export async function GET() {
    try {
        const allStreams = await db.select().from(streams).orderBy(desc(streams.createdAt));
        return NextResponse.json(allStreams);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch streams" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { code, name, description, sortOrder } = body;

        if (!code || !name) {
            return NextResponse.json({ error: "Code and name are required" }, { status: 400 });
        }

        const newStream = await db.insert(streams).values({
            id: randomUUID(),
            code,
            name,
            description,
            sortOrder: sortOrder || "0",
            isActive: "true",
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        return NextResponse.json(newStream[0]);
    } catch (error: any) {
        if (error.code === '23505') {
            return NextResponse.json({ error: "Stream code must be unique" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create stream" }, { status: 500 });
    }
}
