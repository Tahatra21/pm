import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// ── Users ──
export const users = sqliteTable("users", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ["admin", "member", "viewer"] }).notNull().default("member"),
    avatar: text("avatar").default(""),
    color: text("color").default("#6366f1"),
    createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// ── Projects ──
export const projects = sqliteTable("projects", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").default(""),
    color: text("color").default("#6366f1"),
    createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// ── Project Members (many-to-many) ──
export const projectMembers = sqliteTable("project_members", {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
});

// ── Tasks ──
export const tasks = sqliteTable("tasks", {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").default(""),
    status: text("status", { enum: ["todo", "in-progress", "review", "done"] }).notNull().default("todo"),
    priority: text("priority", { enum: ["low", "medium", "high", "urgent"] }).notNull().default("medium"),
    assigneeId: text("assignee_id").references(() => users.id, { onDelete: "set null" }),
    dueDate: text("due_date"),
    startDate: text("start_date"),
    tags: text("tags"), // JSON string array
    gitLink: text("git_link"),
    createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// ── Integrations ──
export const integrations = sqliteTable("integrations", {
    id: text("id").primaryKey(),
    taskId: text("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
    platform: text("platform", { enum: ["github", "gitlab"] }).notNull(),
    link: text("link").notNull(),
    prStatus: text("pr_status", { enum: ["open", "merged", "closed"] }).default("open"),
});

// ── Sessions (for Better Auth) ──
export const sessions = sqliteTable("sessions", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});
