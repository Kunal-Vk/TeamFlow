import { eq, and, ilike, or, sql } from "drizzle-orm";
import { db } from "../../database/db";
import { projects, teams, tasks } from "../../database/schema";

export class SearchRepository {
  async searchAll(organizationId: string, query: string) {
    const pattern = `%${query}%`;

    // 1. Search Projects by name or slug
    const matchingProjects = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.organizationId, organizationId),
          or(ilike(projects.name, pattern), ilike(projects.slug, pattern))
        )
      );

    // 2. Search Teams by name
    const matchingTeams = await db
      .select()
      .from(teams)
      .where(and(eq(teams.organizationId, organizationId), ilike(teams.name, pattern)));

    // 3. Search Tasks by title (description is optional and title search is required)
    const orgProjects = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.organizationId, organizationId));

    const projectIds = orgProjects.map((p) => p.id);

    let matchingTasks: any[] = [];
    if (projectIds.length > 0) {
      matchingTasks = await db
        .select()
        .from(tasks)
        .where(and(sql`${tasks.projectId} IN ${projectIds}`, ilike(tasks.title, pattern)));
    }

    return {
      projects: matchingProjects,
      teams: matchingTeams,
      tasks: matchingTasks,
    };
  }
}
