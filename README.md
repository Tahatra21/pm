# Worktion

**Worktion** is a modern, full-stack Project Management Office (PMO) application built for teams that need to track complex workflows, manage multi-project portfolios, and monitor team productivity — all from a clean, responsive dashboard.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Authentication](#authentication)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [License](#license)

---

## Features

### 📊 Dashboard
- Comprehensive overview of team productivity, workload balance, and project stats.
- Productivity charts (daily hours, utilization rate).
- Upcoming schedule snapshots and recent activity feeds.

### 📁 Projects & Streams
- Organize projects under **Streams** (work categories/divisions).
- Each project has a title, description, color label, member list, and tag associations.
- Project detail view with task progress and member overview.

### ✅ Kanban Board
- Drag-and-drop task management powered by `@hello-pangea/dnd`.
- Four columns: **Todo → In Progress → Review → Done**.
- Task cards display title, priority, assignee avatar, due date, and tags.
- Inline task detail drawer: edit title, description, status, priority, assignee, dates, git link, subtasks, and comments.

### 🗓️ Timeline (Gantt Chart)
- Visualize task schedules across **Daily, Weekly, Monthly, and Yearly** zoom levels.
- Interactive tooltips displaying task details and weighted progress.
- Multi-row layout per project with smart date rendering.

### 📋 My Tasks
- Personal task view filtered to the currently logged-in user.
- Grouped by status for quick action.

### 📅 Schedule
- Calendar-based view of meetings and scheduled events.
- Each schedule entry is linked to a project and optionally assigned to a team member.

### 📥 Inbox
- Direct messaging between team members.
- Unread/read status tracking.
- Notification badge in the sidebar.

### 👥 Employees
- Directory of all team members with role, email, phone, and project assignment.
- Active/inactive status management.

### 📇 Contacts
- CRM-style contact directory linked to projects.
- Fields: name, company, email, phone, and notes.

### ⚙️ Settings
- User preferences: name, avatar, and color.
- Theme toggle: **Dark / Light mode** (via `next-themes`).
- Timezone configuration.

### 🔐 Admin Panel
- Admin-only section for managing users and system-wide settings.
- Role-based access: `admin`, `member`, `viewer`.

### 🔍 Command Palette
- Global `Cmd+K` command palette for quick navigation across the app.

### 🔗 Integrations
- Link tasks to **GitHub** or **GitLab** pull requests.
- Track PR status: `open`, `merged`, or `closed`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript 5 |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| UI Components | [Shadcn UI](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/) |
| Animations | `tw-animate-css` |
| Icons | [Lucide React](https://lucide.dev/) |
| Drag & Drop | [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) |
| Database ORM | [Drizzle ORM](https://orm.drizzle.team/) |
| Schema (alt) | [Prisma](https://www.prisma.io/) (used for reference / migration tooling) |
| Database | PostgreSQL |
| Auth | Custom session-based auth (cookie: `session_token`) |
| Date Utilities | [date-fns v4](https://date-fns.org/) |
| Command Palette | [cmdk](https://cmdk.paco.me/) |
| Themes | [next-themes](https://github.com/pacocoursey/next-themes) |

---

## Project Structure

```
pm/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Login page
│   │   └── register/       # Registration page
│   ├── (dashboard)/
│   │   ├── page.tsx        # Main dashboard (overview)
│   │   ├── layout.tsx      # Dashboard shell (sidebar + header)
│   │   ├── board/          # Kanban board view
│   │   ├── projects/       # Project list & detail
│   │   ├── stream/[id]/    # Stream-specific project view
│   │   ├── my-tasks/       # Personal task list
│   │   ├── schedule/       # Calendar / schedule view
│   │   ├── inbox/          # Messaging / notifications
│   │   ├── employees/      # Team employee directory
│   │   ├── contact/        # Contact / CRM directory
│   │   ├── admin/          # Admin panel
│   │   ├── settings/       # User settings
│   │   └── help/           # Help & support page
│   ├── api/
│   │   ├── auth/           # Login, register, logout, session
│   │   ├── tasks/          # CRUD for tasks
│   │   ├── projects/       # CRUD for projects
│   │   ├── streams/        # CRUD for streams
│   │   ├── subtasks/       # CRUD for subtasks
│   │   ├── comments/       # Task comments & activity log
│   │   ├── employees/      # Employee management
│   │   ├── contacts/       # Contact management
│   │   ├── inbox/          # Inbox messages
│   │   ├── schedules/      # Schedule/meeting management
│   │   ├── calendar/       # Calendar data endpoint (public)
│   │   ├── dashboard/      # Aggregated dashboard stats
│   │   ├── users/          # User management
│   │   └── admin/          # Admin-only endpoints
│   ├── globals.css         # Global styles + CSS variables (theme tokens)
│   └── layout.tsx          # Root layout (ThemeProvider)
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx     # Navigation sidebar with stream/project tree
│   │   └── header.tsx      # Top header (search, notifications, user menu)
│   ├── kanban/
│   │   └── kanban-board.tsx # Full Kanban board with drag-and-drop
│   ├── timeline/           # Gantt-style timeline components
│   ├── command-palette.tsx # Global Cmd+K command palette
│   ├── theme-provider.tsx  # next-themes wrapper
│   ├── theme-toggle.tsx    # Dark/light mode toggle button
│   └── ui/                 # Shadcn UI primitives (button, dialog, select…)
├── lib/
│   ├── db/
│   │   ├── index.ts        # Drizzle DB client
│   │   ├── schema.ts       # Drizzle ORM schema definitions
│   │   ├── seed.ts         # Seed script (basic data)
│   │   └── seed-massive.ts # Seed script (large dataset for demos)
│   ├── generated/          # Prisma generated client output
│   ├── integrations/
│   │   └── git.ts          # GitHub/GitLab integration helpers
│   ├── auth.ts             # Auth helpers (session creation, validation)
│   ├── auth-context.tsx    # React context for current user
│   ├── mock-data.ts        # Static mock data for UI prototyping
│   ├── notifications.ts    # Notification utilities
│   ├── types.ts            # Shared TypeScript interfaces & types
│   └── utils.ts            # General utility functions (cn, etc.)
├── prisma/
│   └── schema.prisma       # Prisma schema (PostgreSQL datasource)
├── data/                   # Static/reference data files
├── public/                 # Static assets (images, icons)
├── scripts/                # Utility scripts
├── nginx/                  # Nginx config for production deployment
├── Dockerfile              # Docker configuration
├── drizzle.config.ts       # Drizzle Kit configuration
├── next.config.ts          # Next.js configuration
├── middleware.ts           # Route protection middleware
└── .env                    # Environment variables (not committed)
```

---

## Database Schema

The database uses **PostgreSQL**, managed via **Drizzle ORM** (`lib/db/schema.ts`).

| Table | Description |
|---|---|
| `users` | Registered team members with role (`admin`, `member`, `viewer`) |
| `sessions` | Session tokens for cookie-based authentication |
| `projects` | Projects, linked to a stream and color-coded |
| `project_members` | Many-to-many: users ↔ projects |
| `streams` | Work streams / divisions that group projects |
| `project_tags` | Reusable tags for categorizing projects |
| `project_tag_relations` | Many-to-many: projects ↔ tags |
| `tasks` | Tasks within projects (status, priority, assignee, dates, git link) |
| `subtasks` | Checklist items under a task |
| `comments` | Comments and system activity log on tasks |
| `integrations` | GitHub/GitLab PR links attached to tasks |
| `meetings` | Scheduled meetings with attendees and time range |
| `schedules` | Individual schedule slots assigned to users/projects |
| `time_logs` | Work hour tracking per task and user |
| `inbox_messages` | Direct messages between users |
| `employees` | Employee directory (separate from users/auth) |
| `contacts` | External contacts linked to projects |
| `productivity_daily` | Daily productivity metrics (hours, utilization rate) |

### ER Diagram

```mermaid
erDiagram
    users {
        text id PK
        text name
        text email
        text password_hash
        text role
        text avatar
        text color
        timestamp created_at
        timestamp updated_at
    }

    sessions {
        text id PK
        text user_id FK
        text token
        timestamp expires_at
        timestamp created_at
    }

    streams {
        text id PK
        text code
        text name
        text description
        text is_active
        text sort_order
        timestamp created_at
        timestamp updated_at
    }

    projects {
        text id PK
        text title
        text description
        text color
        text stream_id FK
        timestamp created_at
        timestamp updated_at
    }

    project_members {
        text id PK
        text project_id FK
        text user_id FK
    }

    project_tags {
        text id PK
        text code
        text name
        text category
        text is_active
        text sort_order
        timestamp created_at
        timestamp updated_at
    }

    project_tag_relations {
        text id PK
        text project_id FK
        text tag_id FK
        timestamp created_at
    }

    tasks {
        text id PK
        text project_id FK
        text title
        text description
        text status
        text priority
        text assignee_id FK
        timestamp due_date
        timestamp start_date
        text tags
        text git_link
        timestamp created_at
        timestamp updated_at
    }

    subtasks {
        text id PK
        text task_id FK
        text title
        text completed
        text sort_order
        timestamp created_at
    }

    comments {
        text id PK
        text task_id FK
        text user_id FK
        text content
        text type
        timestamp created_at
    }

    integrations {
        text id PK
        text task_id FK
        text platform
        text link
        text pr_status
    }

    time_logs {
        text id PK
        text task_id FK
        text user_id FK
        text hours
        timestamp date
        text description
        timestamp created_at
    }

    inbox_messages {
        text id PK
        text sender_id FK
        text receiver_id FK
        text subject
        text message
        text status
        timestamp created_at
    }

    meetings {
        text id PK
        text title
        text description
        text project_id FK
        timestamp start_time
        timestamp end_time
        text location
        text attendees
        timestamp created_at
    }

    schedules {
        text id PK
        text project_id FK
        text title
        timestamp start_time
        timestamp end_time
        text assigned_to FK
        timestamp created_at
    }

    employees {
        text id PK
        text name
        text role
        text email
        text phone
        text project_id FK
        text status
        timestamp created_at
    }

    contacts {
        text id PK
        text name
        text company
        text email
        text phone
        text project_id FK
        text notes
        timestamp created_at
    }

    productivity_daily {
        text id PK
        timestamp date
        text total_hours
        text utilization_rate
        timestamp created_at
    }

    users ||--o{ sessions : "has"
    users ||--o{ project_members : "joins"
    users ||--o{ tasks : "assigned to"
    users ||--o{ comments : "writes"
    users ||--o{ time_logs : "logs"
    users ||--o{ inbox_messages : "sends (sender)"
    users ||--o{ inbox_messages : "receives (receiver)"
    users ||--o{ schedules : "assigned to"

    streams ||--o{ projects : "groups"

    projects ||--o{ project_members : "has"
    projects ||--o{ tasks : "contains"
    projects ||--o{ project_tag_relations : "tagged with"
    projects ||--o{ meetings : "has"
    projects ||--o{ schedules : "has"
    projects ||--o{ employees : "has"
    projects ||--o{ contacts : "has"

    project_tags ||--o{ project_tag_relations : "used in"

    tasks ||--o{ subtasks : "has"
    tasks ||--o{ comments : "has"
    tasks ||--o{ integrations : "linked to"
    tasks ||--o{ time_logs : "tracked in"
```

### Task Status Values
`todo` → `in-progress` → `review` → `done`

### Task Priority Values
`low` | `medium` | `high` | `urgent`

### User Roles
`admin` | `member` | `viewer`

### Database Relations

| From Table | FK Column | → To Table | Column | Cardinality | On Delete |
|---|---|---|---|---|---|
| `sessions` | `user_id` | `users` | `id` | Many-to-One | Cascade |
| `projects` | `stream_id` | `streams` | `id` | Many-to-One | Set Null |
| `project_members` | `project_id` | `projects` | `id` | Many-to-One | Cascade |
| `project_members` | `user_id` | `users` | `id` | Many-to-One | Cascade |
| `project_tag_relations` | `project_id` | `projects` | `id` | Many-to-One | Cascade |
| `project_tag_relations` | `tag_id` | `project_tags` | `id` | Many-to-One | Cascade |
| `tasks` | `project_id` | `projects` | `id` | Many-to-One | Cascade |
| `tasks` | `assignee_id` | `users` | `id` | Many-to-One | Set Null |
| `subtasks` | `task_id` | `tasks` | `id` | Many-to-One | Cascade |
| `comments` | `task_id` | `tasks` | `id` | Many-to-One | Cascade |
| `comments` | `user_id` | `users` | `id` | Many-to-One | Cascade |
| `integrations` | `task_id` | `tasks` | `id` | Many-to-One | Cascade |
| `time_logs` | `task_id` | `tasks` | `id` | Many-to-One | Set Null |
| `time_logs` | `user_id` | `users` | `id` | Many-to-One | Cascade |
| `inbox_messages` | `sender_id` | `users` | `id` | Many-to-One | Restrict |
| `inbox_messages` | `receiver_id` | `users` | `id` | Many-to-One | Restrict |
| `meetings` | `project_id` | `projects` | `id` | Many-to-One | Set Null |
| `schedules` | `project_id` | `projects` | `id` | Many-to-One | Cascade |
| `schedules` | `assigned_to` | `users` | `id` | Many-to-One | Set Null |
| `employees` | `project_id` | `projects` | `id` | Many-to-One | Set Null |
| `contacts` | `project_id` | `projects` | `id` | Many-to-One | Set Null |

**Ringkasan relasi utama:**

- **`users`** adalah entitas sentral — semua aktivitas (task, komentar, time log, pesan, sesi) berelasi ke user.
- **`streams`** mengelompokkan banyak **`projects`** (one-to-many).
- **`projects`** adalah hub utama — task, meeting, schedule, employee, contact, dan tag semua berelasi ke project.
- **`project_members`** adalah junction table many-to-many antara `users` ↔ `projects`.
- **`project_tag_relations`** adalah junction table many-to-many antara `projects` ↔ `project_tags`.
- **`tasks`** memiliki banyak turunan: `subtasks`, `comments`, `integrations`, dan `time_logs` — semuanya ikut terhapus jika task dihapus (**Cascade**).
- **`integrations`** mencatat koneksi task ke PR GitHub/GitLab dengan status `open`, `merged`, atau `closed`.
- **`inbox_messages`** menggunakan dua FK ke `users` (sebagai pengirim dan penerima).

---

## API Routes

All API routes are protected by the middleware (session token required), except `/api/auth/*` and `/api/calendar`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | User login, sets `session_token` cookie |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/logout` | Clears session cookie |
| GET | `/api/auth/session` | Returns current session user |
| GET/POST | `/api/projects` | List / create projects |
| GET/PUT/DELETE | `/api/projects/[id]` | Get / update / delete a project |
| GET/POST | `/api/tasks` | List / create tasks |
| GET/PUT/DELETE | `/api/tasks/[id]` | Get / update / delete a task |
| GET/POST | `/api/subtasks` | List / create subtasks |
| GET/POST | `/api/comments` | List / create comments on tasks |
| GET/POST | `/api/streams` | List / create streams |
| GET/POST | `/api/employees` | List / create employees |
| GET/POST | `/api/contacts` | List / create contacts |
| GET/POST | `/api/inbox` | List / send inbox messages |
| GET/POST | `/api/schedules` | List / create schedules |
| GET | `/api/calendar` | Public calendar data |
| GET | `/api/dashboard` | Aggregated stats for the dashboard |
| GET/POST | `/api/users` | List / manage users |
| GET | `/api/admin` | Admin-only data endpoints |

---

## Authentication

Worktion uses a **custom session-based authentication** system:

1. On login, a `session_token` is created and stored in the `sessions` table, then set as an **HTTP-only cookie** on the client.
2. The **Next.js middleware** (`middleware.ts`) checks for the `session_token` cookie on every protected request.
3. Unauthenticated page requests are redirected to `/login`.
4. Unauthenticated API requests receive a `401 Unauthorized` JSON response.
5. Sessions are stored in the database and have an expiry timestamp (`expires_at`).

**Public routes (no auth required):**
- `/login`
- `/register`
- `/api/auth/*`
- `/api/calendar`

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **PostgreSQL** (running locally or via Docker)
- **npm**

### 1. Clone the repository

```bash
git clone git@github.com:Tahatra21/pm.git
cd pm
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file at the root of the project:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>
```

Example:
```env
DATABASE_URL=postgresql://postgre:jmsdev@localhost:5432/pmo
```

### 4. Set up the database

**Push the schema** (creates tables based on Drizzle schema):
```bash
npx drizzle-kit push
```

**Seed the database** (basic dataset):
```bash
npm run seed
```

**Seed with a larger demo dataset:**
```bash
npx tsx lib/db/seed-massive.ts
```

*(Optional) Use Prisma for schema introspection or migrations:*
```bash
npx prisma generate
npx prisma db push
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app will redirect to `/login` if no active session is found.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string |

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build the production bundle |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npx drizzle-kit push` | Sync Drizzle schema to the database |
| `npx drizzle-kit studio` | Open Drizzle Studio (DB GUI) |
| `npx tsx lib/db/seed.ts` | Seed database with basic data |
| `npx tsx lib/db/seed-massive.ts` | Seed database with large demo dataset |
| `npx prisma generate` | Generate Prisma client |
| `npx prisma db push` | Sync Prisma schema to the database |

---

## Deployment

### Docker

A `Dockerfile` is included for containerized deployment.

```bash
# Build the image
docker build -t worktion .

# Run the container
docker run -p 3000:3000 --env-file .env worktion
```

### Nginx

An Nginx configuration is available in the `/nginx` directory for use as a reverse proxy in front of the Next.js server.

### Production Build

```bash
npm run build
npm run start
```

---

## License

Private repository. All rights reserved © Worktion.
