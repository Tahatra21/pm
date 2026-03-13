import { signIn } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 });
        }

        const result = await signIn(email, password);
        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: 401 });
        }

        const cookieStore = await cookies();
        cookieStore.set("session_token", result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
        });

        return NextResponse.json({ user: result.user });
    } catch (error) {
        console.error("Login API Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan internal." }, { status: 500 });
    }
}
