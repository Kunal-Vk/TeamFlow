import { eq, and, ilike, or } from "drizzle-orm";
import { db } from "../../../database/db";
import { organizations, users } from "../../../database/schema";
import { NewOrganization } from "../types/organizations.types";
import { UpdateOrganizationDto } from "../schemas/organizations.schema";

export class OrganizationRepository {
  // ─── Create ──────────────────────────────────────────────────────────────

  async create(data: NewOrganization) {
    const [org] = await db
      .insert(organizations)
      .values(data)
      .returning();
    return org;
  }

  // ─── Read ─────────────────────────────────────────────────────────────────

  async findAllByOwner(ownerId: string) {
    return db.query.organizations.findMany({
      where: eq(organizations.ownerId, ownerId),
    });
  }

  /** Finds all organizations owned by OR joined by the specified user. */
  async findAllForUser(userId: string) {
    const [userRecord] = await db
      .select({ organizationId: users.organizationId })
      .from(users)
      .where(eq(users.id, userId));

    const userOrgId = userRecord?.organizationId;

    if (userOrgId) {
      return db
        .select()
        .from(organizations)
        .where(or(eq(organizations.ownerId, userId), eq(organizations.id, userOrgId)));
    }

    return db
      .select()
      .from(organizations)
      .where(eq(organizations.ownerId, userId));
  }

  /** Used internally (e.g. to resolve UUID from slug before update/delete). */
  async findById(id: string) {
    return db.query.organizations.findFirst({
      where: eq(organizations.id, id),
    }) ?? null;
  }

  /** Public slug-based lookup. Returns null when not found. */
  async findBySlug(slug: string) {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, slug));
    return org ?? null;
  }

  /** Slug lookup scoped to the authenticated owner. */
  async findBySlugAndOwner(slug: string, ownerId: string) {
    const [org] = await db
      .select()
      .from(organizations)
      .where(and(eq(organizations.slug, slug), eq(organizations.ownerId, ownerId)));
    return org ?? null;
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  async update(id: string, ownerId: string, data: UpdateOrganizationDto) {
    const [updated] = await db
      .update(organizations)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(organizations.id, id), eq(organizations.ownerId, ownerId)))
      .returning();
    return updated ?? null;
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  async delete(id: string, ownerId: string) {
    const [deleted] = await db
      .delete(organizations)
      .where(and(eq(organizations.id, id), eq(organizations.ownerId, ownerId)))
      .returning();
    return deleted ?? null;
  }

  // ─── Search ───────────────────────────────────────────────────────────────

  async search(query: string, ownerId: string) {
    return db
      .select()
      .from(organizations)
      .where(
        and(
          eq(organizations.ownerId, ownerId),
          or(
            ilike(organizations.name, `%${query}%`),
            ilike(organizations.slug, `%${query}%`)
          )
        )
      );
  }
}
