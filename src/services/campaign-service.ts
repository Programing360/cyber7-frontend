/**
 * WhatsApp Campaign Service
 *
 * Encapsulates all backend HTTP calls for Campaign management.
 * All operations are strictly workspace-scoped and authenticated.
 */

import apiClient from "../lib/api-client";
import type {
  ApiResponse,
  CampaignItem,
  CampaignRecipientItem,
  CreateCampaignPayload,
  ListCampaignRecipientsResponseData,
  ListCampaignsParams,
  ListCampaignsResponseData,
  ScheduleCampaignPayload,
  UpdateCampaignPayload,
} from "../types/api";

export const campaignService = {
  /**
   * List campaigns for a workspace with optional filters and pagination.
   * GET /campaigns/:workspaceId
   */
  async getCampaigns(
    workspaceId: string,
    params?: ListCampaignsParams,
  ): Promise<ListCampaignsResponseData> {
    const query = new URLSearchParams();

    if (params?.search && params.search.trim()) {
      query.set("search", params.search.trim());
    }

    if (params?.status && params.status !== "All") {
      query.set("status", params.status);
    }

    if (params?.page && params.page > 0) {
      query.set("page", params.page.toString());
    }

    if (params?.limit && params.limit > 0) {
      query.set("limit", params.limit.toString());
    }

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await apiClient.get<ApiResponse<ListCampaignsResponseData>>(
      `/campaigns/${workspaceId}${queryString}`,
    );

    if (!response.data) {
      throw new Error(response.message || "Failed to load campaigns");
    }

    return response.data;
  },

  /**
   * Retrieve a single campaign by ID.
   * GET /campaigns/:workspaceId/:campaignId
   */
  async getCampaignById(
    workspaceId: string,
    campaignId: string,
  ): Promise<CampaignItem> {
    const response = await apiClient.get<ApiResponse<CampaignItem>>(
      `/campaigns/${workspaceId}/${campaignId}`,
    );

    if (!response.data) {
      throw new Error(response.message || "Campaign not found");
    }

    return response.data;
  },

  /**
   * Create a new campaign (saved as DRAFT).
   * POST /campaigns/:workspaceId
   */
  async createCampaign(
    workspaceId: string,
    payload: CreateCampaignPayload,
  ): Promise<{ campaign: CampaignItem }> {
    const response = await apiClient.post<ApiResponse<{ campaign: CampaignItem }>>(
      `/campaigns/${workspaceId}`,
      payload,
    );

    if (!response.data) {
      throw new Error(response.message || "Failed to create campaign");
    }

    return response.data;
  },

  /**
   * Update a draft campaign.
   * PATCH /campaigns/:workspaceId/:campaignId
   */
  async updateCampaign(
    workspaceId: string,
    campaignId: string,
    payload: UpdateCampaignPayload,
  ): Promise<{ campaign: CampaignItem }> {
    const response = await apiClient.patch<ApiResponse<{ campaign: CampaignItem }>>(
      `/campaigns/${workspaceId}/${campaignId}`,
      payload,
    );

    if (!response.data) {
      throw new Error(response.message || "Failed to update campaign");
    }

    return response.data;
  },

  /**
   * Delete a draft campaign.
   * DELETE /campaigns/:workspaceId/:campaignId
   */
  async deleteCampaign(
    workspaceId: string,
    campaignId: string,
  ): Promise<{ campaignId: string }> {
    const response = await apiClient.delete<ApiResponse<{ campaignId: string }>>(
      `/campaigns/${workspaceId}/${campaignId}`,
    );

    return response.data ?? { campaignId };
  },

  /**
   * Schedule a campaign for automated execution.
   * POST /campaigns/:workspaceId/:campaignId/schedule
   */
  async scheduleCampaign(
    workspaceId: string,
    campaignId: string,
    payload: ScheduleCampaignPayload,
  ): Promise<{ campaign: CampaignItem }> {
    const response = await apiClient.post<ApiResponse<{ campaign: CampaignItem }>>(
      `/campaigns/${workspaceId}/${campaignId}/schedule`,
      payload,
    );

    if (!response.data) {
      throw new Error(response.message || "Failed to schedule campaign");
    }

    return response.data;
  },

  /**
   * Pause a scheduled or processing campaign.
   * POST /campaigns/:workspaceId/:campaignId/pause
   */
  async pauseCampaign(
    workspaceId: string,
    campaignId: string,
  ): Promise<{ campaign: CampaignItem }> {
    const response = await apiClient.post<ApiResponse<{ campaign: CampaignItem }>>(
      `/campaigns/${workspaceId}/${campaignId}/pause`,
      {},
    );

    if (!response.data) {
      throw new Error(response.message || "Failed to pause campaign");
    }

    return response.data;
  },

  /**
   * Resume a paused campaign.
   * POST /campaigns/:workspaceId/:campaignId/resume
   */
  async resumeCampaign(
    workspaceId: string,
    campaignId: string,
  ): Promise<{ campaign: CampaignItem }> {
    const response = await apiClient.post<ApiResponse<{ campaign: CampaignItem }>>(
      `/campaigns/${workspaceId}/${campaignId}/resume`,
      {},
    );

    if (!response.data) {
      throw new Error(response.message || "Failed to resume campaign");
    }

    return response.data;
  },

  /**
   * Cancel a campaign.
   * POST /campaigns/:workspaceId/:campaignId/cancel
   */
  async cancelCampaign(
    workspaceId: string,
    campaignId: string,
  ): Promise<{ campaign: CampaignItem }> {
    const response = await apiClient.post<ApiResponse<{ campaign: CampaignItem }>>(
      `/campaigns/${workspaceId}/${campaignId}/cancel`,
      {},
    );

    if (!response.data) {
      throw new Error(response.message || "Failed to cancel campaign");
    }

    return response.data;
  },

  /**
   * List campaign recipients with delivery statuses and errors.
   * GET /campaigns/:workspaceId/:campaignId/recipients
   */
  async getRecipients(
    workspaceId: string,
    campaignId: string,
    params?: { page?: number; limit?: number; status?: string },
  ): Promise<ListCampaignRecipientsResponseData> {
    const query = new URLSearchParams();

    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.status) query.set("status", params.status);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await apiClient.get<ApiResponse<ListCampaignRecipientsResponseData>>(
      `/campaigns/${workspaceId}/${campaignId}/recipients${queryString}`,
    );

    return (
      response.data ?? {
        recipients: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 1 },
      }
    );
  },
};

