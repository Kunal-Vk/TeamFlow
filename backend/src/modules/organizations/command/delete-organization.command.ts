import { OrganizationRepository } from "../repository/organizations.repository";
import { isOrgOwner } from "../../../common/utils/org-access";
import { db } from "../../../database/db";
import { users } from "../../../database/schema";
import { eq } from "drizzle-orm";

export class DeleteOrganizationCommand {
  private repository = new OrganizationRepository();

  async execute(slug: string, requestingUser: { id: string; email: string; role: string | null; organizationId: string | null }) {
    // Step 1: Resolve slug → row (ownership also enforced)
    const existing = await this.repository.findBySlugAndOwner(slug, requestingUser.id);

    if (!existing) {
      return {
        success: false,
        message: "Organization not found",
      };
    }

    if (!isOrgOwner(requestingUser, existing)) {
      return {
        success: false,
        message: "Forbidden",
      };
    }

    // Step 2: Clear all members' org membership before deleting
    await db
      .update(users)
      .set({ organizationId: null, role: null, updatedAt: new Date() })
      .where(eq(users.organizationId, existing.id));

    // Step 3: Delete the organization (cascades to projects, teams, tasks, comments)
    await this.repository.delete(existing.id, requestingUser.id);

    return {
      success: true,
      message: "Organization deleted successfully",
    };
  }
}
