/**
 * Dashboard Service
 *
 * Encapsulates backend HTTP calls for workspace-scoped dashboard statistics.
 * Requires a valid JWT token and an active workspace membership.
 */

import apiClient from "../lib/api-client";
import type {
  ApiResponse,
  DashboardStatsData,
  WorkspaceAnalyticsData,
  AnalyticsPeriod,
} from "../types/api";

export interface GetDashboardStatsParams {
  workspaceId: string;
  days?: number;
}

export interface GetWorkspaceAnalyticsParams {
  workspaceId: string;
  period?: AnalyticsPeriod;
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

  /**
   * Retrieves live, workspace-scoped analytics (message performance, status distribution, campaign metrics).
   * Endpoint: GET /dashboard/:workspaceId/analytics
   */
  async getWorkspaceAnalytics({
    workspaceId,
    period = "30d",
  }: GetWorkspaceAnalyticsParams): Promise<WorkspaceAnalyticsData> {
    if (!workspaceId) {
      throw new Error("Workspace ID is required to fetch workspace analytics");
    }

    const response = await apiClient.get<ApiResponse<WorkspaceAnalyticsData>>(
      `/dashboard/${workspaceId}/analytics`,
      {
        params: { period },
      },
    );

    if (!response.data) {
      throw new Error(
        response.message || "Failed to load workspace analytics",
      );
    }

    return response.data;
  },
};

export default dashboardService;
