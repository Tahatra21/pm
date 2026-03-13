# .Worktion

**.Worktion** is a professional, high-performance Project Management Office (PMO) platform developed for collaborative teams. It bridges the gap between structured planning and active execution (Work + Action), providing real-time insights into project health, team productivity, and workload balance.

---

## 🚀 Fitur Utama

### 📊 Dashboard Eksekutif
*   **Produktivitas Real-time:** Grafik jam kerja harian dan tingkat utilisasi tim.
*   **Workload Balance:** Visualisasi beban kerja (Overloaded vs Optimal).
*   **Quick Stats:** Pantau jumlah task selesai, proyek aktif, dan tingkat kehadiran.

### 📁 Management Proyek & Stream
*   **Work Streams:** Pengelompokan proyek berdasarkan divisi atau kategori kerja.
*   **Team Assignment:** Manajemen anggota tim yang ditugaskan per proyek dengan inisial dan warna unik.
*   **Tagging System:** Kategorisasi proyek menggunakan sistem tag yang fleksibel.

### ✅ Kanban Board Modern
*   **Drag-and-Drop:** Kelola alur kerja dengan mudah (Backlog → To Do → In Progress → Review → Done).
*   **Subtask Progress:** Menampilkan rasio penyelesaian subtask (misal: "2/5") langsung di kartu task.
*   **Rich Details:** Drawer detail task untuk mengelola deskripsi, prioritas, assignee, git link, dan komentar.

### 🗓️ Timeline & Gantt Chart
*   **Visualisasi Jadwal:** Pantau timeline proyek secara harian, mingguan, bulanan, hingga tahunan.
*   **Progress Tracking:** Indikator progres fisik berdasarkan bobot status task.

### 💬 Kolaborasi & Komunikasi
*   **Inbox Message:** Kirim pesan internal antar anggota tim.
*   **Task Comments:** Diskusi langsung di dalam konteks pekerjaan.
*   **Notifications:** Notifikasi unread messages di sidebar.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Database ORM** | [Prisma](https://www.prisma.io/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) |
| **UI Components** | [Shadcn UI](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/) |
| **D&D Engine** | [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## 📐 ER Diagram (Database Schema)

```mermaid
erDiagram
    tbl_users ||--o{ tbl_sessions : "has"
    tbl_users ||--o{ tbl_project_members : "participates"
    tbl_users ||--o{ tbl_tasks : "assigned_to"
    tbl_users ||--o{ tbl_time_logs : "logs_hours"
    tbl_users ||--o{ tbl_comments : "writes"
    tbl_users ||--o{ tbl_inbox_messages : "sends_receives"
    
    tbl_streams ||--o{ tbl_projects : "contains"
    
    tbl_projects ||--o{ tbl_project_members : "has_members"
    tbl_projects ||--o{ tbl_tasks : "has_tasks"
    tbl_projects ||--o{ tbl_project_tag_relations : "categorized_by"
    tbl_projects ||--o{ tbl_meetings : "hosts"
    
    tbl_project_tags ||--o{ tbl_project_tag_relations : "assigned_to"
    
    tbl_tasks ||--o{ tbl_subtasks : "has_steps"
    tbl_tasks ||--o{ tbl_comments : "has_threads"
    tbl_tasks ||--o{ tbl_integrations : "links_to_git"
    tbl_tasks ||--o{ tbl_time_logs : "tracked_in"

    tbl_users {
        string id PK
        string name
        string email
        string password_hash
        string role
        string color
        string status
    }

    tbl_projects {
        string id PK
        string title
        string description
        string color
        string stream_id FK
    }

    tbl_tasks {
        string id PK
        string project_id FK
        string assignee_id FK
        string title
        string status
        string priority
        datetime due_date
    }

    tbl_subtasks {
        string id PK
        string task_id FK
        string title
        string completed
    }

    tbl_streams {
        string id PK
        string name
        string code
    }
```

---

## 📦 Project Structure

```bash
pm/
├── app/                # Next.js App Router (Pages & API)
├── backup_archive/     # Arsip data sisa migrasi (di-ignore oleh Git)
├── components/         # Komponen UI (Atomic & UI Primitives)
├── docs/               # Dokumentasi teknis terpusat
├── lib/                # Database client, Auth, & Utilities
├── prisma/             # Schema database Prisma & Seed scripts
├── public/             # Asset statis (Logo, Icon)
├── scripts/            # Script otomatisasi & backup
└── .env                # Konfigurasi environment (Private)
```

---

## ⚙️ Installation (Local Development)

### 1. Prasyarat
*   Node.js ≥ 20
*   PostgreSQL Database

### 2. Setup Project
```bash
# Clone Repo
git clone https://github.com/Tahatra21/pm.git
cd pm

# Install Dependencies
npm install
```

### 3. Konfigurasi Environment
Buat file `.env` di root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/pmo_worktion"
```

### 4. Database Initialization
```bash
# Push schema ke database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed data awal
npm run seed
```

### 5. Jalankan Aplikasi
```bash
npm run dev
```

---

## 🚀 Deployment

### Docker (Recommended)
```bash
# Build Image
docker build -t worktion-app .

# Run Container
docker run -p 3000:3000 --env-file .env worktion-app
```

### Manual Build
```bash
# Build production bundle
npm run build

# Start server
npm run start
```

---

## 📄 License
All rights reserved © **.Worktion** 2026.
Internal infrastructure only.
