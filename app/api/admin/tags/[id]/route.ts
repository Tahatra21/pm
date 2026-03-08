import { db } from "@/lib/db";
import { projectTags } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { code, name, category, sortOrder, isActive } = body;

        const updated = await db.update(projectTags)
            .set({ 
                code, 
                name, 
                category, 
                sortOrder, 
                isActive, 
                updatedAt: new Date() 
            })
            .where(eq(projectTags.id, id))
            .returning();

        if (updated.length === 0) {
            return NextResponse.json({ error: "Tag not found" }, { status: 404 });
        }

        return NextResponse.json(updated[0]);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update tag" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        
        await db.update(projectTags)
            .set({ isActive: "false", updatedAt: new Date() })
            .where(eq(projectTags.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete tag" }, { status: 500 });
    }
}
