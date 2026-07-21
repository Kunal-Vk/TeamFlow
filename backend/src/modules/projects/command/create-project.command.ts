import { ProjectRepository } from "../projects.repository";
import { OrganizationRepository } from "../../organizations/repository/organizations.repository";
import { CreateProjectDto } from "../projects.schema";
import { generateSlug } from "../../../shared/slug";
import { isOrgOwner } from "../../../common/utils/org-access";

export class CreateProjectCommand {
  private projectRepository = new ProjectRepository();
  private orgRepository = new OrganizationRepository();

  async execute(orgSlug: string, data: CreateProjectDto, requestingUser: { id: string; role: string | null; organizationId: string | null }) {
    const org = await this.orgRepository.findBySlug(orgSlug);
    if (!org) {
      return { success: false, message: "Organization not found", statusCode: 404 };
    }

    if (!isOrgOwner(requestingUser, org)) {
      return { success: false, message: "Forbidden: Only organization owner can create projects", statusCode: 403 };
    }

    const baseSlug = generateSlug(data.name);
    let slug = baseSlug;
    let counter = 1;

    while (await this.projectRepository.findBySlugAndOrgId(slug, org.id)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const project = await this.projectRepository.create({
      ...data,
      slug,
      organizationId: org.id,
    });

    return {
      success: true,
      message: "Project created successfully",
      data: project,
      statusCode: 201,
    };
  }
}
