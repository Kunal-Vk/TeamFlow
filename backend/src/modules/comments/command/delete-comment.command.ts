import { CommentRepository } from "../comments.repository";
import { TaskRepository } from "../../tasks/tasks.repository";
import { ProjectRepository } from "../../projects/projects.repository";
import { OrganizationRepository } from "../../organizations/repository/organizations.repository";
import { isOrgOwner, hasOrgAccess } from "../../../common/utils/org-access";

export class DeleteCommentCommand {
  private commentRepository = new CommentRepository();
  private taskRepository = new TaskRepository();
  private projectRepository = new ProjectRepository();
  private orgRepository = new OrganizationRepository();

  async execute(
    orgSlug: string,
    projectSlug: string,
    taskId: string,
    commentId: string,
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

    // RBAC Rule: Owner can delete any comment; Member can delete ONLY their own comment
    const isOwner = isOrgOwner(requestingUser, org);
    const isAuthor = comment.userId === requestingUser.id;

    if (!isOwner && !isAuthor) {
      return { success: false, message: "Forbidden: Members can only delete their own comments", statusCode: 403 };
    }

    await this.commentRepository.delete(comment.id, task.id);

    return {
      success: true,
      message: "Comment deleted successfully",
      statusCode: 200,
    };
  }
}
