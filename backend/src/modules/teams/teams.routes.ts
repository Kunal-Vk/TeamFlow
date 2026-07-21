import { Router } from "express";
import { verifyToken } from "../../common/middleware/auth.middleware";
import {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
} from "./controllers/teams.controller";

const router = Router();

router.use(verifyToken);

router.post("/organizations/:orgSlug/teams", createTeam);
router.get("/organizations/:orgSlug/teams", getTeams);
router.get("/organizations/:orgSlug/teams/:teamId", getTeamById);
router.put("/organizations/:orgSlug/teams/:teamId", updateTeam);
router.delete("/organizations/:orgSlug/teams/:teamId", deleteTeam);

export default router;
