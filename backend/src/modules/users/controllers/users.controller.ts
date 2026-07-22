import { Request, Response } from "express";
import { searchUserByEmailSchema, addUserToOrgSchema, joinOrgSchema } from "../schemas/users.schema";
import { SearchUsersCommand } from "../command/search-users.command";
import { AddUserToOrgCommand } from "../command/add-user-to-org.command";
import { RemoveUserFromOrgCommand } from "../command/remove-user-from-org.command";
import { GetOrgMembersCommand } from "../command/get-org-members.command";
import { JoinOrganizationCommand } from "../command/join-organization.command";
import { LeaveOrgCommand } from "../command/leave-org.command";

export const searchUserByEmail = async (req: Request, res: Response) => {
  const result = searchUserByEmailSchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  const command = new SearchUsersCommand();
  const response = await command.execute(result.data.email);

  if (!response.success) {
    return res.status(404).json(response);
  }

  return res.status(200).json(response);
};

export const addUserToOrg = async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  const result = addUserToOrgSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  const command = new AddUserToOrgCommand();
  const response = await command.execute(slug, result.data.userId, req.user);

  if (!response.success) {
    const status = response.message?.includes("Forbidden") ? 403 : 400;
    return res.status(status).json(response);
  }

  return res.status(200).json(response);
};

export const removeUserFromOrg = async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  const userId = req.params.userId as string;

  const command = new RemoveUserFromOrgCommand();
  const response = await command.execute(slug, userId, req.user);

  if (!response.success) {
    const status = response.message?.includes("Forbidden") ? 403 : 400;
    return res.status(status).json(response);
  }

  return res.status(200).json(response);
};

export const getOrgMembers = async (req: Request, res: Response) => {
  const slug = req.params.slug as string;

  const command = new GetOrgMembersCommand();
  const response = await command.execute(slug, req.user);

  if (!response.success) {
    const status = response.message?.includes("Forbidden") ? 403 : 404;
    return res.status(status).json(response);
  }

  return res.status(200).json(response);
};

export const joinOrganization = async (req: Request, res: Response) => {
  const result = joinOrgSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  const command = new JoinOrganizationCommand();
  const response = await command.execute(result.data.slug, req.user);

  if (!response.success) {
    return res.status(400).json(response);
  }

  return res.status(200).json(response);
};

export const leaveOrg = async (req: Request, res: Response) => {
  const command = new LeaveOrgCommand();
  const response = await command.execute(req.user);

  if (!response.success) {
    return res.status(400).json(response);
  }

  return res.status(200).json(response);
};
