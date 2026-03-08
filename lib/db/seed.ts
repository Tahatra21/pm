import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { 
    users, projects, projectMembers, tasks, integrations, 
    meetings, timeLogs, inboxMessages, contacts, employeesTable, schedules,
    streams, projectTags, projectTagRelations
} from "./schema";
import { randomUUID } from "crypto";

const sql = new Pool({
    connectionString: process.env.DATABASE_URL,
});
const db = drizzle(sql);

// Simple hash for demo (NOT for production)
function simpleHash(pwd: string): string {
    let hash = 0;
    for (let i = 0; i < pwd.length; i++) {
        const char = pwd.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return `hash_${Math.abs(hash).toString(36)}`;
}

async function seed() {
    console.log("🌱 Seeding database...");

    // ── Users ──
    const seedUsers = [
        { id: "u1", name: "Andi Pratama", email: "andi.pratama@company.com", role: "admin" as const, color: "#6366f1", password: "password123" },
        { id: "u2", name: "Budi Santoso", email: "budi.santoso@company.com", role: "member" as const, color: "#22c55e", password: "password123" },
        { id: "u3", name: "Citra Dewi", email: "citra.dewi@company.com", role: "member" as const, color: "#f59e0b", password: "password123" },
        { id: "u4", name: "Dian Kusuma", email: "dian.kusuma@company.com", role: "member" as const, color: "#ec4899", password: "password123" },
        { id: "u5", name: "Eko Saputra", email: "eko.saputra@company.com", role: "viewer" as const, color: "#14b8a6", password: "password123" },
    ];

    for (const u of seedUsers) {
        await db.insert(users).values({
            id: u.id, name: u.name, email: u.email, passwordHash: simpleHash(u.password),
            role: u.role, avatar: "", color: u.color,
            createdAt: new Date(), updatedAt: new Date(),
        }).onConflictDoNothing();
    }
    console.log(`  ✓ ${seedUsers.length} users`);
    
    // ── Streams (Master Data) ──
    const seedStreams = [
        { id: "st1", code: "EP_PEMBANGKIT", name: "EP & Pembangkit", description: "Exploration, Production & Power Generation" },
        { id: "st2", code: "TRANSMISI", name: "Transmisi", description: "Electricity Transmission" },
        { id: "st3", code: "DISTRIBUSI", name: "Distribusi", description: "Electricity Distribution" },
        { id: "st4", code: "KORPORAT", name: "Korporat", description: "Corporate Services" },
        { id: "st5", code: "PELAYANAN_PELANGGAN", name: "Pelayanan Pelanggan", description: "Customer Services" },
    ];
    for (const st of seedStreams) {
        await db.insert(streams).values(st).onConflictDoNothing();
    }
    console.log(`  ✓ ${seedStreams.length} streams`);

    // ── Project Tags (Master Data) ──
    const seedTags = [
        { id: "tag1", code: "SA_PLN_1", name: "SA PLN 1", category: "PLN" },
        { id: "tag2", code: "SA_PLN_2", name: "SA PLN 2", category: "PLN" },
        { id: "tag3", code: "SA_ENT_1", name: "SA ENT 1", category: "Enterprise" },
        { id: "tag4", code: "SA_ENT_2", name: "SA ENT 2", category: "Enterprise" },
    ];
    for (const tag of seedTags) {
        await db.insert(projectTags).values(tag).onConflictDoNothing();
    }
    console.log(`  ✓ ${seedTags.length} tags`);

    // ── Projects ──
    const seedProjects = [
        { id: "p1", title: "Website Redesign", description: "Pembaruan tampilan website utama perusahaan dengan desain modern dan responsif.", color: "#6366f1", members: ["u1", "u2", "u3"], streamId: "st4", tags: ["tag1", "tag3"] },
        { id: "p2", title: "Mobile App v2.0", description: "Pengembangan versi kedua aplikasi mobile dengan fitur offline-first dan notifikasi push.", color: "#22c55e", members: ["u1", "u3", "u4", "u5"], streamId: "st5", tags: ["tag2"] },
        { id: "p3", title: "API Integration", description: "Integrasi dengan layanan pihak ketiga: payment gateway, SMS OTP, dan mapping service.", color: "#f59e0b", members: ["u1", "u2"], streamId: "st1", tags: ["tag3", "tag4"] },
        { id: "p4", title: "Data Analytics Dashboard", description: "Pembuatan dashboard analytics real-time untuk monitoring KPI bisnis dan penjualan.", color: "#ec4899", members: ["u2", "u3", "u4"], streamId: "st4", tags: ["tag1", "tag4"] },
    ];

    for (const p of seedProjects) {
        await db.insert(projects).values({
            id: p.id, title: p.title, description: p.description, color: p.color,
            streamId: p.streamId,
            createdAt: new Date("2026-01-15T08:00:00Z"), updatedAt: new Date(),
        }).onConflictDoUpdate({
            target: projects.id,
            set: { streamId: p.streamId }
        });

        for (const userId of p.members) {
            await db.insert(projectMembers).values({
                id: randomUUID(), projectId: p.id, userId,
            }).onConflictDoNothing();
        }

        for (const tagId of p.tags) {
            await db.insert(projectTagRelations).values({
                id: randomUUID(), projectId: p.id, tagId,
            }).onConflictDoNothing();
        }
    }
    console.log(`  ✓ ${seedProjects.length} projects`);

    // ── Tasks ──
    const seedTasks = [
        { id: "t1", projectId: "p1", title: "Desain ulang halaman utama (Landing Page)", description: "Buat mockup baru di Figma.", status: "done" as const, priority: "high" as const, assigneeId: "u3", dueDate: new Date("2026-02-20T00:00:00Z"), startDate: new Date("2026-02-10T00:00:00Z"), tags: '["design","frontend"]' },
        { id: "t2", projectId: "p1", title: "Implementasi komponen Header & Navbar baru", description: "Koding komponen React berdasarkan desain.", status: "done" as const, priority: "high" as const, assigneeId: "u2", dueDate: new Date("2026-02-28T00:00:00Z"), startDate: new Date("2026-02-21T00:00:00Z"), tags: '["frontend","react"]', gitLink: "https://github.com/company/website/pull/42" },
        { id: "t3", projectId: "p1", title: "Optimisasi performa halaman (Core Web Vitals)", description: "Target LCP < 2.5s dan CLS < 0.1.", status: "in-progress" as const, priority: "medium" as const, assigneeId: "u2", dueDate: new Date("2026-03-15T00:00:00Z"), startDate: new Date("2026-03-01T00:00:00Z"), tags: '["performance","seo"]' },
        { id: "t4", projectId: "p1", title: "Setup testing E2E dengan Playwright", description: "Buat test suite untuk semua user journey utama.", status: "todo" as const, priority: "medium" as const, assigneeId: "u1", dueDate: new Date("2026-03-20T00:00:00Z"), startDate: new Date("2026-03-10T00:00:00Z"), tags: '["testing","automation"]' },
        { id: "t5", projectId: "p1", title: "Integrasi CMS headless (Contentful)", description: "Hubungkan website dengan Contentful.", status: "review" as const, priority: "high" as const, assigneeId: "u3", dueDate: new Date("2026-03-10T00:00:00Z"), startDate: new Date("2026-02-25T00:00:00Z"), tags: '["cms","api"]', gitLink: "https://github.com/company/website/pull/55" },
        { id: "t6", projectId: "p1", title: "Deploy ke staging dan UAT testing", description: "Deploy build terbaru ke environment staging.", status: "todo" as const, priority: "low" as const, assigneeId: "u1", dueDate: new Date("2026-03-25T00:00:00Z"), startDate: new Date("2026-03-20T00:00:00Z"), tags: '["deployment","uat"]' },
        { id: "t7", projectId: "p2", title: "Arsitektur state management (Zustand)", description: "Refactor state management dari Redux ke Zustand.", status: "done" as const, priority: "high" as const, assigneeId: "u4", dueDate: new Date("2026-02-15T00:00:00Z"), startDate: new Date("2026-02-01T00:00:00Z"), tags: '["architecture","react-native"]' },
        { id: "t8", projectId: "p2", title: "Fitur offline-first dengan SQLite lokal", description: "Implementasi sinkronisasi data offline.", status: "in-progress" as const, priority: "urgent" as const, assigneeId: "u1", dueDate: new Date("2026-03-12T00:00:00Z"), startDate: new Date("2026-02-20T00:00:00Z"), tags: '["offline","database"]' },
        { id: "t9", projectId: "p2", title: "Push notification dengan Firebase Cloud Messaging", description: "Setup FCM untuk Android dan iOS.", status: "in-progress" as const, priority: "high" as const, assigneeId: "u3", dueDate: new Date("2026-03-10T00:00:00Z"), startDate: new Date("2026-02-25T00:00:00Z"), tags: '["notifications","firebase"]' },
        { id: "t10", projectId: "p2", title: "UI Library Migration ke NativeWind v4", description: "Upgrade seluruh styling.", status: "review" as const, priority: "medium" as const, assigneeId: "u5", dueDate: new Date("2026-03-08T00:00:00Z"), startDate: new Date("2026-02-18T00:00:00Z"), tags: '["ui","styling"]' },
        { id: "t11", projectId: "p2", title: "Biometric Authentication (FaceID/Fingerprint)", description: "Tambahkan opsi login biometrik.", status: "todo" as const, priority: "medium" as const, assigneeId: "u4", dueDate: new Date("2026-03-18T00:00:00Z"), startDate: new Date("2026-03-10T00:00:00Z"), tags: '["security","auth"]' },
        { id: "t12", projectId: "p4", title: "Setup data pipeline Clickhouse", description: "Konfigurasi Clickhouse sebagai OLAP database.", status: "in-progress" as const, priority: "urgent" as const, assigneeId: "u2", dueDate: new Date("2026-03-10T00:00:00Z"), startDate: new Date("2026-02-25T00:00:00Z"), tags: '["database","analytics"]' },
        { id: "t13", projectId: "p4", title: "Chart library evaluation dan setup", description: "Evaluasi library chart yang paling sesuai.", status: "done" as const, priority: "medium" as const, assigneeId: "u3", dueDate: new Date("2026-03-01T00:00:00Z"), startDate: new Date("2026-02-22T00:00:00Z"), tags: '["research","frontend"]' },
        { id: "t14", projectId: "p4", title: "Buat komponen KPI card dengan trend indicator", description: "Komponen reusable.", status: "todo" as const, priority: "high" as const, assigneeId: "u4", dueDate: new Date("2026-03-15T00:00:00Z"), startDate: new Date("2026-03-08T00:00:00Z"), tags: '["frontend","component"]' },
        { id: "t15", projectId: "p4", title: "Real-time WebSocket untuk live metrics", description: "Implementasi WebSocket connection.", status: "todo" as const, priority: "high" as const, assigneeId: "u2", dueDate: new Date("2026-03-20T00:00:00Z"), startDate: new Date("2026-03-12T00:00:00Z"), tags: '["backend","websocket"]' },
    ];

    for (const t of seedTasks) {
        await db.insert(tasks).values({
            id: t.id, projectId: t.projectId, title: t.title, description: t.description,
            status: t.status, priority: t.priority, assigneeId: t.assigneeId,
            dueDate: t.dueDate, startDate: t.startDate, tags: t.tags, gitLink: t.gitLink || null,
            createdAt: new Date("2026-02-01T08:00:00Z"), updatedAt: new Date(),
        }).onConflictDoNothing();
    }
    console.log(`  ✓ ${seedTasks.length} tasks`);

    // ── Meetings ──
    const seedMeetings = [
        { 
            id: "m1", 
            title: "General Meeting : Sprint Planning", 
            description: "Planning for the next two weeks of development.", 
            projectId: "p1", 
            startTime: new Date("2026-03-08T10:00:00Z"), 
            endTime: new Date("2026-03-08T11:30:00Z"), 
            location: "https://zoom.us/j/123456789", 
            attendees: '["u1", "u2", "u3", "u4"]' 
        },
    ];

    for (const m of seedMeetings) {
        await db.insert(meetings).values({
            ...m,
            createdAt: new Date(),
        }).onConflictDoNothing();
    }
    console.log(`  ✓ ${seedMeetings.length} meetings`);

    // ── Inbox Messages ──
    const seedInbox = [
        { id: "msg1", senderId: "u2", receiverId: "u1", subject: "Update on Website Redesign", message: "Hi Andi, the landing page design is ready for review.", status: "unread" as const },
        { id: "msg2", senderId: "u3", receiverId: "u1", subject: "Feedback requested", message: "Can you take a look at the new API integration docs?", status: "read" as const },
    ];
    for (const msg of seedInbox) {
        await db.insert(inboxMessages).values({ ...msg, createdAt: new Date() }).onConflictDoNothing();
    }
    console.log(`  ✓ ${seedInbox.length} messages`);

    // ── Contacts ──
    const seedContacts = [
        { id: "c1", name: "John Doe", company: "Tech Solutions Inc.", email: "john@techsolutions.com", phone: "+1 234 567 890", notes: "Key client for API integration project." },
        { id: "c2", name: "Jane Smith", company: "Design Pro", email: "jane@designpro.io", phone: "+1 987 654 321", notes: "Consultant for mobile app UI." },
    ];
    for (const c of seedContacts) {
        await db.insert(contacts).values({ ...c, createdAt: new Date() }).onConflictDoNothing();
    }
    console.log(`  ✓ ${seedContacts.length} contacts`);

    // ── Employees ──
    const seedEmployees = [
        { id: "e1", name: "Andi Pratama", role: "Software Architect", email: "andi.pratama@company.com", phone: "+62 812 3456 7890", status: "active" as const },
        { id: "e2", name: "Budi Santoso", role: "Frontend Developer", email: "budi.santoso@company.com", phone: "+62 812 9876 5432", status: "active" as const },
        { id: "e3", name: "Citra Dewi", role: "UI/UX Designer", email: "citra.dewi@company.com", phone: "+62 813 1111 2222", status: "active" as const },
        { id: "e4", name: "Dian Kusuma", role: "QA Engineer", email: "dian.kusuma@company.com", phone: "+62 813 3333 4444", status: "active" as const },
    ];
    for (const e of seedEmployees) {
        await db.insert(employeesTable).values({ ...e, createdAt: new Date() }).onConflictDoNothing();
    }
    console.log(`  ✓ ${seedEmployees.length} employees`);

    // ── Schedules ──
    const seedSchedules = [
        { id: "s1", projectId: "p1", title: "UAT Phase 1", startTime: new Date("2026-03-10T09:00:00Z"), endTime: new Date("2026-03-10T17:00:00Z"), assignedTo: "u1" },
        { id: "s2", projectId: "p2", title: "Beta Release", startTime: new Date("2026-03-15T08:00:00Z"), endTime: new Date("2026-03-15T12:00:00Z"), assignedTo: "u4" },
    ];
    for (const s of seedSchedules) {
        await db.insert(schedules).values({ ...s, createdAt: new Date() }).onConflictDoNothing();
    }
    console.log(`  ✓ ${seedSchedules.length} schedules`);

    // ── Time Logs ──
    const seedTimeLogs = [
        // This Week (Mar 2 - Mar 8)
        { id: "tl_w1_1", taskId: "t4", userId: "u1", hours: "4.5", date: new Date("2026-03-02T08:00:00Z"), description: "Setup playwright environment" },
        { id: "tl_w1_2", taskId: "t8", userId: "u1", hours: "6.0", date: new Date("2026-03-03T09:00:00Z"), description: "SQLite integration" },
        { id: "tl_w1_3", taskId: "t8", userId: "u2", hours: "3.5", date: new Date("2026-03-03T10:00:00Z"), description: "SQLite peer review" },
        { id: "tl_w1_4", taskId: "t2", userId: "u2", hours: "8.0", date: new Date("2026-03-04T09:00:00Z"), description: "Header components" },
        { id: "tl_w1_5", taskId: "t3", userId: "u2", hours: "5.5", date: new Date("2026-03-05T09:00:00Z"), description: "Performance audit" },
        { id: "tl_w1_6", taskId: "t12", userId: "u2", hours: "2.0", date: new Date("2026-03-06T09:00:00Z"), description: "Clickhouse config" },
        { id: "tl_w1_7", taskId: "t12", userId: "u2", hours: "4.5", date: new Date("2026-03-07T09:00:00Z"), description: "Data pipeline" },
        
        // Next Week (Mar 9 - Mar 15)
        { id: "tl_w2_1", taskId: "t4", userId: "u1", hours: "5.0", date: new Date("2026-03-09T08:00:00Z"), description: "Code review" },
        { id: "tl_w2_2", taskId: "t8", userId: "u1", hours: "4.0", date: new Date("2026-03-10T09:00:00Z"), description: "Bug fixing" },
    ];

    for (const tl of seedTimeLogs) {
        await db.insert(timeLogs).values({
            ...tl,
            createdAt: new Date(),
        }).onConflictDoNothing();
    }
    console.log(`  ✓ ${seedTimeLogs.length} time logs`);

    console.log("✅ Seed complete!");
}

seed().catch(console.error);
