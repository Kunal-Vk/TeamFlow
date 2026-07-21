import { TaskRepository } from "../tasks.repository";
import { ProjectRepository } from "../../projects/projects.repository";
import { OrganizationRepository } from "../../organizations/repository/organizations.repository";
import { isOrgOwner } from "../../../common/utils/org-access";

export class DeleteTaskCommand {
  private taskRepository = new TaskRepository();
  private projectRepository = new ProjectRepository();
  private orgRepository = new OrganizationRepository();

  async execute(
    orgSlug: string,
    projectSlug: string,
    taskId: string,
    requestingUser: { id: string; role: string | null; organizationId: string | null }
  ) {
    const org = await this.orgRepository.findBySlug(orgSlug);
    if (!org) {
      return { success: false, message: "Organization not found", statusCode: 404 };
    }

    if (!isOrgOwner(requestingUser, org)) {
      return { success: false, message: "Forbidden: Only organization owner can delete tasks", statusCode: 403 };
    }

    const project = await this.projectRepository.findBySlugAndOrgId(projectSlug, org.id);
    if (!project) {
      return { success: false, message: "Project not found", statusCode: 404 };
    }

    const deleted = await this.taskRepository.delete(taskId, project.id);
    if (!deleted) {
      return { success: false, message: "Task not found", statusCode: 404 };
    }

    return {
      success: true,
      message: "Task deleted successfully",
      statusCode: 200,
    };
  }
}
