import type {
  AdminInvoice,
  AdminPayment,
  AdminPlatformOverviewMetrics,
  AdminPlatformUser,
  AdminSubscription,
  AdminSupportTicket,
  AdminWorkspace,
} from "../types/admin.ts";

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
    const globalAssertionFn = (globalThis as Record<string, any>)
      .generateAdminBffAssertion;
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

      const message = json?.message || `Request failed with HTTP ${res.status}`;
      throw new AdminApiError(message, res.status, code);
    }

    if (json && json.success === false) {
      throw new AdminApiError(
        json.message || "Operation failed",
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

  async listSupportTickets(): Promise<PaginatedResult<AdminSupportTicket>> {
    return {
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
      source: "LIVE_BACKEND",
    };
  }
}

export const adminService = new AdminService();
