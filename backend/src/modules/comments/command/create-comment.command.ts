import { CommentRepository } from "../comments.repository";
import { TaskRepository } from "../../tasks/tasks.repository";
import { ProjectRepository } from "../../projects/projects.repository";
import { OrganizationRepository } from "../../organizations/repository/organizations.repository";
import { CreateCommentDto } from "../comments.schema";
import { hasOrgAccess } from "../../../common/utils/org-access";

export class CreateCommentCommand {
  private commentRepository = new CommentRepository();
  private taskRepository = new TaskRepository();
  private projectRepository = new ProjectRepository();
  private orgRepository = new OrganizationRepository();

  async execute(
    orgSlug: string,
    projectSlug: string,
    taskId: string,
    data: CreateCommentDto,
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

    const comment = await this.commentRepository.create({
      ...data,
      taskId: task.id,
      userId: requestingUser.id,
    });

    return {
      success: true,
      message: "Comment created successfully",
      data: comment,
      statusCode: 201,
    };
  }
}
