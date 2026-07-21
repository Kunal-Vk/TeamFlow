import { DashboardRepository } from "../dashboard.repository";
import { OrganizationRepository } from "../../organizations/repository/organizations.repository";
import { hasOrgAccess } from "../../../common/utils/org-access";

export class GetDashboardCommand {
  private dashboardRepository = new DashboardRepository();
  private orgRepository = new OrganizationRepository();

  async execute(orgSlug: string, requestingUser: { id: string; role: string | null; organizationId: string | null }) {
    const org = await this.orgRepository.findBySlug(orgSlug);
    if (!org) {
      return { success: false, message: "Organization not found", statusCode: 404 };
    }

    if (!hasOrgAccess(requestingUser, org)) {
      return { success: false, message: "Forbidden: Access denied", statusCode: 403 };
    }

    const stats = await this.dashboardRepository.getStats(org.id);

    return {
      success: true,
      data: stats,
      statusCode: 200,
    };
  }
}
