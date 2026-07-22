import { api } from "@/lib/api/axios";
import { CreateProjectFormData, UpdateProjectFormData } from "@/schemas";
import { ApiResponse, Project } from "@/types";
import { TeamMember } from "./team.service";

export const projectService = {
  async getProjects(orgSlug: string): Promise<ApiResponse<Project[]>> {
    const res = await api.get<ApiResponse<Project[]>>(`/organizations/${orgSlug}/projects`);
    return res.data;
  },

  async getProjectBySlug(orgSlug: string, projectSlug: string): Promise<ApiResponse<Project>> {
    const res = await api.get<ApiResponse<Project>>(`/organizations/${orgSlug}/projects/${projectSlug}`);
    return res.data;
  },

  async createProject(orgSlug: string, data: CreateProjectFormData): Promise<ApiResponse<Project>> {
    const res = await api.post<ApiResponse<Project>>(`/organizations/${orgSlug}/projects`, data);
    return res.data;
  },

  async updateProject(orgSlug: string, projectSlug: string, data: UpdateProjectFormData): Promise<ApiResponse<Project>> {
    const res = await api.put<ApiResponse<Project>>(`/organizations/${orgSlug}/projects/${projectSlug}`, data);
    return res.data;
  },

  async deleteProject(orgSlug: string, projectSlug: string): Promise<ApiResponse> {
    const res = await api.delete<ApiResponse>(`/organizations/${orgSlug}/projects/${projectSlug}`);
    return res.data;
  },

  async getProjectMembers(orgSlug: string, projectSlug: string): Promise<ApiResponse<TeamMember[]>> {
    const res = await api.get<ApiResponse<TeamMember[]>>(`/organizations/${orgSlug}/projects/${projectSlug}/members`);
    return res.data;
  },

  async addProjectMember(orgSlug: string, projectSlug: string, userId: string): Promise<ApiResponse> {
    const res = await api.post<ApiResponse>(`/organizations/${orgSlug}/projects/${projectSlug}/members`, { userId });
    return res.data;
  },

  async removeProjectMember(orgSlug: string, projectSlug: string, userId: string): Promise<ApiResponse> {
    const res = await api.delete<ApiResponse>(`/organizations/${orgSlug}/projects/${projectSlug}/members/${userId}`);
    return res.data;
  },
};
