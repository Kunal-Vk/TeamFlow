import { z } from "zod";

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .regex(/^[A-Za-z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password cannot exceed 128 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(/[^A-Za-z0-9]/, "Password must contain a special character"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Organization Schemas
export const createOrgSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Organization name must be at least 2 characters")
    .max(255, "Organization name cannot exceed 255 characters"),
  description: z.string().trim().max(1000, "Description cannot exceed 1000 characters").optional(),
});

export type CreateOrgFormData = z.infer<typeof createOrgSchema>;

export const updateOrgSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(255).optional(),
  description: z.string().trim().max(1000).optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .optional(),
});

export type UpdateOrgFormData = z.infer<typeof updateOrgSchema>;

// Project Schemas
export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Project name must be at least 2 characters")
    .max(255, "Project name cannot exceed 255 characters"),
  description: z.string().trim().max(1000).optional(),
});

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: z.string().trim().min(2).max(255).optional(),
  description: z.string().trim().max(1000).optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .optional(),
});

export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;

// Team Schemas
export const createTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Team name must be at least 2 characters")
    .max(255, "Team name cannot exceed 255 characters"),
  description: z.string().trim().max(1000).optional(),
});

export type CreateTeamFormData = z.infer<typeof createTeamSchema>;

export const updateTeamSchema = z.object({
  name: z.string().trim().min(2).max(255).optional(),
  description: z.string().trim().max(1000).optional(),
});

export type UpdateTeamFormData = z.infer<typeof updateTeamSchema>;

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Task title must be at least 2 characters")
    .max(500, "Title cannot exceed 500 characters"),
  description: z.string().trim().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  assignedTo: z.string().uuid("Invalid user selected").nullable().optional(),
  assigneeIds: z.array(z.string()).optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be YYYY-MM-DD format").nullable().optional(),
});

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  title: z.string().trim().min(2).max(500).optional(),
  description: z.string().trim().nullable().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  assignedTo: z.string().uuid().nullable().optional(),
  assigneeIds: z.array(z.string()).optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;

// Comment Schemas
export const createCommentSchema = z.object({
  content: z.string().trim().min(1, "Comment content cannot be empty").max(2000),
});

export type CreateCommentFormData = z.infer<typeof createCommentSchema>;

export const updateCommentSchema = z.object({
  content: z.string().trim().min(1, "Comment content cannot be empty").max(2000),
});

export type UpdateCommentFormData = z.infer<typeof updateCommentSchema>;

// User Search & Add Schema
export const searchUserSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

export type SearchUserFormData = z.infer<typeof searchUserSchema>;

export const addUserToOrgSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
});

export type AddUserToOrgFormData = z.infer<typeof addUserToOrgSchema>;
