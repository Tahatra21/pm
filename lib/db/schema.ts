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
    streamId: text("stream_id").references(() => streams.id, { onDelete: "set null" }),
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
// ── Meetings ──
export const meetings = pgTable("meetings", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").default(""),
    projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    location: text("location").default(""), // e.g. "Zoom Link" or "Room 101"
    attendees: text("attendees"), // JSON string array of user IDs
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Time Logs (for work hour tracking) ──
export const timeLogs = pgTable("time_logs", {
    id: text("id").primaryKey(),
    taskId: text("task_id").references(() => tasks.id, { onDelete: "set null" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    hours: text("hours").notNull(), // Using text to handle decimal precision simple for demo
    date: timestamp("date").notNull().defaultNow(),
    description: text("description").default(""),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Inbox Messages ──
export const inboxMessages = pgTable("inbox_messages", {
    id: text("id").primaryKey(),
    senderId: text("sender_id").notNull().references(() => users.id),
    receiverId: text("receiver_id").notNull().references(() => users.id),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    status: text("status", { enum: ["unread", "read"] as const }).notNull().default("unread"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Contacts ──
export const contacts = pgTable("contacts", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    company: text("company"),
    email: text("email"),
    phone: text("phone"),
    projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }), // Relation to project
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Employees ──
export const employeesTable = pgTable("employees", { 
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    role: text("role").notNull(),
    email: text("email").notNull().unique(),
    phone: text("phone"),
    projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }), // Relation to project
    status: text("status", { enum: ["active", "inactive"] as const }).notNull().default("active"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Schedules ──
export const schedules = pgTable("schedules", {
    id: text("id").primaryKey(),
    projectId: text("project_id").references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    assignedTo: text("assigned_to").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Productivity Daily ──
export const productivityDaily = pgTable("productivity_daily", {
    id: text("id").primaryKey(),
    date: timestamp("date").notNull().unique(),
    totalHours: text("total_hours").notNull(),
    utilizationRate: text("utilization_rate").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Streams (Master Data) ──
export const streams = pgTable("streams", {
    id: text("id").primaryKey(),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    isActive: text("is_active", { enum: ["true", "false"] as const }).notNull().default("true"),
    sortOrder: text("sort_order").default("0"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Project Tags (Master Data) ──
export const projectTags = pgTable("project_tags", {
    id: text("id").primaryKey(),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    category: text("category").default("general"),
    isActive: text("is_active", { enum: ["true", "false"] as const }).notNull().default("true"),
    sortOrder: text("sort_order").default("0"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Project Tag Relations (many-to-many) ──
export const projectTagRelations = pgTable("project_tag_relations", {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    tagId: text("tag_id").notNull().references(() => projectTags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
