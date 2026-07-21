import { Router } from "express";
import { verifyToken } from "../../common/middleware/auth.middleware";
import {
  createProject,
  getProjects,
  getProjectBySlug,
  updateProject,
  deleteProject,
} from "./controllers/projects.controller";

const router = Router();

router.use(verifyToken);

router.post("/organizations/:orgSlug/projects", createProject);
router.get("/organizations/:orgSlug/projects", getProjects);
router.get("/organizations/:orgSlug/projects/:projectSlug", getProjectBySlug);
router.put("/organizations/:orgSlug/projects/:projectSlug", updateProject);
router.delete("/organizations/:orgSlug/projects/:projectSlug", deleteProject);

export default router;
