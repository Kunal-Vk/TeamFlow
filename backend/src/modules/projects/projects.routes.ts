import { Router } from "express";
import { verifyToken } from "../../common/middleware/auth.middleware";
import {
  createProject,
  getProjects,
  getProjectBySlug,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
} from "./controllers/projects.controller";

const router = Router({ mergeParams: true });

router.use(verifyToken);

router.post("/", createProject);
router.get("/", getProjects);
router.get("/:projectSlug", getProjectBySlug);
router.put("/:projectSlug", updateProject);
router.delete("/:projectSlug", deleteProject);

// Project Member Routes
router.get("/:projectSlug/members", getProjectMembers);
router.post("/:projectSlug/members", addProjectMember);
router.delete("/:projectSlug/members/:userId", removeProjectMember);

export default router;
