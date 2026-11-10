"use client";

import { useEffect, useState, useTransition } from "react";
import DashboardLayout from "@/src/component/dashboard/dashboard-layout";
import { useWorkspace } from "@/src/context/workspace-context";
import { whatsappService } from "@/src/services/whatsapp-service";
import type {
  WhatsAppAccountItem,
  WhatsAppConfigStatus,
} from "@/src/types/api";
import { ApiClientError } from "@/src/lib/api-client";
import {
  deriveWhatsAppStatus,
  selectConfigForWorkspace,
  validateWabaId,
} from "@/src/lib/whatsapp-status";
import {
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Plug,
  Phone,
  ShieldCheck,
  Webhook,
  Copy,
  ExternalLink,
  Loader2,
  Trash2,
  Building2,
  Hash,
  KeyRound,
  RefreshCw,
  Power,
  Layers,
  Link2,
  Info,
} from "lucide-react";

export default function WhatsAppIntegrationPage() {
  const { activeWorkspace, isLoading: workspaceLoading } = useWorkspace();

  const [accounts, setAccounts] = useState<WhatsAppAccountItem[]>([]);
  const [configState, setConfigState] = useState<{
    workspaceId: string;
    data: WhatsAppConfigStatus;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActionPending, startTransition] = useTransition();

  const [showCredentials, setShowCredentials] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form input state
  const [businessName, setBusinessName] = useState("");
  const [displayPhoneNumber, setDisplayPhoneNumber] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [businessAccountId, setBusinessAccountId] = useState("");
  const [accessToken, setAccessToken] = useState("");

  const role = activeWorkspace?.role;
  const canManage = role === "OWNER" || role === "ADMIN";

  // Ignore configuration fetched for a different workspace (prevents stale data).
  const configStatus = selectConfigForWorkspace(
    configState?.data ?? null,
    configState?.workspaceId ?? null,
    activeWorkspace?.id ?? null,
  );

  const status = deriveWhatsAppStatus(configStatus, {
    totalAccounts: accounts.length,
    connectedAccounts: accounts.filter((acc) => acc.status === "CONNECTED")
      .length,
  });
  console.log(status);
  const backendCallbackUrl = status.callbackUrl;

  // Fetch accounts and config status on workspace change
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!activeWorkspace?.id) {
        setAccounts([]);
        setConfigState(null);
        setIsLoading(false);
        return;
      }

      const workspaceId = activeWorkspace.id;

      setConfigState(null);
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [accountsData, configData] = await Promise.all([
          canManage
            ? whatsappService.getAccounts(workspaceId)
            : Promise.resolve([]),
          whatsappService.getConfigStatus(workspaceId).catch(() => null),
        ]);

        // console.log(accountsData);

        if (isMounted) {
          setAccounts(accountsData);
          setConfigState(configData ? { workspaceId, data: configData } : null);
        }
      } catch (err) {
        if (isMounted) {
          if (err instanceof ApiClientError) {
            setErrorMessage(err.message);
          } else if (err instanceof Error) {
            setErrorMessage(err.message);
          } else {
            setErrorMessage("Failed to load WhatsApp data");
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [activeWorkspace?.id, canManage]);

  async function copyWebhookUrl() {
    if (!backendCallbackUrl) return;

    try {
      await navigator.clipboard.writeText(backendCallbackUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function handleConnectAccount(e: React.FormEvent) {
    e.preventDefault();

    if (!activeWorkspace?.id) {
      setErrorMessage("No active workspace selected");
      return;
    }

    if (!canManage) {
      setErrorMessage(
        "You do not have permission to connect WhatsApp accounts",
      );
      return;
    }

    // Client validation matching backend schema
    if (businessName.trim().length < 2) {
      setErrorMessage("Business name must be at least 2 characters");
      return;
    }
    if (displayPhoneNumber.trim().length < 5) {
      setErrorMessage("Display phone number must be at least 5 characters");
      return;
    }
    if (phoneNumberId.trim().length < 5) {
      setErrorMessage("Invalid Phone Number ID");
      return;
    }
    const wabaValidation = validateWabaId(businessAccountId);
    if (!wabaValidation.valid) {
      setErrorMessage(
        wabaValidation.error || "Invalid WhatsApp Business Account ID",
      );
      return;
    }
    if (accessToken.trim().length < 20) {
      setErrorMessage("Access token must be at least 20 characters");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const newAccount = await whatsappService.connectAccount(
        activeWorkspace.id,
        {
          businessName: businessName.trim(),
          displayPhoneNumber: displayPhoneNumber.trim(),
          phoneNumberId: phoneNumberId.trim(),
          businessAccountId: businessAccountId.trim(),
          accessToken: accessToken.trim(),
        },
      );

      // Clean token and fields immediately from memory
      setAccessToken("");
      setBusinessName("");
      setDisplayPhoneNumber("");
      setPhoneNumberId("");
      setBusinessAccountId("");
      setShowCredentials(false);

      setAccounts((prev) => [newAccount, ...prev]);
      setSuccessMessage("WhatsApp account connected successfully!");
    } catch (err) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to connect WhatsApp account");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDisconnect(accountId: string) {
    if (!activeWorkspace?.id) return;
    if (
      !confirm("Are you sure you want to disconnect this WhatsApp account?")
    ) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        await whatsappService.disconnectAccount(activeWorkspace.id, accountId);
        setAccounts((prev) =>
          prev.filter((acc) => (acc.id || acc._id) !== accountId),
        );
        setSuccessMessage("WhatsApp account disconnected successfully");
      } catch (err) {
        if (err instanceof ApiClientError) {
          setErrorMessage(err.message);
        } else if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage("Failed to disconnect WhatsApp account");
        }
      }
    });
  }

  async function handleToggleStatus(
    accountId: string,
    currentStatus: WhatsAppAccountItem["status"],
  ) {
    if (!activeWorkspace?.id) return;

    const nextStatus =
      currentStatus === "CONNECTED" ? "DISCONNECTED" : "CONNECTED";

    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const updated = await whatsappService.updateAccountStatus(
          activeWorkspace.id,
          accountId,
          nextStatus,
        );
        setAccounts((prev) =>
          prev.map((acc) =>
            (acc.id || acc._id) === accountId ? updated : acc,
          ),
        );
        setSuccessMessage(
          `Account status updated to ${nextStatus.toLowerCase()}`,
        );
      } catch (err) {
        if (err instanceof ApiClientError) {
          setErrorMessage(err.message);
        } else if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage("Failed to update account status");
        }
      }
    });
  }

  const primaryAccount = accounts[0];
  const isConnected = primaryAccount?.status === "CONNECTED";

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-8 p-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Plug size={16} />
            <span>Configuration / Integrations</span>
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            WhatsApp Integration
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Connect your WhatsApp Business Platform to manage messages,
            contacts, campaigns, and automated conversations from VexChat.
          </p>
        </div>

        {/* Global Notifications */}
        {errorMessage && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
            <div className="flex-1">
              <p className="font-semibold">Integration Notice</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0 text-green-600"
            />
            <div className="flex-1">
              <p className="font-semibold">Success</p>
              <p className="mt-0.5">{successMessage}</p>
            </div>
          </div>
        )}

        {!canManage && !workspaceLoading && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold">Read-Only Permission</p>
              <p className="mt-0.5">
                Your role ({role || "AGENT"}) has read-only access. Only
                Workspace Owners and Administrators can manage WhatsApp Business
                integrations.
              </p>
            </div>
          </div>
        )}

        {/* Platform Configuration Status (independent of workspace accounts) */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Layers size={16} className="text-slate-400" />
                Meta Developer App
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  !status.hasConfigData
                    ? "bg-slate-100 text-slate-600"
                    : status.metaAppConfigured
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                }`}
              >
                {!status.hasConfigData
                  ? "Unknown"
                  : status.metaAppConfigured
                    ? "Configured"
                    : "Not configured"}
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              {!status.hasConfigData
                ? "Platform configuration could not be loaded from the backend."
                : status.metaAppConfigured
                  ? "Backend Meta App credentials are present and ready for Graph API calls."
                  : "Backend Meta App ID and App Secret are missing. Configure them before connecting accounts."}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Webhook size={16} className="text-slate-400" />
                Webhook Configuration
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  status.webhookState === "verified"
                    ? "bg-green-100 text-green-700"
                    : status.webhookState === "listening"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                {status.webhookState === "verified"
                  ? "Verified"
                  : status.webhookState === "listening"
                    ? "Listening"
                    : "Pending"}
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              {status.webhookState === "verified"
                ? "Meta completed the GET verification handshake for this platform."
                : status.webhookState === "listening"
                  ? "Verify token is configured. Complete the Meta handshake to finish verification."
                  : "Webhook verify token is not configured on the backend."}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <MessageCircle size={16} className="text-slate-400" />
                Workspace Accounts
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  status.workspaceAccountState === "connected"
                    ? "bg-green-100 text-green-700"
                    : status.workspaceAccountState === "disconnected"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                {status.workspaceAccountState === "connected"
                  ? `${status.connectedAccounts} Connected`
                  : status.workspaceAccountState === "disconnected"
                    ? `${status.disconnectedAccounts} Disconnected`
                    : "None"}
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              {status.totalAccounts === 0
                ? "This workspace has no WhatsApp accounts linked yet. The platform can still be configured."
                : `${status.connectedAccounts} of ${status.totalAccounts} accounts connected in this workspace.`}
            </p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Main Account Management Card */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-4 border-b border-slate-100 p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#88da1c]/15">
                <MessageCircle size={30} className="text-green-700" />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-slate-900">
                  WhatsApp Business Platform
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Meta WhatsApp Cloud API
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isLoading
                    ? "bg-slate-100 text-slate-600"
                    : isConnected
                      ? "bg-green-100 text-green-700"
                      : primaryAccount?.status === "DISCONNECTED"
                        ? "bg-slate-100 text-slate-700"
                        : primaryAccount?.status === "ERROR"
                          ? "bg-red-100 text-red-700"
                          : primaryAccount?.status === "PENDING"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-amber-100 text-amber-700"
                }`}
              >
                {isLoading
                  ? "Loading..."
                  : isConnected
                    ? "Connected"
                    : primaryAccount?.status === "DISCONNECTED"
                      ? "Disconnected"
                      : primaryAccount?.status === "ERROR"
                        ? "Connection Error"
                        : primaryAccount?.status === "PENDING"
                          ? "Pending Verification"
                          : "Not Connected"}
              </span>
            </div>

            <div className="space-y-5 p-6">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-slate-400"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Secure API configuration
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Access tokens are validated against Meta Graph API,
                    encrypted using AES-256 before storage, and never exposed.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={20} className="mt-0.5 shrink-0 text-slate-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Business phone number
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Use a phone number registered with your Meta WhatsApp
                    Business account.
                  </p>
                </div>
              </div>

              {/* Connected Account Display */}
              {primaryAccount && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {primaryAccount.businessName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {primaryAccount.displayPhoneNumber}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        primaryAccount.status === "CONNECTED"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {primaryAccount.status}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>
                      <span className="font-medium text-slate-500">
                        Phone Number ID:
                      </span>
                      <p className="font-mono text-slate-800">
                        {primaryAccount.phoneNumberId}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-500">
                        WABA ID:
                      </span>
                      <p className="font-mono text-slate-800">
                        {primaryAccount.businessAccountId}
                      </p>
                    </div>
                    {primaryAccount.connectedAt && (
                      <div className="col-span-2 mt-1">
                        <span className="font-medium text-slate-500">
                          Connected:
                        </span>{" "}
                        <span className="text-slate-700">
                          {new Date(
                            primaryAccount.connectedAt,
                          ).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {canManage && (
                    <div className="mt-4 flex gap-2 border-t border-slate-200 pt-3">
                      <button
                        type="button"
                        disabled={isActionPending}
                        onClick={() =>
                          handleToggleStatus(
                            primaryAccount.id || primaryAccount._id!,
                            primaryAccount.status,
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                      >
                        <Power size={13} />
                        {primaryAccount.status === "CONNECTED"
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                      <button
                        type="button"
                        disabled={isActionPending}
                        onClick={() =>
                          handleDisconnect(
                            primaryAccount.id || primaryAccount._id!,
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                        Disconnect
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Configure/Toggle Button */}
              {canManage && (
                <button
                  type="button"
                  onClick={() => setShowCredentials((value) => !value)}
                  className="w-full rounded-xl bg-[#88da1c] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#79c518]"
                >
                  {showCredentials
                    ? "Hide Configuration"
                    : primaryAccount
                      ? "Connect Another Account"
                      : "Configure Integration"}
                </button>
              )}

              {/* Connection Form */}
              {showCredentials && canManage && (
                <form
                  onSubmit={handleConnectAccount}
                  className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div>
                    <label
                      htmlFor="business-name"
                      className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700"
                    >
                      <Building2 size={15} className="text-slate-400" />
                      Business Name
                    </label>
                    <input
                      id="business-name"
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Acme Support"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#88da1c] focus:ring-2 focus:ring-[#88da1c]/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="display-phone"
                      className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700"
                    >
                      <Phone size={15} className="text-slate-400" />
                      Display Phone Number
                    </label>
                    <input
                      id="display-phone"
                      type="text"
                      required
                      value={displayPhoneNumber}
                      onChange={(e) => setDisplayPhoneNumber(e.target.value)}
                      placeholder="e.g. +1 555-0199"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#88da1c] focus:ring-2 focus:ring-[#88da1c]/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone-number-id"
                      className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700"
                    >
                      <Hash size={15} className="text-slate-400" />
                      Phone Number ID
                    </label>
                    <input
                      id="phone-number-id"
                      type="text"
                      required
                      value={phoneNumberId}
                      onChange={(e) => setPhoneNumberId(e.target.value)}
                      placeholder="e.g. 100987654321098"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#88da1c] focus:ring-2 focus:ring-[#88da1c]/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="business-account-id"
                      className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700"
                    >
                      <Hash size={15} className="text-slate-400" />
                      WhatsApp Business Account ID (WABA ID)
                    </label>
                    <input
                      id="business-account-id"
                      type="text"
                      required
                      value={businessAccountId}
                      onChange={(e) => setBusinessAccountId(e.target.value)}
                      placeholder="e.g. 100234567890123"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#88da1c] focus:ring-2 focus:ring-[#88da1c]/20"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Found in Meta Business Manager under Business Settings &
                      Accounts & WhatsApp Accounts. Numeric ID only.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="access-token"
                      className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700"
                    >
                      <KeyRound size={15} className="text-slate-400" />
                      System User Access Token
                    </label>
                    <input
                      id="access-token"
                      type="password"
                      required
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      placeholder="Permanent Meta System User Token (min 20 chars)"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#88da1c] focus:ring-2 focus:ring-[#88da1c]/20"
                    />
                  </div>

                  <p className="text-xs leading-5 text-slate-500">
                    The backend verifies credentials directly with Meta Graph
                    API before saving. Tokens are encrypted using AES-256 and
                    never stored in local storage.
                  </p>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#88da1c] px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-[#79c518] disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Validating with Meta...
                        </>
                      ) : (
                        "Connect Account"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCredentials(false)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-slate-500"
                />
                <p className="text-xs leading-5 text-slate-600">
                  Real API credentials require a verified Meta Developer App and
                  WhatsApp Business Cloud API access. For sandbox testing, use
                  test numbers provided in your Meta App Dashboard.
                </p>
              </div>
            </div>
          </section>

          {/* Webhook Configuration Section */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                  <Webhook size={22} className="text-slate-700" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">Webhook Settings</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Platform-level Meta callback configuration
                  </p>
                </div>
              </div>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  status.webhookState === "verified"
                    ? "bg-green-100 text-green-700"
                    : status.webhookState === "listening"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                {status.webhookState === "verified"
                  ? "Verified"
                  : status.webhookState === "listening"
                    ? "Listening"
                    : "Pending"}
              </span>
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-500">
              Meta calls this public HTTPS endpoint to verify the webhook and to
              deliver incoming messages and delivery status updates.
            </p>

            <label
              htmlFor="webhook-url"
              className="mb-2 mt-5 block text-sm font-semibold text-slate-700"
            >
              Public HTTPS Callback URL
            </label>

            <div className="flex items-stretch gap-2">
              <input
                id="webhook-url"
                readOnly
                value={backendCallbackUrl ?? ""}
                placeholder="No public HTTPS URL configured"
                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-600 outline-none"
              />

              <button
                type="button"
                onClick={copyWebhookUrl}
                disabled={!backendCallbackUrl}
                aria-label="Copy webhook URL"
                className="flex shrink-0 items-center justify-center rounded-lg border border-slate-200 px-3 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copied ? (
                  <CheckCircle2 size={17} className="text-green-600" />
                ) : (
                  <Copy size={17} />
                )}
              </button>
            </div>

            {backendCallbackUrl ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs leading-5 text-green-700">
                <Link2 size={13} className="shrink-0" />
                {copied
                  ? "Copied to clipboard."
                  : "Use this exact URL as the Callback URL in Meta Developer Dashboard."}
              </p>
            ) : (
              <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>
                  No public HTTPS callback URL is configured. Set{" "}
                  <code className="font-mono">WEBHOOK_PUBLIC_URL</code>{" "}
                  (preferred) or{" "}
                  <code className="font-mono">PUBLIC_API_URL</code> on the
                  backend. Localhost and plain HTTP URLs are never accepted by
                  Meta.
                </span>
              </div>
            )}

            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                <Info size={15} className="text-slate-500" />
                Meta Developer Dashboard setup
              </h3>

              <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm text-slate-600">
                <li>
                  Open your Meta App Dashboard, then go to{" "}
                  <span className="font-medium text-slate-800">
                    WhatsApp & Configuration
                  </span>
                  .
                </li>
                <li>
                  Paste the public HTTPS callback URL above into the{" "}
                  <span className="font-medium text-slate-800">
                    Callback URL
                  </span>{" "}
                  field.
                </li>
                <li>
                  Enter the{" "}
                  <span className="font-medium text-slate-800">
                    Verify Token
                  </span>{" "}
                  using exactly the same value configured in the backend{" "}
                  <code className="font-mono">META_WEBHOOK_VERIFY_TOKEN</code>{" "}
                  environment variable. The token is stored securely on the
                  server and is never displayed here.
                </li>
                <li>
                  Subscribe to the <code className="font-mono">messages</code>{" "}
                  webhook field, then click{" "}
                  <span className="font-medium text-slate-800">
                    Verify and Save
                  </span>
                  .
                </li>
                <li>
                  Confirm the status above changes to{" "}
                  <span className="font-medium text-slate-800">Verified</span>{" "}
                  after Meta completes the GET verification handshake.
                </li>
              </ol>
            </div>

            <a
              href="https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-800 transition hover:text-green-700"
            >
              Meta webhook documentation
              <ExternalLink size={15} />
            </a>
          </section>
        </div>

        {/* Integration Actions / Summary Section */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Workspace Accounts Overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {activeWorkspace
                  ? `Active Workspace: ${activeWorkspace.name}`
                  : "No workspace selected"}
              </p>
            </div>

            {canManage && (
              <button
                type="button"
                disabled={isLoading}
                onClick={async () => {
                  if (!activeWorkspace?.id) return;
                  setIsLoading(true);
                  try {
                    const data = await whatsappService.getAccounts(
                      activeWorkspace.id,
                    );
                    setAccounts(data);
                    setSuccessMessage("Account list refreshed");
                  } catch (err) {
                    setErrorMessage("Failed to refresh accounts");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={isLoading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            )}
          </div>

          <div className="mt-5">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-slate-400" />
              </div>
            ) : accounts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                <MessageCircle size={32} className="mx-auto text-slate-300" />
                <p className="mt-2 text-sm font-medium text-slate-700">
                  No WhatsApp accounts connected
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {canManage
                    ? "Click 'Configure Integration' above to link your Meta WhatsApp Business Account."
                    : "An administrator must connect a WhatsApp account to enable messaging."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map((acc) => {
                  const accId = acc.id || acc._id || "";
                  return (
                    <div
                      key={accId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#88da1c]/15 text-green-700">
                          <MessageCircle size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {acc.businessName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {acc.displayPhoneNumber} &bull; WABA:{" "}
                            {acc.businessAccountId}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            acc.status === "CONNECTED"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {acc.status}
                        </span>

                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleDisconnect(accId)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition"
                            title="Disconnect account"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
