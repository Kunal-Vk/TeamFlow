import { Request, Response } from "express";
import { createProjectSchema, updateProjectSchema } from "../projects.schema";
import { CreateProjectCommand } from "../command/create-project.command";
import { GetProjectsCommand } from "../command/get-projects.command";
import { GetProjectBySlugCommand } from "../command/get-project-by-slug.command";
import { UpdateProjectCommand } from "../command/update-project.command";
import { DeleteProjectCommand } from "../command/delete-project.command";

export const createProject = async (req: Request, res: Response) => {
  const orgSlug = req.params.orgSlug as string;
  const result = createProjectSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  const command = new CreateProjectCommand();
  const response = await command.execute(orgSlug, result.data, req.user);

  return res.status(response.statusCode).json(response);
};

export const getProjects = async (req: Request, res: Response) => {
  const orgSlug = req.params.orgSlug as string;

  const command = new GetProjectsCommand();
  const response = await command.execute(orgSlug, req.user);

  return res.status(response.statusCode).json(response);
};

export const getProjectBySlug = async (req: Request, res: Response) => {
  const orgSlug = req.params.orgSlug as string;
  const projectSlug = req.params.projectSlug as string;

  const command = new GetProjectBySlugCommand();
  const response = await command.execute(orgSlug, projectSlug, req.user);

  return res.status(response.statusCode).json(response);
};

export const updateProject = async (req: Request, res: Response) => {
  const orgSlug = req.params.orgSlug as string;
  const projectSlug = req.params.projectSlug as string;
  const result = updateProjectSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  const command = new UpdateProjectCommand();
  const response = await command.execute(orgSlug, projectSlug, result.data, req.user);

  return res.status(response.statusCode).json(response);
};

export const deleteProject = async (req: Request, res: Response) => {
  const orgSlug = req.params.orgSlug as string;
  const projectSlug = req.params.projectSlug as string;

  const command = new DeleteProjectCommand();
  const response = await command.execute(orgSlug, projectSlug, req.user);

  return res.status(response.statusCode).json(response);
};
