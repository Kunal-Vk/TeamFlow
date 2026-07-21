import { Router } from "express";
import { verifyToken } from "../../../common/middleware/auth.middleware";
import {
  createOrganization,
  getOrganizations,
  getOrganizationBySlug,
  searchOrganizations,
  updateOrganization,
  deleteOrganization,
} from "../controllers/organizations.controller";

const router = Router();

// All organization routes require a valid JWT
router.use(verifyToken);

router.post("/",        createOrganization);    // POST   /api/organizations
router.get("/",         getOrganizations);       // GET    /api/organizations
router.get("/search",   searchOrganizations);    // GET    /api/organizations/search?q=  ← static, must be before /:slug
router.get("/:slug",    getOrganizationBySlug);  // GET    /api/organizations/:slug
router.put("/:slug",    updateOrganization);     // PUT    /api/organizations/:slug
router.delete("/:slug", deleteOrganization);     // DELETE /api/organizations/:slug

export default router;
