import { projects } from "../../database/schema";

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
