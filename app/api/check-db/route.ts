import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const count = await db.tbl_projects.count();
        const sample = await db.tbl_projects.findMany({ take: 1 });
        const keys = sample.length > 0 ? Object.keys(sample[0]) : [];
        return NextResponse.json({
            success: true,
            db_type: db.constructor.name,
            count,
            sample_keys: keys,
            sample: sample[0],
            env: {
                has_url: !!process.env.DATABASE_URL
            }
        });
    } catch (err: any) {
        return NextResponse.json({
            success: false,
            error: err.message,
            stack: err.stack,
            env: {
                has_url: !!process.env.DATABASE_URL
            }
        }, { status: 500 });
    }
}
