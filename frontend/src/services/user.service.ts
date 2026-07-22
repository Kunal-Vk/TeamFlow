import { api } from "@/lib/api/axios";
import { ApiResponse, User } from "@/types";

export const userService = {
  async searchUserByEmail(email: string): Promise<ApiResponse<{ id: string; name: string; email: string }>> {
    const res = await api.get<ApiResponse<{ id: string; name: string; email: string }>>(`/users/search`, {
      params: { email },
    });
    return res.data;
  },

  async getOrgMembers(orgSlug: string): Promise<ApiResponse<User[]>> {
    const res = await api.get<ApiResponse<User[]>>(`/users/organizations/${orgSlug}/users`);
    return res.data;
  },

  async addUserToOrg(orgSlug: string, userId: string): Promise<ApiResponse<User>> {
    const res = await api.post<ApiResponse<User>>(`/users/organizations/${orgSlug}/users`, { userId });
    return res.data;
  },

  async removeUserFromOrg(orgSlug: string, userId: string): Promise<ApiResponse> {
    const res = await api.delete<ApiResponse>(`/users/organizations/${orgSlug}/users/${userId}`);
    return res.data;
  },

  async joinOrganization(slug: string): Promise<ApiResponse<User>> {
    const res = await api.post<ApiResponse<User>>(`/users/join`, { slug });
    return res.data;
  },

  async leaveOrganization(): Promise<ApiResponse> {
    const res = await api.post<ApiResponse>(`/users/leave`);
    return res.data;
  },
};
