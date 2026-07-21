import { eq, and } from "drizzle-orm";
import { db } from "../../database/db";
import { comments } from "../../database/schema";
import { NewComment } from "./comments.types";
import { UpdateCommentDto } from "./comments.schema";

export class CommentRepository {
  async create(data: NewComment) {
    const [comment] = await db.insert(comments).values(data).returning();
    return comment;
  }

  async findByTaskId(taskId: string) {
    return db.query.comments.findMany({
      where: eq(comments.taskId, taskId),
    });
  }

  async findByIdAndTaskId(id: string, taskId: string) {
    const [comment] = await db
      .select()
      .from(comments)
      .where(and(eq(comments.id, id), eq(comments.taskId, taskId)));
    return comment ?? null;
  }

  async update(id: string, taskId: string, data: UpdateCommentDto) {
    const [updated] = await db
      .update(comments)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(comments.id, id), eq(comments.taskId, taskId)))
      .returning();
    return updated ?? null;
  }

  async delete(id: string, taskId: string) {
    const [deleted] = await db
      .delete(comments)
      .where(and(eq(comments.id, id), eq(comments.taskId, taskId)))
      .returning();
    return deleted ?? null;
  }
}
