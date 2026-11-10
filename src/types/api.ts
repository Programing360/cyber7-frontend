/**
 * VexChat Shared API Types & Request/Response Contracts
 *
 * Strictly models actual backend entities, schemas, and response formats
 * implemented in vexchat-backend.
 */

// ─── Generic Response Envelopes ─────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ApiErrorIssue {
  field?: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ApiErrorIssue[] | Record<string, unknown>;
  debug?: {
    name?: string;
    message?: string;
  };
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── Health Check ────────────────────────────────────────────────────────────

export interface HealthCheckResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

// ─── Auth Module Types ───────────────────────────────────────────────────────

export type UserRole =
  | "OWNER"
  | "ADMIN"
  | "AGENT"
  | "SUPER_ADMIN"
  | "FINANCE_ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole | string;
  platformRole: UserRole;
  isEmailVerified?: boolean;
  createdAt?: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponseData {
  user: AuthUser;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponseData {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: string;
  user: AuthUser;
}

export interface CurrentUserResponseData {
  user: AuthUser;
}

// ─── Workspace Module Types ──────────────────────────────────────────────────

export interface CreateWorkspaceInput {
  name: string;
}

export interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  status: string;
  timezone?: string;
  currency?: string;
  role: UserRole;
  joinedAt?: string;
}

export interface CreatedWorkspaceData {
  workspace: {
    id: string;
    name: string;
    slug: string;
    ownerId: string;
    role: string;
    status: string;
  };
}

export interface WorkspacesListResponseData {
  workspaces: WorkspaceItem[];
}

export interface WorkspaceAccessCheckData {
  user: {
    id: string;
    email: string;
  };
  workspace: {
    id: string;
    role: UserRole;
  };
}

// ─── Workspace Member & Team Types ──────────────────────────────────────────

export type WorkspaceMemberStatus = "ACTIVE" | "SUSPENDED";

export interface WorkspaceMemberUser {
  id: string;
  name: string;
  email: string;
}

export interface WorkspaceMemberItem {
  membershipId: string;
  user: WorkspaceMemberUser;
  role: UserRole;
  status: WorkspaceMemberStatus;
  joinedAt: string;
}

export interface ListMembersResponseData {
  members: WorkspaceMemberItem[];
  pagination: PaginationMetadata;
}

export interface UpdateMemberRoleInput {
  role: "ADMIN" | "AGENT";
}

export interface UpdateMemberRoleData {
  memberId: string;
  workspaceId: string;
  role: "ADMIN" | "AGENT";
}

export interface UpdateMemberStatusInput {
  status: WorkspaceMemberStatus;
}

export interface UpdateMemberStatusData {
  memberId: string;
  workspaceId: string;
  status: WorkspaceMemberStatus;
}

export interface RemoveMemberData {
  membershipId: string;
}

// ─── Workspace Invitation Types ─────────────────────────────────────────────

export type InvitationStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";

export interface CreateInvitationInput {
  email: string;
  role: "ADMIN" | "AGENT";
}

export interface CreatedInvitationData {
  invitation: {
    id: string;
    email: string;
    role: "ADMIN" | "AGENT";
    status: InvitationStatus;
    expiresAt: string;
  };
  invitationToken?: string;
}

export interface AcceptInvitationInput {
  token: string;
}

export interface WorkspaceInvitationItem {
  _id: string;
  workspaceId: string;
  email: string;
  role: "ADMIN" | "AGENT";
  status: InvitationStatus;
  invitedBy: {
    _id: string;
    name: string;
    email: string;
  };
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListInvitationsResponseData {
  invitations: WorkspaceInvitationItem[];
  pagination: PaginationMetadata;
}

export interface RevokeInvitationData {
  invitationId: string;
}

// ─── WhatsApp Module Types ──────────────────────────────────────────────────

export type WhatsAppAccountStatus =
  | "CONNECTED"
  | "DISCONNECTED"
  | "PENDING"
  | "ERROR";

export interface ConnectWhatsAppInput {
  businessName: string;
  businessAccountId: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  accessToken: string;
}

export interface UpdateWhatsAppStatusInput {
  status: WhatsAppAccountStatus;
}

export interface WhatsAppAccountItem {
  id?: string;
  _id?: string;
  businessName: string;
  businessAccountId: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  status: WhatsAppAccountStatus;
  webhookVerified: boolean;
  connectedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WhatsAppConfigStatus {
  metaApp: {
    configured: boolean;
  };
  webhook: {
    configured: boolean;
    verified: boolean;
    callbackUrl: string | null;
  };
  workspaceAccount: {
    totalAccounts: number;
    connectedAccounts: number;
  };
}

export interface SendWhatsAppTemplateMessageInput {
  conversationId: string;
  templateId: string;
  language?: string;
  components?: Array<{
    type: "header" | "body" | "button";
    sub_type?: string;
    index?: number;
    parameters: Array<{
      type: string;
      text?: string;
      image?: Record<string, unknown>;
      document?: Record<string, unknown>;
      video?: Record<string, unknown>;
    }>;
  }>;
}

export interface SendWhatsAppTextMessageInput {
  conversationId: string;
  text: string;
}

export interface WhatsAppSentMessageData {
  _id: string;
  workspaceId: string;
  conversationId: string;
  contactId: string;
  whatsappAccountId: string;
  waMessageId: string;
  direction: "OUTBOUND";
  type: "TEXT";
  status: "SENT" | "DELIVERED" | "READ" | "FAILED";
  text: string;
  senderId: string;
  timestamp: string;
  statusUpdatedAt?: string;
}

// ─── WhatsApp Template Module Types ──────────────────────────────────────────

export type MetaTemplateCategory = "MARKETING" | "UTILITY" | "AUTHENTICATION";

export type MetaTemplateStatus =
  | "APPROVED"
  | "PENDING"
  | "REJECTED"
  | "PAUSED"
  | "DISABLED"
  | "IN_APPEAL"
  | "DELETED"
  | "DRAFT";

export interface WhatsAppTemplateButton {
  type: string;
  text?: string;
  url?: string;
  phoneNumber?: string;
}

export interface WhatsAppTemplateHeader {
  format?: string;
  text?: string;
}

export interface WhatsAppTemplateItem {
  _id: string;
  id?: string;
  workspaceId: string;
  whatsappAccountId: string;
  metaTemplateId: string;
  name: string;
  category: MetaTemplateCategory | string;
  language: string;
  status: MetaTemplateStatus | string;
  header?: WhatsAppTemplateHeader;
  body: string;
  footer?: string;
  buttons: WhatsAppTemplateButton[];
  variables: string[];
  components?: Array<Record<string, unknown>>;
  qualityScore?: string;
  rejectedReason?: string;
  syncedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TemplateCounts {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  draft: number;
  paused?: number;
}

export interface ListTemplatesParams {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ListTemplatesResponseData {
  templates: WhatsAppTemplateItem[];
  counts: TemplateCounts;
  pagination: PaginationMetadata;
}

export interface SyncTemplatesResponseData {
  syncedCount: number;
  templates: WhatsAppTemplateItem[];
}

// ─── WhatsApp Chat Module Types ──────────────────────────────────────────────

export interface WhatsAppContactItem {
  _id: string;
  workspaceId: string;
  waId: string;
  phoneNumber: string;
  profileName?: string;
  isOptedOut?: boolean;
  optOutTimestamp?: string;
  optOutSource?: "STOP_MESSAGE" | "USER_ACTION" | "API";
  optInTimestamp?: string;
  optInSource?: "START_MESSAGE" | "USER_ACTION" | "API";
  createdAt: string;
  updatedAt: string;
}

export interface CreateWhatsAppContactInput {
  phoneNumber: string;
  profileName?: string;
}

export interface UpdateWhatsAppContactInput {
  phoneNumber?: string;
  profileName?: string;
}

export interface ListContactsResponseData {
  contacts: WhatsAppContactItem[];
  pagination: PaginationMetadata;
}

export type ConversationStatus = "OPEN" | "CLOSED" | "PENDING";

export type WhatsAppMessageDirection = "INBOUND" | "OUTBOUND";
export type WhatsAppMessageType =
  | "TEXT"
  | "IMAGE"
  | "VIDEO"
  | "AUDIO"
  | "DOCUMENT"
  | "LOCATION"
  | "TEMPLATE"
  | "INTERACTIVE"
  | "CALL"
  | "UNKNOWN";
export type WhatsAppMessageStatus =
  | "RECEIVED"
  | "SENT"
  | "DELIVERED"
  | "READ"
  | "FAILED";

export interface WhatsAppMessageItem {
  _id: string;
  workspaceId: string;
  conversationId: string;
  contactId: string;
  whatsappAccountId: string;
  waMessageId?: string;
  direction: WhatsAppMessageDirection;
  type: WhatsAppMessageType;
  status: WhatsAppMessageStatus;
  text?: string;
  mediaId?: string;
  mediaMimeType?: string;
  callLogId?: string;
  senderId?: string;
  timestamp: string;
  errorMessage?: string;
  createdAt: string;
  statusUpdatedAt?: string;
}

export interface WhatsAppConversationContact {
  _id: string;
  profileName?: string;
  phoneNumber: string;
  waId: string;
  isOptedOut?: boolean;
  optOutTimestamp?: string;
  optOutSource?: string;
  optInTimestamp?: string;
  optInSource?: string;
}

export interface WhatsAppConversationAssignee {
  _id: string;
  name: string;
  email: string;
}

export interface WhatsAppConversationAccount {
  _id: string;
  businessName: string;
  displayPhoneNumber: string;
}

export interface WhatsAppConversationItem {
  _id: string;
  workspaceId: string;
  whatsappAccountId: WhatsAppConversationAccount | string;
  contactId: WhatsAppConversationContact | string;
  status: ConversationStatus;
  assignedTo?: WhatsAppConversationAssignee | string | null;
  lastMessageAt?: string;
  lastCustomerMessageAt?: string;
  isCustomerServiceWindowActive?: boolean;
  customerServiceWindowExpiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  /** Enriched by service: latest message preview */
  lastMessage?: {
    _id: string;
    text?: string;
    type: WhatsAppMessageType;
    direction: WhatsAppMessageDirection;
    status: WhatsAppMessageStatus;
    timestamp: string;
  } | null;
}

export interface ListConversationsResponseData {
  conversations: WhatsAppConversationItem[];
  pagination: PaginationMetadata;
}

export interface UpdateConversationStatusInput {
  status: ConversationStatus;
}

export interface ListMessagesResponseData {
  messages: WhatsAppMessageItem[];
  pagination: PaginationMetadata;
}

// ─── Dashboard Module Types ──────────────────────────────────────────────────

export interface DashboardOverviewStats {
  totalContacts: number;
  totalConversations: number;
  openConversations: number;
  closedConversations: number;
  pendingConversations: number;
  totalMessages: number;
  inboundMessages: number;
  outboundMessages: number;
}

export interface DashboardWhatsAppStats {
  totalAccounts: number;
  connectedAccounts: number;
  disconnectedAccounts: number;
}

export interface DashboardMessageDateStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export interface DashboardRecentConversationItem {
  id: string;
  name: string;
  phoneNumber: string;
  message: string;
  time: string;
  timestamp: string;
  initials: string;
  color: string;
  unread: number;
  status: string;
}

export interface DashboardMessageActivityItem {
  date: string;
  day: string;
  incoming: number;
  outgoing: number;
}

export interface DashboardStatsData {
  overview: DashboardOverviewStats;
  whatsapp: DashboardWhatsAppStats;
  messages: DashboardMessageDateStats;
  recentConversations: DashboardRecentConversationItem[];
  messageActivity: DashboardMessageActivityItem[];
}

// ─── Workspace Analytics Module Types ───────────────────────────────────────

export type AnalyticsPeriod = "7d" | "30d" | "90d";

export interface WorkspaceAnalyticsSummary {
  totalSent: number;
  delivered: number;
  read: number;
  failed: number;
  pending: number;
}

export interface WorkspaceAnalyticsTrend {
  totalSentChange: string;
  totalSentPositive: boolean;
  deliveredChange: string;
  deliveredPositive: boolean;
  readChange: string;
  readPositive: boolean;
  failedChange: string;
  failedPositive: boolean;
}

export interface WorkspaceAnalyticsRates {
  deliveryRate: number;
  readRate: number;
  failureRate: number;
}

export interface WorkspaceAnalyticsTimeSeriesItem {
  date: string;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
}

export interface WorkspaceAnalyticsStatusItem {
  name: string;
  value: number;
}

export interface WorkspaceAnalyticsCampaignItem {
  id: string;
  name: string;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  status: string;
  createdAt: string;
}

export interface WorkspaceAnalyticsData {
  period: AnalyticsPeriod;
  summary: WorkspaceAnalyticsSummary;
  trends: WorkspaceAnalyticsTrend;
  rates: WorkspaceAnalyticsRates;
  chartData: WorkspaceAnalyticsTimeSeriesItem[];
  statusData: WorkspaceAnalyticsStatusItem[];
  campaigns: WorkspaceAnalyticsCampaignItem[];
}

// ─── Campaign Module Types ──────────────────────────────────────────────────

export type BackendCampaignStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "PROCESSING"
  | "PAUSED"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type CampaignAudienceMode = "ALL_CONTACTS" | "SELECTED_CONTACTS";

export interface CampaignAudience {
  mode: CampaignAudienceMode;
  contactIds: string[];
}

export interface CampaignItem {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  whatsappAccountId: string;
  templateId: string;
  audience: CampaignAudience;
  status: BackendCampaignStatus;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdBy: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListCampaignsParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ListCampaignsResponseData {
  campaigns: CampaignItem[];
  pagination: PaginationMetadata;
}

export interface CreateCampaignPayload {
  name: string;
  description?: string;
  whatsappAccountId: string;
  templateId: string;
  audience: {
    mode: CampaignAudienceMode;
    contactIds?: string[];
  };
}

export interface UpdateCampaignPayload {
  name?: string;
  description?: string;
  whatsappAccountId?: string;
  templateId?: string;
  audience?: {
    mode: CampaignAudienceMode;
    contactIds?: string[];
  };
}

export interface ScheduleCampaignPayload {
  scheduledAt: string;
}

export interface CampaignRecipientItem {
  id: string;
  campaignId: string;
  contactId: string;
  phoneNumber: string;
  status: "PENDING" | "PROCESSING" | "SENT" | "DELIVERED" | "READ" | "FAILED";
  providerMessageId: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  failedAt: string | null;
}

export interface ListCampaignRecipientsResponseData {
  recipients: CampaignRecipientItem[];
  pagination: PaginationMetadata;
}

// ─── Workspace Support Ticket Types ─────────────────────────────────────────

export type SupportTicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type SupportTicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export interface SupportTicketAttachment {
  filename: string;
  url: string;
}

export interface SupportTicketMessage {
  _id?: string;
  id?: string;
  senderId: string;
  senderRole: "CUSTOMER" | "PLATFORM_ADMIN";
  senderName?: string;
  content: string;
  attachments?: SupportTicketAttachment[];
  createdAt: string;
}

export interface SupportTicketItem {
  _id?: string;
  id?: string;
  ticketNumber: string;
  workspaceId: string;
  workspaceName: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  category?: string;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  assignedAdmin?: {
    _id: string;
    name: string;
    email: string;
    platformRole?: string;
  } | null;
  messages: SupportTicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}

export interface ListSupportTicketsResponseData {
  items: SupportTicketItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  stats?: SupportTicketStats;
}

export interface CreateSupportTicketPayload {
  workspaceId?: string;
  subject: string;
  priority?: SupportTicketPriority;
  category?: string;
  description: string;
  customerName?: string;
  customerEmail?: string;
}

export interface AddSupportTicketMessagePayload {
  content: string;
  attachments?: SupportTicketAttachment[];
}

// ─── Workspace Settings Types ───────────────────────────────────────────────

export interface BusinessProfile {
  businessName: string;
  businessEmail: string;
  phoneNumber: string;
  website: string;
  industry: string;
  timezone: string;
  country: string;
  description: string;
}

export interface WhatsAppConfiguration {
  phoneNumberId: string;
  businessAccountId: string;
  displayPhoneNumber: string;
  connectionStatus: "CONNECTED" | "DISCONNECTED" | "PENDING" | "ERROR";
  webhookVerified?: boolean;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  campaignUpdates: boolean;
  messageFailureAlerts: boolean;
  teamActivityAlerts: boolean;
  weeklyReports: boolean;
  productUpdates: boolean;
}

export interface SecurityPreferences {
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  sessionTimeout: string;
}

export interface ApiPreferences {
  apiKey?: string;
  webhookUrl: string;
  webhookSecret?: string;
  webhookEvents: string[];
}

export interface WorkspaceSettingsData {
  _id?: string;
  workspaceId: string;
  business: BusinessProfile;
  notifications: NotificationPreferences;
  security: SecurityPreferences;
  api: ApiPreferences;
  updatedAt?: string;
}

export interface UpdateWorkspaceSettingsPayload {
  business?: Partial<BusinessProfile>;
  notifications?: Partial<NotificationPreferences>;
  security?: Partial<SecurityPreferences>;
  api?: Partial<ApiPreferences>;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// ─── Workspace Automation Types ───────────────────────────────────────────

export type AutomationTriggerType =
  | "NEW_CONTACT"
  | "INCOMING_MESSAGE"
  | "KEYWORD_MATCH"
  | "AWAY_HOURS"
  | "NO_REPLY";

export type AutomationActionType =
  | "SEND_MESSAGE"
  | "SEND_TEMPLATE"
  | "ASSIGN_AGENT"
  | "ADD_TAGS"
  | "CREATE_TICKET";

export interface AutomationRuleActionConfig {
  messageBody?: string;
  templateName?: string;
  templateLanguage?: string;
  assignedUserId?: string;
  tags?: string[];
  ticketPriority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}

export interface AutomationRuleItem {
  _id: string;
  workspaceId: string;
  name: string;
  description?: string;
  trigger: AutomationTriggerType;
  keywords?: string[];
  matchType?: "EXACT" | "CONTAINS" | "STARTS_WITH";
  action: AutomationActionType;
  actionConfig: AutomationRuleActionConfig;
  isActive: boolean;
  executionsCount: number;
  lastExecutedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAutomationRulePayload {
  name: string;
  description?: string;
  trigger: AutomationTriggerType;
  keywords?: string[];
  matchType?: "EXACT" | "CONTAINS" | "STARTS_WITH";
  action: AutomationActionType;
  actionConfig?: AutomationRuleActionConfig;
  isActive?: boolean;
}

export interface UpdateAutomationRulePayload {
  name?: string;
  description?: string;
  trigger?: AutomationTriggerType;
  keywords?: string[];
  matchType?: "EXACT" | "CONTAINS" | "STARTS_WITH";
  action?: AutomationActionType;
  actionConfig?: AutomationRuleActionConfig;
  isActive?: boolean;
}


