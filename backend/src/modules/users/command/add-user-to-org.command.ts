import { UserRepository } from "../repository/users.repository";
import { OrganizationRepository } from "../../organizations/repository/organizations.repository";

export class AddUserToOrgCommand {
  private userRepository = new UserRepository();
  private orgRepository = new OrganizationRepository();

  async execute(orgSlug: string, userIdToAdd: string, requestingUser: { id: string; role: string | null; organizationId: string | null }) {
    // 1. Verify organization exists
    const org = await this.orgRepository.findBySlug(orgSlug);
    if (!org) {
      return { success: false, message: "Organization not found" };
    }

    // 2. Verify requester is the owner of this organization
    if (org.ownerId !== requestingUser.id) {
      return { success: false, message: "Forbidden: Only the organization owner can add users" };
    }

    // 3. Verify user to add exists
    const targetUser = await this.userRepository.findById(userIdToAdd);
    if (!targetUser) {
      return { success: false, message: "User not found" };
    }

    // 4. Verify user is not already in an organization
    if (targetUser.organizationId) {
      return { success: false, message: "User already belongs to an organization" };
    }

    // 5. Update user to belong to this org with role = MEMBER
    const updated = await this.userRepository.setOrganization(targetUser.id, org.id, "member");

    const { password, ...safeUser } = updated;

    return {
      success: true,
      message: "User added to organization successfully",
      data: safeUser,
    };
  }
}
