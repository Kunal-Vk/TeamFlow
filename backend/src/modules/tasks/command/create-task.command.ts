import { TaskRepository } from "../tasks.repository";
import { ProjectRepository } from "../../projects/projects.repository";
import { OrganizationRepository } from "../../organizations/repository/organizations.repository";
import { CreateTaskDto } from "../tasks.schema";
import { isOrgOwner } from "../../../common/utils/org-access";

export class CreateTaskCommand {
  private taskRepository = new TaskRepository();
  private projectRepository = new ProjectRepository();
  private orgRepository = new OrganizationRepository();

  async execute(
    orgSlug: string,
    projectSlug: string,
    data: CreateTaskDto,
    requestingUser: { id: string; role: string | null; organizationId: string | null }
  ) {
    const org = await this.orgRepository.findBySlug(orgSlug);
    if (!org) {
      return { success: false, message: "Organization not found", statusCode: 404 };
    }

    // Only organization owners can create tasks
    if (!isOrgOwner(requestingUser, org)) {
      return { success: false, message: "Forbidden: Only organization owners can create tasks", statusCode: 403 };
    }

    const project = await this.projectRepository.findBySlugAndOrgId(projectSlug, org.id);
    if (!project) {
      return { success: false, message: "Project not found", statusCode: 404 };
    }

    const assigneeIds = data.assigneeIds && data.assigneeIds.length > 0
      ? data.assigneeIds
      : data.assignedTo
      ? [data.assignedTo]
      : [];

    const { assigneeIds: _, ...taskData } = data;

    const task = await this.taskRepository.create(
      {
        ...taskData,
        projectId: project.id,
      },
      assigneeIds
    );

    return {
      success: true,
      message: "Task created successfully",
      data: task,
      statusCode: 201,
    };
  }
}
