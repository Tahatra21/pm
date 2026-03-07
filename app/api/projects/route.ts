import { db } from "@/lib/db";
import { projects, projectMembers, tasks } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

// GET /api/projects — list all projects with member count and task stats
export async function GET() {
    try {
        const allProjects = db
            .select({
                id: projects.id,
                title: projects.title,
                description: projects.description,
                color: projects.color,
                createdAt: projects.createdAt,
                updatedAt: projects.updatedAt,
            })
            .from(projects)
            .all();

        const result = allProjects.map((p) => {
            const members = db.select({ userId: projectMembers.userId }).from(projectMembers).where(eq(projectMembers.projectId, p.id)).all();
            const allTasks = db.select({ status: tasks.status }).from(tasks).where(eq(tasks.projectId, p.id)).all();
            return {
                ...p,
                members: members.map((m) => m.userId),
                taskCount: allTasks.length,
                completedCount: allTasks.filter((t) => t.status === "done").length,
            };
        });

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
    }
}

// POST /api/projects — create a new project
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, color, members } = body;

        if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

        const id = randomUUID();
        db.insert(projects).values({
            id, title, description: description || "", color: color || "#6366f1",
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        }).run();

        if (members && Array.isArray(members)) {
            for (const userId of members) {
                db.insert(projectMembers).values({ id: randomUUID(), projectId: id, userId }).run();
            }
        }

        return NextResponse.json({ id, title, description, color }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
    }
}
