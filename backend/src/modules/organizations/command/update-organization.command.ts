import { OrganizationRepository } from "../repository/organizations.repository";
import { UpdateOrganizationDto } from "../schemas/organizations.schema";

export class UpdateOrganizationCommand {
  private repository = new OrganizationRepository();

  async execute(currentSlug: string, ownerId: string, data: UpdateOrganizationDto) {
    // Step 1: Resolve organization by slug
    const existing = await this.repository.findBySlug(currentSlug);

    if (!existing) {
      return {
        success: false,
        message: "Organization not found",
      };
    }

    // Enforce ownership
    if (existing.ownerId !== ownerId) {
      return {
        success: false,
        message: "Forbidden: Only the organization owner can update workspace details",
      };
    }

    // Step 2: If the user provides a new slug, ensure it is not taken
    if (data.slug !== undefined && data.slug !== existing.slug) {
      const conflict = await this.repository.findBySlug(data.slug);

      if (conflict) {
        return {
          success: false,
          message: `The slug "${data.slug}" is already taken. Please choose a different slug.`,
        };
      }
    }

    // Step 3: Perform the update
    const updated = await this.repository.update(existing.id, ownerId, data);

    if (!updated) {
      return {
        success: false,
        message: "Failed to update organization",
      };
    }

    return {
      success: true,
      message: "Organization updated successfully",
      data: updated,
    };
  }
}
