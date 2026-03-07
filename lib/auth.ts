import { db } from "@/lib/db";
import { users, sessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

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
}

export async function signIn(email: string, password: string): Promise<{ user: AuthUser; token: string } | { error: string }> {
    const result = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    const user = result[0];
    if (!user) return { error: "Email tidak ditemukan." };

    const hash = simpleHash(password);
    if (user.passwordHash !== hash) return { error: "Password salah." };

    // Create session
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await db.insert(sessions).values({
        id: randomUUID(), userId: user.id, token, expiresAt,
        createdAt: new Date(),
    });

    return {
        user: { id: user.id, name: user.name, email: user.email, role: user.role, color: user.color || "#6366f1" },
        token,
    };
}

export async function signUp(name: string, email: string, password: string): Promise<{ user: AuthUser; token: string } | { error: string }> {
    const existingResult = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (existingResult.length > 0) return { error: "Email sudah terdaftar." };

    const id = randomUUID();
    const colors = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#14b8a6", "#8b5cf6"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    await db.insert(users).values({
        id, name, email: email.toLowerCase(), passwordHash: simpleHash(password),
        role: "member", avatar: "", color,
        createdAt: new Date(), updatedAt: new Date(),
    });

    const token = randomUUID();
    await db.insert(sessions).values({
        id: randomUUID(), userId: id, token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
    });

    return { user: { id, name, email, role: "member", color }, token };
}

export async function getSession(token: string): Promise<AuthUser | null> {
    const sessionResult = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
    const session = sessionResult[0];
    if (!session) return null;
    
    if (new Date(session.expiresAt) < new Date()) {
        await db.delete(sessions).where(eq(sessions.id, session.id));
        return null;
    }
    const userResult = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
    const user = userResult[0];
    if (!user) return null;
    return { id: user.id, name: user.name, email: user.email, role: user.role, color: user.color || "#6366f1" };
}

export async function signOut(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token));
}
