import { TeamRepository } from "../teams.repository";
import { OrganizationRepository } from "../../organizations/repository/organizations.repository";
import { hasOrgAccess } from "../../../common/utils/org-access";

export class GetTeamByIdCommand {
  private teamRepository = new TeamRepository();
  private orgRepository = new OrganizationRepository();

  async execute(orgSlug: string, teamId: string, requestingUser: { id: string; role: string | null; organizationId: string | null }) {
    const org = await this.orgRepository.findBySlug(orgSlug);
    if (!org) {
      return { success: false, message: "Organization not found", statusCode: 404 };
    }

    if (!hasOrgAccess(requestingUser, org)) {
      return { success: false, message: "Forbidden: Access denied", statusCode: 403 };
    }

    const team = await this.teamRepository.findByIdAndOrgId(teamId, org.id);
    if (!team) {
      return { success: false, message: "Team not found", statusCode: 404 };
    }

    return {
      success: true,
      data: team,
      statusCode: 200,
    };
  }
}
