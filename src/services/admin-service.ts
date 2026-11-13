import type {
  AdminAnalyticsData,
  AdminInvoice,
  AdminPayment,
  AdminPlatformOverviewMetrics,
  AdminPlatformUser,
  AdminSubscription,
  AdminSupportTicket,
  AdminSupportMessage,
  AdminWorkspace,
  AdminPlatformSettings,
  GatewaysHealthReport,
  AdminPlan,
  CreateCustomPlanInput,
  UpdatePlanInput,
} from "../types/admin.ts";
import { getStoredToken } from "../lib/token-storage";

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats?: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    urgent?: number;
  };
  source: "LIVE_BACKEND";
}

export interface AdminSecurityAuditRecord {
  id: string;
  eventType: string;
  adminUserId?: string;
  adminEmail?: string;
  sessionId?: string;
  reason: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AdminRevenueData {
  totalRevenueBdt: number;
  monthly: Array<{ month: string; amount: number; count: number }>;
  byMethod: Array<{ method: string; amount: number; count: number }>;
  source: "LIVE_BACKEND";
}

export interface AdminSessionProfile {
  user: {
    id: string;
    email: string;
    name: string;
    platformRole: "SUPER_ADMIN" | "FINANCE_ADMIN";
  };
  session: {
    id: string;
    status: "ACTIVE" | "REVOKED" | "EXPIRED";
    idleExpiresAt: string;
    absoluteExpiresAt: string;
    lastActivityAt: string;
  };
  mfa: {
    configured: boolean;
    enrolledAt?: string;
    confirmedAt?: string;
    remainingRecoveryCodes?: number;
  };
}

export class AdminApiError extends Error {
  public readonly status: number;
  public readonly code: string;

  constructor(
    message: string,
    status: number = 500,
    code: string = "ADMIN_API_ERROR",
  ) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.code = code;
  }
}

interface ApiResponseEnvelope<T> {
  success?: boolean;
  code?: string;
  message?: string;
  data?: T;
}

/**
 * Server-side helper to sign or fetch BFF assertion tokens if available.
 * If you have a dedicated token signing utility, replace this fallback with your module.
 */
async function resolveAdminBffAssertion(): Promise<string | null> {
  if (typeof window !== "undefined") {
    return null;
  }

  try {
    // Optional dynamic resolution if defined in global scope or environment
    const globalAssertionFn = (globalThis as Record<string, unknown>)
      .generateAdminBffAssertion as (() => Promise<string>) | undefined;
    if (typeof globalAssertionFn === "function") {
      return await globalAssertionFn();
    }
  } catch {
    // Fallback if unavailable
  }

  return process.env.ADMIN_BFF_INTERNAL_SECRET || null;
}

/**
 * Platform Admin API Service
 * Encapsulates communication with Next.js BFF and platform administration endpoints.
 */
class AdminService {
  private async fetchBff<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const isBrowser = typeof window !== "undefined";
    const baseUrl = isBrowser
      ? ""
      : process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";

    const url = endpoint.startsWith("http")
      ? endpoint
      : `${baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
    };

    // Attach assertion header on server-side requests if available
    if (!isBrowser && !headers["x-admin-bff-assertion"]) {
      const assertion = await resolveAdminBffAssertion();
      if (assertion) {
        headers["x-admin-bff-assertion"] = assertion;
      }
    }

    // Attach user access token in browser if Authorization header not explicitly set
    if (isBrowser && !headers["authorization"] && !headers["Authorization"]) {
      const storedToken = getStoredToken();
      if (storedToken) {
        headers["authorization"] = `Bearer ${storedToken}`;
      }
    }

    // Attach JSON headers for payload bodies
    if (options.body && !headers["content-type"] && !headers["Content-Type"]) {
      headers["content-type"] = "application/json";
    }

    let res: Response;
    try {
      res = await fetch(url, {
        ...options,
        headers,
        credentials: options.credentials || "include",
        cache: "no-store",
      });
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Network error: Unable to reach Next.js BFF";
      throw new AdminApiError(errorMsg, 503, "NETWORK_ERROR");
    }

    let json: ApiResponseEnvelope<T> | null = null;
    try {
      json = (await res.json()) as ApiResponseEnvelope<T>;
    } catch {
      // Non-JSON responses (such as 502/504 Bad Gateway HTML proxies)
    }

    if (!res.ok) {
      const code =
        json?.code ||
        (res.status === 403
          ? "PLATFORM_ROLE_UNAUTHORIZED"
          : res.status === 401
            ? "UNAUTHORIZED"
            : "HTTP_ERROR");

      const message =
        (json as any)?.error ||
        json?.message ||
        `Request failed with HTTP ${res.status}`;
      throw new AdminApiError(message, res.status, code);
    }

    if (json && json.success === false) {
      throw new AdminApiError(
        (json as any)?.error || json.message || "Operation failed",
        res.status,
        json.code || "OPERATION_FAILED",
      );
    }

    return (json?.data !== undefined ? json.data : (json as unknown)) as T;
  }

  async getOverviewMetrics(): Promise<{
    metrics: AdminPlatformOverviewMetrics;
    recentActivity?: AdminSecurityAuditRecord[];
    source: "LIVE_BACKEND";
  }> {
    const data = await this.fetchBff<{
      metrics: AdminPlatformOverviewMetrics;
      recentActivity?: AdminSecurityAuditRecord[];
      source: "LIVE_BACKEND";
    }>("/api/admin/dashboard/overview");

    return {
      metrics: data.metrics,
      recentActivity: data.recentActivity || [],
      source: "LIVE_BACKEND",
    };
  }

  async getRevenueMetrics(): Promise<AdminRevenueData> {
    return this.fetchBff<AdminRevenueData>("/api/admin/dashboard/revenue");
  }

  async listWorkspaces(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<AdminWorkspace>> {
    const searchParams = new URLSearchParams();
    if (params?.search?.trim())
      searchParams.set("search", params.search.trim());
    if (params?.status && params.status !== "ALL")
      searchParams.set("status", params.status);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const qs = searchParams.toString();
    const endpoint = `/api/admin/dashboard/workspaces${qs ? `?${qs}` : ""}`;
    return this.fetchBff<PaginatedResult<AdminWorkspace>>(endpoint);
  }

  async listUsers(params?: {
    search?: string;
    role?: string;
    platformRole?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<AdminPlatformUser>> {
    const searchParams = new URLSearchParams();
    if (params?.search?.trim())
      searchParams.set("search", params.search.trim());
    if (params?.role && params.role !== "ALL")
      searchParams.set("role", params.role);
    if (params?.platformRole && params.platformRole !== "ALL") {
      searchParams.set("platformRole", params.platformRole);
    }
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const qs = searchParams.toString();
    const endpoint = `/api/admin/dashboard/users${qs ? `?${qs}` : ""}`;
    return this.fetchBff<PaginatedResult<AdminPlatformUser>>(endpoint);
  }

  async listSubscriptions(params?: {
    search?: string;
    plan?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<AdminSubscription>> {
    const searchParams = new URLSearchParams();
    if (params?.search?.trim())
      searchParams.set("search", params.search.trim());
    if (params?.plan && params.plan !== "ALL")
      searchParams.set("plan", params.plan);
    if (params?.status && params.status !== "ALL")
      searchParams.set("status", params.status);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const qs = searchParams.toString();
    const endpoint = `/api/admin/dashboard/subscriptions${qs ? `?${qs}` : ""}`;
    return this.fetchBff<PaginatedResult<AdminSubscription>>(endpoint);
  }

  async listPayments(params?: {
    search?: string;
    status?: string;
    method?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<AdminPayment>> {
    const searchParams = new URLSearchParams();
    if (params?.search?.trim())
      searchParams.set("search", params.search.trim());
    if (params?.status && params.status !== "ALL")
      searchParams.set("status", params.status);
    if (params?.method && params.method !== "ALL")
      searchParams.set("method", params.method);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const qs = searchParams.toString();
    const endpoint = `/api/admin/dashboard/payments${qs ? `?${qs}` : ""}`;
    return this.fetchBff<PaginatedResult<AdminPayment>>(endpoint);
  }

  async listInvoices(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<AdminInvoice>> {
    const searchParams = new URLSearchParams();
    if (params?.search?.trim())
      searchParams.set("search", params.search.trim());
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const qs = searchParams.toString();
    const endpoint = `/api/admin/dashboard/invoices${qs ? `?${qs}` : ""}`;
    return this.fetchBff<PaginatedResult<AdminInvoice>>(endpoint);
  }

  async listAuditLogs(params?: {
    search?: string;
    eventType?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<AdminSecurityAuditRecord>> {
    const searchParams = new URLSearchParams();
    if (params?.search?.trim())
      searchParams.set("search", params.search.trim());
    if (params?.eventType && params.eventType !== "ALL") {
      searchParams.set("eventType", params.eventType);
    }
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const qs = searchParams.toString();
    const endpoint = `/api/admin/dashboard/audit-logs${qs ? `?${qs}` : ""}`;
    return this.fetchBff<PaginatedResult<AdminSecurityAuditRecord>>(endpoint);
  }

  /**
   * Fetches current admin session and MFA context
   */
  async getAdminSession(
    initHeaders?: HeadersInit,
  ): Promise<AdminSessionProfile> {
    return this.fetchBff<AdminSessionProfile>("/api/admin/auth/me", {
      headers: initHeaders,
    });
  }

  /**
   * Logs out current admin session and clears cookies
   */
  async logout(): Promise<void> {
    await this.fetchBff("/api/admin/auth/logout", { method: "POST" });
  }

  // ==========================================
  // 1. PAYMENTS & FINANCIAL MUTATIONS
  // ==========================================

  async approveBankTransfer(
    paymentId: string,
    payload?: { adminNotes?: string; stepUpToken?: string },
  ): Promise<Record<string, unknown>> {
    return this.fetchBff(`/api/admin/dashboard/billing/bank-transfers/${paymentId}/approve`, {
      method: "POST",
      body: JSON.stringify(payload || {}),
    });
  }

  async rejectBankTransfer(
    paymentId: string,
    payload: { rejectionReason: string },
  ): Promise<Record<string, unknown>> {
    return this.fetchBff(`/api/admin/dashboard/billing/bank-transfers/${paymentId}/reject`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async refundPayment(
    paymentId: string,
    payload: { reason: string },
  ): Promise<Record<string, unknown>> {
    return this.fetchBff(`/api/admin/dashboard/billing/payments/${paymentId}/refund`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async downloadReceiptPdf(paymentId: string, receiptNumber?: string): Promise<void> {
    const res = await fetch(`/api/admin/dashboard/billing/payments/${paymentId}/receipt`, {
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new AdminApiError("Failed to download payment receipt PDF", res.status, "RECEIPT_DOWNLOAD_FAILED");
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Receipt-${receiptNumber || paymentId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // ==========================================
  // 2. WORKSPACES & TENANT GOVERNANCE
  // ==========================================

  async updateWorkspaceStatus(
    workspaceId: string,
    payload: { status: "ACTIVE" | "SUSPENDED"; reason?: string },
  ): Promise<Record<string, unknown>> {
    return this.fetchBff(`/api/admin/dashboard/workspaces/${workspaceId}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }

  async updateWorkspaceQuotas(
    workspaceId: string,
    payload: { maxWhatsAppNumbers?: number | null; maxTeamMembers?: number | null },
  ): Promise<Record<string, unknown>> {
    return this.fetchBff(`/api/admin/dashboard/workspaces/${workspaceId}/quotas`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }

  // ==========================================
  // 3. USERS & ACCESS CONTROL
  // ==========================================

  async updateUserRole(
    userId: string,
    payload: { platformRole: "USER" | "FINANCE_ADMIN" | "SUPER_ADMIN" },
  ): Promise<Record<string, unknown>> {
    return this.fetchBff(`/api/admin/dashboard/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }

  async revokeUserSessions(
    userId: string,
    payload?: { reason?: string },
  ): Promise<Record<string, unknown>> {
    return this.fetchBff(`/api/admin/dashboard/users/${userId}/revoke-sessions`, {
      method: "POST",
      body: JSON.stringify(payload || {}),
    });
  }

  async updateUserStatus(
    userId: string,
    payload: { isActive: boolean; reason?: string },
  ): Promise<Record<string, unknown>> {
    return this.fetchBff(`/api/admin/dashboard/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }

  async deleteUser(
    userId: string,
    payload: { confirmation: "DELETE" },
  ): Promise<Record<string, unknown>> {
    return this.fetchBff(`/api/admin/dashboard/users/${userId}`, {
      method: "DELETE",
      body: JSON.stringify(payload),
    });
  }

  // ==========================================
  // 4. SUBSCRIPTIONS & CATALOG
  // ==========================================

  async listPlans(): Promise<{ plans: AdminPlan[] }> {
    return this.fetchBff(`/api/admin/dashboard/billing/plans`, {
      method: "GET",
    });
  }

  async createCustomPlan(
    payload: CreateCustomPlanInput,
  ): Promise<{ plan: AdminPlan }> {
    return this.fetchBff(`/api/admin/dashboard/billing/plans`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async updatePlan(
    planCode: string,
    payload: UpdatePlanInput,
  ): Promise<{ plan: AdminPlan }> {
    return this.fetchBff(`/api/admin/dashboard/billing/plans/${planCode}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }

  async deletePlan(
    planCode: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.fetchBff(`/api/admin/dashboard/billing/plans/${planCode}`, {
      method: "DELETE",
    });
  }

  async modifySubscriptionPlan(
    subscriptionId: string,
    payload: { planCode: string; immediate?: boolean },
  ): Promise<Record<string, unknown>> {
    return this.fetchBff(`/api/admin/dashboard/subscriptions/${subscriptionId}/plan`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }

  async cancelSubscription(
    subscriptionId: string,
    payload: { cancelAtPeriodEnd?: boolean; reason?: string },
  ): Promise<Record<string, unknown>> {
    return this.fetchBff(`/api/admin/dashboard/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // ==========================================
  // 5. INVOICES & DOCUMENTS
  // ==========================================

  async downloadInvoicePdf(invoiceId: string, invoiceNumber?: string): Promise<void> {
    const res = await fetch(`/api/admin/dashboard/invoices/${invoiceId}/pdf`, {
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new AdminApiError("Failed to download invoice PDF", res.status, "INVOICE_DOWNLOAD_FAILED");
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice-${invoiceNumber || invoiceId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  async resendInvoiceEmail(
    invoiceId: string,
    payload?: { recipientEmail?: string },
  ): Promise<{ success: boolean; message: string; recipientEmail: string }> {
    return this.fetchBff(`/api/admin/dashboard/invoices/${invoiceId}/resend`, {
      method: "POST",
      body: JSON.stringify(payload || {}),
    });
  }

  // ==========================================
  // 6. SUPPORT TICKETING
  // ==========================================

  async listSupportTickets(params?: {
    search?: string;
    status?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<AdminSupportTicket>> {
    const searchParams = new URLSearchParams();
    if (params?.search?.trim()) searchParams.set("search", params.search.trim());
    if (params?.status && params.status !== "ALL") searchParams.set("status", params.status);
    if (params?.priority && params.priority !== "ALL") searchParams.set("priority", params.priority);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("pageSize", String(params.limit));

    const qs = searchParams.toString();
    const res = await this.fetchBff<{
      items: AdminSupportTicket[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
      stats?: {
        total: number;
        open: number;
        inProgress: number;
        resolved: number;
        urgent?: number;
      };
    }>(`/api/admin/dashboard/support/tickets${qs ? `?${qs}` : ""}`);

    const rawItems = res?.items || [];
    const normalizedItems: AdminSupportTicket[] = rawItems.map((t: any) => {
      const id = t.id || t._id?.toString() || t.ticketNumber;
      let assignedAdmin = t.assignedAdmin;
      let assignedAdminId = t.assignedAdminId;
      if (typeof assignedAdmin === "object" && assignedAdmin !== null) {
        assignedAdminId =
          assignedAdminId || assignedAdmin._id || assignedAdmin.id;
        assignedAdmin =
          assignedAdmin.name ||
          assignedAdmin.email ||
          (assignedAdminId
            ? `Admin (${String(assignedAdminId).slice(-4)})`
            : null);
      }
      return {
        ...t,
        id,
        assignedAdminId: assignedAdminId || null,
        assignedAdmin: assignedAdmin || null,
      };
    });

    return {
      items: normalizedItems,
      total: res?.total || 0,
      page: res?.page || 1,
      limit: res?.pageSize || 10,
      totalPages: res?.totalPages || 1,
      stats: res?.stats,
      source: "LIVE_BACKEND",
    };
  }

  async createSupportTicket(payload: {
    workspaceId: string;
    workspaceName?: string;
    customerName: string;
    customerEmail: string;
    subject: string;
    priority?: string;
    initialMessage?: string;
  }): Promise<AdminSupportTicket> {
    const res = await this.fetchBff<AdminSupportTicket>(
      "/api/admin/dashboard/support/tickets",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
    const id =
      (res as any)?.id || (res as any)?._id?.toString() || res.ticketNumber;
    return {
      ...res,
      id,
    };
  }

  async assignSupportTicket(
    ticketId: string,
    payload: { assignedAdminId?: string | null },
  ): Promise<AdminSupportTicket> {
    const cleanId = encodeURIComponent(String(ticketId || "").trim());
    const res = await this.fetchBff<AdminSupportTicket>(
      `/api/admin/dashboard/support/tickets/${cleanId}/assign`,
      {
        method: "PATCH",
        body: JSON.stringify({
          assignedAdminId: payload.assignedAdminId?.trim() || null,
        }),
      },
    );
    const id =
      (res as any)?.id || (res as any)?._id?.toString() || cleanId;
    return {
      ...res,
      id,
    };
  }

  async updateSupportTicketStatus(
    ticketId: string,
    payload: { status: string },
  ): Promise<AdminSupportTicket> {
    const cleanId = encodeURIComponent(String(ticketId || "").trim());
    const res = await this.fetchBff<AdminSupportTicket>(
      `/api/admin/dashboard/support/tickets/${cleanId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );
    const id =
      (res as any)?.id || (res as any)?._id?.toString() || cleanId;
    return {
      ...res,
      id,
    };
  }

  async addSupportTicketMessage(
    ticketId: string,
    payload: { content: string; attachments?: Array<{ filename: string; url: string }> },
  ): Promise<AdminSupportMessage> {
    const cleanId = encodeURIComponent(String(ticketId || "").trim());
    return this.fetchBff(
      `/api/admin/dashboard/support/tickets/${cleanId}/messages`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  }

  // ==========================================
  // 7. PLATFORM SETTINGS & SYSTEM CONTROLS
  // ==========================================

  async getPlatformSettings(): Promise<AdminPlatformSettings> {
    return this.fetchBff<AdminPlatformSettings>("/api/admin/dashboard/settings");
  }

  async updatePlatformSettings(payload: {
    currency?: string;
    maintenanceMode?: boolean;
    sessionPolicies?: Partial<AdminPlatformSettings["sessionPolicies"]>;
    gatewayToggles?: Partial<AdminPlatformSettings["gatewayToggles"]>;
  }): Promise<AdminPlatformSettings> {
    return this.fetchBff<AdminPlatformSettings>("/api/admin/dashboard/settings", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }

  async getGatewayHealth(): Promise<GatewaysHealthReport> {
    return this.fetchBff<GatewaysHealthReport>("/api/admin/dashboard/billing/gateways/health");
  }

  async purgeExpiredSessions(): Promise<{ success: boolean; purgedCount: number }> {
    return this.fetchBff<{ success: boolean; purgedCount: number }>(
      "/api/admin/dashboard/auth/sessions/purge",
      { method: "POST" },
    );
  }

  /**
   * Fetches full platform analytics aggregations (MRR, user growth, plan distribution, payment methods)
   */
  async getAnalyticsData(): Promise<AdminAnalyticsData> {
    return this.fetchBff<AdminAnalyticsData>("/api/admin/dashboard/analytics");
  }

  /**
   * Downloads platform analytics CSV report
   */
  async downloadAnalyticsCsv(): Promise<void> {
    const res = await fetch("/api/admin/dashboard/analytics/export", {
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new AdminApiError(
        "Failed to download analytics report",
        res.status,
        "EXPORT_FAILED",
      );
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vexchat-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

export const adminService = new AdminService();
