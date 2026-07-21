import { organizations } from "../../../database/schema";

// Infer the full Organization row type from Drizzle's table definition
export type Organization = typeof organizations.$inferSelect;

// Type for inserting a new organization row
export type NewOrganization = typeof organizations.$inferInsert;
