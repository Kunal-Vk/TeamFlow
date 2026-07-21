import { UserRepository } from "../repository/users.repository";
import { OrganizationRepository } from "../../organizations/repository/organizations.repository";

export class GetOrgMembersCommand {
  private userRepository = new UserRepository();
  private orgRepository = new OrganizationRepository();

  async execute(orgSlug: string, requestingUser: { id: string; role: string | null; organizationId: string | null }) {
    // 1. Verify organization exists
    const org = await this.orgRepository.findBySlug(orgSlug);
    if (!org) {
      return { success: false, message: "Organization not found" };
    }

    // 2. Verify requester belongs to this org (Owner or Member)
    const isOwner = org.ownerId === requestingUser.id;
    const isMember = requestingUser.organizationId === org.id;

    if (!isOwner && !isMember) {
      return { success: false, message: "Forbidden: Access denied to this organization" };
    }

    // 3. Fetch all members
    const members = await this.userRepository.findByOrganizationId(org.id);

    // Strip passwords
    const safeMembers = members.map(({ password, ...user }) => user);

    return {
      success: true,
      message: "Members fetched successfully",
      data: safeMembers,
    };
  }
}
