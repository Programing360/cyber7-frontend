/**
 * Conversation Service
 *
 * Encapsulates all backend HTTP calls for WhatsApp conversation and message management.
 * All operations are scoped to a workspace and require a valid JWT token.
 */

import apiClient from "../lib/api-client";
import type {
  ApiResponse,
  ConversationStatus,
  ListConversationsResponseData,
  ListMessagesResponseData,
  UpdateConversationStatusInput,
  WhatsAppConversationItem,
} from "../types/api";

export interface ListConversationsParams {
  workspaceId: string;
  page?: number;
  limit?: number;
  status?: ConversationStatus;
  search?: string;
}

export interface ListMessagesParams {
  workspaceId: string;
  conversationId: string;
  page?: number;
  limit?: number;
}

export interface CreateConversationParams {
  workspaceId: string;
  contactId?: string;
  phoneNumber?: string;
  profileName?: string;
}

export const conversationService = {
  /**
   * Create or retrieve an existing conversation with a contact or phone number.
   * POST /whatsapp/:workspaceId/conversations
   */
  async createConversation({
    workspaceId,
    contactId,
    phoneNumber,
    profileName,
  }: CreateConversationParams): Promise<WhatsAppConversationItem> {
    const response = await apiClient.post<
      ApiResponse<WhatsAppConversationItem>
    >(`/whatsapp/${workspaceId}/conversations`, {
      contactId,
      phoneNumber,
      profileName,
    });

    if (!response.data) {
      throw new Error("Failed to create conversation");
    }

    return response.data;
  },

  /**
   * List conversations in a workspace with optional status filter and search.
   * GET /whatsapp/:workspaceId/conversations
   */
  async listConversations({
    workspaceId,
    page = 1,
    limit = 30,
    status,
    search,
  }: ListConversationsParams): Promise<ListConversationsResponseData> {
    const params: Record<string, string | number | boolean | undefined | null> =
      { page, limit };

    if (status) {
      params.status = status;
    }

    if (search && search.trim()) {
      params.search = search.trim();
    }

    const response = await apiClient.get<
      ApiResponse<ListConversationsResponseData>
    >(`/whatsapp/${workspaceId}/conversations`, { params });

    return (
      response.data ?? {
        conversations: [],
        pagination: { page, limit, total: 0, totalPages: 1 },
      }
    );
  },

  /**
   * Get a single conversation by ID.
   * GET /whatsapp/:workspaceId/conversations/:conversationId
   */
  async getConversationById(
    workspaceId: string,
    conversationId: string,
  ): Promise<WhatsAppConversationItem> {
    const response = await apiClient.get<ApiResponse<WhatsAppConversationItem>>(
      `/whatsapp/${workspaceId}/conversations/${conversationId}`,
    );

    if (!response.data) {
      throw new Error("Conversation not found");
    }

    return response.data;
  },

  /**
   * Update conversation status (OPEN, CLOSED, PENDING).
   * PATCH /whatsapp/:workspaceId/conversations/:conversationId/status
   */
  async updateConversationStatus(
    workspaceId: string,
    conversationId: string,
    status: ConversationStatus,
  ): Promise<WhatsAppConversationItem> {
    const response = await apiClient.patch<
      ApiResponse<WhatsAppConversationItem>,
      UpdateConversationStatusInput
    >(`/whatsapp/${workspaceId}/conversations/${conversationId}/status`, {
      status,
    });

    if (!response.data) {
      throw new Error("Failed to update conversation status");
    }

    return response.data;
  },

  /**
   * List messages for a conversation (chronological order).
   * GET /whatsapp/:workspaceId/conversations/:conversationId/messages
   */
  async listMessages({
    workspaceId,
    conversationId,
    page = 1,
    limit = 50,
  }: ListMessagesParams): Promise<ListMessagesResponseData> {
    const response = await apiClient.get<ApiResponse<ListMessagesResponseData>>(
      `/whatsapp/${workspaceId}/conversations/${conversationId}/messages`,
      { params: { page, limit } },
    );

    return (
      response.data ?? {
        messages: [],
        pagination: { page, limit, total: 0, totalPages: 1 },
      }
    );
  },
};
