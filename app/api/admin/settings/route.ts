import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        if (!session.permissions?.includes("ADMIN_PRIVILEGE")) {
            return NextResponse.json({ error: "No permission to manage system settings" }, { status: 403 });
        }

        const settings = await (db as any).tbl_system_settings.findUnique({
            where: { id: "global" }
        });

        return NextResponse.json(settings?.data || {});
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        if (!session.permissions?.includes("ADMIN_PRIVILEGE")) {
            return NextResponse.json({ error: "No permission to manage system settings" }, { status: 403 });
        }

        const data = await req.json();

        const updated = await db.tbl_system_settings.upsert({
            where: { id: "global" },
            update: { data },
            create: { id: "global", data }
        });

        // Log the action
        await db.tbl_audit_logs.create({
            data: {
                userId: session.id,
                action: "UPDATE_SETTINGS",
                resource: "system_settings",
                details: "Global settings updated by admin",
                ipAddress: req.headers.get("x-forwarded-for") || "unknown"
            }
        });

        return NextResponse.json(updated.data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
