import { Router } from "express";
import { verifyToken } from "../../common/middleware/auth.middleware";
import { searchOrg } from "./controllers/search.controller";

const router = Router();

router.use(verifyToken);

router.get("/organizations/:orgSlug/search", searchOrg);

export default router;
