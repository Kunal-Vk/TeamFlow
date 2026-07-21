import { ProjectRepository } from "../projects.repository";
import { OrganizationRepository } from "../../organizations/repository/organizations.repository";
import { hasOrgAccess } from "../../../common/utils/org-access";

export class GetProjectBySlugCommand {
  private projectRepository = new ProjectRepository();
  private orgRepository = new OrganizationRepository();

  async execute(orgSlug: string, projectSlug: string, requestingUser: { id: string; role: string | null; organizationId: string | null }) {
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

    return {
      success: true,
      data: project,
      statusCode: 200,
    };
  }
}
