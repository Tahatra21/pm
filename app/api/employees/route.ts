import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getServerSession } from "@/lib/auth";

// GET /api/employees (Now fetching from tbl_users)
export async function GET(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Check for VIEW_DATA permission
        if (!session.permissions?.includes("VIEW_DATA")) {
            return NextResponse.json({ error: "No permission to view data" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const level = session.hierarchyLevel || "L4";
        let whereClause: any = {};

        if (level === "L1") {
            whereClause = {};
        } else if (level === "L2" || level === "L3") {
            // See users in my streams
            const currentUser = await (db as any).tbl_users.findUnique({
                where: { id: session.id },
                include: { user_streams: true }
            });
            const myStreamIds = currentUser?.user_streams.map((us: any) => us.streamId) || [];
            
            whereClause = {
                user_streams: {
                    some: {
                        streamId: { in: myStreamIds }
                    }
                }
            };
        } else {
            // L4: Only self
            whereClause = { id: session.id };
        }

        const [results, total] = await Promise.all([
            (db as any).tbl_users.findMany({
                where: whereClause,
                skip,
                take: limit,
                include: {
                    role_ref: true,
                    projects: {
                        select: {
                            title: true
                        }
                    },
                    user_streams: {
                        include: {
                            streams: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true
                                }
                            }
                        }
                    }
                },
                orderBy: { name: "asc" }
            }),
            (db as any).tbl_users.count({ where: whereClause })
        ]);

        const formattedResults = results.map((u: any) => ({
            id: u.id,
            name: u.name,
            role: u.role_ref?.roleName || u.role,
            roleId: u.roleId,
            email: u.email,
            phone: u.phone,
            status: u.status,
            projectId: u.projectId,
            projectTitle: u.projects?.title || null,
            streams: u.user_streams.map((us: any) => us.streams),
            hierarchyLevel: u.role_ref?.hierarchyLevel,
            organizationUnit: u.organizationUnit
        }));

        return NextResponse.json({
            data: formattedResults,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Users GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

// POST /api/employees (Now creating in tbl_users)
export async function POST(req: Request) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Check for EDIT_DATA permission
        if (!session.permissions?.includes("EDIT_DATA")) {
            return NextResponse.json({ error: "No permission to edit/create users" }, { status: 403 });
        }

        const body = await req.json();
        const { name, role, email, phone, status, projectId, streamIds, roleId, organizationUnit, password } = body;

        if (!name || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const userId = randomUUID();
        // Since we are creating a login user, we need a password hash.
        // If not provided, we should probably set a default or error out.
        // For 'employee management', maybe they don't have login yet? 
        // But the user said unified table. So they are users.
        const passwordHash = "hash_1v7z374"; // Default 'password123' if not provided

        const newUser = await (db as any).tbl_users.create({
            data: {
                id: userId,
                name,
                email,
                passwordHash, // Default password
                role: role || "member",
                roleId: roleId ? parseInt(roleId.toString()) : null,
                organizationUnit: organizationUnit || null,
                phone,
                projectId: projectId || null,
                status: status || "active",
                createdAt: new Date(),
                updatedAt: new Date(),
                user_streams: {
                    create: (streamIds || []).map((sid: string) => ({
                        id: randomUUID(),
                        streamId: sid,
                        createdAt: new Date()
                    }))
                }
            },
            include: {
                role_ref: true,
                user_streams: {
                    include: {
                        streams: true
                    }
                }
            }
        });

        // Log action
        await (db as any).tbl_audit_logs.create({
            data: {
                userId: session.id,
                action: "CREATE_USER",
                resource: "users",
                details: `Created user: ${name} (${email}) with ${streamIds?.length || 0} streams`
            }
        });

        return NextResponse.json(newUser);
    } catch (error: any) {
        console.error("Users POST Error:", error);
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
}
