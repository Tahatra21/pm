import { db } from "@/lib/db";
import { streams } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { code, name, description, sortOrder, isActive } = body;

        const updated = await db.update(streams)
            .set({ 
                code, 
                name, 
                description, 
                sortOrder, 
                isActive, 
                updatedAt: new Date() 
            })
            .where(eq(streams.id, id))
            .returning();

        if (updated.length === 0) {
            return NextResponse.json({ error: "Stream not found" }, { status: 404 });
        }

        return NextResponse.json(updated[0]);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update stream" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        // Rules: stream/tag yang sudah dipakai project tidak boleh hard delete
        // For now, let's stick to status inactive or just block if in use.
        // Actually, md/stream.md says: "stream/tag yang sudah dipakai project tidak boleh hard delete"
        // We'll implement a soft delete or just toggle isActive.
        
        await db.update(streams)
            .set({ isActive: "false", updatedAt: new Date() })
            .where(eq(streams.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete stream" }, { status: 500 });
    }
}
