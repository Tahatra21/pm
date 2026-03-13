import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { getServerSession } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Check for VIEW_DATA permission
        if (!session.permissions?.includes("VIEW_DATA")) {
            return NextResponse.json({ error: "No permission to view data" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const [tags, total] = await Promise.all([
            (db as any).tbl_project_tags.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            (db as any).tbl_project_tags.count()
        ]);

        return NextResponse.json({
            data: tags,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Check for ADMIN_PRIVILEGE for master data management
        if (!session.permissions?.includes("ADMIN_PRIVILEGE")) {
            return NextResponse.json({ error: "No permission to manage master data" }, { status: 403 });
        }

        const body = await request.json();
        const { code, name, category, sortOrder } = body;

        if (!code || !name) {
            return NextResponse.json({ error: "Code and name are required" }, { status: 400 });
        }

        const newTag = await (db as any).tbl_project_tags.create({
            data: {
                id: randomUUID(),
                code,
                name,
                category: category || "general",
                sortOrder: sortOrder || "0",
                isActive: "true",
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        });

        // Log action
        await (db as any).tbl_audit_logs.create({
            data: {
                userId: session.id,
                action: "CREATE_TAG",
                resource: "master_data",
                details: `Created tag: ${name} (${code})`
            }
        });

        return NextResponse.json(newTag);
    } catch (error: any) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return NextResponse.json({ error: "Tag code must be unique" }, { status: 400 });
            }
        }
        console.error(error);
        return NextResponse.json({ error: "Failed to create tag" }, { status: 500 });
    }
}
