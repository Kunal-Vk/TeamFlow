import { OrganizationRepository } from "../repository/organizations.repository";
import { UpdateOrganizationDto } from "../schemas/organizations.schema";

export class UpdateOrganizationCommand {
  private repository = new OrganizationRepository();

  async execute(currentSlug: string, ownerId: string, data: UpdateOrganizationDto) {
    // Step 1: Resolve slug → row (also enforces ownership)
    const existing = await this.repository.findBySlugAndOwner(currentSlug, ownerId);

    if (!existing) {
      return {
        success: false,
        message: "Organization not found",
      };
    }

    // Step 2: If the user explicitly provides a new slug, ensure it is not taken
    //         by a DIFFERENT organization. Slug is only ever changed when the
    //         client sends it — name changes do NOT auto-regenerate the slug.
    if (data.slug !== undefined && data.slug !== existing.slug) {
      const conflict = await this.repository.findBySlug(data.slug);

      if (conflict) {
        return {
          success: false,
          message: `The slug "${data.slug}" is already taken. Please choose a different slug.`,
        };
      }
    }

    // Step 3: Perform the update using the internal UUID (never exposed publicly)
    const updated = await this.repository.update(existing.id, ownerId, data);

    if (!updated) {
      return {
        success: false,
        message: "Organization not found",
      };
    }

    return {
      success: true,
      message: "Organization updated successfully",
      data: updated,
    };
  }
}
