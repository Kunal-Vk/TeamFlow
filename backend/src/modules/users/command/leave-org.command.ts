import { UserRepository } from "../repository/users.repository";
import { OrganizationRepository } from "../../organizations/repository/organizations.repository";
import { db } from "../../../database/db";
import { users, teamMembers, taskAssignees, tasks } from "../../../database/schema";
import { eq } from "drizzle-orm";

export class LeaveOrgCommand {
  private userRepository = new UserRepository();
  private orgRepository = new OrganizationRepository();

  async execute(user: { id: string; role: string | null; organizationId: string | null }) {
    const currentUser = await this.userRepository.findById(user.id);
    if (!currentUser || !currentUser.organizationId) {
      return { success: false, message: "You do not belong to any organization" };
    }

    const org = await this.orgRepository.findById(currentUser.organizationId);
    if (org && org.ownerId === currentUser.id) {
      return {
        success: false,
        message: "Organization Owners cannot leave their organization. You must delete the organization or transfer ownership.",
      };
    }

    // 1. Remove user from all team memberships
    await db.delete(teamMembers).where(eq(teamMembers.userId, currentUser.id));

    // 2. Remove user from all task assignments
    await db.delete(taskAssignees).where(eq(taskAssignees.userId, currentUser.id));

    // 3. Unassign user from single assignedTo tasks
    await db
      .update(tasks)
      .set({ assignedTo: null })
      .where(eq(tasks.assignedTo, currentUser.id));

    // 4. Update user record to have null organizationId and role
    await this.userRepository.clearOrganization(currentUser.id);

    return {
      success: true,
      message: "You have left the organization successfully",
    };
  }
}
