import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { calculateProgress } from "@/lib/utils";
import { getServerSession } from "@/lib/auth";

// GET /api/projects — list all projects with member count and task stats
export async function GET() {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        if (!session.permissions?.includes("VIEW_DATA")) {
            return NextResponse.json({ error: "No permission to view data" }, { status: 403 });
        }

        let whereClause: any = {};

        const level = session.hierarchyLevel || "L4";

        if (level === "L1") {
            whereClause = {};
        } else if (level === "L2" || level === "L3") {
            const currentUser = await (db as any).tbl_users.findUnique({
                where: { id: session.id },
                include: { user_streams: { select: { streamId: true } } }
            });

            const authorizedStreamIds = currentUser?.user_streams.map((us: any) => us.streamId) || [];
            if (authorizedStreamIds.length > 0) {
                whereClause = { streamId: { in: authorizedStreamIds } };
            } else {
                return NextResponse.json([]);
            }
        } else {
            whereClause = {
                project_members: {
                    some: { userId: session.id }
                }
            };
        }

        const result = await (db as any).tbl_projects.findMany({
            where: whereClause,
            include: {
                project_members: {
                    select: {
                        userId: true,
                        users: {
                            select: { id: true, name: true, color: true, avatar: true }
                        }
                    }
                },
                tasks: { select: { status: true } },
                project_tag_relations: { select: { tagId: true } },
            }
        });

        const formattedResult = result.map((p: any) => {
            const streamId = p.streamId !== undefined ? p.streamId : p.stream_id;
            const createdAt = p.createdAt !== undefined ? p.createdAt : p.created_at;
            const updatedAt = p.updatedAt !== undefined ? p.updatedAt : p.updated_at;

            const members = p.project_members || [];
            const tags = p.project_tag_relations || [];
            const tasks = p.tasks || [];

            return {
                id: p.id,
                title: p.title,
                description: p.description,
                color: p.color,
                streamId,
                createdAt,
                updatedAt,
                members: members.map((m: any) => m.userId || m.user_id),
                memberDetails: members
                    .map((m: any) => m.users)
                    .filter(Boolean)
                    .map((u: any) => ({
                        id: u.id,
                        name: u.name,
                        color: u.color || "#6366f1",
                        avatar: u.avatar,
                    })),
                tags: tags.map((t: any) => t.tagId || t.tag_id),
                taskCount: tasks.length,
                completedCount: tasks.filter((t: any) => t.status === "done").length,
                progress: calculateProgress(tasks as any),
            };
        });

        return NextResponse.json(formattedResult);
    } catch (error: any) {
        console.error("API GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
    }
}

// POST /api/projects — create a new project
export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        if (!session.permissions?.includes("EDIT_DATA")) {
            return NextResponse.json({ error: "No permission to create projects" }, { status: 403 });
        }

        const body = await request.json();
        const { title: bodyTitle, name, description, color, members, streamId, tags } = body;
        const title = bodyTitle || name;

        if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
        const id = randomUUID();
        const effectiveStreamId = streamId || "st1";

        const newProject = await (db as any).tbl_projects.create({
            data: {
                id,
                title,
                description: description || "",
                color: color || "#6366f1",
                streamId: effectiveStreamId,
                createdAt: new Date(),
                updatedAt: new Date(),
                project_members: {
                    create: (members || []).map((userId: string) => ({
                        id: randomUUID(),
                        userId,
                    })),
                },
                project_tag_relations: {
                    create: (tags || []).map((tagId: string) => ({
                        id: randomUUID(),
                        tagId,
                    })),
                },
            },
        });

        return NextResponse.json({ id, title, description, color, streamId, tags }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
    }
}
