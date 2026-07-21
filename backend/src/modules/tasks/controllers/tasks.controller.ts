import { Request, Response } from "express";
import { createTaskSchema, updateTaskSchema } from "../tasks.schema";
import { CreateTaskCommand } from "../command/create-task.command";
import { GetTasksCommand } from "../command/get-tasks.command";
import { GetTaskByIdCommand } from "../command/get-task-by-id.command";
import { UpdateTaskCommand } from "../command/update-task.command";
import { DeleteTaskCommand } from "../command/delete-task.command";

export const createTask = async (req: Request, res: Response) => {
  const orgSlug = req.params.orgSlug as string;
  const projectSlug = req.params.projectSlug as string;
  const result = createTaskSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  const command = new CreateTaskCommand();
  const response = await command.execute(orgSlug, projectSlug, result.data, req.user);

  return res.status(response.statusCode).json(response);
};

export const getTasks = async (req: Request, res: Response) => {
  const orgSlug = req.params.orgSlug as string;
  const projectSlug = req.params.projectSlug as string;

  const command = new GetTasksCommand();
  const response = await command.execute(orgSlug, projectSlug, req.user);

  return res.status(response.statusCode).json(response);
};

export const getTaskById = async (req: Request, res: Response) => {
  const orgSlug = req.params.orgSlug as string;
  const projectSlug = req.params.projectSlug as string;
  const taskId = req.params.taskId as string;

  const command = new GetTaskByIdCommand();
  const response = await command.execute(orgSlug, projectSlug, taskId, req.user);

  return res.status(response.statusCode).json(response);
};

export const updateTask = async (req: Request, res: Response) => {
  const orgSlug = req.params.orgSlug as string;
  const projectSlug = req.params.projectSlug as string;
  const taskId = req.params.taskId as string;
  const result = updateTaskSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  const command = new UpdateTaskCommand();
  const response = await command.execute(orgSlug, projectSlug, taskId, result.data, req.user);

  return res.status(response.statusCode).json(response);
};

export const deleteTask = async (req: Request, res: Response) => {
  const orgSlug = req.params.orgSlug as string;
  const projectSlug = req.params.projectSlug as string;
  const taskId = req.params.taskId as string;

  const command = new DeleteTaskCommand();
  const response = await command.execute(orgSlug, projectSlug, taskId, req.user);

  return res.status(response.statusCode).json(response);
};
