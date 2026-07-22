import { api } from "@/lib/api/axios";
import { CreateTaskFormData, UpdateTaskFormData } from "@/schemas";
import { ApiResponse, Task } from "@/types";

export const taskService = {
  async getTasks(orgSlug: string, projectSlug: string): Promise<ApiResponse<Task[]>> {
    const res = await api.get<ApiResponse<Task[]>>(`/organizations/${orgSlug}/projects/${projectSlug}/tasks`);
    return res.data;
  },

  async getTaskById(orgSlug: string, projectSlug: string, taskId: string): Promise<ApiResponse<Task>> {
    const res = await api.get<ApiResponse<Task>>(`/organizations/${orgSlug}/projects/${projectSlug}/tasks/${taskId}`);
    return res.data;
  },

  async createTask(orgSlug: string, projectSlug: string, data: CreateTaskFormData): Promise<ApiResponse<Task>> {
    const res = await api.post<ApiResponse<Task>>(`/organizations/${orgSlug}/projects/${projectSlug}/tasks`, data);
    return res.data;
  },

  async updateTask(orgSlug: string, projectSlug: string, taskId: string, data: UpdateTaskFormData): Promise<ApiResponse<Task>> {
    const res = await api.put<ApiResponse<Task>>(`/organizations/${orgSlug}/projects/${projectSlug}/tasks/${taskId}`, data);
    return res.data;
  },

  async deleteTask(orgSlug: string, projectSlug: string, taskId: string): Promise<ApiResponse> {
    const res = await api.delete<ApiResponse>(`/organizations/${orgSlug}/projects/${projectSlug}/tasks/${taskId}`);
    return res.data;
  },
};
