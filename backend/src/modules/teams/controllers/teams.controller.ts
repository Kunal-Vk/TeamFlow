import { Request, Response } from "express";
import { createTeamSchema, updateTeamSchema } from "../teams.schema";
import { CreateTeamCommand } from "../command/create-team.command";
import { GetTeamsCommand } from "../command/get-teams.command";
import { GetTeamByIdCommand } from "../command/get-team-by-id.command";
import { UpdateTeamCommand } from "../command/update-team.command";
import { DeleteTeamCommand } from "../command/delete-team.command";
import { TeamRepository } from "../teams.repository";

const teamRepo = new TeamRepository();

export const createTeam = async (req: Request, res: Response) => {
  const orgSlug = req.params.orgSlug as string;
  const result = createTeamSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  const command = new CreateTeamCommand();
  const response = await command.execute(orgSlug, result.data, req.user);

  return res.status(response.statusCode).json(response);
};

export const getTeams = async (req: Request, res: Response) => {
  const orgSlug = req.params.orgSlug as string;

  const command = new GetTeamsCommand();
  const response = await command.execute(orgSlug, req.user);

  return res.status(response.statusCode).json(response);
};

export const getTeamById = async (req: Request, res: Response) => {
  const orgSlug = req.params.orgSlug as string;
  const teamId = req.params.teamId as string;

  const command = new GetTeamByIdCommand();
  const response = await command.execute(orgSlug, teamId, req.user);

  return res.status(response.statusCode).json(response);
};

export const updateTeam = async (req: Request, res: Response) => {
  const orgSlug = req.params.orgSlug as string;
  const teamId = req.params.teamId as string;
  const result = updateTeamSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  const command = new UpdateTeamCommand();
  const response = await command.execute(orgSlug, teamId, result.data, req.user);

  return res.status(response.statusCode).json(response);
};

export const deleteTeam = async (req: Request, res: Response) => {
  const orgSlug = req.params.orgSlug as string;
  const teamId = req.params.teamId as string;

  const command = new DeleteTeamCommand();
  const response = await command.execute(orgSlug, teamId, req.user);

  return res.status(response.statusCode).json(response);
};

// ─── Team Member Endpoints ───────────────────────────────────────────────────

export const addTeamMember = async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  const added = await teamRepo.addMember(teamId, userId);
  return res.status(200).json({
    success: true,
    message: "Member added to team successfully",
    data: added,
  });
};

export const getTeamMembers = async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;

  const members = await teamRepo.getMembers(teamId);
  return res.status(200).json({
    success: true,
    data: members,
  });
};

export const removeTeamMember = async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;
  const userId = req.params.userId as string;

  await teamRepo.removeMember(teamId, userId);
  return res.status(200).json({
    success: true,
    message: "Member removed from team successfully",
  });
};
