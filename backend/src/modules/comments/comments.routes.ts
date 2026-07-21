import { Router } from "express";
import { verifyToken } from "../../common/middleware/auth.middleware";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "./controllers/comments.controller";

const router = Router();

router.use(verifyToken);

router.post("/organizations/:orgSlug/projects/:projectSlug/tasks/:taskId/comments", createComment);
router.get("/organizations/:orgSlug/projects/:projectSlug/tasks/:taskId/comments", getComments);
router.put("/organizations/:orgSlug/projects/:projectSlug/tasks/:taskId/comments/:commentId", updateComment);
router.delete("/organizations/:orgSlug/projects/:projectSlug/tasks/:taskId/comments/:commentId", deleteComment);

export default router;
