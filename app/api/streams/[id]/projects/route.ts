import { db } from "@/lib/db";
import { streams, projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Verify stream exists
        const stream = await db.select().from(streams).where(eq(streams.id, id)).limit(1);
        
        if (!stream || stream.length === 0) {
            return NextResponse.json({ error: "Stream not found" }, { status: 404 });
        }

        // 2. Fetch all projects belonging to this stream
        const streamProjects = await db
            .select()
            .from(projects)
            .where(eq(projects.streamId, id));

        // Note: For a fully optimized query we could join tasks to get counts,
        // but for now we'll just return the projects array.
        return NextResponse.json({
            stream: stream[0],
            projects: streamProjects
        });

    } catch (error: any) {
        console.error("DEBUG - Stream Projects Error:", error);
        return NextResponse.json({ 
            error: "Failed to fetch stream projects",
            message: error.message
        }, { status: 500 });
    }
}
