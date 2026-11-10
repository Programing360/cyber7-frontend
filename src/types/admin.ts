/**
 * Authoritative Platform Admin Types for VexChat
 * Strictly aligned with cyber7-backend models, enums, and billing configuration.
 */

// --- Backend Platform Roles ---
export type PlatformRole = "USER" | "FINANCE_ADMIN" | "SUPER_ADMIN";

// --- Workspace Membership Roles (Customer Domain) ---
export type WorkspaceRole = "OWNER" | "ADMIN" | "AGENT";

// --- Workspace Statuses ---
export type WorkspaceStatus = "ACTIVE" | "SUSPENDED";

// --- Plan Codes (from billing.config.ts) ---
export type PlanCode = "STARTER" | "BUSINESS_PRO" | "ENTERPRISE" | (string & {});

// --- Subscription Statuses ---
export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

// --- Payment Enums (from billing.config.ts) ---
export type PaymentMethod = "BKASH" | "CITY_BANK_CARD" | "CITY_BANK_TRANSFER";

export type PaymentStatus =
  | "INITIATED"
  | "PENDING_VERIFICATION"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "REJECTED"
  | "REFUNDED";

// --- Invoice Statuses ---
export type InvoiceStatus = "PAID" | "PENDING" | "VOID";

// --- Audit Actor Types ---
export type AuditActorType = "USER" | "PLATFORM_ADMIN" | "SYSTEM";

/**
 * Backend Support Status Classification
 */
export type BackendSupportStatus =
  | "IMPLEMENTED"
  | "PARTIAL"
  | "NOT_IMPLEMENTED"
  | "NEEDS_VERIFICATION";

/**
 * Platform Admin Workspace Model Representation
 */
export interface AdminWorkspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  status: WorkspaceStatus;
  timezone: string;
  currency: "BDT";
  memberCount: number;
  activePlan: PlanCode;
  subscriptionStatus: SubscriptionStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Platform Admin User Model Representation
 */
export interface AdminPlatformUser {
  id: string;
  name: string;
  email: string;
  platformRole: PlatformRole;
  workspaceRole?: WorkspaceRole;
  primaryWorkspaceName?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

/**
 * Platform Admin Subscription Model Representation
 */
export interface AdminSubscription {
  id: string;
  workspaceId: string;
  workspaceName: string;
  planCode: PlanCode;
  planName: string;
  status: SubscriptionStatus;
  currency: "BDT";
  price: number;
  billingCycle: "MONTHLY";
  billingCycleAnchorDay: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  lastPaymentId?: string;
  limits: {
    maxWhatsAppNumbers: number; // -1 = unlimited
    maxTeamMembers: number; // -1 = unlimited
  };
  features: string[];
  createdAt: string;
}

/**
 * Platform Admin Authoritative Plan Definition
 */
export interface AdminPlan {
  code: string;
  name: string;
  priceBdt: number;
  description: string;
  limits: {
    maxWhatsAppNumbers: number;
    maxTeamMembers: number;
  };
  features: string[];
  isCustom?: boolean;
  activeSubscriptionsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCustomPlanInput {
  planCode: string;
  name: string;
  priceBdt: number;
  description?: string;
  limits: {
    maxWhatsAppNumbers: number;
    maxTeamMembers: number;
  };
  features?: string[];
}

export interface UpdatePlanInput {
  name?: string;
  priceBdt?: number;
  description?: string;
  limits?: {
    maxWhatsAppNumbers?: number;
    maxTeamMembers?: number;
  };
  features?: string[];
}

/**
 * Platform Admin Payment Model Representation
 */
export interface AdminPayment {
  id: string;
  workspaceId: string;
  workspaceName: string;
  initiatedBy: {
    id: string;
    name: string;
    email: string;
  };
  paymentMethod: PaymentMethod;
  planCode: PlanCode;
  planName: string;
  amount: number;
  currency: "BDT";
  status: PaymentStatus;
  invoiceNumber: string;
  idempotencyKey: string;
  gatewayData?: {
    trxID?: string;
    cblOrderId?: string;
    cblTransactionId?: string;
    bankTransfer?: {
      bankName?: string;
      accountName?: string;
      accountNumber?: string;
      branchName?: string;
      depositDate?: string;
      referenceNumber?: string;
      depositAmount?: number;
      receiptUrl?: string;
      adminNotes?: string;
      rejectionReason?: string;
    };
  };
  failureReason?: string;
  completedAt?: string;
  createdAt: string;
}

/**
 * Platform Admin Invoice Model Representation
 */
export interface AdminInvoice {
  id: string;
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
  currency: "BDT";
  status: InvoiceStatus;
  paymentMethod: PaymentMethod;
  paidAt?: string;
  createdAt: string;
}

/**
 * Platform Overview Aggregate Metrics
 */
export interface AdminPlatformOverviewMetrics {
  totalWorkspaces: number;
  totalUsers: number;
  activeSubscriptions: number;
  subscriptionRevenueBdt: number;
  pendingTransfersCount: number;
  pendingTransfersAmountBdt: number;
  plansBreakdown: Record<PlanCode, number>;
  backendSupport: {
    totalWorkspaces: BackendSupportStatus;
    totalUsers: BackendSupportStatus;
    activeSubscriptions: BackendSupportStatus;
    subscriptionRevenue: BackendSupportStatus;
    pendingTransfers: BackendSupportStatus;
  };
}

/**
 * Platform Support Ticket (Mocked / Unimplemented Backend Feature)
 */
/**
 * Platform Support Ticket Message & Ticket Models
 */
export interface AdminSupportMessageAttachment {
  filename: string;
  url: string;
}

export interface AdminSupportMessage {
  id?: string;
  senderId: string;
  senderRole: "CUSTOMER" | "PLATFORM_ADMIN" | "AGENT";
  senderName?: string;
  content: string;
  attachments?: AdminSupportMessageAttachment[];
  createdAt: string;
}

export interface AdminSupportTicket {
  id: string;
  ticketNumber: string;
  workspaceId: string;
  workspaceName: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  assignedAdmin?: string | null;
  assignedAdminId?: string | null;
  messages?: AdminSupportMessage[];
  createdAt: string;
  updatedAt: string;
  backendSupport?: BackendSupportStatus;
}

export interface PlatformRuntimeDiagnostics {
  nodeVersion: string;
  environment: string;
  uptimeSeconds: number;
  serverTime: string;
  mongoConnected: boolean;
  activeSessionsCount: number;
  expiredSessionsCount: number;
}

export interface AdminPlatformSettings {
  currency: string;
  maintenanceMode?: boolean;
  sessionPolicies: {
    idleTimeoutMinutes: number;
    absoluteLifetimeHours: number;
    highValueStepUpThresholdBdt: number;
  };
  gatewayToggles: {
    bkashDirect: boolean;
    cityBankTransfer: boolean;
    portPosCards: boolean;
  };
  runtime?: PlatformRuntimeDiagnostics;
  updatedBy?: string | null;
  updatedAt?: string;
}

export interface GatewayHealthResult {
  status: "HEALTHY" | "DEGRADED" | "DOWN";
  latencyMs: number;
  message: string;
  mode: string;
}

export interface GatewaysHealthReport {
  success: boolean;
  timestamp: string;
  overallStatus: "HEALTHY" | "DEGRADED" | "DOWN";
  gateways: {
    bkash: GatewayHealthResult;
    cityBank: GatewayHealthResult;
  };
}

/**
 * Platform Admin Comprehensive Analytics
 */
export interface AdminAnalyticsOverview {
  totalRevenueBdt: number;
  monthlyRecurringRevenueBdt: number;
  totalActiveSubscriptions: number;
  averageRevenuePerAccount: number;
  totalUsers: number;
  trialUsers: number;
  paidUsers: number;
  totalWorkspaces: number;
  activeWorkspaces: number;
}

export interface AdminAnalyticsRevenueTrendItem {
  month: string;
  revenue: number;
  count: number;
}

export interface AdminAnalyticsPlanItem {
  planCode: string;
  name: string;
  value: number;
  revenueBdt: number;
  color: string;
}

export interface AdminAnalyticsPaymentMethodItem {
  method: string;
  label: string;
  amount: number;
  count: number;
}

export interface AdminAnalyticsGrowthItem {
  month: string;
  users: number;
  workspaces: number;
  revenue: number;
  transactions: number;
}

export interface AdminAnalyticsData {
  overview: AdminAnalyticsOverview;
  revenueTrend: AdminAnalyticsRevenueTrendItem[];
  planDistribution: AdminAnalyticsPlanItem[];
  paymentMethods: AdminAnalyticsPaymentMethodItem[];
  growthTrend: AdminAnalyticsGrowthItem[];
  source: "LIVE_BACKEND";
}

