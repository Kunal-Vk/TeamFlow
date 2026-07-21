import { Router } from "express";
import { register, login, refresh, logout, logoutAll, me } from "../controller/auth.controller";
import { verifyToken } from "../../../common/middleware/auth.middleware";

const router = Router();

router.post("/register",     register);
router.post("/login",        login);
router.post("/refresh",      refresh);                    // POST /auth/refresh
router.post("/logout",       verifyToken, logout);        // POST /auth/logout        (single device)
router.post("/logout-all",   verifyToken, logoutAll);     // POST /auth/logout-all    (all devices)
router.get("/me",            verifyToken, me);

export default router;