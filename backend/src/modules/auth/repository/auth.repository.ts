import { db } from "../../../database/db";
import { users } from "../../../database/schema";
import { eq } from "drizzle-orm";
import { RegisterUserDto } from "../schemas/auth.schema";

export class AuthRepository {
  async findByEmail(email: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    return user;
  }

  async create(user: RegisterUserDto) {
    console.log("Creating user:", user);
    const [newUser] = await db
      .insert(users)
      .values(user)
      .returning();
    console.log("Created:", newUser);
    return newUser;
  }
}