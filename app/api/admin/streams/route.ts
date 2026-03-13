import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { randomUUID } from "crypto";

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

        const level = session.hierarchyLevel || "L4";
        let whereClause: any = {};

        if (level !== "L1") {
            // L2, L3, L4 can only see streams they are members of
            const currentUser = await (db as any).tbl_users.findUnique({
                where: { id: session.id },
                include: { user_streams: { select: { streamId: true } } }
            });
            const streamIds = currentUser?.user_streams.map((us: any) => us.streamId) || [];
            if (streamIds.length > 0) {
                whereClause = { id: { in: streamIds } };
            } else {
                return NextResponse.json({ data: [], meta: { total: 0, page, limit, totalPages: 0 } });
            }
        }

        const [streams, total] = await Promise.all([
            (db as any).tbl_streams.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { sortOrder: 'asc' },
                include: {
                    _count: {
                        select: { projects: true }
                    }
                }
            }),
            (db as any).tbl_streams.count({ where: whereClause })
        ]);
        
        const formattedStreams = streams.map((stream: any) => ({
            ...stream,
            projectCount: stream._count.projects
        }));

        return NextResponse.json({
            data: formattedStreams,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to fetch streams" }, { status: 500 });
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
        const { code, name, description, sortOrder } = body;

        if (!code || !name) {
            return NextResponse.json({ error: "Code and name are required" }, { status: 400 });
        }

        const newStream = await (db as any).tbl_streams.create({
            data: {
                id: randomUUID(),
                code,
                name,
                description: description || "",
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
                action: "CREATE_STREAM",
                resource: "master_data",
                details: `Created stream: ${name} (${code})`
            }
        });

        return NextResponse.json(newStream);
    } catch (error: any) {
        console.error("Create Stream Error:", error);
        return NextResponse.json({ error: "Failed to create stream" }, { status: 500 });
    }
}
