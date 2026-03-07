import { db } from "@/lib/db";
import { projects, projectMembers, tasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET /api/projects/[id]
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const project = db.select().from(projects).where(eq(projects.id, id)).get();
        if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

        const members = db.select({ userId: projectMembers.userId }).from(projectMembers).where(eq(projectMembers.projectId, id)).all();
        const allTasks = db.select().from(tasks).where(eq(tasks.projectId, id)).all();

        return NextResponse.json({
            ...project,
            members: members.map((m) => m.userId),
            taskCount: allTasks.length,
            completedCount: allTasks.filter((t) => t.status === "done").length,
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

        db.update(projects).set({
            ...(title !== undefined && { title }),
            ...(description !== undefined && { description }),
            ...(color !== undefined && { color }),
            updatedAt: new Date().toISOString(),
        }).where(eq(projects.id, id)).run();

        const updated = db.select().from(projects).where(eq(projects.id, id)).get();
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
    }
}

// DELETE /api/projects/[id]
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        db.delete(projects).where(eq(projects.id, id)).run();
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
    }
}
