/**
 * Support Ticket Service (Customer / Workspace Dashboard)
 *
 * Encapsulates backend HTTP calls for workspace customer support tickets,
 * conversations, replies, and status updates with local-first resilient caching.
 */

import apiClient from "../lib/api-client";
import type {
  ApiResponse,
  ListSupportTicketsResponseData,
  SupportTicketItem,
  CreateSupportTicketPayload,
  AddSupportTicketMessagePayload,
  SupportTicketStatus,
  SupportTicketPriority,
  SupportTicketStats,
  SupportTicketMessage,
} from "../types/api";

export interface ListSupportTicketsParams {
  workspaceId: string;
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

const STORAGE_PREFIX = "vexchat_workspace_tickets_";

function getLocalStorageTickets(workspaceId: string): {
  items: SupportTicketItem[];
  stats: SupportTicketStats;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${workspaceId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setLocalStorageTickets(
  workspaceId: string,
  items: SupportTicketItem[],
  stats?: SupportTicketStats,
): void {
  if (typeof window === "undefined") return;
  try {
    const computedStats: SupportTicketStats = stats || {
      total: items.length,
      open: items.filter((t) => t.status === "OPEN").length,
      inProgress: items.filter((t) => t.status === "IN_PROGRESS").length,
      resolved: items.filter(
        (t) => t.status === "RESOLVED" || t.status === "CLOSED",
      ).length,
    };
    localStorage.setItem(
      `${STORAGE_PREFIX}${workspaceId}`,
      JSON.stringify({ items, stats: computedStats }),
    );
  } catch (err) {
    console.warn("[SupportService] Failed to cache tickets locally:", err);
  }
}

export const supportService = {
  /**
   * List tickets for workspace with live sync and local cache fallback
   */
  async listTickets({
    workspaceId,
    status,
    priority,
    search,
    page = 1,
    pageSize = 50,
  }: ListSupportTicketsParams): Promise<ListSupportTicketsResponseData> {
    if (!workspaceId) {
      return {
        items: [],
        total: 0,
        page: 1,
        pageSize,
        totalPages: 1,
        stats: { total: 0, open: 0, inProgress: 0, resolved: 0 },
      };
    }

    try {
      const response = await apiClient.get<
        ApiResponse<ListSupportTicketsResponseData>
      >("/support/tickets", {
        params: {
          workspaceId,
          status:
            status && status !== "ALL" && status !== "All" ? status : undefined,
          priority:
            priority && priority !== "ALL" && priority !== "All"
              ? priority
              : undefined,
          search: search?.trim() || undefined,
          page,
          pageSize,
        },
        headers: {
          "x-workspace-id": workspaceId,
        },
      });

      if (response && response.data && Array.isArray(response.data.items)) {
        setLocalStorageTickets(
          workspaceId,
          response.data.items,
          response.data.stats,
        );
        return response.data;
      }
    } catch (networkError: unknown) {
      console.warn(
        "[SupportService] Network request failed, attempting local cache fallback:",
        networkError,
      );
    }

    // Fallback to local cache if network/adblocker interrupted
    const cached = getLocalStorageTickets(workspaceId);
    if (cached && cached.items) {
      let filtered = [...cached.items];
      if (status && status !== "ALL" && status !== "All") {
        filtered = filtered.filter((t) => t.status === status);
      }
      if (priority && priority !== "ALL" && priority !== "All") {
        filtered = filtered.filter((t) => t.priority === priority);
      }
      if (search?.trim()) {
        const q = search.trim().toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.subject?.toLowerCase().includes(q) ||
            t.ticketNumber?.toLowerCase().includes(q) ||
            t.category?.toLowerCase().includes(q),
        );
      }

      return {
        items: filtered,
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize) || 1,
        stats: cached.stats,
      };
    }

    return {
      items: [],
      total: 0,
      page: 1,
      pageSize,
      totalPages: 1,
      stats: { total: 0, open: 0, inProgress: 0, resolved: 0 },
    };
  },

  /**
   * Get single ticket details
   */
  async getTicket(
    workspaceId: string,
    ticketId: string,
  ): Promise<SupportTicketItem> {
    if (!workspaceId || !ticketId) {
      throw new Error("Workspace ID and Ticket ID are required");
    }

    try {
      const response = await apiClient.get<ApiResponse<SupportTicketItem>>(
        `/support/tickets/${ticketId}`,
        {
          params: { workspaceId },
          headers: {
            "x-workspace-id": workspaceId,
          },
        },
      );

      if (response && response.data) {
        return response.data;
      }
    } catch (networkError) {
      console.warn(
        "[SupportService] getTicket network fetch failed, checking cache:",
        networkError,
      );
    }

    const cached = getLocalStorageTickets(workspaceId);
    const found = cached?.items.find(
      (t) =>
        t.id === ticketId || t._id === ticketId || t.ticketNumber === ticketId,
    );
    if (found) return found;

    throw new Error("Support ticket not found");
  },

  /**
   * Create new ticket
   */
  async createTicket(
    payload: CreateSupportTicketPayload & { workspaceId: string },
  ): Promise<SupportTicketItem> {
    let createdItem: SupportTicketItem | null = null;

    try {
      const response = await apiClient.post<ApiResponse<SupportTicketItem>>(
        "/support/tickets",
        payload,
        {
          headers: {
            "x-workspace-id": payload.workspaceId,
          },
        },
      );

      if (response && response.data) {
        createdItem = response.data;
      }
    } catch (networkError) {
      console.warn(
        "[SupportService] createTicket network dispatch failed, generating optimistic ticket:",
        networkError,
      );
    }

    if (!createdItem) {
      const fallbackId = `TICK-${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`;
      createdItem = {
        _id: fallbackId,
        id: fallbackId,
        ticketNumber: fallbackId,
        workspaceId: payload.workspaceId,
        workspaceName: "My Workspace",
        subject: payload.subject,
        priority: payload.priority || "MEDIUM",
        category: payload.category || "Technical Issue",
        status: "OPEN",
        customerName: payload.customerName || "Workspace Member",
        customerEmail: payload.customerEmail || "",
        messages: [
          {
            _id: `msg-${Date.now()}`,
            id: `msg-${Date.now()}`,
            senderId: "customer",
            senderRole: "CUSTOMER",
            senderName: payload.customerName || "You",
            content: payload.description,
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const itemToSave: SupportTicketItem = createdItem;
    // Persist to local cache immediately
    const cached = getLocalStorageTickets(payload.workspaceId) || {
      items: [],
      stats: { total: 0, open: 0, inProgress: 0, resolved: 0 },
    };
    const updatedItems: SupportTicketItem[] = [
      itemToSave,
      ...cached.items.filter(
        (t) =>
          t.id !== itemToSave._id &&
          t.ticketNumber !== itemToSave.ticketNumber,
      ),
    ];
    setLocalStorageTickets(payload.workspaceId, updatedItems);

    return itemToSave;
  },

  /**
   * Add message reply to ticket
   */
  async addMessage(
    workspaceId: string,
    ticketId: string,
    payload: AddSupportTicketMessagePayload,
  ): Promise<SupportTicketItem> {
    let updatedItem: SupportTicketItem | null = null;

    try {
      const response = await apiClient.post<ApiResponse<SupportTicketItem>>(
        `/support/tickets/${ticketId}/messages`,
        payload,
        {
          params: { workspaceId },
          headers: {
            "x-workspace-id": workspaceId,
          },
        },
      );

      if (response && response.data) {
        updatedItem = response.data;
      }
    } catch (networkError) {
      console.warn(
        "[SupportService] addMessage network dispatch failed, applying local message:",
        networkError,
      );
    }

    const cached = getLocalStorageTickets(workspaceId) || {
      items: [],
      stats: { total: 0, open: 0, inProgress: 0, resolved: 0 },
    };

    if (!updatedItem) {
      const existing = cached.items.find(
        (t) =>
          t.id === ticketId || t._id === ticketId || t.ticketNumber === ticketId,
      );
      if (existing) {
        const newMsg: SupportTicketMessage = {
          _id: `msg-${Date.now()}`,
          id: `msg-${Date.now()}`,
          senderId: "customer",
          senderRole: "CUSTOMER",
          senderName: "You",
          content: payload.content,
          createdAt: new Date().toISOString(),
        };
        const newStatus =
          existing.status === "RESOLVED" || existing.status === "CLOSED"
            ? ("IN_PROGRESS" as SupportTicketStatus)
            : existing.status;

        updatedItem = {
          ...existing,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          messages: [...(existing.messages || []), newMsg],
        };
      }
    }

    if (updatedItem) {
      const updatedList = cached.items.map((t) =>
        t.id === ticketId || t._id === ticketId || t.ticketNumber === ticketId
          ? updatedItem!
          : t,
      );
      setLocalStorageTickets(workspaceId, updatedList);
      return updatedItem;
    }

    throw new Error("Unable to add reply to ticket");
  },

  /**
   * Update ticket status
   */
  async updateStatus(
    workspaceId: string,
    ticketId: string,
    status: SupportTicketStatus,
  ): Promise<SupportTicketItem> {
    let updatedItem: SupportTicketItem | null = null;

    try {
      const response = await apiClient.patch<ApiResponse<SupportTicketItem>>(
        `/support/tickets/${ticketId}/status`,
        { status },
        {
          params: { workspaceId },
          headers: {
            "x-workspace-id": workspaceId,
          },
        },
      );

      if (response && response.data) {
        updatedItem = response.data;
      }
    } catch (networkError) {
      console.warn(
        "[SupportService] updateStatus network dispatch failed, updating locally:",
        networkError,
      );
    }

    const cached = getLocalStorageTickets(workspaceId) || {
      items: [],
      stats: { total: 0, open: 0, inProgress: 0, resolved: 0 },
    };

    if (!updatedItem) {
      const existing = cached.items.find(
        (t) =>
          t.id === ticketId || t._id === ticketId || t.ticketNumber === ticketId,
      );
      if (existing) {
        updatedItem = {
          ...existing,
          status,
          updatedAt: new Date().toISOString(),
        };
      }
    }

    if (updatedItem) {
      const updatedList = cached.items.map((t) =>
        t.id === ticketId || t._id === ticketId || t.ticketNumber === ticketId
          ? updatedItem!
          : t,
      );
      setLocalStorageTickets(workspaceId, updatedList);
      return updatedItem;
    }

    throw new Error("Failed to update ticket status");
  },

  /**
   * Update ticket priority
   */
  async updatePriority(
    workspaceId: string,
    ticketId: string,
    priority: SupportTicketPriority,
  ): Promise<SupportTicketItem> {
    let updatedItem: SupportTicketItem | null = null;

    try {
      const response = await apiClient.patch<ApiResponse<SupportTicketItem>>(
        `/support/tickets/${ticketId}/priority`,
        { priority },
        {
          params: { workspaceId },
          headers: {
            "x-workspace-id": workspaceId,
          },
        },
      );

      if (response && response.data) {
        updatedItem = response.data;
      }
    } catch (networkError) {
      console.warn(
        "[SupportService] updatePriority network dispatch failed, updating locally:",
        networkError,
      );
    }

    const cached = getLocalStorageTickets(workspaceId) || {
      items: [],
      stats: { total: 0, open: 0, inProgress: 0, resolved: 0 },
    };

    if (!updatedItem) {
      const existing = cached.items.find(
        (t) =>
          t.id === ticketId || t._id === ticketId || t.ticketNumber === ticketId,
      );
      if (existing) {
        updatedItem = {
          ...existing,
          priority,
          updatedAt: new Date().toISOString(),
        };
      }
    }

    if (updatedItem) {
      const updatedList = cached.items.map((t) =>
        t.id === ticketId || t._id === ticketId || t.ticketNumber === ticketId
          ? updatedItem!
          : t,
      );
      setLocalStorageTickets(workspaceId, updatedList);
      return updatedItem;
    }

    throw new Error("Failed to update ticket priority");
  },
};

export default supportService;
