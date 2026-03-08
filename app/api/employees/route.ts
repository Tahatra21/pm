import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { employeesTable, projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function GET() {
    try {
        const employees = await db.select({
            id: employeesTable.id,
            name: employeesTable.name,
            role: employeesTable.role,
            email: employeesTable.email,
            phone: employeesTable.phone,
            status: employeesTable.status,
            projectId: employeesTable.projectId,
            projectTitle: projects.title,
        })
        .from(employeesTable)
        .leftJoin(projects, eq(employeesTable.projectId, projects.id))
        .orderBy(employeesTable.name);
        return NextResponse.json(employees);
    } catch (error) {
        console.error("Employees GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, role, email, phone, status } = body;

        if (!name || !role || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newEmployee = await db.insert(employeesTable).values({
            id: randomUUID(),
            name,
            role,
            email,
            phone,
            status: status || "active",
            createdAt: new Date(),
        }).returning();

        return NextResponse.json(newEmployee[0]);
    } catch (error) {
        console.error("Employees POST Error:", error);
        return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
    }
}
