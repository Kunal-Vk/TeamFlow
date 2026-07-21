import { OrganizationRepository } from "../repository/organizations.repository";
import { CreateOrganizationDto } from "../schemas/organizations.schema";
import { generateSlug } from "../../../shared/slug";
import { db } from "../../../database/db";
import { users } from "../../../database/schema";
import { eq } from "drizzle-orm";

export class CreateOrganizationCommand {
  private repository = new OrganizationRepository();

  async execute(data: CreateOrganizationDto, ownerId: string) {
    // Step 1: Check the user doesn't already belong to another org
    const [owner] = await db.select().from(users).where(eq(users.id, ownerId));

    if (owner?.organizationId) {
      return {
        success: false,
        message: "You already belong to an organization. Leave it before creating a new one.",
      };
    }

    // Step 2: Generate a globally unique slug
    const baseSlug = generateSlug(data.name);
    let slug       = baseSlug;
    let counter    = 1;

    while (await this.repository.findBySlug(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Step 3: Create the organization
    const org = await this.repository.create({ ...data, slug, ownerId });

    // Step 4: Mark the creator as the owner in the users table
    await db
      .update(users)
      .set({ organizationId: org.id, role: "owner", updatedAt: new Date() })
      .where(eq(users.id, ownerId));

    return {
      success: true,
      message: "Organization created successfully",
      data: org,
    };
  }
}