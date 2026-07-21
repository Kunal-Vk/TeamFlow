import { db } from "../../../database/db";
import { users, refreshTokens } from "../../../database/schema";
import { eq } from "drizzle-orm";

export class AuthRepository {
  // ─── Users ────────────────────────────────────────────────────────────────

  async findByEmail(email: string) {
    return db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  async findById(id: string) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  async create(user: { name: string; email: string; password: string }) {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // ─── Refresh Tokens ───────────────────────────────────────────────────────

  async saveRefreshToken(userId: string, token: string, expiresAt: Date) {
    await db.insert(refreshTokens).values({ userId, token, expiresAt });
  }

  async findRefreshToken(token: string) {
    return db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.token, token),
    });
  }

  async deleteRefreshToken(token: string) {
    await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
  }

  async deleteAllUserRefreshTokens(userId: string) {
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
  }
}