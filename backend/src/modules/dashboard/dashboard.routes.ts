import { Router } from "express";
import { verifyToken } from "../../common/middleware/auth.middleware";
import { getDashboard } from "./controllers/dashboard.controller";

const router = Router({ mergeParams: true });

router.use(verifyToken);

router.get("/", getDashboard);

export default router;
