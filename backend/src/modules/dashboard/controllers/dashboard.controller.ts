import { Request, Response } from "express";
import { GetDashboardCommand } from "../command/get-dashboard.command";
import { db } from "../../../database/db";
import { comments, tasks, projects, organizations, users } from "../../../database/schema";
import { eq, and, ilike, desc } from "drizzle-orm";

export const getDashboard = async (req: Request, res: Response) => {
  const orgSlug = req.params.orgSlug as string;

  const command = new GetDashboardCommand();
  const response = await command.execute(orgSlug, req.user);

  return res.status(response.statusCode).json(response);
};

export const getAuditLogs = async (req: Request, res: Response) => {
  const orgSlug = req.params.orgSlug as string;

  const [org] = await db.select().from(organizations).where(eq(organizations.slug, orgSlug));
  if (!org) {
    return res.status(404).json({ success: false, message: "Organization not found" });
  }

  const logs = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      taskId: tasks.id,
      taskTitle: tasks.title,
      projectSlug: projects.slug,
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
    })
    .from(comments)
    .innerJoin(tasks, eq(comments.taskId, tasks.id))
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .innerJoin(users, eq(comments.userId, users.id))
    .where(
      and(
        eq(projects.organizationId, org.id),
        ilike(comments.content, "%[AUDIT_LOG]%")
      )
    )
    .orderBy(desc(comments.createdAt))
    .limit(20);

  return res.status(200).json({
    success: true,
    data: logs,
  });
};
