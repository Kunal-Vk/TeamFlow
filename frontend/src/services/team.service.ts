import { api } from "@/lib/api/axios";
import { CreateTeamFormData, UpdateTeamFormData } from "@/schemas";
import { ApiResponse, Team } from "@/types";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string | null;
  addedAt: string;
}

export const teamService = {
  async getTeams(orgSlug: string): Promise<ApiResponse<Team[]>> {
    const res = await api.get<ApiResponse<Team[]>>(`/organizations/${orgSlug}/teams`);
    return res.data;
  },

  async getTeamById(orgSlug: string, teamId: string): Promise<ApiResponse<Team>> {
    const res = await api.get<ApiResponse<Team>>(`/organizations/${orgSlug}/teams/${teamId}`);
    return res.data;
  },

  async createTeam(orgSlug: string, data: CreateTeamFormData): Promise<ApiResponse<Team>> {
    const res = await api.post<ApiResponse<Team>>(`/organizations/${orgSlug}/teams`, data);
    return res.data;
  },

  async updateTeam(orgSlug: string, teamId: string, data: UpdateTeamFormData): Promise<ApiResponse<Team>> {
    const res = await api.put<ApiResponse<Team>>(`/organizations/${orgSlug}/teams/${teamId}`, data);
    return res.data;
  },

  async deleteTeam(orgSlug: string, teamId: string): Promise<ApiResponse> {
    const res = await api.delete<ApiResponse>(`/organizations/${orgSlug}/teams/${teamId}`);
    return res.data;
  },

  async getTeamMembers(orgSlug: string, teamId: string): Promise<ApiResponse<TeamMember[]>> {
    const res = await api.get<ApiResponse<TeamMember[]>>(`/organizations/${orgSlug}/teams/${teamId}/members`);
    return res.data;
  },

  async addTeamMember(orgSlug: string, teamId: string, userId: string): Promise<ApiResponse> {
    const res = await api.post<ApiResponse>(`/organizations/${orgSlug}/teams/${teamId}/members`, { userId });
    return res.data;
  },

  async removeTeamMember(orgSlug: string, teamId: string, userId: string): Promise<ApiResponse> {
    const res = await api.delete<ApiResponse>(`/organizations/${orgSlug}/teams/${teamId}/members/${userId}`);
    return res.data;
  },
};
