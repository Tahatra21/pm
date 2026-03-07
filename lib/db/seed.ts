import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { users, projects, projectMembers, tasks, integrations } from "./schema";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "projectflow.db");
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite);

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
        db.insert(users).values({
            id: u.id, name: u.name, email: u.email, passwordHash: simpleHash(u.password),
            role: u.role, avatar: "", color: u.color,
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        }).onConflictDoNothing().run();
    }
    console.log(`  ✓ ${seedUsers.length} users`);

    // ── Projects ──
    const seedProjects = [
        { id: "p1", title: "Website Redesign", description: "Pembaruan tampilan website utama perusahaan dengan desain modern dan responsif.", color: "#6366f1", members: ["u1", "u2", "u3"] },
        { id: "p2", title: "Mobile App v2.0", description: "Pengembangan versi kedua aplikasi mobile dengan fitur offline-first dan notifikasi push.", color: "#22c55e", members: ["u1", "u3", "u4", "u5"] },
        { id: "p3", title: "API Integration", description: "Integrasi dengan layanan pihak ketiga: payment gateway, SMS OTP, dan mapping service.", color: "#f59e0b", members: ["u1", "u2"] },
        { id: "p4", title: "Data Analytics Dashboard", description: "Pembuatan dashboard analytics real-time untuk monitoring KPI bisnis dan penjualan.", color: "#ec4899", members: ["u2", "u3", "u4"] },
    ];

    for (const p of seedProjects) {
        db.insert(projects).values({
            id: p.id, title: p.title, description: p.description, color: p.color,
            createdAt: "2026-01-15T08:00:00Z", updatedAt: new Date().toISOString(),
        }).onConflictDoNothing().run();

        for (const userId of p.members) {
            db.insert(projectMembers).values({
                id: randomUUID(), projectId: p.id, userId,
            }).onConflictDoNothing().run();
        }
    }
    console.log(`  ✓ ${seedProjects.length} projects`);

    // ── Tasks ──
    const seedTasks = [
        { id: "t1", projectId: "p1", title: "Desain ulang halaman utama (Landing Page)", description: "Buat mockup baru di Figma.", status: "done" as const, priority: "high" as const, assigneeId: "u3", dueDate: "2026-02-20T00:00:00Z", startDate: "2026-02-10T00:00:00Z", tags: '["design","frontend"]' },
        { id: "t2", projectId: "p1", title: "Implementasi komponen Header & Navbar baru", description: "Koding komponen React berdasarkan desain.", status: "done" as const, priority: "high" as const, assigneeId: "u2", dueDate: "2026-02-28T00:00:00Z", startDate: "2026-02-21T00:00:00Z", tags: '["frontend","react"]', gitLink: "https://github.com/company/website/pull/42" },
        { id: "t3", projectId: "p1", title: "Optimisasi performa halaman (Core Web Vitals)", description: "Target LCP < 2.5s dan CLS < 0.1.", status: "in-progress" as const, priority: "medium" as const, assigneeId: "u2", dueDate: "2026-03-15T00:00:00Z", startDate: "2026-03-01T00:00:00Z", tags: '["performance","seo"]' },
        { id: "t4", projectId: "p1", title: "Setup testing E2E dengan Playwright", description: "Buat test suite untuk semua user journey utama.", status: "todo" as const, priority: "medium" as const, assigneeId: "u1", dueDate: "2026-03-20T00:00:00Z", startDate: "2026-03-10T00:00:00Z", tags: '["testing","automation"]' },
        { id: "t5", projectId: "p1", title: "Integrasi CMS headless (Contentful)", description: "Hubungkan website dengan Contentful.", status: "review" as const, priority: "high" as const, assigneeId: "u3", dueDate: "2026-03-10T00:00:00Z", startDate: "2026-02-25T00:00:00Z", tags: '["cms","api"]', gitLink: "https://github.com/company/website/pull/55" },
        { id: "t6", projectId: "p1", title: "Deploy ke staging dan UAT testing", description: "Deploy build terbaru ke environment staging.", status: "todo" as const, priority: "low" as const, assigneeId: "u1", dueDate: "2026-03-25T00:00:00Z", startDate: "2026-03-20T00:00:00Z", tags: '["deployment","uat"]' },
        { id: "t7", projectId: "p2", title: "Arsitektur state management (Zustand)", description: "Refactor state management dari Redux ke Zustand.", status: "done" as const, priority: "high" as const, assigneeId: "u4", dueDate: "2026-02-15T00:00:00Z", startDate: "2026-02-01T00:00:00Z", tags: '["architecture","react-native"]' },
        { id: "t8", projectId: "p2", title: "Fitur offline-first dengan SQLite lokal", description: "Implementasi sinkronisasi data offline.", status: "in-progress" as const, priority: "urgent" as const, assigneeId: "u1", dueDate: "2026-03-12T00:00:00Z", startDate: "2026-02-20T00:00:00Z", tags: '["offline","database"]' },
        { id: "t9", projectId: "p2", title: "Push notification dengan Firebase Cloud Messaging", description: "Setup FCM untuk Android dan iOS.", status: "in-progress" as const, priority: "high" as const, assigneeId: "u3", dueDate: "2026-03-10T00:00:00Z", startDate: "2026-02-25T00:00:00Z", tags: '["notifications","firebase"]' },
        { id: "t10", projectId: "p2", title: "UI Library Migration ke NativeWind v4", description: "Upgrade seluruh styling.", status: "review" as const, priority: "medium" as const, assigneeId: "u5", dueDate: "2026-03-08T00:00:00Z", startDate: "2026-02-18T00:00:00Z", tags: '["ui","styling"]' },
        { id: "t11", projectId: "p2", title: "Biometric Authentication (FaceID/Fingerprint)", description: "Tambahkan opsi login biometrik.", status: "todo" as const, priority: "medium" as const, assigneeId: "u4", dueDate: "2026-03-18T00:00:00Z", startDate: "2026-03-10T00:00:00Z", tags: '["security","auth"]' },
        { id: "t12", projectId: "p4", title: "Setup data pipeline Clickhouse", description: "Konfigurasi Clickhouse sebagai OLAP database.", status: "in-progress" as const, priority: "urgent" as const, assigneeId: "u2", dueDate: "2026-03-10T00:00:00Z", startDate: "2026-02-25T00:00:00Z", tags: '["database","analytics"]' },
        { id: "t13", projectId: "p4", title: "Chart library evaluation dan setup", description: "Evaluasi library chart yang paling sesuai.", status: "done" as const, priority: "medium" as const, assigneeId: "u3", dueDate: "2026-03-01T00:00:00Z", startDate: "2026-02-22T00:00:00Z", tags: '["research","frontend"]' },
        { id: "t14", projectId: "p4", title: "Buat komponen KPI card dengan trend indicator", description: "Komponen reusable.", status: "todo" as const, priority: "high" as const, assigneeId: "u4", dueDate: "2026-03-15T00:00:00Z", startDate: "2026-03-08T00:00:00Z", tags: '["frontend","component"]' },
        { id: "t15", projectId: "p4", title: "Real-time WebSocket untuk live metrics", description: "Implementasi WebSocket connection.", status: "todo" as const, priority: "high" as const, assigneeId: "u2", dueDate: "2026-03-20T00:00:00Z", startDate: "2026-03-12T00:00:00Z", tags: '["backend","websocket"]' },
    ];

    for (const t of seedTasks) {
        db.insert(tasks).values({
            id: t.id, projectId: t.projectId, title: t.title, description: t.description,
            status: t.status, priority: t.priority, assigneeId: t.assigneeId,
            dueDate: t.dueDate, startDate: t.startDate, tags: t.tags, gitLink: t.gitLink || null,
            createdAt: "2026-02-01T08:00:00Z", updatedAt: new Date().toISOString(),
        }).onConflictDoNothing().run();
    }
    console.log(`  ✓ ${seedTasks.length} tasks`);

    console.log("✅ Seed complete!");
}

seed().catch(console.error);
