import { Router } from "express";
import { verifyToken } from "../../common/middleware/auth.middleware";
import { searchOrg } from "./controllers/search.controller";

const router = Router({ mergeParams: true });

router.use(verifyToken);

router.get("/", searchOrg);

export default router;
