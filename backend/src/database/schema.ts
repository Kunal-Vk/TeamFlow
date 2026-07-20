import {pgTable,uuid,varchar,timestamp} from "drizzle-orm/pg-core";

export const users=pgTable("users",{
    id:uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password:varchar("password",{length:255}).notNull(),
    role:varchar("role",{length:20}).notNull().default("member"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
