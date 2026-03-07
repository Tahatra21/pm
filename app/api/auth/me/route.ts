import { getSession } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// GET /api/auth/me — get current user from session
export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("session_token")?.value;
        if (!token) return NextResponse.json({ user: null }, { status: 401 });

        const user = await getSession(token);
        if (!user) return NextResponse.json({ user: null }, { status: 401 });

        return NextResponse.json({ user });
    } catch (error) {
        return NextResponse.json({ user: null }, { status: 500 });
    }
}
