import { signUp } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 });
        }

        const result = await signUp(name, email, password);
        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: 409 });
        }

        return NextResponse.json({ user: result.user }, { status: 201 });
    } catch (error) {
        console.error("Register API Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan internal." }, { status: 500 });
    }
}
