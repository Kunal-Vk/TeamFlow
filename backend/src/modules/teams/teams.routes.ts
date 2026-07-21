import { Router } from "express";
import { verifyToken } from "../../common/middleware/auth.middleware";
import {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
} from "./controllers/teams.controller";

const router = Router({ mergeParams: true });

router.use(verifyToken);

router.post("/", createTeam);
router.get("/", getTeams);
router.get("/:teamId", getTeamById);
router.put("/:teamId", updateTeam);
router.delete("/:teamId", deleteTeam);

export default router;
