/**
 * Message Service
 *
 * Sends outbound WhatsApp text messages via the backend.
 * The backend holds the encrypted access token — the frontend never
 * sees, stores, or logs any WhatsApp credentials.
 *
 * Endpoint: POST /whatsapp/:workspaceId/messages
 */

import apiClient, { ApiClientError } from "../lib/api-client";
import type {
  ApiResponse,
  WhatsAppSentMessageData,
  SendWhatsAppTemplateMessageInput,
} from "../types/api";

export interface SendTextMessageInput {
  workspaceId: string;
  conversationId: string;
  text: string;
}

export interface SendTextMessageResult {
  message: WhatsAppSentMessageData;
}

/**
 * Friendly error messages mapped from common backend/Meta failure scenarios.
 * Raw Meta API errors or access tokens are never surfaced.
 */
function mapSendError(err: unknown): string {
  if (!(err instanceof ApiClientError)) {
    return "Failed to send message. Please check your connection and try again.";
  }

  const msg = err.message.toLowerCase();

  // Backend-enforced business rule rejections
  if (err.status === 422) {
    if (msg.includes("opted out") || msg.includes("opt-out")) {
      return "Cannot send message: Contact has opted out of WhatsApp communications.";
    }
    if (msg.includes("24") || msg.includes("window") || msg.includes("customer service")) {
      return "The 24-hour customer service window has expired. You must use an approved WhatsApp template to re-engage this contact.";
    }
    return err.message;
  }
  if (err.status === 400 && msg.includes("closed")) {
    return "This conversation is closed. Reopen it before sending a message.";
  }
  if (err.status === 400) {
    return err.message; // validation errors are safe to show
  }

  // Resource not found
  if (err.status === 404 && msg.includes("account")) {
    return "No connected WhatsApp account found. Check your integration settings.";
  }
  if (err.status === 404 && msg.includes("conversation")) {
    return "Conversation not found. It may have been deleted.";
  }
  if (err.status === 404) {
    return err.message;
  }

  // Unauthorized
  if (err.status === 401) {
    return "Your session has expired. Please log in again.";
  }
  if (err.status === 403) {
    return "You are not authorized to send messages in this workspace.";
  }

  // Meta API / Gateway errors (502 = upstream Meta API failure)
  if (err.status === 502) {
    // 24-hour customer service window
    if (
      msg.includes("24") ||
      msg.includes("window") ||
      msg.includes("session") ||
      msg.includes("re-engagement")
    ) {
      return "The 24-hour customer service window has expired. You must use an approved WhatsApp template to re-engage this contact.";
    }
    // Generic Meta API rejection — do NOT expose raw Meta error details
    return "WhatsApp could not deliver the message. Please try again in a moment.";
  }

  // Network failure
  if (err.isNetworkError) {
    return "Network error. Please check your internet connection and try again.";
  }

  return "Failed to send message. Please try again.";
}

export const messageService = {
  /**
   * Send a WhatsApp text message through the backend.
   *
   * Returns the persisted message document from the backend on success.
   * Throws a user-friendly error string (via mapSendError) on failure.
   */
  async sendTextMessage({
    workspaceId,
    conversationId,
    text,
  }: SendTextMessageInput): Promise<WhatsAppSentMessageData> {
    try {
      const response = await apiClient.post<
        ApiResponse<WhatsAppSentMessageData>
      >(`/whatsapp/${workspaceId}/messages`, { conversationId, text });

      if (!response.data) {
        throw new ApiClientError({
          message: "No message data returned from server.",
          status: 500,
        });
      }

      return response.data;
    } catch (err) {
      // Re-wrap with a clean, user-friendly message
      const friendlyMessage = mapSendError(err);
      throw new Error(friendlyMessage);
    }
  },

  /**
   * Send an approved WhatsApp template message through the backend.
   *
   * Endpoint: POST /whatsapp/:workspaceId/messages/template
   */
  async sendTemplateMessage({
    workspaceId,
    conversationId,
    templateId,
    language,
    components,
  }: {
    workspaceId: string;
    conversationId: string;
    templateId: string;
    language?: string;
    components?: SendWhatsAppTemplateMessageInput["components"] | unknown;
  }): Promise<WhatsAppSentMessageData> {
    try {
      const response = await apiClient.post<
        ApiResponse<WhatsAppSentMessageData>
      >(`/whatsapp/${workspaceId}/messages/template`, {
        conversationId,
        templateId,
        language,
        components,
      });

      if (!response.data) {
        throw new ApiClientError({
          message: "No message data returned from server.",
          status: 500,
        });
      }

      return response.data;
    } catch (err) {
      const friendlyMessage = mapSendError(err);
      throw new Error(friendlyMessage);
    }
  },
};
