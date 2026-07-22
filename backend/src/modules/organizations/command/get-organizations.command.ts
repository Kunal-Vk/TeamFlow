import { OrganizationRepository } from "../repository/organizations.repository";

export class GetOrganizationsCommand {
  private repository = new OrganizationRepository();

  async execute(userId: string) {
    const orgs = await this.repository.findAllForUser(userId);

    return {
      success: true,
      message: "Organizations fetched successfully",
      data: orgs,
    };
  }
}
