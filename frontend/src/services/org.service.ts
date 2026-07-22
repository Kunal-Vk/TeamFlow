import { api } from "@/lib/api/axios";
import { CreateOrgFormData, UpdateOrgFormData } from "@/schemas";
import { ApiResponse, Organization } from "@/types";

export const orgService = {
  async getOrganizations(): Promise<ApiResponse<Organization[]>> {
    const res = await api.get<ApiResponse<Organization[]>>("/organizations");
    return res.data;
  },

  async getOrganizationBySlug(slug: string): Promise<ApiResponse<Organization>> {
    const res = await api.get<ApiResponse<Organization>>(`/organizations/${slug}`);
    return res.data;
  },

  async createOrganization(data: CreateOrgFormData): Promise<ApiResponse<Organization>> {
    const res = await api.post<ApiResponse<Organization>>("/organizations", data);
    return res.data;
  },

  async updateOrganization(slug: string, data: UpdateOrgFormData): Promise<ApiResponse<Organization>> {
    const res = await api.put<ApiResponse<Organization>>(`/organizations/${slug}`, data);
    return res.data;
  },

  async deleteOrganization(slug: string): Promise<ApiResponse> {
    const res = await api.delete<ApiResponse>(`/organizations/${slug}`);
    return res.data;
  },
};
