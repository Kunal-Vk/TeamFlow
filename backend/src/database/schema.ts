import { pgTable, uuid, varchar, timestamp, text, date, uniqueIndex } from "drizzle-orm/pg-core";

// ─── Users ────────────────────────────────────────────────────────────────────
// organizationId has no FK reference here to avoid a circular TypeScript
// dependency (organizations → users → organizations). Referential integrity
// is enforced at the application layer instead.
export const users = pgTable("users", {
  id:             uuid("id").defaultRandom().primaryKey(),
  name:           varchar("name", { length: 100 }).notNull(),
  email:          varchar("email", { length: 255 }).notNull().unique(),
  password:       varchar("password", { length: 255 }).notNull(),
  role:           varchar("role", { length: 20 }),           // null | "owner" | "member"
  organizationId: uuid("organization_id"),                   // null = no org
  createdAt:      timestamp("created_at").defaultNow().notNull(),
  updatedAt:      timestamp("updated_at").defaultNow().notNull(),
});

// ─── Organizations ────────────────────────────────────────────────────────────
export const organizations = pgTable("organizations", {
  id:          uuid("id").defaultRandom().primaryKey(),
  name:        varchar("name", { length: 255 }).notNull(),
  slug:        varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  ownerId:     uuid("owner_id").notNull().references(() => users.id),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  updatedAt:   timestamp("updated_at").defaultNow().notNull(),
});

// ─── Refresh Tokens ───────────────────────────────────────────────────────────
export const refreshTokens = pgTable("refresh_tokens", {
  id:        uuid("id").defaultRandom().primaryKey(),
  userId:    uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token:     varchar("token", { length: 512 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Projects ─────────────────────────────────────────────────────────────────
// Slug is unique per organization — two different orgs can use the same slug.
export const projects = pgTable(
  "projects",
  {
    id:             uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    name:           varchar("name", { length: 255 }).notNull(),
    slug:           varchar("slug", { length: 100 }).notNull(),
    description:    text("description"),
    createdAt:      timestamp("created_at").defaultNow().notNull(),
    updatedAt:      timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    orgSlugUnique: uniqueIndex("projects_org_slug_unique").on(t.organizationId, t.slug),
  })
);

// ─── Teams ────────────────────────────────────────────────────────────────────
export const teams = pgTable("teams", {
  id:             uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name:           varchar("name", { length: 255 }).notNull(),
  description:    text("description"),
  createdAt:      timestamp("created_at").defaultNow().notNull(),
  updatedAt:      timestamp("updated_at").defaultNow().notNull(),
});

// ─── Tasks ────────────────────────────────────────────────────────────────────
// status : TODO | IN_PROGRESS | DONE
// priority: LOW  | MEDIUM     | HIGH
export const tasks = pgTable("tasks", {
  id:          uuid("id").defaultRandom().primaryKey(),
  projectId:   uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title:       varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  status:      varchar("status", { length: 20 }).notNull().default("TODO"),
  priority:    varchar("priority", { length: 10 }).notNull().default("MEDIUM"),
  assignedTo:  uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
  dueDate:     date("due_date"),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  updatedAt:   timestamp("updated_at").defaultNow().notNull(),
});

// ─── Comments ─────────────────────────────────────────────────────────────────
export const comments = pgTable("comments", {
  id:        uuid("id").defaultRandom().primaryKey(),
  taskId:    uuid("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  userId:    uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content:   text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
