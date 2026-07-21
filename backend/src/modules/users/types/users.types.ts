import { users } from "../../../database/schema";

export type User    = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Safe user — strips password before returning to client
export type SafeUser = Omit<User, "password">;
