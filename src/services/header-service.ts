/**
 * Workspace Header Service
 *
 * Provides live runtime search across contacts, campaigns, automations,
 * support tickets, calls, and navigation, as well as live workspace notifications.
 */

import apiClient from "../lib/api-client";
import type { ApiResponse } from "../types/api";

export interface HeaderSearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  type: "contact" | "campaign" | "automation" | "ticket" | "call" | "navigation";
  url: string;
}

export interface HeaderSearchResponseData {
  contacts: HeaderSearchResultItem[];
  campaigns: HeaderSearchResultItem[];
  automations: HeaderSearchResultItem[];
  tickets: HeaderSearchResultItem[];
  calls: HeaderSearchResultItem[];
  navigation: HeaderSearchResultItem[];
  totalCount: number;
}

export interface HeaderNotificationItem {
  id: string;
  category: "message" | "call" | "campaign" | "support" | "system";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  url: string;
}

export interface HeaderNotificationsResponseData {
  notifications: HeaderNotificationItem[];
  unreadCount: number;
}

export const headerService = {
  /**
   * Search across workspace entities in real-time.
   * GET /api/workspaces/:workspaceId/search?q={query}
   */
  async searchWorkspace(
    workspaceId: string,
    query: string,
  ): Promise<HeaderSearchResponseData> {
    if (!query || !query.trim()) {
      return {
        contacts: [],
        campaigns: [],
        automations: [],
        tickets: [],
        calls: [],
        navigation: [],
        totalCount: 0,
      };
    }

    const response = await apiClient.get<ApiResponse<HeaderSearchResponseData>>(
      `/workspaces/${workspaceId}/search`,
      { params: { q: query.trim() } },
    );

    return (
      response.data ?? {
        contacts: [],
        campaigns: [],
        automations: [],
        tickets: [],
        calls: [],
        navigation: [],
        totalCount: 0,
      }
    );
  },

  /**
   * Retrieve workspace activity stream and notifications in real-time.
   * GET /api/workspaces/:workspaceId/notifications
   */
  async getNotifications(
    workspaceId: string,
  ): Promise<HeaderNotificationsResponseData> {
    const response = await apiClient.get<
      ApiResponse<HeaderNotificationsResponseData>
    >(`/workspaces/${workspaceId}/notifications`);

    return (
      response.data ?? {
        notifications: [],
        unreadCount: 0,
      }
    );
  },
};

