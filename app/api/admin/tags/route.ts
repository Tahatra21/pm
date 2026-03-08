import { db } from "@/lib/db";
import { projectTags } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { desc } from "drizzle-orm";

export async function GET() {
    try {
        const allTags = await db.select().from(projectTags).orderBy(desc(projectTags.createdAt));
        return NextResponse.json(allTags);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { code, name, category, sortOrder } = body;

        if (!code || !name) {
            return NextResponse.json({ error: "Code and name are required" }, { status: 400 });
        }

        const newTag = await db.insert(projectTags).values({
            id: randomUUID(),
            code,
            name,
            category: category || "general",
            sortOrder: sortOrder || "0",
            isActive: "true",
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        return NextResponse.json(newTag[0]);
    } catch (error: any) {
        if (error.code === '23505') {
            return NextResponse.json({ error: "Tag code must be unique" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create tag" }, { status: 500 });
    }
}
