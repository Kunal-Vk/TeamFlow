import { OrganizationRepository } from "../repository/organizations.repository";

export class SearchOrganizationsCommand {
  private repository = new OrganizationRepository();

  async execute(query: string, ownerId: string) {
    const orgs = await this.repository.search(query, ownerId);

    return {
      success: true,
      message: "Organizations fetched successfully",
      data: orgs,
    };
  }
}
