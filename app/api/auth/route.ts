import { signIn, signUp, signOut } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// POST /api/auth — login or register
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, email, password, name } = body;

        if (action === "login") {
            if (!email || !password) return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 });
            const result = await signIn(email, password);
            if ("error" in result) return NextResponse.json({ error: result.error }, { status: 401 });

            const cookieStore = await cookies();
            cookieStore.set("session_token", result.token, {
                httpOnly: true, secure: process.env.NODE_ENV === "production",
                sameSite: "lax", maxAge: 7 * 24 * 60 * 60, path: "/",
            });

            return NextResponse.json({ user: result.user });
        }

        if (action === "register") {
            if (!name || !email || !password) return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
            if (password.length < 8) return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 });
            const result = await signUp(name, email, password);
            if ("error" in result) return NextResponse.json({ error: result.error }, { status: 409 });

            return NextResponse.json({ user: result.user }, { status: 201 });
        }

        if (action === "logout") {
            const cookieStore = await cookies();
            const token = cookieStore.get("session_token")?.value;
            if (token) {
                await signOut(token);
                cookieStore.delete("session_token");
            }
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Auth API Error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
