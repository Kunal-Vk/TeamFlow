import { eq, and } from "drizzle-orm";
import { db } from "../../database/db";
import { tasks } from "../../database/schema";
import { NewTask } from "./tasks.types";
import { UpdateTaskDto } from "./tasks.schema";

export class TaskRepository {
  async create(data: NewTask) {
    const [task] = await db.insert(tasks).values(data).returning();
    return task;
  }

  async findByProjectId(projectId: string) {
    return db.query.tasks.findMany({
      where: eq(tasks.projectId, projectId),
    });
  }

  async findById(id: string) {
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id));
    return task ?? null;
  }

  async findByIdAndProjectId(id: string, projectId: string) {
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.projectId, projectId)));
    return task ?? null;
  }

  async update(id: string, projectId: string, data: UpdateTaskDto) {
    const [updated] = await db
      .update(tasks)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(tasks.id, id), eq(tasks.projectId, projectId)))
      .returning();
    return updated ?? null;
  }

  async delete(id: string, projectId: string) {
    const [deleted] = await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.projectId, projectId)))
      .returning();
    return deleted ?? null;
  }
}
