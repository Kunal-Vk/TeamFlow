import { z } from "zod";

export const searchUserByEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const addUserToOrgSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
});

export const joinOrgSchema = z.object({
  slug: z.string().trim().min(1, "Organization slug is required"),
});

export type SearchUserByEmailDto = z.infer<typeof searchUserByEmailSchema>;
export type AddUserToOrgDto      = z.infer<typeof addUserToOrgSchema>;
export type JoinOrgDto           = z.infer<typeof joinOrgSchema>;
