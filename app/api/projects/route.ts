import { db } from "@/lib/db";
import { projects, projectMembers, tasks, projectTagRelations } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { calculateProgress } from "@/lib/utils";
import { Project } from "@/lib/types";

// GET /api/projects — list all projects with member count and task stats
export async function GET() {
    try {
        const allProjects = await db
            .select({
                id: projects.id,
                title: projects.title,
                description: projects.description,
                color: projects.color,
                streamId: projects.streamId,
                createdAt: projects.createdAt,
                updatedAt: projects.updatedAt,
            })
            .from(projects);

        const resultPromises = allProjects.map(async (p: any) => {
            const members = await db.select({ userId: projectMembers.userId }).from(projectMembers).where(eq(projectMembers.projectId, p.id));
            const allTasks = await db.select({ status: tasks.status }).from(tasks).where(eq(tasks.projectId, p.id));
            const tags = await db.select({ tagId: projectTagRelations.tagId }).from(projectTagRelations).where(eq(projectTagRelations.projectId, p.id));
            return {
                ...p,
                members: members.map((m: any) => m.userId),
                tags: tags.map((t: any) => t.tagId),
                taskCount: allTasks.length,
                completedCount: allTasks.filter((t: any) => t.status === "done").length,
                progress: calculateProgress(allTasks as any),
            };
        });

        const result = await Promise.all(resultPromises);

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
    }
}

// POST /api/projects — create a new project
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, color, members, streamId, tags } = body;

        if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
        if (!streamId) return NextResponse.json({ error: "Stream is required" }, { status: 400 });

        const id = randomUUID();
        await db.insert(projects).values({
            id, title, description: description || "", color: color || "#6366f1",
            streamId,
            createdAt: new Date(), updatedAt: new Date(),
        });

        if (members && Array.isArray(members)) {
            for (const userId of members) {
                await db.insert(projectMembers).values({ id: randomUUID(), projectId: id, userId });
            }
        }

        if (tags && Array.isArray(tags)) {
            for (const tagId of tags) {
                await db.insert(projectTagRelations).values({ id: randomUUID(), projectId: id, tagId });
            }
        }

        return NextResponse.json({ id, title, description, color, streamId, tags }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
    }
}
