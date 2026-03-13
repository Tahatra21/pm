import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { code, name, category, sortOrder, isActive } = body;

        const updated = await (db as any).tbl_project_tags.update({
            where: { id },
            data: {
                code,
                name,
                category,
                sortOrder,
                isActive,
                updatedAt: new Date()
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update tag" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        await (db as any).tbl_project_tags.update({
            where: { id },
            data: { isActive: "false", updatedAt: new Date() }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to delete tag" }, { status: 500 });
    }
}
