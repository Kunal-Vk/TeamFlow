import { OrganizationRepository } from "../repository/organizations.repository";

/**
 * Fetches a single organization by its slug.
 * Scoped to the authenticated owner so users cannot read each other's orgs.
 */
export class GetOrganizationByIdCommand {
  private repository = new OrganizationRepository();

  async execute(slug: string, ownerId: string) {
    const org = await this.repository.findBySlugAndOwner(slug, ownerId);

    if (!org) {
      return {
        success: false,
        message: "Organization not found",
      };
    }

    return {
      success: true,
      message: "Organization fetched successfully",
      data: org,
    };
  }
}
