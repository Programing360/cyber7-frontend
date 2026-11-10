/**
 * Analytics Service
 *
 * Encapsulates backend HTTP calls for workspace-scoped real-time messaging
 * and campaign performance analytics.
 */

import apiClient from "../lib/api-client";
import type {
  ApiResponse,
  WorkspaceAnalyticsData,
  AnalyticsPeriod,
} from "../types/api";

export interface GetWorkspaceAnalyticsParams {
  workspaceId: string;
  period?: AnalyticsPeriod;
}

export const analyticsService = {
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

export default analyticsService;

