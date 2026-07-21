import { eq } from "drizzle-orm";
import { db } from "../../../database/db";
import { users } from "../../../database/schema";

export class UserRepository {
  /** Find a single user by exact email match. */
  async findByEmail(email: string) {
    return db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  /** Find a user by UUID. */
  async findById(id: string) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  /** List all users who belong to a given organization. */
  async findByOrganizationId(organizationId: string) {
    return db.query.users.findMany({
      where: eq(users.organizationId, organizationId),
    });
  }

  /** Set a user's organization and role. */
  async setOrganization(userId: string, organizationId: string, role: string) {
    const [updated] = await db
      .update(users)
      .set({ organizationId, role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  /** Clear a user's organization and role (remove from org). */
  async clearOrganization(userId: string) {
    const [updated] = await db
      .update(users)
      .set({ organizationId: null, role: null, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }
}
