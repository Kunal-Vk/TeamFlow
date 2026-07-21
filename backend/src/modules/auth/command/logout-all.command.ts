import { AuthRepository } from "../repository/auth.repository";

export class LogoutAllCommand {
  private authRepository = new AuthRepository();

  /** Logs out all devices by deleting every refresh token for this user. */
  async execute(userId: string) {
    await this.authRepository.deleteAllUserRefreshTokens(userId);

    return {
      success: true,
      message: "Logged out from all devices successfully",
    };
  }
}
