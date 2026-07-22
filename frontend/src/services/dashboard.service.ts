import { api } from "@/lib/api/axios";
import { ApiResponse, DashboardStats } from "@/types";

export interface AuditLogItem {
  id: string;
  content: string;
  createdAt: string;
  taskId: string;
  taskTitle: string;
  projectSlug: string;
  userId: string;
  userName: string;
  userEmail: string;
}

export const dashboardService = {
  async getDashboard(orgSlug: string): Promise<ApiResponse<DashboardStats>> {
    const res = await api.get<ApiResponse<DashboardStats>>(`/organizations/${orgSlug}/dashboard`);
    return res.data;
  },

  async getAuditLogs(orgSlug: string): Promise<ApiResponse<AuditLogItem[]>> {
    const res = await api.get<ApiResponse<AuditLogItem[]>>(`/organizations/${orgSlug}/dashboard/audit-logs`);
    return res.data;
  },
};
