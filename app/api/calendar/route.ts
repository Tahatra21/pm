import { db } from "@/lib/db";
import { tasks, projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET /api/calendar?userId=xxx — iCal export for task deadlines
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        let allTasks = await db.select().from(tasks);
        if (userId) allTasks = allTasks.filter((t) => t.assigneeId === userId);

        // Filter tasks with due dates
        const tasksWithDates = allTasks.filter((t) => t.dueDate);

        // Build iCal
        const lines: string[] = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//ProjectFlow//Tasks//ID",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            "X-WR-CALNAME:ProjectFlow Tasks",
        ];

        for (const task of tasksWithDates) {
            const projResult = await db.select().from(projects).where(eq(projects.id, task.projectId)).limit(1);
            const project = projResult[0];
            const dueDate = new Date(task.dueDate!);
            const dtStamp = formatICalDate(new Date());
            const dtStart = formatICalDate(dueDate);
            const dtEnd = formatICalDate(new Date(dueDate.getTime() + 60 * 60 * 1000)); // 1 hour

            lines.push(
                "BEGIN:VEVENT",
                `UID:${task.id}@projectflow`,
                `DTSTAMP:${dtStamp}`,
                `DTSTART:${dtStart}`,
                `DTEND:${dtEnd}`,
                `SUMMARY:${task.title}`,
                `DESCRIPTION:${task.description || ""}\\nProyek: ${project?.title || ""}\\nStatus: ${task.status}`,
                `CATEGORIES:${project?.title || "ProjectFlow"}`,
                task.priority === "urgent" || task.priority === "high" ? "PRIORITY:1" : "PRIORITY:5",
                "END:VEVENT"
            );
        }

        lines.push("END:VCALENDAR");

        return new NextResponse(lines.join("\r\n"), {
            headers: {
                "Content-Type": "text/calendar; charset=utf-8",
                "Content-Disposition": "attachment; filename=projectflow-tasks.ics",
            },
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to generate calendar" }, { status: 500 });
    }
}

function formatICalDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}
