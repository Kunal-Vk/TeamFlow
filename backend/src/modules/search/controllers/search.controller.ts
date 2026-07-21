import { Request, Response } from "express";
import { searchSchema } from "../search.schema";
import { SearchCommand } from "../command/search.command";

export const searchOrg = async (req: Request, res: Response) => {
  const orgSlug = req.params.orgSlug as string;
  const result = searchSchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  const command = new SearchCommand();
  const response = await command.execute(orgSlug, result.data.q, req.user);

  return res.status(response.statusCode).json(response);
};
