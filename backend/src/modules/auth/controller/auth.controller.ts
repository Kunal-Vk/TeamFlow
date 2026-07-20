import { Request, Response } from "express";
import { registerSchema,loginSchema } from "../schemas/auth.schema";
import { RegisterCommand } from "../command/register.command";
import { LoginCommand } from "../command/login.command";

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

  return res.status(200).json(response);
};

export const me = async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};