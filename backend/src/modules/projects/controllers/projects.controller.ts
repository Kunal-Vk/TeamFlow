import { Request, Response } from "express";
import { createProjectSchema, updateProjectSchema } from "../projects.schema";
import { CreateProjectCommand } from "../command/create-project.command";
import { GetProjectsCommand } from "../command/get-projects.command";
import { GetProjectBySlugCommand } from "../command/get-project-by-slug.command";
import { UpdateProjectCommand } from "../command/update-project.command";
import { DeleteProjectCommand } from "../command/delete-project.command";
import { ProjectRepository } from "../projects.repository";
import { OrganizationRepository } from "../../organizations/repository/organizations.repository";
import { hasOrgAccess } from "../../../common/utils/org-access";

const projectRepository = new ProjectRepository();
const orgRepository = new OrganizationRepository();

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

// ─── Project Members Controllers ─────────────────────────────────────────────

export const getProjectMembers = async (req: Request, res: Response) => {
  const orgSlug = req.params.orgSlug as string;
  const projectSlug = req.params.projectSlug as string;

  const org = await orgRepository.findBySlug(orgSlug);
  if (!org || !hasOrgAccess(req.user, org)) {
    return res.status(403).json({ success: false, message: "Forbidden: Access denied" });
  }

  const project = await projectRepository.findBySlugAndOrgId(projectSlug, org.id);
  if (!project) {
    return res.status(404).json({ success: false, message: "Project not found" });
  }

  const members = await projectRepository.getMembers(project.id);
  return res.status(200).json({ success: true, data: members });
};

export const addProjectMember = async (req: Request, res: Response) => {
  const orgSlug = req.params.orgSlug as string;
  const projectSlug = req.params.projectSlug as string;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: "userId is required" });
  }

  const org = await orgRepository.findBySlug(orgSlug);
  if (!org || !hasOrgAccess(req.user, org)) {
    return res.status(403).json({ success: false, message: "Forbidden: Access denied" });
  }

  const project = await projectRepository.findBySlugAndOrgId(projectSlug, org.id);
  if (!project) {
    return res.status(404).json({ success: false, message: "Project not found" });
  }

  await projectRepository.addMember(project.id, userId);
  return res.status(200).json({ success: true, message: "Member added to project successfully" });
};

export const removeProjectMember = async (req: Request, res: Response) => {
  const orgSlug = req.params.orgSlug as string;
  const projectSlug = req.params.projectSlug as string;
  const userId = req.params.userId as string;

  const org = await orgRepository.findBySlug(orgSlug);
  if (!org || !hasOrgAccess(req.user, org)) {
    return res.status(403).json({ success: false, message: "Forbidden: Access denied" });
  }

  const project = await projectRepository.findBySlugAndOrgId(projectSlug, org.id);
  if (!project) {
    return res.status(404).json({ success: false, message: "Project not found" });
  }

  await projectRepository.removeMember(project.id, userId);
  return res.status(200).json({ success: true, message: "Member removed from project successfully" });
};
