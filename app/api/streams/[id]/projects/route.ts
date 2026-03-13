import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Verify stream exists
        const stream = await db.tbl_streams.findUnique({
            where: { id }
        });

        if (!stream) {
            return NextResponse.json({ error: "Stream not found" }, { status: 404 });
        }

        // 2. Fetch all projects belonging to this stream
        const streamProjects = await db.tbl_projects.findMany({
            where: { streamId: id }
        });

        // Note: For a fully optimized query we could join tasks to get counts,
        // but for now we'll just return the projects array.
        return NextResponse.json({
            stream: stream,
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
