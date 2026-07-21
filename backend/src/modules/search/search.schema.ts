import { z } from "zod";

export const searchSchema = z.object({
  q: z.string().trim().min(1, "Search query cannot be empty"),
});

export type SearchDto = z.infer<typeof searchSchema>;
