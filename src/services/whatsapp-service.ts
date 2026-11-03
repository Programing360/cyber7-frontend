/**
 * WhatsApp Integration Service
 *
 * Encapsulates all backend HTTP calls for WhatsApp account management.
 * Security Note: Access tokens are transmitted over TLS directly in the POST body
 * to the backend and are NEVER logged, cached in localStorage, or exposed.
 */

import apiClient from "../lib/api-client";
import type {
  ApiResponse,
  ConnectWhatsAppInput,
  UpdateWhatsAppStatusInput,
  WhatsAppAccountItem,
  WhatsAppAccountStatus,
  WhatsAppConfigStatus,
} from "../types/api";

export const whatsappService = {
  /**
   * Fetch connected WhatsApp accounts for a workspace
   */
  async getAccounts(workspaceId: string): Promise<WhatsAppAccountItem[]> {
    const response = await apiClient.get<ApiResponse<WhatsAppAccountItem[]>>(
      `/whatsapp/${workspaceId}/accounts`,
    );

    return response.data ?? [];
  },

  /**
   * Fetch a single WhatsApp account by its ID
   */
  async getAccountById(
    workspaceId: string,
    accountId: string,
  ): Promise<WhatsAppAccountItem> {
    const response = await apiClient.get<ApiResponse<WhatsAppAccountItem>>(
      `/whatsapp/${workspaceId}/accounts/${accountId}`,
    );

    if (!response.data) {
      throw new Error("WhatsApp account not found");
    }

    return response.data;
  },

  /**
   * Connect a new WhatsApp Business account
   *
   * Validates credentials against Meta Graph API in the backend,
   * encrypts the access token, and registers the account for this workspace.
   */
  async connectAccount(
    workspaceId: string,
    input: ConnectWhatsAppInput,
  ): Promise<WhatsAppAccountItem> {
    const response = await apiClient.post<
      ApiResponse<WhatsAppAccountItem>,
      ConnectWhatsAppInput
    >(`/whatsapp/${workspaceId}/accounts`, input);

    if (!response.data) {
      throw new Error("Failed to connect WhatsApp account");
    }

    return response.data;
  },

  /**
   * Update the status of a connected WhatsApp account
   */
  async updateAccountStatus(
    workspaceId: string,
    accountId: string,
    status: WhatsAppAccountStatus,
  ): Promise<WhatsAppAccountItem> {
    const response = await apiClient.patch<
      ApiResponse<WhatsAppAccountItem>,
      UpdateWhatsAppStatusInput
    >(`/whatsapp/${workspaceId}/accounts/${accountId}/status`, { status });

    if (!response.data) {
      throw new Error("Failed to update WhatsApp account status");
    }

    return response.data;
  },

  /**
   * Disconnect and remove a WhatsApp account from the workspace
   */
  async disconnectAccount(
    workspaceId: string,
    accountId: string,
  ): Promise<{ id: string }> {
    const response = await apiClient.delete<ApiResponse<{ id: string }>>(
      `/whatsapp/${workspaceId}/accounts/${accountId}`,
    );

    return response.data ?? { id: accountId };
  },

  /**
   * Fetch WhatsApp integration and platform configuration status
   */
  async getConfigStatus(workspaceId: string): Promise<WhatsAppConfigStatus> {
    const response = await apiClient.get<ApiResponse<WhatsAppConfigStatus>>(
      `/whatsapp/${workspaceId}/config-status`,
    );

    if (!response.data) {
      throw new Error("Failed to fetch WhatsApp configuration status");
    }
    // console.log(response);
    return response.data;
  },
};
