import type { WhatsAppConfigStatus } from "../types/api";

export type WebhookDisplayState = "verified" | "listening" | "pending";

export type WorkspaceAccountDisplayState =
  | "connected"
  | "disconnected"
  | "none";

export interface WhatsAppStatusFallbackCounts {
  totalAccounts?: number;
  connectedAccounts?: number;
  disconnectedAccounts?: number;
}

export interface WhatsAppStatusSummary {
  hasConfigData: boolean;
  metaAppConfigured: boolean;
  webhookConfigured: boolean;
  webhookVerified: boolean;
  webhookState: WebhookDisplayState;
  hasPublicCallbackUrl: boolean;
  callbackUrl: string | null;
  totalAccounts: number;
  connectedAccounts: number;
  disconnectedAccounts: number;
  workspaceAccountState: WorkspaceAccountDisplayState;
}

/**
 * Only returns configuration that belongs to the currently active workspace.
 * This prevents a previous workspace's configuration from being rendered while
 * a new workspace request is still in flight.
 */
export function selectConfigForWorkspace(
  config: WhatsAppConfigStatus | null,
  configWorkspaceId: string | null,
  activeWorkspaceId: string | null,
): WhatsAppConfigStatus | null {
  if (!config || !configWorkspaceId || !activeWorkspaceId) {
    return null;
  }

  return configWorkspaceId === activeWorkspaceId ? config : null;
}

export function deriveWhatsAppStatus(
  configStatus: WhatsAppConfigStatus | null,
  fallback?: WhatsAppStatusFallbackCounts,
): WhatsAppStatusSummary {
  const totalAccounts =
    configStatus?.workspaceAccount.totalAccounts ??
    fallback?.totalAccounts ??
    0;
  const connectedAccounts =
    configStatus?.workspaceAccount.connectedAccounts ??
    fallback?.connectedAccounts ??
    0;
  const disconnectedAccounts =
    fallback?.disconnectedAccounts ??
    Math.max(0, totalAccounts - connectedAccounts);

  const hasConfigData = configStatus !== null;
  const metaAppConfigured = configStatus?.metaApp.configured ?? false;
  const webhookConfigured = configStatus?.webhook.configured ?? false;
  const webhookVerified = configStatus?.webhook.verified ?? false;
  const callbackUrl = configStatus?.webhook.callbackUrl ?? null;

  const webhookState: WebhookDisplayState = webhookVerified
    ? "verified"
    : webhookConfigured
      ? "listening"
      : "pending";

  const workspaceAccountState: WorkspaceAccountDisplayState =
    connectedAccounts > 0
      ? "connected"
      : totalAccounts > 0
        ? "disconnected"
        : "none";

  return {
    hasConfigData,
    metaAppConfigured,
    webhookConfigured,
    webhookVerified,
    webhookState,
    hasPublicCallbackUrl: Boolean(callbackUrl),
    callbackUrl,
    totalAccounts,
    connectedAccounts,
    disconnectedAccounts,
    workspaceAccountState,
  };
}
