import { z } from "zod";

export const searchUserByEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const addUserToOrgSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
});

export type SearchUserByEmailDto = z.infer<typeof searchUserByEmailSchema>;
export type AddUserToOrgDto      = z.infer<typeof addUserToOrgSchema>;
