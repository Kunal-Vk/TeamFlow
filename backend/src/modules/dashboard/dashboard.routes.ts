import { Router } from "express";
import { verifyToken } from "../../common/middleware/auth.middleware";
import { getDashboard } from "./controllers/dashboard.controller";

const router = Router();

router.use(verifyToken);

router.get("/organizations/:orgSlug/dashboard", getDashboard);

export default router;
