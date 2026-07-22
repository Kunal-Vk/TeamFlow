import { api } from "@/lib/api/axios";
import { ApiResponse, SearchResults } from "@/types";

export const searchService = {
  async search(orgSlug: string, query: string): Promise<ApiResponse<SearchResults>> {
    const res = await api.get<ApiResponse<SearchResults>>(`/organizations/${orgSlug}/search`, {
      params: { q: query },
    });
    return res.data;
  },
};
