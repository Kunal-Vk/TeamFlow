import { Router } from "express";
import { verifyToken } from "../../common/middleware/auth.middleware";
import { getDashboard, getAuditLogs } from "./controllers/dashboard.controller";

const router = Router({ mergeParams: true });

router.use(verifyToken);

router.get("/", getDashboard);
router.get("/audit-logs", getAuditLogs);

export default router;
