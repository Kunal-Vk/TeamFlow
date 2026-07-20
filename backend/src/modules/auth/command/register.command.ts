import { RegisterUserDto } from "../schemas/auth.schema";
import { AuthRepository } from "../repository/auth.repository";
import bcrypt from "bcrypt";

export class RegisterCommand {
  private authRepository = new AuthRepository();

  async execute(data: RegisterUserDto) {
    const existingUser = await this.authRepository.findByEmail(data.email);

    if (existingUser) {
      return {
        success: false,
        message: "Email already exists",
      };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = {
      ...data,
      password: hashedPassword,
    };

    const newUser=await this.authRepository.create(user);
    const { password, ...safeUser } = newUser;

    return {
      success: true,
      message: "USer registered successfully",
      data: safeUser,
    };
  }
}



