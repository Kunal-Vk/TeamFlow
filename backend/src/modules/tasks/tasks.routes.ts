import { Router } from "express";
import { verifyToken } from "../../common/middleware/auth.middleware";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "./controllers/tasks.controller";

const router = Router();

router.use(verifyToken);

router.post("/organizations/:orgSlug/projects/:projectSlug/tasks", createTask);
router.get("/organizations/:orgSlug/projects/:projectSlug/tasks", getTasks);
router.get("/organizations/:orgSlug/projects/:projectSlug/tasks/:taskId", getTaskById);
router.put("/organizations/:orgSlug/projects/:projectSlug/tasks/:taskId", updateTask);
router.delete("/organizations/:orgSlug/projects/:projectSlug/tasks/:taskId", deleteTask);

export default router;
