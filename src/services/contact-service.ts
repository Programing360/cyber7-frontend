/**
 * Contact Service
 *
 * Encapsulates all backend HTTP calls for WhatsApp contact management.
 * All operations are scoped to a workspace and require a valid JWT token.
 */

import apiClient from "../lib/api-client";
import type {
  ApiResponse,
  CreateWhatsAppContactInput,
  ListContactsResponseData,
  UpdateWhatsAppContactInput,
  WhatsAppContactItem,
} from "../types/api";

export interface ListContactsParams {
  workspaceId: string;
  page?: number;
  limit?: number;
  search?: string;
}

export const contactService = {
  /**
   * List all contacts in a workspace with optional search and pagination.
   * GET /whatsapp/:workspaceId/contacts
   */
  async listContacts({
    workspaceId,
    page = 1,
    limit = 50,
    search,
  }: ListContactsParams): Promise<ListContactsResponseData> {
    const params: Record<string, string | number | boolean | undefined | null> =
      { page, limit };

    if (search && search.trim()) {
      params.search = search.trim();
    }

    const response = await apiClient.get<ApiResponse<ListContactsResponseData>>(
      `/whatsapp/${workspaceId}/contacts`,
      { params },
    );

    return (
      response.data ?? {
        contacts: [],
        pagination: { page, limit, total: 0, totalPages: 1 },
      }
    );
  },

  /**
   * Get a single contact by its ID.
   * GET /whatsapp/:workspaceId/contacts/:contactId
   */
  async getContactById(
    workspaceId: string,
    contactId: string,
  ): Promise<WhatsAppContactItem> {
    const response = await apiClient.get<ApiResponse<WhatsAppContactItem>>(
      `/whatsapp/${workspaceId}/contacts/${contactId}`,
    );

    if (!response.data) {
      throw new Error("Contact not found");
    }

    return response.data;
  },

  /**
   * Create or upsert a contact by phone number.
   * POST /whatsapp/:workspaceId/contacts
   */
  async createContact(
    workspaceId: string,
    input: CreateWhatsAppContactInput,
  ): Promise<WhatsAppContactItem> {
    const response = await apiClient.post<
      ApiResponse<WhatsAppContactItem>,
      CreateWhatsAppContactInput
    >(`/whatsapp/${workspaceId}/contacts`, input);

    if (!response.data) {
      throw new Error("Failed to save contact");
    }

    return response.data;
  },

  /**
   * Update an existing contact.
   * PATCH /whatsapp/:workspaceId/contacts/:contactId
   */
  async updateContact(
    workspaceId: string,
    contactId: string,
    input: UpdateWhatsAppContactInput,
  ): Promise<WhatsAppContactItem> {
    const response = await apiClient.patch<
      ApiResponse<WhatsAppContactItem>,
      UpdateWhatsAppContactInput
    >(`/whatsapp/${workspaceId}/contacts/${contactId}`, input);

    if (!response.data) {
      throw new Error("Failed to update contact");
    }

    return response.data;
  },

  /**
   * Delete a contact by its ID.
   * DELETE /whatsapp/:workspaceId/contacts/:contactId
   */
  async deleteContact(
    workspaceId: string,
    contactId: string,
  ): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(
      `/whatsapp/${workspaceId}/contacts/${contactId}`,
    );
  },
};
