/**
 * WhatsApp Template Service
 *
 * Provides typed methods for interacting with WhatsApp Business message templates.
 * All operations are scoped by workspaceId and strictly authenticated.
 * Access tokens are never handled or stored on the client side.
 */

import apiClient from "../lib/api-client";
import type {
  ApiResponse,
  ListTemplatesParams,
  ListTemplatesResponseData,
  SyncTemplatesResponseData,
  WhatsAppTemplateItem,
} from "../types/api";

export const templateService = {
  /**
   * List templates for the active workspace with optional search, category, status, and pagination.
   */
  async getTemplates(
    workspaceId: string,
    params?: ListTemplatesParams,
  ): Promise<ListTemplatesResponseData> {
    const query = new URLSearchParams();

    if (params?.search && params.search.trim()) {
      query.set("search", params.search.trim());
    }

    if (params?.category && params.category !== "All") {
      query.set("category", params.category);
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
    const response = await apiClient.get<ApiResponse<ListTemplatesResponseData>>(
      `/whatsapp/${workspaceId}/templates${queryString}`,
    );

    if (!response.data) {
      throw new Error(response.message || "Failed to load templates");
    }

    return response.data;
  },

  /**
   * Sync message templates from the connected WhatsApp Business Account(s) via Meta Graph API.
   * Requires OWNER or ADMIN role in the workspace.
   */
  async syncTemplates(workspaceId: string): Promise<SyncTemplatesResponseData> {
    const response = await apiClient.post<ApiResponse<SyncTemplatesResponseData>>(
      `/whatsapp/${workspaceId}/templates/sync`,
    );

    if (!response.data) {
      throw new Error(response.message || "Failed to sync templates from Meta");
    }

    return response.data;
  },

  /**
   * Retrieve a single WhatsApp template by its database ID or Meta template ID.
   */
  async getTemplateById(
    workspaceId: string,
    templateId: string,
  ): Promise<WhatsAppTemplateItem> {
    const response = await apiClient.get<
      ApiResponse<{ template: WhatsAppTemplateItem }>
    >(`/whatsapp/${workspaceId}/templates/${templateId}`);

    if (!response.data?.template) {
      throw new Error("Template not found");
    }

    return response.data.template;
  },
};

export default templateService;

