import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { AuthRepository } from "../repository/auth.repository";
import { LoginUserDto } from "../schemas/auth.schema";
import { env } from "../../../config/env";

const ACCESS_TOKEN_TTL  = "30m";
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

export class LoginCommand {
  private authRepository = new AuthRepository();

  async execute(data: LoginUserDto) {
    const user = await this.authRepository.findByEmail(data.email.toLowerCase());

    if (!user) {
      return { success: false, message: "Invalid email or password" };
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      return { success: false, message: "Invalid email or password" };
    }

    // Access token — short-lived, contains role + organizationId for RBAC
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
      env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    // Refresh token — opaque random string, stored in DB
    const refreshToken = crypto.randomBytes(64).toString("hex");
    const expiresAt    = new Date(Date.now() + REFRESH_TOKEN_TTL);

    await this.authRepository.saveRefreshToken(user.id, refreshToken, expiresAt);

    const { password, ...safeUser } = user;

    return {
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user: safeUser,
    };
  }
}