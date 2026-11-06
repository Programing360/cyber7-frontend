"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Layers,
  MessageCircle,
  Webhook,
} from "lucide-react";
import type {
  DashboardWhatsAppStats,
  WhatsAppConfigStatus,
} from "@/src/types/api";
import { whatsappService } from "@/src/services/whatsapp-service";
import {
  deriveWhatsAppStatus,
  selectConfigForWorkspace,
} from "@/src/lib/whatsapp-status";

interface WhatsAppStatusProps {
  whatsapp?: DashboardWhatsAppStats;
  workspaceId?: string;
  isLoading?: boolean;
}

export default function WhatsAppStatus({
  whatsapp,
  workspaceId,
  isLoading = false,
}: WhatsAppStatusProps) {
  const [configState, setConfigState] = useState<{
    workspaceId: string;
    data: WhatsAppConfigStatus;
  } | null>(null);
  const [isConfigLoading, setIsConfigLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!workspaceId) {
      setConfigState(null);
      setIsConfigLoading(false);
      return;
    }

    setConfigState(null);
    setIsConfigLoading(true);
    whatsappService
      .getConfigStatus(workspaceId)
      .then((data) => {
        if (isMounted) setConfigState({ workspaceId, data });
      })
      .catch(() => {
        if (isMounted) setConfigState(null);
      })
      .finally(() => {
        if (isMounted) setIsConfigLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [workspaceId]);

  if (isLoading || isConfigLoading) {
    return (
      <section className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 shrink-0 rounded-xl bg-slate-100" />
          <div className="min-w-0 flex-1">
            <div className="h-5 w-36 rounded bg-slate-100" />
            <div className="mt-2 h-4 w-48 rounded bg-slate-100" />
            <div className="mt-3 h-4 w-28 rounded bg-slate-100" />
            <div className="mt-3 h-3 w-64 rounded bg-slate-100" />
            <div className="mt-4 h-10 w-44 rounded-xl bg-slate-100" />
          </div>
        </div>
      </section>
    );
  }

  // Ignore configuration fetched for a different workspace (prevents stale data).
  const configStatus = selectConfigForWorkspace(
    configState?.data ?? null,
    configState?.workspaceId ?? null,
    workspaceId ?? null,
  );

  const status = deriveWhatsAppStatus(configStatus, whatsapp);
  console.log(status, configStatus);
  const {
    hasConfigData,
    metaAppConfigured: isMetaAppConfigured,
    webhookVerified: isWebhookVerified,
    webhookConfigured: isWebhookConfigured,
    totalAccounts,
    connectedAccounts: connectedCount,
    disconnectedAccounts: disconnectedCount,
    workspaceAccountState,
  } = status;

  const isConnected = workspaceAccountState === "connected";
  const hasAccounts = workspaceAccountState !== "none";

  return (
    <section
      className={`rounded-2xl border bg-white p-5 shadow-sm sm:p-6 ${
        isConnected
          ? "border-green-200"
          : hasAccounts
            ? "border-red-200"
            : "border-slate-200"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
          <MessageCircle size={24} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-bold text-slate-900">WhatsApp Business</h2>
            {isConnected ? (
              <CheckCircle2 size={18} className="shrink-0 text-green-500" />
            ) : (
              <AlertCircle
                size={18}
                className={`shrink-0 ${hasAccounts ? "text-red-500" : "text-amber-500"}`}
              />
            )}
          </div>

          <p className="mt-1 text-sm text-slate-500">
            {isConnected
              ? "Your WhatsApp connection is active."
              : hasAccounts
                ? "Account requires attention to resume messaging."
                : !hasConfigData
                  ? "Unable to load platform configuration status."
                  : isMetaAppConfigured
                    ? "Platform ready: Connect your WhatsApp Business number."
                    : "Meta Developer App credentials required in backend."}
          </p>

          {/* 3 Distinct Dimension Badges: Meta App, Webhook, Workspace Account */}
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {/* 1. Meta Developer App */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs">
              <Layers size={13} className="shrink-0 text-slate-500" />
              <div className="min-w-0 flex-1 truncate">
                <span className="text-slate-500">Meta App: </span>
                <span
                  className={`font-semibold ${
                    !hasConfigData
                      ? "text-slate-600"
                      : isMetaAppConfigured
                        ? "text-green-700"
                        : "text-amber-700"
                  }`}
                >
                  {!hasConfigData
                    ? "Unknown"
                    : isMetaAppConfigured
                      ? "Configured"
                      : "Missing"}
                </span>
              </div>
            </div>

            {/* 2. Webhook Gateway */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs">
              <Webhook size={13} className="shrink-0 text-slate-500" />
              <div className="min-w-0 flex-1 truncate">
                <span className="text-slate-500">Webhook: </span>
                <span
                  className={`font-semibold ${
                    !hasConfigData
                      ? "text-slate-600"
                      : isWebhookVerified
                        ? "text-green-700"
                        : isWebhookConfigured
                          ? "text-amber-700"
                          : "text-slate-600"
                  }`}
                >
                  {!hasConfigData
                    ? "Unknown"
                    : isWebhookVerified
                      ? "Verified"
                      : isWebhookConfigured
                        ? "Listening"
                        : "Pending"}
                </span>
              </div>
            </div>

            {/* 3. Workspace WhatsApp Accounts */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs">
              <MessageCircle size={13} className="shrink-0 text-slate-500" />
              <div className="min-w-0 flex-1 truncate">
                <span className="text-slate-500">Accounts: </span>
                <span
                  className={`font-semibold ${
                    isConnected
                      ? "text-green-700"
                      : hasAccounts
                        ? "text-red-700"
                        : "text-slate-600"
                  }`}
                >
                  {isConnected
                    ? `${connectedCount} Connected`
                    : hasAccounts
                      ? `${disconnectedCount} Disconnected`
                      : "None"}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            {isConnected
              ? `${connectedCount} of ${totalAccounts} WhatsApp Business accounts connected and operational.`
              : hasAccounts
                ? "All registered accounts are currently disconnected. Re-authenticate to resume."
                : !hasConfigData
                  ? "Platform configuration status could not be retrieved. Retry to see the current Meta App state."
                  : isMetaAppConfigured
                    ? "Meta Developer App credentials are valid. Link your WhatsApp Business number to start sending messages."
                    : "Meta Developer App credentials are required in backend environment to connect."}
          </p>

          <Link
            href="/integrations/whatsapp"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#88da1c] px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-[#79c518]"
          >
            {isConnected ? "Manage Accounts" : "Configure Integration"}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
