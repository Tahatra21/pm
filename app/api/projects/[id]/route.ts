import { db } from "@/lib/db";
import { projects, projectMembers, tasks, projectTagRelations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { calculateProgress } from "@/lib/utils";
import { randomUUID } from "crypto";

// GET /api/projects/[id]
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const projResult = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
        const project = projResult[0];
        if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

        const members = await db.select({ userId: projectMembers.userId }).from(projectMembers).where(eq(projectMembers.projectId, id));
        const allTasks = await db.select().from(tasks).where(eq(tasks.projectId, id));
        const tags = await db.select({ tagId: projectTagRelations.tagId }).from(projectTagRelations).where(eq(projectTagRelations.projectId, id));

        return NextResponse.json({
            ...project,
            members: members.map((m: any) => m.userId),
            tags: tags.map((t: any) => t.tagId),
            taskCount: allTasks.length,
            completedCount: allTasks.filter((t: any) => t.status === "done").length,
            progress: calculateProgress(allTasks as any),
            tasks: allTasks,
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

        await db.update(projects).set({
            ...(title !== undefined && { title }),
            ...(description !== undefined && { description }),
            ...(color !== undefined && { color }),
            ...(streamId !== undefined && { streamId }),
            updatedAt: new Date(),
        }).where(eq(projects.id, id));

        if (tags !== undefined && Array.isArray(tags)) {
            await db.delete(projectTagRelations).where(eq(projectTagRelations.projectId, id));
            for (const tagId of tags) {
                await db.insert(projectTagRelations).values({ id: randomUUID(), projectId: id, tagId });
            }
        }

        const updatedResult = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
        const updated = updatedResult[0];
        const currentTags = await db.select({ tagId: projectTagRelations.tagId }).from(projectTagRelations).where(eq(projectTagRelations.projectId, id));

        return NextResponse.json({
            ...updated,
            tags: currentTags.map((t: any) => t.tagId)
        });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
    }
}

// DELETE /api/projects/[id]
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await db.delete(projects).where(eq(projects.id, id));
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
    }
}
