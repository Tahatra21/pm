import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { calculateProgress } from "@/lib/utils";
import { randomUUID } from "crypto";

// GET /api/projects/[id]
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const project = await db.tbl_projects.findUnique({
            where: { id },
            include: {
                project_members: { select: { userId: true } },
                tasks: true,
                project_tag_relations: { select: { tagId: true } },
            }
        });

        if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

        return NextResponse.json({
            ...project,
            members: project.project_members.map((m: any) => m.userId),
            tags: project.project_tag_relations.map((t: any) => t.tagId),
            taskCount: project.tasks.length,
            completedCount: project.tasks.filter((t: any) => t.status === "done").length,
            progress: calculateProgress(project.tasks as any),
            tasks: project.tasks,
        });
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: "Failed to fetch project", detail: error.message }, { status: 500 });
    }
}

// PUT /api/projects/[id]
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, description, color, streamId, tags } = body;

        const updateData: any = {
            ...(title !== undefined && { title }),
            ...(description !== undefined && { description }),
            ...(color !== undefined && { color }),
            ...(streamId !== undefined && { streamId }),
            updatedAt: new Date(),
        };

        if (tags !== undefined && Array.isArray(tags)) {
            // Use transaction for tag updates
            await db.$transaction([
                db.tbl_project_tag_relations.deleteMany({ where: { projectId: id } }),
                db.tbl_project_tag_relations.createMany({
                    data: tags.map(tagId => ({
                        id: randomUUID(),
                        projectId: id,
                        tagId,
                    }))
                })
            ]);
        }

        const updated = await db.tbl_projects.update({
            where: { id },
            data: updateData,
            include: {
                project_tag_relations: { select: { tagId: true } }
            }
        });

        return NextResponse.json({
            ...updated,
            tags: updated.project_tag_relations.map((t: any) => t.tagId)
        });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
    }
}

// DELETE /api/projects/[id]
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await db.tbl_projects.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
    }
}
