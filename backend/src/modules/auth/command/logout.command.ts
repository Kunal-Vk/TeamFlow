import { AuthRepository } from "../repository/auth.repository";

export class LogoutCommand {
  private authRepository = new AuthRepository();

  /** Logs out the current device by deleting the specific refresh token. */
  async execute(refreshToken: string) {
    await this.authRepository.deleteRefreshToken(refreshToken);

    return {
      success: true,
      message: "Logged out successfully",
    };
  }
}
