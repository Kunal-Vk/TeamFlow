import { comments } from "../../database/schema";

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
