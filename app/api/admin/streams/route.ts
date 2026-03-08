import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { streams } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
    try {
        console.log("DEBUG: Admin Streams API Hit");
        const allStreams = await db.select().from(streams).orderBy(desc(streams.createdAt));
        console.log("DEBUG: Found Streams:", allStreams.length);
        
        // Ensure returning array
        return NextResponse.json(allStreams || []);
    } catch (error: any) {
        console.error("DEBUG: Admin Streams Error:", error);
        return NextResponse.json({ error: "Failed to fetch streams", details: error.message }, { status: 500 });
    }
}
