import { UserRepository } from "../repository/users.repository";
import { OrganizationRepository } from "../../organizations/repository/organizations.repository";

export class RemoveUserFromOrgCommand {
  private userRepository = new UserRepository();
  private orgRepository = new OrganizationRepository();

  async execute(orgSlug: string, userIdToRemove: string, requestingUser: { id: string; role: string | null; organizationId: string | null }) {
    // 1. Verify organization exists
    const org = await this.orgRepository.findBySlug(orgSlug);
    if (!org) {
      return { success: false, message: "Organization not found" };
    }

    // 2. Verify requester is the owner of this organization
    if (org.ownerId !== requestingUser.id) {
      return { success: false, message: "Forbidden: Only the organization owner can remove users" };
    }

    // 3. Cannot remove the owner themselves
    if (userIdToRemove === org.ownerId) {
      return { success: false, message: "Cannot remove the organization owner from the organization" };
    }

    // 4. Verify user to remove exists and belongs to this organization
    const targetUser = await this.userRepository.findById(userIdToRemove);
    if (!targetUser || targetUser.organizationId !== org.id) {
      return { success: false, message: "User not found in this organization" };
    }

    // 5. Clear user's organizationId and role (revert to null)
    await this.userRepository.clearOrganization(userIdToRemove);

    return {
      success: true,
      message: "User removed from organization successfully",
    };
  }
}
