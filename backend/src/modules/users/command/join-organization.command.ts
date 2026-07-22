import { UserRepository } from "../repository/users.repository";
import { OrganizationRepository } from "../../organizations/repository/organizations.repository";

export class JoinOrganizationCommand {
  private userRepository = new UserRepository();
  private orgRepository = new OrganizationRepository();

  async execute(slug: string, requestingUser: { id: string }) {
    return {
      success: false,
      message: "Joining organizations directly is disabled. You must be added by an organization owner.",
    };
  }
}
