import { SearchRepository } from "../search.repository";
import { OrganizationRepository } from "../../organizations/repository/organizations.repository";
import { hasOrgAccess } from "../../../common/utils/org-access";

export class SearchCommand {
  private searchRepository = new SearchRepository();
  private orgRepository = new OrganizationRepository();

  async execute(orgSlug: string, query: string, requestingUser: { id: string; role: string | null; organizationId: string | null }) {
    const org = await this.orgRepository.findBySlug(orgSlug);
    if (!org) {
      return { success: false, message: "Organization not found", statusCode: 404 };
    }

    if (!hasOrgAccess(requestingUser, org)) {
      return { success: false, message: "Forbidden: Access denied", statusCode: 403 };
    }

    const results = await this.searchRepository.searchAll(org.id, query);

    return {
      success: true,
      data: results,
      statusCode: 200,
    };
  }
}
