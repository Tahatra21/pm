# Technical Requirements Document (TRD) — ProjectFlow

**Version:** 1.0.0  
**Role:** Senior System Architect & Lead Developer  
**Project:** ProjectFlow (Internal Project Management System)

---

## 1. Tech Stack & Dasar Pemilihan

Kombinasi teknologi berikut dipilih untuk memastikan performa tinggi, skalabilitas tim kecil, dan keamanan data internal.

*   **Frontend & Backend (Fullstack):** **Next.js 16 (App Router)**. Memberikan keunggulan *Server-Side Rendering* (SSR) untuk SEO internal dan *Static Site Generation* (SSG) untuk dashboard yang cepat. API Routes digunakan sebagai backend terpadu.
*   **Styling:** **Tailwind CSS 4** & **Shadcn UI**. Memungkinkan pembuatan UI yang konsisten dan premium dengan kecepatan pengembangan yang sangat tinggi.
*   **Database:** **PostgreSQL**. Pilihan standar industri untuk data relasional, mendukung query kompleks dan integritas data yang kuat dibandingkan SQLite untuk kebutuhan jangka panjang.
*   **ORM:** **Prisma ORM**. Menyediakan *type-safety* end-to-end yang memudahkan developer dalam memanipulasi data tanpa error manual pada query SQL.
*   **Cloud/Hosting:** **Docker & Nginx**. Aplikasi dikemas dalam kontainer untuk konsistensi lingkungan *deployment*. Nginx bertindak sebagai *reverse proxy* untuk menangani SSL, sinkronisasi statis, dan keamanan tingkat lanjut.

---

## 2. UI/UX Specification

Antarmuka dirancang untuk produktivitas tinggi dengan estetika modern (*Linear-style*).

### A. Arsitektur Layout (Three-Layer)
1.  **Sidebar (Navigasi):** Persisten di sisi kiri, dapat disiutkan (*collapsible*). Berisi menu utama: Home, My Tasks, Projects, Teams, Analytics, dan Settings. Di bagian bawah terdapat *Workspace Switcher* dan *User Profile*.
2.  **Top Navigation Bar:** Berisi bilah pencarian global, pemicu *Command Palette* (CMD+K), ikon notifikasi real-time, dan tombol "Quick Create Task".
3.  **Main Workspace:** Area konten dinamis yang menggunakan *scroll-area* terpisah untuk menjaga orientasi pengguna.

### B. Komponen & Interaksi Kunci
*   **Kanban Board:** Sistem *drag-and-drop* menggunakan `@hello-pangea/dnd`. Kartu tugas menampilkan prioritas (warna), *assignee* (avatar), dan *due date*.
*   **Task Detail Panel:** Menggunakan *Sheet/Slide-over* dari Shadcn UI. Memungkinkan pengeditan deskripsi (Markdown), manajemen sub-tugas (Checklist), dan melihat *Activity Log* tanpa meninggalkan konteks papan.
*   **Command Palette (Quick Actions):** Integrasi `cmdk` untuk navigasi antar proyek, pencarian tugas global, dan perintah cepat seperti "Create Task" atau "Change Status".
*   **Design System:** Menggunakan *Outfit* sebagai font utama untuk keterbacaan dan *JetBrains Mono* untuk data teknis. Konsistensi warna mengikuti palet sistem yang adaptif (Light/Dark Mode).

---

## 3. Fitur Utama & Business Flow

### A. Alur Kerja Pengguna (Happy Path)
1.  **Login & Session:** Pengguna masuk via `/login`. Sistem memvalidasi kredensial dan membuat sesi aman.
2.  **Personalized Dashboard:** Pengguna melihat *KPI Cards* yang relevan: jumlah tugas aktif mereka, tugas yang mendekati tenggat (*Upcoming*), dan ringkasan aktivitas tim.
3.  **Project Navigation:** Memilih proyek dari Sidebar. Masuk ke tampilan *Board* atau *Timeline*.
4.  **Task Life-cycle:**
    *   **Create:** Klik "Add Task", isi detail, pilih *assignee*.
    *   **Execute:** Ubah status dari `Todo` ke `In-Progress`.
    *   **Git Sync:** Jika deskripsi mengandung tautan commit, status akan diperbarui otomatis via integrasi webhook/API.
    *   **Review & Complete:** Tugas dipindah ke `Review` untuk dicek manajer, lalu ke `Done`.
5.  **Analytics & Reporting:** Manajer mengakses halaman *Analytics* untuk melihat *Cycle Time* (waktu rata-rata penyelesaian tugas) dan *Team Workload Heatmap*.

### B. Fitur Unggulan
*   **Multi-View Project:** Berpindah seketika antara List View, Kanban Board, dan Timeline (Gantt Chart).
*   **Real-time Collaboration:** Indikator keberadaan user dan pembaruan status tugas secara instan tanpa *refresh* (Optimistic UI updates).
*   **Integrasi Git Otomatis:** Menghubungkan tugas langsung dengan status Pull Request di GitLab/GitHub internal.

---

## 4. Arsitektur Sistem & Technology Flow

*   **Data Flow:** Client mengirimkan request (JSON) via Fetch API ke Next.js API Routes. Backend memproses logika bisnis, berinteraksi dengan PostgreSQL via Prisma, dan mengembalikan response terstruktur.
*   **Authentication & Middleware:**
    *   **Metode:** Session-based authentication menggunakan cookie `HttpOnly` untuk mencegah serangan XSS.
    *   **Middleware:** `middleware.ts` mengecek validitas session pada setiap request rute sensitif (`/dashboard`, `/api/*`).
    *   **Role-Based Access Control (RBAC):** Middleware memverifikasi peran pengguna (`admin`, `member`, `viewer`) sebelum mengizinkan mutasi data.
*   **Error Handling:** Global Error Boundary di sisi frontend dan Try-Catch block di backend dengan standarisasi response error (e.g., `{ error: "Message", code: 400 }`).

---

## 5. Skema Database (Relational Schema)

```mermaid
erDiagram
    USERS ||--o{ SESSIONS : "memiliki"
    USERS ||--o{ PROJECT_MEMBERS : "tergabung"
    USERS ||--o{ TASKS : "mengelola"
    PROJECTS ||--o{ PROJECT_MEMBERS : "memiliki"
    PROJECTS ||--o{ TASKS : "berisi"
    TASKS ||--o{ INTEGRATIONS : "terhubung"

    USERS {
        uuid id PK
        string name
        string email UK
        string password_hash
        string role
        string color
        string avatar
        datetime created_at
        datetime updated_at
    }
    
    PROJECTS {
        uuid id PK
        string title
        text description
        string color
        datetime created_at
        datetime updated_at
    }

    PROJECT_MEMBERS {
        uuid id PK
        uuid project_id FK
        uuid user_id FK
    }
    
    TASKS {
        uuid id PK
        uuid project_id FK
        uuid assignee_id FK
        string title
        text description
        string status
        string priority
        datetime due_date
        datetime start_date
        string tags
        string git_link
        datetime created_at
        datetime updated_at
    }
    
    SESSIONS {
        uuid id PK
        uuid user_id FK
        string token UK
        datetime expires_at
        datetime created_at
    }

    INTEGRATIONS {
        uuid id PK
        uuid task_id FK
        string platform
        string link
        string pr_status
    }
```

*   **Indeks Strategis:** `IDX_tasks_project_id` dan `IDX_tasks_assignee_id` untuk mempercepat filtering tugas di Dashboard dan Kanban.

---

## 6. Komponen Tambahan yang Wajib Ada

### API Contract (Example: Create Task)
*   **Endpoint:** `POST /api/tasks`
*   **Request Body:**
    ```json
    {
      "projectId": "uuid",
      "title": "Build API",
      "priority": "high",
      "assigneeId": "uuid"
    }
    ```
*   **Response (201 Created):**
    ```json
    { "id": "uuid", "status": "success" }
    ```

### Security Strategy
*   **SQL Injection:** Dicegah secara otomatis oleh Prisma ORM melalui parameterized queries.
*   **XSS Protection:** Enkoding otomatis oleh React/Next.js serta penggunaan cookie `HttpOnly` & `SameSite: Strict`.
*   **Rate Limiting:** Dikonfigurasi di level Nginx (e.g., 60 requests per minute per IP) untuk mencegah Brute Force.

### State Management
*   **Server State:** Menggunakan **React Query** (TanStack Query) untuk caching data API dan sinkronisasi status real-time.
*   **UI State:** Menggunakan **Zustand** untuk mengelola state global yang ringan seperti sidebar toggle atau filter aktif.

### Testing Strategy
*   **Unit Test (Wajib):** Logika kalkulasi progres, utility pemformatan tanggal, dan helper autentikasi.
*   **Integration Test (Wajib):** Alur pembuatan tugas (POST API) dan proteksi Middleware (Auth guard).

---

> [!WARNING]
> **Bottleneck Alert:** Pada skala 1000+ tugas dalam satu board, render Kanban dapat melambat. Disarankan menggunakan *Windowing/Virtualization* untuk daftar tugas yang panjang.
