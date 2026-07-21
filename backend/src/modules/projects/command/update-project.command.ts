import { ProjectRepository } from "../projects.repository";
import { OrganizationRepository } from "../../organizations/repository/organizations.repository";
import { UpdateProjectDto } from "../projects.schema";
import { isOrgOwner } from "../../../common/utils/org-access";

export class UpdateProjectCommand {
  private projectRepository = new ProjectRepository();
  private orgRepository = new OrganizationRepository();

  async execute(
    orgSlug: string,
    projectSlug: string,
    data: UpdateProjectDto,
    requestingUser: { id: string; role: string | null; organizationId: string | null }
  ) {
    const org = await this.orgRepository.findBySlug(orgSlug);
    if (!org) {
      return { success: false, message: "Organization not found", statusCode: 404 };
    }

    if (!isOrgOwner(requestingUser, org)) {
      return { success: false, message: "Forbidden: Only organization owner can update projects", statusCode: 403 };
    }

    const existingProject = await this.projectRepository.findBySlugAndOrgId(projectSlug, org.id);
    if (!existingProject) {
      return { success: false, message: "Project not found", statusCode: 404 };
    }

    if (data.slug !== undefined && data.slug !== existingProject.slug) {
      const conflict = await this.projectRepository.findBySlugAndOrgId(data.slug, org.id);
      if (conflict) {
        return {
          success: false,
          message: `The slug "${data.slug}" is already taken in this organization`,
          statusCode: 409,
        };
      }
    }

    const updated = await this.projectRepository.update(existingProject.id, org.id, data);

    return {
      success: true,
      message: "Project updated successfully",
      data: updated,
      statusCode: 200,
    };
  }
}
