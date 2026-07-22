import { TaskRepository } from "../tasks.repository";
import { ProjectRepository } from "../../projects/projects.repository";
import { OrganizationRepository } from "../../organizations/repository/organizations.repository";
import { CommentRepository } from "../../comments/comments.repository";
import { UpdateTaskDto } from "../tasks.schema";
import { isOrgOwner, hasOrgAccess } from "../../../common/utils/org-access";
import { db } from "../../../database/db";
import { users } from "../../../database/schema";
import { eq } from "drizzle-orm";

export class UpdateTaskCommand {
  private taskRepository = new TaskRepository();
  private projectRepository = new ProjectRepository();
  private orgRepository = new OrganizationRepository();
  private commentRepository = new CommentRepository();

  async execute(
    orgSlug: string,
    projectSlug: string,
    taskId: string,
    data: UpdateTaskDto,
    requestingUser: { id: string; role: string | null; organizationId: string | null }
  ) {
    const org = await this.orgRepository.findBySlug(orgSlug);
    if (!org) {
      return { success: false, message: "Organization not found", statusCode: 404 };
    }

    if (!hasOrgAccess(requestingUser, org)) {
      return { success: false, message: "Forbidden: Access denied", statusCode: 403 };
    }

    const project = await this.projectRepository.findBySlugAndOrgId(projectSlug, org.id);
    if (!project) {
      return { success: false, message: "Project not found", statusCode: 404 };
    }

    const task = await this.taskRepository.findByIdAndProjectId(taskId, project.id);
    if (!task) {
      return { success: false, message: "Task not found", statusCode: 404 };
    }

    // RBAC Rule: Owner can update any task; Member can update if assigned (via single assignedTo or assigneeIds array)
    const isOwner = isOrgOwner(requestingUser, org);
    const isAssignedMember =
      task.assignedTo === requestingUser.id ||
      (task.assigneeIds && task.assigneeIds.includes(requestingUser.id));

    if (!isOwner && !isAssignedMember) {
      return {
        success: false,
        message: "Forbidden: Members can only update tasks assigned to themselves",
        statusCode: 403,
      };
    }

    const assigneeIds = data.assigneeIds !== undefined
      ? data.assigneeIds
      : data.assignedTo !== undefined
      ? (data.assignedTo ? [data.assignedTo] : [])
      : undefined;

    const { assigneeIds: _, ...taskData } = data;

    const updated = await this.taskRepository.update(task.id, project.id, taskData, assigneeIds);

    // Audit Trail: If status changed, post a highlighted System Audit Trail comment
    if (data.status && data.status !== task.status) {
      const [updater] = await db.select({ name: users.name }).from(users).where(eq(users.id, requestingUser.id));
      const updaterName = updater?.name || "User";

      await this.commentRepository.create({
        taskId: task.id,
        userId: requestingUser.id,
        content: `[AUDIT_LOG] ${updaterName} updated status from ${task.status} to ${data.status}`,
      });
    }

    return {
      success: true,
      message: "Task updated successfully",
      data: updated,
      statusCode: 200,
    };
  }
}
