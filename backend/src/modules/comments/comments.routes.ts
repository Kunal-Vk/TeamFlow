import { Router } from "express";
import { verifyToken } from "../../common/middleware/auth.middleware";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "./controllers/comments.controller";

const router = Router({ mergeParams: true });

router.use(verifyToken);

router.post("/", createComment);
router.get("/", getComments);
router.put("/:commentId", updateComment);
router.delete("/:commentId", deleteComment);

export default router;
