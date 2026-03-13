import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
    try {
        const session = await getServerSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("logo") as File;
        const type = formData.get("type") as string || "main"; // main or mini

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const filename = `logo-${type}-${Date.now()}${path.extname(file.name)}`;
        const uploadPath = path.join(process.cwd(), "public", "uploads", filename);
        
        // Ensure directory exists (simplified, public/uploads should exist)
        await writeFile(uploadPath, buffer);

        const url = `/uploads/${filename}`;

        return NextResponse.json({ url });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
