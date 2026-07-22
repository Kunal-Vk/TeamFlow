import { eq, and } from "drizzle-orm";
import { db } from "../../database/db";
import { teams, teamMembers, users } from "../../database/schema";
import { NewTeam } from "./teams.types";
import { UpdateTeamDto } from "./teams.schema";

export class TeamRepository {
  async create(data: NewTeam) {
    const [team] = await db.insert(teams).values(data).returning();
    return team;
  }

  async findByOrgId(organizationId: string) {
    return db.query.teams.findMany({
      where: eq(teams.organizationId, organizationId),
    });
  }

  async findByIdAndOrgId(id: string, organizationId: string) {
    const [team] = await db
      .select()
      .from(teams)
      .where(and(eq(teams.id, id), eq(teams.organizationId, organizationId)));
    return team ?? null;
  }

  async update(id: string, organizationId: string, data: UpdateTeamDto) {
    const [updated] = await db
      .update(teams)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(teams.id, id), eq(teams.organizationId, organizationId)))
      .returning();
    return updated ?? null;
  }

  async delete(id: string, organizationId: string) {
    const [deleted] = await db
      .delete(teams)
      .where(and(eq(teams.id, id), eq(teams.organizationId, organizationId)))
      .returning();
    return deleted ?? null;
  }

  // ─── Team Members ─────────────────────────────────────────────────────────────

  async addMember(teamId: string, userId: string) {
    const [record] = await db
      .insert(teamMembers)
      .values({ teamId, userId })
      .onConflictDoNothing()
      .returning();
    return record;
  }

  async getMembers(teamId: string) {
    const records = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        addedAt: teamMembers.createdAt,
      })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, teamId));
    return records;
  }

  async removeMember(teamId: string, userId: string) {
    const [deleted] = await db
      .delete(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)))
      .returning();
    return deleted ?? null;
  }
}
