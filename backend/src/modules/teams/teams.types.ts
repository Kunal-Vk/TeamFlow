import { teams } from "../../database/schema";

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
