import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function GET() {
    try {
        const results = await db.tbl_contacts.findMany({
            include: {
                projects: {
                    select: {
                        title: true
                    }
                }
            },
            orderBy: { name: "asc" }
        });

        const formattedResults = results.map(c => ({
            id: c.id,
            name: c.name,
            company: c.company,
            email: c.email,
            phone: c.phone,
            projectId: c.projectId,
            projectTitle: c.projects?.title || null,
            notes: c.notes,
        }));

        return NextResponse.json(formattedResults);
    } catch (error) {
        console.error("Contacts GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, company, email, phone, notes } = body;

        if (!name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newContact = await db.tbl_contacts.create({
            data: {
                id: randomUUID(),
                name,
                company,
                email,
                phone,
                notes,
                createdAt: new Date(),
            }
        });

        return NextResponse.json(newContact);
    } catch (error) {
        console.error("Contacts POST Error:", error);
        return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
    }
}
