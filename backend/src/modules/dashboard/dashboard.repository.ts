import { eq, and, lt, ne, sql, count } from "drizzle-orm";
import { db } from "../../database/db";
import { projects, teams, users, tasks } from "../../database/schema";

export class DashboardRepository {
  async getStats(organizationId: string) {
    // 1. Total Projects
    const [projRes] = await db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.organizationId, organizationId));

    // 2. Total Teams
    const [teamRes] = await db
      .select({ count: count() })
      .from(teams)
      .where(eq(teams.organizationId, organizationId));

    // 3. Total Members
    const [memberRes] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.organizationId, organizationId));

    // 4. Total Tasks, Completed, Pending, Overdue
    // Subquery / join projects for org scoping
    const orgProjects = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.organizationId, organizationId));

    const projectIds = orgProjects.map((p) => p.id);

    if (projectIds.length === 0) {
      return {
        totalProjects: Number(projRes?.count ?? 0),
        totalTeams: Number(teamRes?.count ?? 0),
        totalMembers: Number(memberRes?.count ?? 0),
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
      };
    }

    const todayStr = new Date().toISOString().split("T")[0];

    const [allTasksRes] = await db
      .select({ count: count() })
      .from(tasks)
      .where(sql`${tasks.projectId} IN ${projectIds}`);

    const [completedRes] = await db
      .select({ count: count() })
      .from(tasks)
      .where(and(sql`${tasks.projectId} IN ${projectIds}`, eq(tasks.status, "DONE")));

    const [pendingRes] = await db
      .select({ count: count() })
      .from(tasks)
      .where(and(sql`${tasks.projectId} IN ${projectIds}`, ne(tasks.status, "DONE")));

    const [overdueRes] = await db
      .select({ count: count() })
      .from(tasks)
      .where(
        and(
          sql`${tasks.projectId} IN ${projectIds}`,
          ne(tasks.status, "DONE"),
          lt(tasks.dueDate, todayStr)
        )
      );

    return {
      totalProjects: Number(projRes?.count ?? 0),
      totalTeams: Number(teamRes?.count ?? 0),
      totalMembers: Number(memberRes?.count ?? 0),
      totalTasks: Number(allTasksRes?.count ?? 0),
      completedTasks: Number(completedRes?.count ?? 0),
      pendingTasks: Number(pendingRes?.count ?? 0),
      overdueTasks: Number(overdueRes?.count ?? 0),
    };
  }
}
