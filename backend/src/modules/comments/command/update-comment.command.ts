import { CommentRepository } from "../comments.repository";
import { TaskRepository } from "../../tasks/tasks.repository";
import { ProjectRepository } from "../../projects/projects.repository";
import { OrganizationRepository } from "../../organizations/repository/organizations.repository";
import { UpdateCommentDto } from "../comments.schema";
import { isOrgOwner, hasOrgAccess } from "../../../common/utils/org-access";

export class UpdateCommentCommand {
  private commentRepository = new CommentRepository();
  private taskRepository = new TaskRepository();
  private projectRepository = new ProjectRepository();
  private orgRepository = new OrganizationRepository();

  async execute(
    orgSlug: string,
    projectSlug: string,
    taskId: string,
    commentId: string,
    data: UpdateCommentDto,
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

    const comment = await this.commentRepository.findByIdAndTaskId(commentId, task.id);
    if (!comment) {
      return { success: false, message: "Comment not found", statusCode: 404 };
    }

    // RBAC Rule: Owner can update any comment; Member can edit ONLY their own comment
    const isOwner = isOrgOwner(requestingUser, org);
    const isAuthor = comment.userId === requestingUser.id;

    if (!isOwner && !isAuthor) {
      return { success: false, message: "Forbidden: Members can only edit their own comments", statusCode: 403 };
    }

    const updated = await this.commentRepository.update(comment.id, task.id, data);

    return {
      success: true,
      message: "Comment updated successfully",
      data: updated,
      statusCode: 200,
    };
  }
}
