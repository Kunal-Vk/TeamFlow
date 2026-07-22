import { eq, and, inArray } from "drizzle-orm";
import { db } from "../../database/db";
import { tasks, taskAssignees, users } from "../../database/schema";
import { NewTask } from "./tasks.types";
import { UpdateTaskDto } from "./tasks.schema";

export class TaskRepository {
  async create(data: NewTask, assigneeIds: string[] = []) {
    const [task] = await db.insert(tasks).values(data).returning();
    if (assigneeIds.length > 0) {
      await this.setAssignees(task.id, assigneeIds);
    }
    return this.findById(task.id);
  }

  async setAssignees(taskId: string, userIds: string[]) {
    await db.delete(taskAssignees).where(eq(taskAssignees.taskId, taskId));
    if (userIds.length > 0) {
      const records = userIds.map((userId) => ({ taskId, userId }));
      await db.insert(taskAssignees).values(records).onConflictDoNothing();
    }
  }

  async getAssigneesForTasks(taskIds: string[]) {
    if (taskIds.length === 0) return {};
    const records = await db
      .select({
        taskId: taskAssignees.taskId,
        userId: users.id,
        name: users.name,
        email: users.email,
      })
      .from(taskAssignees)
      .innerJoin(users, eq(taskAssignees.userId, users.id))
      .where(inArray(taskAssignees.taskId, taskIds));

    const map: Record<string, Array<{ id: string; name: string; email: string }>> = {};
    records.forEach((r) => {
      if (!map[r.taskId]) map[r.taskId] = [];
      map[r.taskId].push({ id: r.userId, name: r.name, email: r.email });
    });
    return map;
  }

  async findByProjectId(projectId: string) {
    const taskList = await db.query.tasks.findMany({
      where: eq(tasks.projectId, projectId),
    });
    if (taskList.length === 0) return [];

    const assigneesMap = await this.getAssigneesForTasks(taskList.map((t) => t.id));
    return taskList.map((t) => ({
      ...t,
      assignees: assigneesMap[t.id] || [],
      assigneeIds: (assigneesMap[t.id] || []).map((a) => a.id),
    }));
  }

  async findById(id: string) {
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id));

    if (!task) return null;
    const assigneesMap = await this.getAssigneesForTasks([task.id]);
    return {
      ...task,
      assignees: assigneesMap[task.id] || [],
      assigneeIds: (assigneesMap[task.id] || []).map((a) => a.id),
    };
  }

  async findByIdAndProjectId(id: string, projectId: string) {
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.projectId, projectId)));

    if (!task) return null;
    const assigneesMap = await this.getAssigneesForTasks([task.id]);
    return {
      ...task,
      assignees: assigneesMap[task.id] || [],
      assigneeIds: (assigneesMap[task.id] || []).map((a) => a.id),
    };
  }

  async update(id: string, projectId: string, data: UpdateTaskDto, assigneeIds?: string[]) {
    const [updated] = await db
      .update(tasks)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(tasks.id, id), eq(tasks.projectId, projectId)))
      .returning();

    if (!updated) return null;

    if (assigneeIds !== undefined) {
      await this.setAssignees(id, assigneeIds);
    }

    return this.findById(id);
  }

  async delete(id: string, projectId: string) {
    const [deleted] = await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.projectId, projectId)))
      .returning();
    return deleted ?? null;
  }
}
