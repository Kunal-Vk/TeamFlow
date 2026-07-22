import { Request, Response } from "express";
import { registerSchema, loginSchema } from "../schemas/auth.schema";
import { RegisterCommand } from "../command/register.command";
import { LoginCommand } from "../command/login.command";
import { RefreshTokenCommand } from "../command/refresh-token.command";
import { LogoutCommand } from "../command/logout.command";
import { LogoutAllCommand } from "../command/logout-all.command";
import { db } from "../../../database/db";
import { users } from "../../../database/schema";
import { eq } from "drizzle-orm";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

export const register = async (req: Request, res: Response) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  const command = new RegisterCommand();
  const response = await command.execute(result.data);

  return res.status(201).json(response);
};

export const login = async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  const command = new LoginCommand();
  const response = await command.execute(result.data);

  if (!response.success || !response.refreshToken) {
    return res.status(401).json(response);
  }

  // Set Refresh Token in HttpOnly cookie for XSS immunity
  res.cookie("refreshToken", response.refreshToken, COOKIE_OPTIONS);

  return res.status(200).json({
    success: true,
    message: response.message,
    accessToken: response.accessToken,
    user: response.user,
  });
};

export const refresh = async (req: Request, res: Response) => {
  // Read refresh token from HttpOnly cookie first, with fallback to request body
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token missing",
    });
  }

  const command = new RefreshTokenCommand();
  const response = await command.execute(refreshToken);

  if (!response.success || !response.refreshToken) {
    res.clearCookie("refreshToken");
    return res.status(401).json(response);
  }

  // Rotate HttpOnly cookie
  res.cookie("refreshToken", response.refreshToken, COOKIE_OPTIONS);

  return res.status(200).json({
    success: true,
    message: response.message,
    accessToken: response.accessToken,
  });
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (refreshToken) {
    const command = new LogoutCommand();
    await command.execute(refreshToken);
  }

  res.clearCookie("refreshToken");

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const logoutAll = async (req: Request, res: Response) => {
  const command = new LogoutAllCommand();
  const response = await command.execute(req.user.id);

  res.clearCookie("refreshToken");

  return res.status(200).json(response);
};

export const me = async (req: Request, res: Response) => {
  // Fetch fresh user data from PostgreSQL database to ensure roles and organizationId are real-time accurate
  const [freshUser] = await db.select().from(users).where(eq(users.id, req.user.id));

  if (!freshUser) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const { password: _, ...userWithoutPassword } = freshUser;

  return res.status(200).json({
    success: true,
    user: userWithoutPassword,
  });
};