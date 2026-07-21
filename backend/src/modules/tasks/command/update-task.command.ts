import { TaskRepository } from "../tasks.repository";
import { ProjectRepository } from "../../projects/projects.repository";
import { OrganizationRepository } from "../../organizations/repository/organizations.repository";
import { UpdateTaskDto } from "../tasks.schema";
import { isOrgOwner, hasOrgAccess } from "../../../common/utils/org-access";

export class UpdateTaskCommand {
  private taskRepository = new TaskRepository();
  private projectRepository = new ProjectRepository();
  private orgRepository = new OrganizationRepository();

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

    // RBAC Rule: Owner can update any task; Member can only update tasks assigned to themselves
    const isOwner = isOrgOwner(requestingUser, org);
    const isAssignedMember = task.assignedTo === requestingUser.id;

    if (!isOwner && !isAssignedMember) {
      return { success: false, message: "Forbidden: Members can only update tasks assigned to themselves", statusCode: 403 };
    }

    const updated = await this.taskRepository.update(task.id, project.id, data);

    return {
      success: true,
      message: "Task updated successfully",
      data: updated,
      statusCode: 200,
    };
  }
}
