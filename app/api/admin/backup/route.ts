import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Generate full system backup as JSON
        const data = {
            projects: await db.tbl_projects.findMany(),
            tasks: await db.tbl_tasks.findMany(),
            users: await db.tbl_users.findMany({ select: { id: true, name: true, email: true, role: true } }),
            streams: await db.tbl_streams.findMany(),
            tags: await db.tbl_project_tags.findMany(),
            timestamp: new Date().toISOString(),
            version: "1.0"
        };

        // Log the backup action
        await db.tbl_audit_logs.create({
            data: {
                userId: session.id,
                action: "SYSTEM_BACK_UP",
                resource: "backup",
                details: "Full system JSON backup exported"
            }
        });

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
