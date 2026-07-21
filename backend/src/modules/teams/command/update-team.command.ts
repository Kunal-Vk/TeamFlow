import { TeamRepository } from "../teams.repository";
import { OrganizationRepository } from "../../organizations/repository/organizations.repository";
import { UpdateTeamDto } from "../teams.schema";
import { isOrgOwner } from "../../../common/utils/org-access";

export class UpdateTeamCommand {
  private teamRepository = new TeamRepository();
  private orgRepository = new OrganizationRepository();

  async execute(
    orgSlug: string,
    teamId: string,
    data: UpdateTeamDto,
    requestingUser: { id: string; role: string | null; organizationId: string | null }
  ) {
    const org = await this.orgRepository.findBySlug(orgSlug);
    if (!org) {
      return { success: false, message: "Organization not found", statusCode: 404 };
    }

    if (!isOrgOwner(requestingUser, org)) {
      return { success: false, message: "Forbidden: Only organization owner can update teams", statusCode: 403 };
    }

    const updated = await this.teamRepository.update(teamId, org.id, data);
    if (!updated) {
      return { success: false, message: "Team not found", statusCode: 404 };
    }

    return {
      success: true,
      message: "Team updated successfully",
      data: updated,
      statusCode: 200,
    };
  }
}
