import { Router } from "express";
import { verifyToken } from "../../common/middleware/auth.middleware";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "./controllers/tasks.controller";

const router = Router({ mergeParams: true });

router.use(verifyToken);

router.post("/", createTask);
router.get("/", getTasks);
router.get("/:taskId", getTaskById);
router.put("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);

export default router;
