import { Router } from "express";
import { verifyToken } from "../../common/middleware/auth.middleware";
import {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addTeamMember,
  getTeamMembers,
  removeTeamMember,
} from "./controllers/teams.controller";

const router = Router({ mergeParams: true });

router.use(verifyToken);

router.post("/", createTeam);
router.get("/", getTeams);
router.get("/:teamId", getTeamById);
router.put("/:teamId", updateTeam);
router.delete("/:teamId", deleteTeam);

// Team Members Management Routes
router.post("/:teamId/members", addTeamMember);
router.get("/:teamId/members", getTeamMembers);
router.delete("/:teamId/members/:userId", removeTeamMember);

export default router;
