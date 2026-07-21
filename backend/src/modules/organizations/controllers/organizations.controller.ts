import { Request, Response } from "express";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  searchOrganizationsSchema,
} from "../schemas/organizations.schema";
import { CreateOrganizationCommand } from "../command/create-organization.command";
import { GetOrganizationsCommand } from "../command/get-organizations.command";
import { GetOrganizationByIdCommand } from "../command/get-organization-by-id.command";
import { UpdateOrganizationCommand } from "../command/update-organization.command";
import { DeleteOrganizationCommand } from "../command/delete-organization.command";
import { SearchOrganizationsCommand } from "../command/search-organizations.command";

export const createOrganization = async (req: Request, res: Response) => {
  const result = createOrganizationSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  const command = new CreateOrganizationCommand();
  const response = await command.execute(result.data, req.user.id);

  return res.status(201).json(response);
};

export const getOrganizations = async (req: Request, res: Response) => {
  const command = new GetOrganizationsCommand();
  const response = await command.execute(req.user.id);

  return res.status(200).json(response);
};

export const getOrganizationBySlug = async (req: Request, res: Response) => {
  const slug = req.params.slug as string;

  const command = new GetOrganizationByIdCommand();
  const response = await command.execute(slug, req.user.id);

  if (!response.success) {
    return res.status(404).json(response);
  }

  return res.status(200).json(response);
};

export const searchOrganizations = async (req: Request, res: Response) => {
  const result = searchOrganizationsSchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  const command = new SearchOrganizationsCommand();
  const response = await command.execute(result.data.q, req.user.id);

  return res.status(200).json(response);
};

export const updateOrganization = async (req: Request, res: Response) => {
  const slug = req.params.slug as string;

  const result = updateOrganizationSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  const command = new UpdateOrganizationCommand();
  const response = await command.execute(slug, req.user.id, result.data);

  if (!response.success) {
    // Distinguish slug conflict (409) from not found (404)
    const status = response.message?.includes("already taken") ? 409 : 404;
    return res.status(status).json(response);
  }

  return res.status(200).json(response);
};

export const deleteOrganization = async (req: Request, res: Response) => {
  const slug = req.params.slug as string;

  const command = new DeleteOrganizationCommand();
  const response = await command.execute(slug, req.user);

  if (!response.success) {
    return res.status(404).json(response);
  }

  return res.status(200).json(response);
};
