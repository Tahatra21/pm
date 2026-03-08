import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts, projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function GET() {
    try {
        const data = await db.select({
            id: contacts.id,
            name: contacts.name,
            company: contacts.company,
            email: contacts.email,
            phone: contacts.phone,
            projectId: contacts.projectId,
            projectTitle: projects.title,
            notes: contacts.notes,
        })
        .from(contacts)
        .leftJoin(projects, eq(contacts.projectId, projects.id))
        .orderBy(contacts.name);
        return NextResponse.json(data);
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

        const newContact = await db.insert(contacts).values({
            id: randomUUID(),
            name,
            company,
            email,
            phone,
            notes,
            createdAt: new Date(),
        }).returning();

        return NextResponse.json(newContact[0]);
    } catch (error) {
        console.error("Contacts POST Error:", error);
        return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
    }
}
