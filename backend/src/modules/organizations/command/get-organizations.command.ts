import { OrganizationRepository } from "../repository/organizations.repository";

export class GetOrganizationsCommand {
  private repository = new OrganizationRepository();

  async execute(ownerId: string) {
    const orgs = await this.repository.findAllByOwner(ownerId);

    return {
      success: true,
      message: "Organizations fetched successfully",
      data: orgs,
    };
  }
}
