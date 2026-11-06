/**
 * VexChat Billing & Payment System Types
 * Strictly mirrors authoritative backend models and billing schemas.
 */

export const CURRENCY = "BDT" as const;

export type PlanCode = "STARTER" | "BUSINESS_PRO" | "ENTERPRISE";

export interface PlanLimits {
  maxWhatsAppNumbers: number; // -1 for unlimited
  maxTeamMembers: number;     // -1 for unlimited
}

export interface BillingPlan {
  code: PlanCode;
  name: string;
  priceBdt: number;
  priceBdtDecimal?: string;
  description: string;
  limits: PlanLimits;
  features: string[];
}

export type PaymentMethod = "BKASH" | "CITY_BANK_CARD" | "CITY_BANK_TRANSFER";

export type PaymentStatus =
  | "INITIATED"
  | "PENDING_VERIFICATION"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "REJECTED"
  | "REFUNDED";

export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

export interface WorkspaceSubscription {
  _id?: string;
  workspaceId: string;
  planCode: PlanCode;
  planName: string;
  status: SubscriptionStatus;
  currency: string;
  price: number;
  billingCycle: "MONTHLY";
  billingCycleAnchorDay: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  lastPaymentId?: string;
  limits: PlanLimits;
  features: string[];
}

export interface PaymentItem {
  _id: string;
  workspaceId: string;
  initiatedBy: string;
  paymentMethod: PaymentMethod;
  planCode: PlanCode;
  planName: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  invoiceNumber: string;
  idempotencyKey: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
  gatewayData?: {
    trxID?: string;
    paymentID?: string;
    cblOrderId?: string;
    bankTransfer?: {
      bankName?: string;
      accountName?: string;
      accountNumber?: string;
      referenceNumber?: string;
      depositAmount?: number;
      depositDate?: string;
      receiptUrl?: string;
    };
  };
}

export interface InvoiceItem {
  _id: string;
  invoiceNumber: string;
  workspaceId: string;
  paymentId: string;
  issuedTo: {
    userId: string;
    userName: string;
    userEmail: string;
    workspaceName: string;
  };
  planCode: PlanCode;
  planName: string;
  billingCycle: "MONTHLY";
  periodCoveredStart: string;
  periodCoveredEnd: string;
  amount: number;
  currency: string;
  status: "PAID" | "PENDING" | "VOID";
  paymentMethod: PaymentMethod;
  paidAt?: string;
  createdAt: string;
}

export interface BillingOverviewData {
  subscription: WorkspaceSubscription | null;
  plans: BillingPlan[];
  recentPayments: PaymentItem[];
  recentInvoices: InvoiceItem[];
  isSubscriptionActive: boolean;
  daysRemaining: number;
}

export interface InitiatePaymentPayload {
  planCode: PlanCode;
  paymentMethod: PaymentMethod;
  idempotencyKey?: string;
}

export interface InitiatePaymentResponseData {
  payment: PaymentItem;
  plan: BillingPlan;
  bkashURL?: string; // Only present in gateway sandbox/staging environments
}

export interface SubmitBankTransferPayload {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  branchName?: string;
  depositDate?: string;
  referenceNumber: string;
  receiptUrl?: string;
  depositAmount?: number; // Governed authoritatively by backend payment record
}

export interface CityBankDetailsConfig {
  isConfigured: boolean;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  branchName?: string;
  routingNumber?: string;
  swiftCode?: string;
  notice: string;
}

export const CITY_BANK_CONFIG: CityBankDetailsConfig = {
  isConfigured: false,
  notice:
    "Bank transfer instructions are currently unavailable. Please contact your workspace administrator.",
};

