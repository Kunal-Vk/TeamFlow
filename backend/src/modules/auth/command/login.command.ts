import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { AuthRepository } from "../repository/auth.repository";
import { LoginUserDto } from "../schemas/auth.schema";
import { env } from "../../../config/env";

export class LoginCommand {
  private authRepository = new AuthRepository();

  async execute(data: LoginUserDto) {
  const user = await this.authRepository.findByEmail(data.email.toLowerCase());
  if (!user) {
    return {
      success: false,
      message: "Invalid email or password",
    };
  }
  const isPasswordValid = await bcrypt.compare(
    data.password,
    user.password
  );

  if (!isPasswordValid) {
    return {
      success: false,
      message: "Invalid email or password",
    };
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  // Remove password
  const { password, ...safeUser } = user;

  // Return response
  return {
    success: true,
    message: "Login successful",
    token,
    user: safeUser,
  };
  

  

}
}