/**
 * Dashboard Service
 *
 * Encapsulates backend HTTP calls for workspace-scoped dashboard statistics.
 * Requires a valid JWT token and an active workspace membership.
 */

import apiClient from "../lib/api-client";
import type { ApiResponse, DashboardStatsData } from "../types/api";

export interface GetDashboardStatsParams {
  workspaceId: string;
  days?: number;
}

export const dashboardService = {
  /**
   * Retrieves live, workspace-scoped dashboard statistics.
   * Endpoint: GET /dashboard/:workspaceId/stats
   * Note: apiClient automatically prepends /api.
   */
  async getDashboardStats({
    workspaceId,
    days = 7,
  }: GetDashboardStatsParams): Promise<DashboardStatsData> {
    if (!workspaceId) {
      throw new Error("Workspace ID is required to fetch dashboard statistics");
    }

    const response = await apiClient.get<ApiResponse<DashboardStatsData>>(
      `/dashboard/${workspaceId}/stats`,
      {
        params: { days },
      },
    );

    if (!response.data) {
      throw new Error(
        response.message || "Failed to load dashboard statistics",
      );
    }

    return response.data;
  },
};

export default dashboardService;
