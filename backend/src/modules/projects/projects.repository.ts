import { eq, and } from "drizzle-orm";
import { db } from "../../database/db";
import { projects } from "../../database/schema";
import { NewProject } from "./projects.types";
import { UpdateProjectDto } from "./projects.schema";

export class ProjectRepository {
  async create(data: NewProject) {
    const [project] = await db
      .insert(projects)
      .values(data)
      .returning();
    return project;
  }

  async findByOrgId(organizationId: string) {
    return db.query.projects.findMany({
      where: eq(projects.organizationId, organizationId),
    });
  }

  async findBySlugAndOrgId(slug: string, organizationId: string) {
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.slug, slug), eq(projects.organizationId, organizationId)));
    return project ?? null;
  }

  async findById(id: string) {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    return project ?? null;
  }

  async update(id: string, organizationId: string, data: UpdateProjectDto) {
    const [updated] = await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(projects.id, id), eq(projects.organizationId, organizationId)))
      .returning();
    return updated ?? null;
  }

  async delete(id: string, organizationId: string) {
    const [deleted] = await db
      .delete(projects)
      .where(and(eq(projects.id, id), eq(projects.organizationId, organizationId)))
      .returning();
    return deleted ?? null;
  }
}
