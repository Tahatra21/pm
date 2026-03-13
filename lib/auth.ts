import { db } from "@/lib/db";
import { randomUUID } from "crypto";
import * as fs from "fs";

function logDebug(msg: string) {
    try {
        const dbKeys = Object.keys(db).filter(k => k.startsWith('tbl_'));
        fs.appendFileSync("/tmp/auth_debug.txt", `${new Date().toISOString()} - ${msg} - Models: ${dbKeys.join(',')}\n`);
    } catch (e) {}
}

// Simple hash matching the seed script
function simpleHash(pwd: string): string {
    let hash = 0;
    for (let i = 0; i < pwd.length; i++) {
        const char = pwd.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return `hash_${Math.abs(hash).toString(36)}`;
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: string;
    color: string;
    hierarchyLevel?: string;
    permissions?: string[];
    organizationUnit?: string;
}

export async function signIn(email: string, password: string): Promise<{ user: AuthUser; token: string } | { error: string }> {
    const user = await (db as any).tbl_users.findUnique({
        where: { email: email.toLowerCase() }
    });
    if (!user) return { error: "Email tidak ditemukan." };

    const hash = simpleHash(password);
    if (user.passwordHash !== hash) return { error: "Password salah." };

    // Fetch Role and Permissions
    const roleRecord = await (db as any).tbl_lookup_roles.findUnique({
        where: { id: user.roleId },
        include: {
            role_permissions: {
                where: { isAllowed: true },
                include: { permissions: true }
            }
        }
    });
    const permissions = roleRecord?.role_permissions.map((rp: any) => rp.permissions.permissionCode) || [];

    // Get system settings for timeout
    const settingsDoc = await (db as any).tbl_system_settings.findUnique({ where: { id: "global" } });
    const timeoutHours = parseInt(settingsDoc?.data?.sessionTimeout || "168"); // Default 7 days (168h)

    // Create session
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + timeoutHours * 60 * 60 * 1000);
    await (db as any).tbl_sessions.create({
        data: {
            id: randomUUID(),
            userId: user.id,
            token,
            expiresAt,
            createdAt: new Date(),
        }
    });

    // Log the sign in
    await (db as any).tbl_audit_logs.create({
        data: {
            userId: user.id,
            action: "USER_LOGIN",
            resource: "auth",
            details: `User ${user.email} logged in`
        }
    });

    return {
        user: { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.role, 
            color: user.color || "#6366f1",
            hierarchyLevel: roleRecord?.hierarchyLevel,
            permissions,
            organizationUnit: user.organizationUnit
        },
        token,
    };
}

export async function signUp(name: string, email: string, password: string): Promise<{ user: AuthUser; token: string } | { error: string }> {
    const existing = await (db as any).tbl_users.findUnique({
        where: { email: email.toLowerCase() }
    });
    if (existing) return { error: "Email sudah terdaftar." };

    const id = randomUUID();
    const colors = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#14b8a6", "#8b5cf6"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    // New users default to 'USER' role (L4)
    const userRole = await (db as any).tbl_lookup_roles.findUnique({ where: { roleCode: "USER" } });

    await (db as any).tbl_users.create({
        data: {
            id, name, email: email.toLowerCase(), passwordHash: simpleHash(password),
            role: "member", avatar: "", color,
            roleId: userRole?.id,
            createdAt: new Date(), updatedAt: new Date(),
        }
    });

    // Log the sign up
    await (db as any).tbl_audit_logs.create({
        data: {
            userId: id,
            action: "USER_REGISTER",
            resource: "auth",
            details: `New user ${email} registered`
        }
    });

    const token = randomUUID();
    await (db as any).tbl_sessions.create({
        data: {
            id: randomUUID(),
            userId: id,
            token,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
        }
    });

    return { 
        user: { 
            id, name, email, role: "member", color, 
            hierarchyLevel: userRole?.hierarchyLevel,
            permissions: ["VIEW_DATA"] 
        }, 
        token 
    };
}

export async function getSession(token: string): Promise<AuthUser | null> {
    logDebug(`getSession starting. db keys: ${Object.keys(db).length}. tbl_sessions exists: ${!!(db as any).tbl_sessions}`);
    const session = await (db as any).tbl_sessions.findUnique({
        where: { token },
        include: { users: true }
    });
    if (!session) return null;

    if (new Date(session.expiresAt) < new Date()) {
        await (db as any).tbl_sessions.delete({
            where: { id: session.id }
        });
        return null;
    }

    const user = session.users;
    if (!user) return null;

    // Fetch Role and Permissions
    const roleRecord = await (db as any).tbl_lookup_roles.findUnique({
        where: { id: user.roleId },
        include: {
            role_permissions: {
                where: { isAllowed: true },
                include: { permissions: true }
            }
        }
    });
    const permissions = roleRecord?.role_permissions.map((rp: any) => rp.permissions.permissionCode) || [];

    return { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        color: user.color || "#6366f1",
        hierarchyLevel: roleRecord?.hierarchyLevel,
        permissions,
        organizationUnit: user.organizationUnit
    };
}

export async function signOut(token: string): Promise<void> {
    const session = await (db as any).tbl_sessions.findUnique({ where: { token } });
    if (session) {
        await (db as any).tbl_audit_logs.create({
            data: {
                userId: session.userId,
                action: "USER_LOGOUT",
                resource: "auth",
                details: "User logged out"
            }
        });
        await (db as any).tbl_sessions.deleteMany({
            where: { token }
        });
    }
}

export async function getServerSession(): Promise<AuthUser | null> {
    try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const token = cookieStore.get("session_token")?.value;
        if (!token) return null;
        return getSession(token);
    } catch (e) {
        return null;
    }
}
