import { Request, Response } from "express";
import { GetDashboardCommand } from "../command/get-dashboard.command";

export const getDashboard = async (req: Request, res: Response) => {
  const orgSlug = req.params.orgSlug as string;

  const command = new GetDashboardCommand();
  const response = await command.execute(orgSlug, req.user);

  return res.status(response.statusCode).json(response);
};
