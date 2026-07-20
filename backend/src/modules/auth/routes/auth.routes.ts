import { Router } from "express";
import { register,login } from "../controller/auth.controller";
import { verifyToken } from "../../../../src/common/middleware/auth.middleware";
import { me } from "../controller/auth.controller";



const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, me);

export default router;