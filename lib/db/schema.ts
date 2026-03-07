import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// ── Users ──
export const users = pgTable("users", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ["admin", "member", "viewer"] as const }).notNull().default("member"),
    avatar: text("avatar").default(""),
    color: text("color").default("#6366f1"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Projects ──
export const projects = pgTable("projects", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").default(""),
    color: text("color").default("#6366f1"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Project Members (many-to-many) ──
export const projectMembers = pgTable("project_members", {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
});

// ── Tasks ──
export const tasks = pgTable("tasks", {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").default(""),
    status: text("status", { enum: ["todo", "in-progress", "review", "done"] as const }).notNull().default("todo"),
    priority: text("priority", { enum: ["low", "medium", "high", "urgent"] as const }).notNull().default("medium"),
    assigneeId: text("assignee_id").references(() => users.id, { onDelete: "set null" }),
    dueDate: timestamp("due_date"),
    startDate: timestamp("start_date"),
    tags: text("tags"), // JSON string array
    gitLink: text("git_link"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Integrations ──
export const integrations = pgTable("integrations", {
    id: text("id").primaryKey(),
    taskId: text("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
    platform: text("platform", { enum: ["github", "gitlab"] as const }).notNull(),
    link: text("link").notNull(),
    prStatus: text("pr_status", { enum: ["open", "merged", "closed"] as const }).default("open"),
});

// ── Subtasks (checklists per task) ──
export const subtasks = pgTable("subtasks", {
    id: text("id").primaryKey(),
    taskId: text("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    completed: text("completed", { enum: ["true", "false"] as const }).notNull().default("false"),
    sortOrder: text("sort_order").default("0"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Comments / Activity Log ──
export const comments = pgTable("comments", {
    id: text("id").primaryKey(),
    taskId: text("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    type: text("type", { enum: ["comment", "system"] as const }).notNull().default("comment"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Sessions (for Better Auth) ──
export const sessions = pgTable("sessions", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
