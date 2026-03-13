import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/calendar?userId=xxx — iCal export for task deadlines
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        const allTasks = await db.tbl_tasks.findMany({
            where: {
                ...(userId && { assigneeId: userId }),
                dueDate: { not: null }
            },
            include: {
                projects: true
            }
        });

        // Build iCal
        const lines: string[] = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//ProjectFlow//Tasks//ID",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            "X-WR-CALNAME:ProjectFlow Tasks",
        ];

        for (const task of allTasks) {
            const project = task.projects;
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
        console.error(error);
        return NextResponse.json({ error: "Failed to generate calendar" }, { status: 500 });
    }
}

function formatICalDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}
