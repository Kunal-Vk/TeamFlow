import { Router } from "express";
import { verifyToken } from "../../common/middleware/auth.middleware";
import {
  createProject,
  getProjects,
  getProjectBySlug,
  updateProject,
  deleteProject,
} from "./controllers/projects.controller";

const router = Router({ mergeParams: true });

router.use(verifyToken);

router.post("/", createProject);
router.get("/", getProjects);
router.get("/:projectSlug", getProjectBySlug);
router.put("/:projectSlug", updateProject);
router.delete("/:projectSlug", deleteProject);

export default router;
