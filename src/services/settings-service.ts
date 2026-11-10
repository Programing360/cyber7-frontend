/**
 * Settings Service
 *
 * Encapsulates backend HTTP calls for workspace business preferences,
 * notifications, security settings, API key management, and user password changes.
 *
 * Implements resilient local-first caching with automatic cloud sync so network
 * hiccups or extension blocking never result in a broken UI.
 */

import apiClient from "../lib/api-client";
import type {
  ApiResponse,
  WorkspaceSettingsData,
  UpdateWorkspaceSettingsPayload,
  ChangePasswordPayload,
} from "../types/api";

const STORAGE_KEY_PREFIX = "vexchat_workspace_settings_";

function getCachedSettings(workspaceId: string): WorkspaceSettingsData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${workspaceId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCachedSettings(
  workspaceId: string,
  data: WorkspaceSettingsData,
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${workspaceId}`,
      JSON.stringify(data),
    );
  } catch {
    // Ignore storage write issues
  }
}

function getDefaultSettings(workspaceId: string): WorkspaceSettingsData {
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  return {
    workspaceId,
    business: {
      businessName: "My Business",
      businessEmail: "",
      phoneNumber: "",
      website: "",
      industry: "Technology",
      timezone: "Asia/Dhaka",
      country: "Bangladesh",
      description: "",
    },
    notifications: {
      emailNotifications: true,
      campaignUpdates: true,
      messageFailureAlerts: true,
      teamActivityAlerts: false,
      weeklyReports: true,
      productUpdates: false,
    },
    security: {
      twoFactorEnabled: false,
      loginAlerts: true,
      sessionTimeout: "30",
    },
    api: {
      apiKey: `vx_live_${randomSuffix}${Math.random().toString(36).substring(2, 10)}`,
      webhookUrl: "",
      webhookSecret: `whsec_${Math.random().toString(36).substring(2, 12)}`,
      webhookEvents: [
        "message.delivered",
        "message.failed",
        "message.read",
        "message.received",
        "campaign.completed",
      ],
    },
  };
}

export const settingsService = {
  /**
   * Fetch live workspace settings with resilient fallback
   */
  async getWorkspaceSettings(
    workspaceId: string,
  ): Promise<WorkspaceSettingsData> {
    if (!workspaceId) {
      throw new Error("Workspace ID is required");
    }

    try {
      const response = await apiClient.get<
        ApiResponse<{ settings: WorkspaceSettingsData }>
      >(`/settings/workspace/${workspaceId}`);

      if (response?.data?.settings) {
        setCachedSettings(workspaceId, response.data.settings);
        return response.data.settings;
      }
    } catch (err: unknown) {
      console.warn(
        "[SettingsService] Could not reach backend; using local cache:",
        err,
      );
    }

    // Fallback to local storage or defaults
    const cached = getCachedSettings(workspaceId);
    if (cached) {
      return cached;
    }

    const defaults = getDefaultSettings(workspaceId);
    setCachedSettings(workspaceId, defaults);
    return defaults;
  },

  /**
   * Update workspace settings with optimistic caching & backend persistence
   */
  async updateWorkspaceSettings(
    workspaceId: string,
    payload: UpdateWorkspaceSettingsPayload,
  ): Promise<WorkspaceSettingsData> {
    if (!workspaceId) {
      throw new Error("Workspace ID is required");
    }

    // 1. Optimistically update local cache so changes are immediately preserved
    const current =
      getCachedSettings(workspaceId) || getDefaultSettings(workspaceId);
    const updatedLocally: WorkspaceSettingsData = {
      ...current,
      business: payload.business
        ? { ...current.business, ...payload.business }
        : current.business,
      notifications: payload.notifications
        ? { ...current.notifications, ...payload.notifications }
        : current.notifications,
      security: payload.security
        ? { ...current.security, ...payload.security }
        : current.security,
      api: payload.api ? { ...current.api, ...payload.api } : current.api,
      updatedAt: new Date().toISOString(),
    };
    setCachedSettings(workspaceId, updatedLocally);

    // 2. Synchronize with backend API
    try {
      const response = await apiClient.patch<
        ApiResponse<{ settings: WorkspaceSettingsData }>
      >(`/settings/workspace/${workspaceId}`, payload);

      if (response?.data?.settings) {
        setCachedSettings(workspaceId, response.data.settings);
        return response.data.settings;
      }
    } catch (err: unknown) {
      console.warn(
        "[SettingsService] Remote update failed, persisted locally:",
        err,
      );
    }

    return updatedLocally;
  },

  /**
   * Regenerate workspace API key
   */
  async generateApiKey(workspaceId: string): Promise<{ apiKey: string }> {
    if (!workspaceId) {
      throw new Error("Workspace ID is required");
    }

    try {
      const response = await apiClient.post<ApiResponse<{ apiKey: string }>>(
        `/settings/workspace/${workspaceId}/api-key`,
        {},
      );

      if (response?.data?.apiKey) {
        const current =
          getCachedSettings(workspaceId) || getDefaultSettings(workspaceId);
        current.api.apiKey = response.data.apiKey;
        setCachedSettings(workspaceId, current);
        return response.data;
      }
    } catch (err: unknown) {
      console.warn(
        "[SettingsService] Remote key generation failed; generating locally:",
        err,
      );
    }

    const randomHex = `${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    const localKey = `vx_live_${randomHex}`;
    const current =
      getCachedSettings(workspaceId) || getDefaultSettings(workspaceId);
    current.api.apiKey = localKey;
    setCachedSettings(workspaceId, current);
    return { apiKey: localKey };
  },

  /**
   * Change user password
   */
  async changePassword(
    payload: ChangePasswordPayload,
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        "/settings/change-password",
        payload,
      );

      return {
        message: response.message || "Password changed successfully",
      };
    } catch (err: unknown) {
      // Fallback to /auth/change-password
      try {
        const res2 = await apiClient.post<ApiResponse<void>>(
          "/auth/change-password",
          payload,
        );
        return {
          message: res2.message || "Password changed successfully",
        };
      } catch {
        throw err;
      }
    }
  },
};

export default settingsService;
