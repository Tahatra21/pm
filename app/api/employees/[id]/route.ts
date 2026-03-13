import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { randomUUID } from "crypto";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        if (!session.permissions?.includes("EDIT_DATA")) {
            return NextResponse.json({ error: "No permission to edit employees" }, { status: 403 });
        }

        const body = await req.json();
        const { name, role, email, phone, status, projectId, streamIds, roleId, organizationUnit } = body;

        // Step 1: Delete existing streams
        await (db as any).tbl_user_streams.deleteMany({ where: { userId: id } });

        // Step 2: Update user data
        const updatedUser = await (db as any).tbl_users.update({
            where: { id },
            data: {
                name,
                role: role || "",
                roleId: roleId ? parseInt(roleId.toString()) : null,
                organizationUnit: organizationUnit || null,
                email,
                phone: phone || null,
                status: status || "active",
                projectId: projectId || null,
                updatedAt: new Date(),
            }
        });

        // Step 3: Create new stream assignments
        if (streamIds && streamIds.length > 0) {
            await (db as any).tbl_user_streams.createMany({
                data: streamIds.map((sid: string) => ({
                    id: randomUUID(),
                    userId: id,
                    streamId: sid,
                    createdAt: new Date(),
                }))
            });
        }

        // Log action
        await (db as any).tbl_audit_logs.create({
            data: {
                userId: session.id,
                action: "UPDATE_USER",
                resource: "users",
                details: `Updated user: ${name} (${email}). Synced ${streamIds?.length || 0} streams.`
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error: any) {
        console.error("Employee PUT Error:", error);
        return NextResponse.json({ error: "Failed to update employee", detail: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        if (!session.permissions?.includes("DELETE_DATA")) {
            return NextResponse.json({ error: "No permission to delete employees" }, { status: 403 });
        }

        const user = await (db as any).tbl_users.findUnique({ where: { id } });

        await (db as any).tbl_users.delete({ where: { id } });

        // Log action
        await (db as any).tbl_audit_logs.create({
            data: {
                userId: session.id,
                action: "DELETE_USER",
                resource: "users",
                details: `Deleted user: ${user?.name} (${user?.email})`
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Employee DELETE Error:", error);
        return NextResponse.json({ error: "Failed to delete employee", detail: error.message }, { status: 500 });
    }
}
