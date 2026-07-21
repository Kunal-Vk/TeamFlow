import { ProjectRepository } from "../projects.repository";
import { OrganizationRepository } from "../../organizations/repository/organizations.repository";
import { isOrgOwner } from "../../../common/utils/org-access";

export class DeleteProjectCommand {
  private projectRepository = new ProjectRepository();
  private orgRepository = new OrganizationRepository();

  async execute(orgSlug: string, projectSlug: string, requestingUser: { id: string; role: string | null; organizationId: string | null }) {
    const org = await this.orgRepository.findBySlug(orgSlug);
    if (!org) {
      return { success: false, message: "Organization not found", statusCode: 404 };
    }

    if (!isOrgOwner(requestingUser, org)) {
      return { success: false, message: "Forbidden: Only organization owner can delete projects", statusCode: 403 };
    }

    const existingProject = await this.projectRepository.findBySlugAndOrgId(projectSlug, org.id);
    if (!existingProject) {
      return { success: false, message: "Project not found", statusCode: 404 };
    }

    await this.projectRepository.delete(existingProject.id, org.id);

    return {
      success: true,
      message: "Project deleted successfully",
      statusCode: 200,
    };
  }
}
