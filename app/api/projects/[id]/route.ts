import { db } from "@/lib/db";
import { projects, projectMembers, tasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { calculateProgress } from "@/lib/utils";

// GET /api/projects/[id]
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const projResult = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
        const project = projResult[0];
        if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

        const members = await db.select({ userId: projectMembers.userId }).from(projectMembers).where(eq(projectMembers.projectId, id));
        const allTasks = await db.select().from(tasks).where(eq(tasks.projectId, id));

        return NextResponse.json({
            ...project,
            members: members.map((m) => m.userId),
            taskCount: allTasks.length,
            completedCount: allTasks.filter((t) => t.status === "done").length,
            progress: calculateProgress(allTasks),
            tasks: allTasks,
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
    }
}

// PUT /api/projects/[id]
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, description, color } = body;

        await db.update(projects).set({
            ...(title !== undefined && { title }),
            ...(description !== undefined && { description }),
            ...(color !== undefined && { color }),
            updatedAt: new Date(),
        }).where(eq(projects.id, id));

        const updatedResult = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
        const updated = updatedResult[0];
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
    }
}

// DELETE /api/projects/[id]
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await db.delete(projects).where(eq(projects.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
    }
}
