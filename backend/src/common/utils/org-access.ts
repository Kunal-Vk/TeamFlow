// Helpers for checking organization access in commands.
// Reads directly from req.user (JWT payload) — no extra DB query needed.

type JwtUser = {
  id: string;
  email?: string;
  role: string | null;
  organizationId: string | null;
};

type OrgRef = { id: string; ownerId: string };

/** True if the JWT user is the owner of the given org. */
export function isOrgOwner(user: JwtUser, org: OrgRef): boolean {
  return org.ownerId === user.id;
}

/** True if the JWT user is a member (or owner) of the given org. */
export function hasOrgAccess(user: JwtUser, org: OrgRef): boolean {
  return org.ownerId === user.id || user.organizationId === org.id;
}
