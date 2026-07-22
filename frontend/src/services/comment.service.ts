import { api } from "@/lib/api/axios";
import { CreateCommentFormData, UpdateCommentFormData } from "@/schemas";
import { ApiResponse, Comment } from "@/types";

export const commentService = {
  async getComments(orgSlug: string, projectSlug: string, taskId: string): Promise<ApiResponse<Comment[]>> {
    const res = await api.get<ApiResponse<Comment[]>>(`/organizations/${orgSlug}/projects/${projectSlug}/tasks/${taskId}/comments`);
    return res.data;
  },

  async createComment(orgSlug: string, projectSlug: string, taskId: string, data: CreateCommentFormData): Promise<ApiResponse<Comment>> {
    const res = await api.post<ApiResponse<Comment>>(`/organizations/${orgSlug}/projects/${projectSlug}/tasks/${taskId}/comments`, data);
    return res.data;
  },

  async updateComment(orgSlug: string, projectSlug: string, taskId: string, commentId: string, data: UpdateCommentFormData): Promise<ApiResponse<Comment>> {
    const res = await api.put<ApiResponse<Comment>>(`/organizations/${orgSlug}/projects/${projectSlug}/tasks/${taskId}/comments/${commentId}`, data);
    return res.data;
  },

  async deleteComment(orgSlug: string, projectSlug: string, taskId: string, commentId: string): Promise<ApiResponse> {
    const res = await api.delete<ApiResponse>(`/organizations/${orgSlug}/projects/${projectSlug}/tasks/${taskId}/comments/${commentId}`);
    return res.data;
  },
};
