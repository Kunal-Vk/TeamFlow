import jwt from "jsonwebtoken";
import crypto from "crypto";

import { AuthRepository } from "../repository/auth.repository";
import { env } from "../../../config/env";

const ACCESS_TOKEN_TTL  = "15m";
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

export class RefreshTokenCommand {
  private authRepository = new AuthRepository();

  async execute(token: string) {
    // 1. Find the token in DB
    const stored = await this.authRepository.findRefreshToken(token);

    if (!stored) {
      return { success: false, message: "Invalid refresh token" };
    }

    // 2. Check expiry
    if (stored.expiresAt < new Date()) {
      await this.authRepository.deleteRefreshToken(token);
      return { success: false, message: "Refresh token has expired. Please log in again." };
    }

    // 3. Load fresh user data (role + organizationId may have changed)
    const user = await this.authRepository.findById(stored.userId);

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // 4. Issue new access token with up-to-date payload
    const newAccessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
      env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    // 5. Rotate refresh token — delete old, issue new
    const newRefreshToken = crypto.randomBytes(64).toString("hex");
    const expiresAt       = new Date(Date.now() + REFRESH_TOKEN_TTL);

    await this.authRepository.deleteRefreshToken(token);
    await this.authRepository.saveRefreshToken(user.id, newRefreshToken, expiresAt);

    return {
      success: true,
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
