/**
 * VexChat Frontend Billing Service
 * Communicates with vexchat-backend billing endpoints via apiClient.
 */

import apiClient from "../lib/api-client.ts";
import type { ApiResponse, PaginationMetadata } from "../types/api.ts";
import type {
  BillingOverviewData,
  BillingPlan,
  InitiatePaymentPayload,
  InitiatePaymentResponseData,
  InvoiceItem,
  MyServicesData,
  PaymentItem,
  PlanCode,
  SubmitBankTransferPayload,
} from "../types/billing.ts";

export class BillingService {
  /**
   * Retrieves full billing overview for a workspace (subscription, plans, recent payments & invoices).
   */
  async getOverview(workspaceId: string): Promise<BillingOverviewData> {
    const res = await apiClient.get<ApiResponse<BillingOverviewData>>(
      `/workspaces/${workspaceId}/billing/overview`,
    );
    if (!res.data) {
      throw new Error("No billing overview data returned from server");
    }
    return res.data;
  }

  /**
   * Retrieves active services, subscription, profile, and unlocked features for a workspace.
   */
  async getMyServices(workspaceId: string): Promise<MyServicesData> {
    const res = await apiClient.get<ApiResponse<MyServicesData>>(
      `/workspaces/${workspaceId}/billing/my-services`,
    );
    if (!res.data) {
      throw new Error(res.message || "Failed to retrieve my-services data from server");
    }
    return res.data;
  }

  /**
   * Retrieves authoritative plan definitions from the backend catalog.
   */
  async getPlans(workspaceId: string): Promise<BillingPlan[]> {
    const res = await apiClient.get<ApiResponse<{ plans: BillingPlan[] }>>(
      `/workspaces/${workspaceId}/billing/plans`,
    );
    return res.data?.plans || [];
  }

  /**
   * Initiates payment for a selected plan and payment method.
   * Authoritative price is enforced on the backend.
   */
  async initiatePayment(
    workspaceId: string,
    payload: InitiatePaymentPayload,
  ): Promise<InitiatePaymentResponseData> {
    const res = await apiClient.post<ApiResponse<InitiatePaymentResponseData>>(
      `/workspaces/${workspaceId}/billing/payments/initiate`,
      payload,
    );
    if (!res.data) {
      throw new Error("Failed to initiate payment");
    }
    return res.data;
  }

  /**
   * Initiates payment via ZiniPay automated gateway.
   * Returns gateway checkout URL for instant redirection.
   */
  async payWithZinipay(
    workspaceId: string,
    planCode: PlanCode,
  ): Promise<{ gatewayUrl: string; paymentId: string; invoiceNumber?: string }> {
    const res = await apiClient.post<
      ApiResponse<{ gatewayUrl: string; paymentId: string; invoiceNumber?: string }>
    >(`/workspaces/${workspaceId}/billing/pay/zinipay`, { planCode });
    const data = res.data;
    if (!data?.gatewayUrl) {
      throw new Error(res.message || "Failed to generate ZiniPay checkout session");
    }
    return data;
  }

  /**
   * Submits bank deposit reference and slip details for City Bank manual transfers.
   * Backend responds with `{ success: true, message: "...", data: { payment } }`.
   */
  async submitBankTransfer(
    workspaceId: string,
    paymentId: string,
    payload: SubmitBankTransferPayload,
  ): Promise<PaymentItem> {
    const res = await apiClient.post<ApiResponse<{ payment: PaymentItem }>>(
      `/workspaces/${workspaceId}/billing/payments/${paymentId}/bank-transfer`,
      payload,
    );
    if (!res.data?.payment) {
      throw new Error("Failed to submit bank transfer details: malformed response");
    }
    return res.data.payment;
  }

  /**
   * Retrieves paginated invoices for a workspace.
   * Backend returns flat pagination structure `{ invoices, total, page, totalPages }`.
   */
  async getInvoices(
    workspaceId: string,
    page = 1,
    limit = 20,
  ): Promise<{ invoices: InvoiceItem[]; pagination: PaginationMetadata }> {
    const res = await apiClient.get<
      ApiResponse<{
        invoices: InvoiceItem[];
        total: number;
        page: number;
        totalPages: number;
      }>
    >(`/workspaces/${workspaceId}/billing/invoices`, {
      params: { page, limit },
    });

    const data = res.data;
    if (!data || !Array.isArray(data.invoices)) {
      return {
        invoices: [],
        pagination: { page: 1, limit, total: 0, totalPages: 0 },
      };
    }

    return {
      invoices: data.invoices,
      pagination: {
        page: data.page ?? page,
        limit,
        total: data.total ?? 0,
        totalPages: data.totalPages ?? 0,
      },
    };
  }

  /**
   * Retrieves a single invoice by its ID.
   * Backend route: `GET /api/workspaces/:workspaceId/billing/invoices/:invoiceId`
   */
  async getInvoiceById(
    workspaceId: string,
    invoiceId: string,
  ): Promise<InvoiceItem> {
    const res = await apiClient.get<ApiResponse<{ invoice: InvoiceItem }>>(
      `/workspaces/${workspaceId}/billing/invoices/${invoiceId}`,
    );
    if (!res.data?.invoice) {
      throw new Error("Invoice record not found or malformed response");
    }
    return res.data.invoice;
  }
}

export const billingService = new BillingService();

