import { TeamRepository } from "../teams.repository";
import { OrganizationRepository } from "../../organizations/repository/organizations.repository";
import { CreateTeamDto } from "../teams.schema";
import { isOrgOwner } from "../../../common/utils/org-access";

export class CreateTeamCommand {
  private teamRepository = new TeamRepository();
  private orgRepository = new OrganizationRepository();

  async execute(orgSlug: string, data: CreateTeamDto, requestingUser: { id: string; role: string | null; organizationId: string | null }) {
    const org = await this.orgRepository.findBySlug(orgSlug);
    if (!org) {
      return { success: false, message: "Organization not found", statusCode: 404 };
    }

    if (!isOrgOwner(requestingUser, org)) {
      return { success: false, message: "Forbidden: Only organization owner can create teams", statusCode: 403 };
    }

    const team = await this.teamRepository.create({
      ...data,
      organizationId: org.id,
    });

    return {
      success: true,
      message: "Team created successfully",
      data: team,
      statusCode: 201,
    };
  }
}
