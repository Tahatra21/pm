import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { 
    users, projects, projectMembers, tasks, integrations, 
    meetings, timeLogs, inboxMessages, contacts, employeesTable, schedules,
    streams, projectTags, projectTagRelations, subtasks, comments
} from "./schema";
import { randomUUID } from "crypto";
import dotenv from "dotenv";

dotenv.config();

const sql = new Pool({
    connectionString: process.env.DATABASE_URL,
});
const db = drizzle(sql);

function simpleHash(pwd: string): string {
    let hash = 0;
    for (let i = 0; i < pwd.length; i++) {
        const char = pwd.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return `hash_${Math.abs(hash).toString(36)}`;
}

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

async function seedMassive() {
    console.log("🚀 Starting Massive Seeding...");

    // 1. Users
    const additionalUsers = [
        { id: "u6", name: "Fajar Ramadhan", email: "fajar.ramadhan@company.com", role: "member" as const, color: "#8b5cf6" },
        { id: "u7", name: "Gita Permata", email: "gita.permata@company.com", role: "member" as const, color: "#f43f5e" },
        { id: "u8", name: "Hadi Wijaya", email: "hadi.wijaya@company.com", role: "member" as const, color: "#0ea5e9" },
        { id: "u9", name: "Indah Sari", email: "indah.sari@company.com", role: "member" as const, color: "#fbbf24" },
        { id: "u10", name: "Joko Widodo", email: "joko.widodo@company.com", role: "viewer" as const, color: "#4ade80" },
    ];

    for (const u of additionalUsers) {
        await db.insert(users).values({
            id: u.id, name: u.name, email: u.email, passwordHash: simpleHash("password123"),
            role: u.role, avatar: "", color: u.color,
            createdAt: new Date(), updatedAt: new Date(),
        }).onConflictDoNothing();
    }
    const allUserIds = ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8", "u9", "u10"];
    console.log("  ✓ Users populated");

    // 2. Streams & Tags (already seeded in original, but let's ensure they exist)
    const streamIds = ["st1", "st2", "st3", "st4", "st5"];
    const tagIds = ["tag1", "tag2", "tag3", "tag4"];

    // 3. Projects
    const projectTitles = [
        "Cloud Migration Phase 2", "ERP System Integration", "Security Audit 2026",
        "Employee Productivity Tool", "Customer Loyalty Program", "AI-Powered Chatbot",
        "Smart Office Infrastructure", "Green Energy Initiative", "Network Upgrade JKT",
        "Disaster Recovery Site"
    ];

    const projectColors = ["#ef4444", "#f97316", "#f59e0b", "#10b981", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef", "#f43f5e"];
    const createdProjectIds: string[] = [];

    // --- Specific Projects for Distribusi (st3) ---
    const distribusiProjects = [
        { id: "p_dist_1", title: "Modernisasi Jaringan Distribusi Jabar", color: "#10b981" },
        { id: "p_dist_2", title: "Smart Meter Rollout Jateng", color: "#06b6d4" },
        { id: "p_dist_3", title: "Optimasi Gardu Induk Distribusi JKT", color: "#3b82f6" },
    ];

    for (const dp of distribusiProjects) {
        await db.insert(projects).values({
            id: dp.id,
            title: dp.title,
            description: `Proyek strategis distribusi untuk ${dp.title}.`,
            color: dp.color,
            streamId: "st3",
            createdAt: new Date(Date.now() - getRandomInt(10, 30) * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
        }).onConflictDoNothing();
        createdProjectIds.push(dp.id);

        // Members & Tags
        const members = [...allUserIds].sort(() => 0.5 - Math.random()).slice(0, 3);
        for (const uid of members) await db.insert(projectMembers).values({ id: randomUUID(), projectId: dp.id, userId: uid }).onConflictDoNothing();
        await db.insert(projectTagRelations).values({ id: randomUUID(), projectId: dp.id, tagId: "tag1" }).onConflictDoNothing();
    }

    for (let i = 0; i < projectTitles.length; i++) {
        const pid = `p_massive_${i + 1}`;
        await db.insert(projects).values({
            id: pid,
            title: projectTitles[i],
            description: `Rencana strategis untuk ${projectTitles[i].toLowerCase()} guna meningkatkan efisiensi operasional tim.`,
            color: projectColors[i],
            streamId: getRandomElement(streamIds),
            createdAt: new Date(Date.now() - getRandomInt(10, 60) * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
        }).onConflictDoNothing();
        createdProjectIds.push(pid);

        // Members
        const numMembers = getRandomInt(2, 5);
        const members = [...allUserIds].sort(() => 0.5 - Math.random()).slice(0, numMembers);
        for (const uid of members) {
            await db.insert(projectMembers).values({ id: randomUUID(), projectId: pid, userId: uid }).onConflictDoNothing();
        }

        // Tags
        const numTags = getRandomInt(1, 2);
        const tags = [...tagIds].sort(() => 0.5 - Math.random()).slice(0, numTags);
        for (const tid of tags) {
            await db.insert(projectTagRelations).values({ id: randomUUID(), projectId: pid, tagId: tid }).onConflictDoNothing();
        }
    }
    console.log(`  ✓ ${createdProjectIds.length} massive projects seeded`);

    // 4. Tasks (Seed 15-20 tasks per massive project)
    const taskPrefixes = ["Implementasi", "Review", "Testing", "Dokumentasi", "Riset", "Fixing", "Optimasi", "Meeting", "Deployment"];
    const taskSubjects = ["Database", "Frontend UI", "API Endpoint", "Security Patch", "Unit Test", "Performance", "Cloud Sync", "Auth Flow"];

    for (const pid of createdProjectIds) {
        const numTasks = getRandomInt(12, 18);
        for (let j = 0; j < numTasks; j++) {
            const tid = `${pid}_t${j + 1}`;
            const status = getRandomElement(["todo", "in-progress", "review", "done"] as const);
            const priority = getRandomElement(["low", "medium", "high", "urgent"] as const);
            const assigneeId = getRandomElement(allUserIds);
            
            const daysOffsetStart = getRandomInt(-20, 10);
            const daysDuration = getRandomInt(3, 14);
            const startDate = new Date(Date.now() + daysOffsetStart * 24 * 60 * 60 * 1000);
            const dueDate = new Date(startDate.getTime() + daysDuration * 24 * 60 * 60 * 1000);

            await db.insert(tasks).values({
                id: tid,
                projectId: pid,
                title: `${getRandomElement(taskPrefixes)} ${getRandomElement(taskSubjects)} #${j + 1}`,
                description: `Tugas penting untuk memastikan ${pid} berjalan lancar sesuai timeline yang ditentukan.`,
                status,
                priority,
                assigneeId,
                startDate,
                dueDate,
                tags: JSON.stringify([getRandomElement(["tech", "design", "admin", "dev"])]),
                createdAt: new Date(Date.now() - getRandomInt(30, 90) * 24 * 60 * 60 * 1000),
                updatedAt: new Date(),
            }).onConflictDoNothing();

            // Add some subtasks
            if (Math.random() > 0.3) {
                const numSub = getRandomInt(2, 5);
                for (let k = 0; k < numSub; k++) {
                    await db.insert(subtasks).values({
                        id: randomUUID(),
                        taskId: tid,
                        title: `Detail sub-item ${k + 1} for ${tid}`,
                        completed: Math.random() > 0.5 ? "true" : "false",
                        sortOrder: k.toString()
                    }).onConflictDoNothing();
                }
            }

            // Add some comments
            if (Math.random() > 0.5) {
                const numComm = getRandomInt(1, 4);
                for (let k = 0; k < numComm; k++) {
                    await db.insert(comments).values({
                        id: randomUUID(),
                        taskId: tid,
                        userId: getRandomElement(allUserIds),
                        content: `Update progress untuk task ${tid}. Semuanya terlihat ${Math.random() > 0.2 ? "oke" : "ada kendala"}.`,
                        type: "comment",
                        createdAt: new Date(Date.now() - getRandomInt(1, 5) * 24 * 60 * 60 * 1000)
                    }).onConflictDoNothing();
                }
            }

            // Add some time logs
            if (status === "done" || status === "in-progress") {
                const numLogs = getRandomInt(1, 3);
                for (let k = 0; k < numLogs; k++) {
                    await db.insert(timeLogs).values({
                        id: randomUUID(),
                        taskId: tid,
                        userId: assigneeId,
                        hours: (Math.random() * 4 + 1).toFixed(1),
                        date: new Date(Date.now() - getRandomInt(0, 10) * 24 * 60 * 60 * 1000),
                        description: `Mengerjakan ${tid} bagian ke-${k + 1}`
                    }).onConflictDoNothing();
                }
            }
        }
    }
    console.log("  ✓ Tasks, subtasks, and comments populated");

    // 5. Meetings
    for (let i = 0; i < 8; i++) {
        const pid = getRandomElement(createdProjectIds);
        const startTime = new Date(Date.now() + getRandomInt(-2, 5) * 24 * 60 * 60 * 1000);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        await db.insert(meetings).values({
            id: randomUUID(),
            title: `Sync Project ${pid} #${i + 1}`,
            description: "Daily standup and progress review.",
            projectId: pid,
            startTime,
            endTime,
            location: "Meeting Room " + getRandomInt(101, 109),
            attendees: JSON.stringify(allUserIds.sort(() => 0.5 - Math.random()).slice(0, 4))
        }).onConflictDoNothing();
    }
    console.log("  ✓ Meetings populated");

    // 6. Inbox Messages
    for (let i = 0; i < 15; i++) {
        const senderId = getRandomElement(allUserIds);
        let receiverId = getRandomElement(allUserIds);
        while (receiverId === senderId) receiverId = getRandomElement(allUserIds);

        await db.insert(inboxMessages).values({
            id: randomUUID(),
            senderId,
            receiverId,
            subject: `Feedback Project ${getRandomInt(1, 10)}`,
            message: "Tolong review dokumen terbaru yang saya upload di sistem. Terima kasih!",
            status: Math.random() > 0.5 ? "read" : "unread",
            createdAt: new Date(Date.now() - getRandomInt(0, 7) * 24 * 60 * 60 * 1000)
        }).onConflictDoNothing();
    }
    console.log("  ✓ Inbox messages populated");

    console.log("✅ Massive Seed Complete!");
    process.exit(0);
}

seedMassive().catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
});
