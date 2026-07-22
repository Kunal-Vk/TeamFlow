import { api } from "@/lib/api/axios";
import { LoginFormData, RegisterFormData } from "@/schemas";
import { LoginResponse, ApiResponse, User } from "@/types";

export const authService = {
  async register(data: RegisterFormData): Promise<ApiResponse<User>> {
    const res = await api.post<ApiResponse<User>>("/auth/register", data);
    return res.data;
  },

  async login(data: LoginFormData): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>("/auth/login", data);
    return res.data;
  },

  async getMe(): Promise<{ success: boolean; user: User }> {
    const res = await api.get<{ success: boolean; user: User }>("/auth/me");
    return res.data;
  },

  async logout(): Promise<ApiResponse> {
    const res = await api.post<ApiResponse>("/auth/logout");
    return res.data;
  },

  async logoutAll(): Promise<ApiResponse> {
    const res = await api.post<ApiResponse>("/auth/logout-all");
    return res.data;
  },
};
