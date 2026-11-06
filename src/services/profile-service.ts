import apiClient, { ApiClientError } from "../lib/api-client";
import type { ApiResponse } from "../types/api";

export interface UserNotificationsConfig {
  whatsappInbound: boolean;
  campaignDeliveries: boolean;
  templateApprovals: boolean;
  weeklyDigest: boolean;
  securityAlerts: boolean;
  soundEffects: boolean;
}

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  platformRole?: string;
  isEmailVerified?: boolean;
  displayName?: string;
  phoneNumber?: string;
  jobTitle?: string;
  bio?: string;
  timezone?: string;
  avatarUrl?: string;
  bannerTheme?: string;
  customStatus?: string;
  customStatusEmoji?: string;
  isAvailable?: boolean;
  notifications?: UserNotificationsConfig;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileInput {
  name?: string;
  displayName?: string;
  phoneNumber?: string;
  jobTitle?: string;
  bio?: string;
  timezone?: string;
  avatarUrl?: string;
  bannerTheme?: string;
  customStatus?: string;
  customStatusEmoji?: string;
  isAvailable?: boolean;
  notifications?: Partial<UserNotificationsConfig>;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export const profileService = {
  /**
   * Fetches the current authenticated user's profile from the backend.
   * Tries /api/settings/profile first, then falls back to /api/auth/me.
   */
  async getProfile(): Promise<UserProfileData | null> {
    try {
      const res = await apiClient.get<ApiResponse<{ profile?: UserProfileData; user?: UserProfileData }>>(
        "/settings/profile"
      );
      if (res?.data?.profile) return res.data.profile;
      if (res?.data?.user) return res.data.user;
    } catch {
      // Fallback to /auth/me
      try {
        const res2 = await apiClient.get<ApiResponse<{ user?: UserProfileData }>>(
          "/auth/me"
        );
        if (res2?.data?.user) return res2.data.user;
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Updates the user's profile dynamically via backend API.
   * Sends PATCH to /api/settings/profile with fallback to /api/auth/profile.
   */
  async updateProfile(payload: UpdateProfileInput): Promise<UserProfileData> {
    try {
      const res = await apiClient.patch<ApiResponse<{ profile?: UserProfileData; user?: UserProfileData }>>(
        "/settings/profile",
        payload
      );
      if (res?.data?.profile) return res.data.profile;
      if (res?.data?.user) return res.data.user;
    } catch (err: unknown) {
      // Fallback to /auth/profile
      const res2 = await apiClient.patch<ApiResponse<{ user?: UserProfileData; profile?: UserProfileData }>>(
        "/auth/profile",
        payload
      );
      if (res2?.data?.user) return res2.data.user;
      if (res2?.data?.profile) return res2.data.profile;
      throw err;
    }
    throw new Error("Failed to update profile");
  },

  /**
   * Updates the user's password securely via backend API.
   */
  async changePassword(payload: ChangePasswordInput): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await apiClient.post<ApiResponse<{ message?: string }>>(
        "/settings/change-password",
        payload
      );
      return { success: true, message: res?.message || "Password updated successfully" };
    } catch {
      // Fallback to /auth/change-password
      const res2 = await apiClient.post<ApiResponse<{ message?: string }>>(
        "/auth/change-password",
        payload
      );
      return { success: true, message: res2?.message || "Password updated successfully" };
    }
  },
};

export default profileService;

