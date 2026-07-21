import { TeamRepository } from "../teams.repository";
import { OrganizationRepository } from "../../organizations/repository/organizations.repository";
import { hasOrgAccess } from "../../../common/utils/org-access";

export class GetTeamsCommand {
  private teamRepository = new TeamRepository();
  private orgRepository = new OrganizationRepository();

  async execute(orgSlug: string, requestingUser: { id: string; role: string | null; organizationId: string | null }) {
    const org = await this.orgRepository.findBySlug(orgSlug);
    if (!org) {
      return { success: false, message: "Organization not found", statusCode: 404 };
    }

    if (!hasOrgAccess(requestingUser, org)) {
      return { success: false, message: "Forbidden: Access denied", statusCode: 403 };
    }

    const teamsList = await this.teamRepository.findByOrgId(org.id);

    return {
      success: true,
      data: teamsList,
      statusCode: 200,
    };
  }
}
