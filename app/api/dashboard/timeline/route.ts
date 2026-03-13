import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const streamId = searchParams.get("streamId");
        const status = searchParams.get("status");
        const useStreamFilter = streamId && streamId !== "all";
        const useStatusFilter = status && status !== "all";

        const timelineTasks = await db.tbl_tasks.findMany({
            where: {
                startDate: { not: null },
                ...(useStreamFilter && {
                    projects: {
                        streamId: streamId
                    }
                }),
                ...(useStatusFilter && {
                    status: status
                })
            },
            select: {
                id: true,
                title: true,
                startDate: true,
                dueDate: true,
                status: true,
                projectId: true,
            }
        });

        return NextResponse.json(timelineTasks);
    } catch (error) {
        console.error("Timeline API Error:", error);
        return NextResponse.json({ error: "Failed to fetch timeline tasks" }, { status: 500 });
    }
}
