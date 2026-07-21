import { Request, Response } from "express";
import { createCommentSchema, updateCommentSchema } from "../comments.schema";
import { CreateCommentCommand } from "../command/create-comment.command";
import { GetCommentsCommand } from "../command/get-comments.command";
import { UpdateCommentCommand } from "../command/update-comment.command";
import { DeleteCommentCommand } from "../command/delete-comment.command";

export const createComment = async (req: Request, res: Response) => {
  const orgSlug = req.params.orgSlug as string;
  const projectSlug = req.params.projectSlug as string;
  const taskId = req.params.taskId as string;
  const result = createCommentSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  const command = new CreateCommentCommand();
  const response = await command.execute(orgSlug, projectSlug, taskId, result.data, req.user);

  return res.status(response.statusCode).json(response);
};

export const getComments = async (req: Request, res: Response) => {
  const orgSlug = req.params.orgSlug as string;
  const projectSlug = req.params.projectSlug as string;
  const taskId = req.params.taskId as string;

  const command = new GetCommentsCommand();
  const response = await command.execute(orgSlug, projectSlug, taskId, req.user);

  return res.status(response.statusCode).json(response);
};

export const updateComment = async (req: Request, res: Response) => {
  const orgSlug = req.params.orgSlug as string;
  const projectSlug = req.params.projectSlug as string;
  const taskId = req.params.taskId as string;
  const commentId = req.params.commentId as string;
  const result = updateCommentSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  const command = new UpdateCommentCommand();
  const response = await command.execute(orgSlug, projectSlug, taskId, commentId, result.data, req.user);

  return res.status(response.statusCode).json(response);
};

export const deleteComment = async (req: Request, res: Response) => {
  const orgSlug = req.params.orgSlug as string;
  const projectSlug = req.params.projectSlug as string;
  const taskId = req.params.taskId as string;
  const commentId = req.params.commentId as string;

  const command = new DeleteCommentCommand();
  const response = await command.execute(orgSlug, projectSlug, taskId, commentId, req.user);

  return res.status(response.statusCode).json(response);
};
