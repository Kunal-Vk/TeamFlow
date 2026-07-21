import { TeamRepository } from "../teams.repository";
import { OrganizationRepository } from "../../organizations/repository/organizations.repository";
import { isOrgOwner } from "../../../common/utils/org-access";

export class DeleteTeamCommand {
  private teamRepository = new TeamRepository();
  private orgRepository = new OrganizationRepository();

  async execute(orgSlug: string, teamId: string, requestingUser: { id: string; role: string | null; organizationId: string | null }) {
    const org = await this.orgRepository.findBySlug(orgSlug);
    if (!org) {
      return { success: false, message: "Organization not found", statusCode: 404 };
    }

    if (!isOrgOwner(requestingUser, org)) {
      return { success: false, message: "Forbidden: Only organization owner can delete teams", statusCode: 403 };
    }

    const deleted = await this.teamRepository.delete(teamId, org.id);
    if (!deleted) {
      return { success: false, message: "Team not found", statusCode: 404 };
    }

    return {
      success: true,
      message: "Team deleted successfully",
      statusCode: 200,
    };
  }
}
