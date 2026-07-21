import { Request, Response } from "express";
import { registerSchema, loginSchema, refreshSchema } from "../schemas/auth.schema";
import { RegisterCommand } from "../command/register.command";
import { LoginCommand } from "../command/login.command";
import { RefreshTokenCommand } from "../command/refresh-token.command";
import { LogoutCommand } from "../command/logout.command";
import { LogoutAllCommand } from "../command/logout-all.command";

export const register = async (req: Request, res: Response) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  const command  = new RegisterCommand();
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

  const command  = new LoginCommand();
  const response = await command.execute(result.data);

  if (!response.success) {
    return res.status(401).json(response);
  }

  return res.status(200).json(response);
};

export const refresh = async (req: Request, res: Response) => {
  const result = refreshSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  const command  = new RefreshTokenCommand();
  const response = await command.execute(result.data.refreshToken);

  if (!response.success) {
    return res.status(401).json(response);
  }

  return res.status(200).json(response);
};

export const logout = async (req: Request, res: Response) => {
  const result = refreshSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  const command  = new LogoutCommand();
  const response = await command.execute(result.data.refreshToken);

  return res.status(200).json(response);
};

export const logoutAll = async (req: Request, res: Response) => {
  const command  = new LogoutAllCommand();
  const response = await command.execute(req.user.id);

  return res.status(200).json(response);
};

export const me = async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};