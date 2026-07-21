import { Router } from "express";
import { verifyToken } from "../../../common/middleware/auth.middleware";
import {
  searchUserByEmail,
  addUserToOrg,
  removeUserFromOrg,
  getOrgMembers,
} from "../controllers/users.controller";

const router = Router();

// All user management routes require valid authentication
router.use(verifyToken);

// User search (Owner searching user by email)
router.get("/search", searchUserByEmail);                                // GET /api/users/search?email=...

// Org membership management
router.get("/organizations/:slug/users", getOrgMembers);                // GET /api/users/organizations/:slug/users
router.post("/organizations/:slug/users", addUserToOrg);                 // POST /api/users/organizations/:slug/users
router.delete("/organizations/:slug/users/:userId", removeUserFromOrg); // DELETE /api/users/organizations/:slug/users/:userId

export default router;
