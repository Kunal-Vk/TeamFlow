import { UserRepository } from "../repository/users.repository";

export class SearchUsersCommand {
  private repository = new UserRepository();

  async execute(email: string) {
    const user = await this.repository.findByEmail(email.toLowerCase());

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Only return minimal public info (never expose password or internal metadata)
    return {
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
