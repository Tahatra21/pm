import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();

        // Transactional restore
        await (db as any).$transaction(async (tx: any) => {
            // Clear existing data (selective)
            await tx.tbl_comments.deleteMany({});
            await tx.tbl_tasks.deleteMany({});
            await tx.tbl_projects.deleteMany({});
            await tx.tbl_streams.deleteMany({});
            await tx.tbl_project_tags.deleteMany({});

            // Restore Streams
            if (data.streams) {
                await tx.tbl_streams.createMany({ data: data.streams });
            }

            // Restore Tags
            if (data.tags) {
                await tx.tbl_project_tags.createMany({ data: data.tags });
            }

            // Restore Projects
            if (data.projects) {
                await tx.tbl_projects.createMany({ data: data.projects });
            }

            // Restore Tasks
            if (data.tasks) {
                await tx.tbl_tasks.createMany({ data: data.tasks });
            }
        });

        await (db as any).tbl_audit_logs.create({
            data: {
                userId: session.id,
                action: "SYSTEM_RESTORE",
                resource: "backup",
                details: "System data restored from backup file"
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Restore failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
