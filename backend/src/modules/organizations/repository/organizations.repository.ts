import { eq, and, ilike, or } from "drizzle-orm";
import { db } from "../../../database/db";
import { organizations } from "../../../database/schema";
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

  /**
   * Update by primary-key UUID + ownerId guard.
   * Called internally after resolving a slug to a UUID.
   * Accepts the full UpdateOrganizationDto which may contain a new slug.
   */
  async update(id: string, ownerId: string, data: UpdateOrganizationDto) {
    const [updated] = await db
      .update(organizations)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(organizations.id, id), eq(organizations.ownerId, ownerId)))
      .returning();
    return updated ?? null;
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  /**
   * Delete by primary-key UUID + ownerId guard.
   * Called internally after resolving a slug to a UUID.
   */
  async delete(id: string, ownerId: string) {
    const [deleted] = await db
      .delete(organizations)
      .where(and(eq(organizations.id, id), eq(organizations.ownerId, ownerId)))
      .returning();
    return deleted ?? null;
  }

  // ─── Search ───────────────────────────────────────────────────────────────

  /**
   * Case-insensitive partial match on name OR slug, scoped to the owner.
   * Pure DB read — no business logic.
   */
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

