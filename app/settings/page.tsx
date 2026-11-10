"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import {
  Activity,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Code2,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  MessageCircle,
  RefreshCw,
  Save,
  ShieldCheck,
  Smartphone,
  UserRound,
  Webhook,
  X,
} from "lucide-react";

import DashboardLayout from "@/src/component/dashboard/dashboard-layout";
import { useWorkspace } from "@/src/context/workspace-context";
import { useAuth } from "@/src/context/auth-context";
import settingsService from "@/src/services/settings-service";
import { whatsappService } from "@/src/services/whatsapp-service";
import type {
  WhatsAppAccountItem,
  WhatsAppConfigStatus,
  BusinessProfile,
  WhatsAppConfiguration,
  NotificationPreferences,
  SecurityPreferences,
  ApiPreferences,
} from "@/src/types/api";

type SettingsTab =
  | "business"
  | "whatsapp"
  | "notifications"
  | "security"
  | "api";

const tabs: {
  id: SettingsTab;
  label: string;
  description: string;
  icon: ReactNode;
}[] = [
  {
    id: "business",
    label: "Business Profile",
    description: "Business details and preferences",
    icon: <UserRound size={18} />,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    description: "WhatsApp Business configuration",
    icon: <MessageCircle size={18} />,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Alerts and email preferences",
    icon: <Bell size={18} />,
  },
  {
    id: "security",
    label: "Security",
    description: "Account security preferences",
    icon: <ShieldCheck size={18} />,
  },
  {
    id: "api",
    label: "API & Webhooks",
    description: "API and webhook configuration",
    icon: <Code2 size={18} />,
  },
];

const industryOptions = [
  "Technology",
  "E-commerce",
  "Education",
  "Healthcare",
  "Finance",
  "Retail",
  "Real Estate",
  "Professional Services",
  "Other",
];

const timezoneOptions = [
  "Asia/Dhaka",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Europe/London",
  "America/New_York",
  "UTC",
];

const sessionTimeoutOptions = [
  { label: "15 minutes", value: "15" },
  { label: "30 minutes", value: "30" },
  { label: "1 hour", value: "60" },
  { label: "4 hours", value: "240" },
];

const eventOptions = [
  {
    value: "message.delivered",
    label: "Message delivered",
    description:
      "Fires when a WhatsApp message is successfully delivered to recipient",
  },
  {
    value: "message.failed",
    label: "Message failed",
    description: "Fires when message delivery fails or returns an error",
  },
  {
    value: "message.read",
    label: "Message read",
    description: "Fires when recipient opens and reads the WhatsApp message",
  },
  {
    value: "message.received",
    label: "Message received",
    description: "Fires when an incoming message from a customer is received",
  },
  {
    value: "campaign.completed",
    label: "Campaign completed",
    description:
      "Fires when a broadcast campaign finishes processing all recipients",
  },
];

export default function SettingsPage() {
  const { activeWorkspace, refreshWorkspaces } = useWorkspace();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTab>("business");
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Business Profile
  const [business, setBusiness] = useState<BusinessProfile>({
    businessName: activeWorkspace?.name || "My Business",
    businessEmail: user?.email || "",
    phoneNumber: "",
    website: "",
    industry: "Technology",
    timezone: "Asia/Dhaka",
    country: "Bangladesh",
    description: "",
  });

  // WhatsApp Config
  const [whatsapp, setWhatsapp] = useState<WhatsAppConfiguration>({
    phoneNumberId: "",
    businessAccountId: "",
    displayPhoneNumber: "",
    connectionStatus: "DISCONNECTED",
  });
  const [waAccounts, setWaAccounts] = useState<WhatsAppAccountItem[]>([]);
  const [waConfigStatus, setWaConfigStatus] =
    useState<WhatsAppConfigStatus | null>(null);
  const [waConfigLoading, setWaConfigLoading] = useState(false);

  // Notification Preferences
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    emailNotifications: true,
    campaignUpdates: true,
    messageFailureAlerts: true,
    teamActivityAlerts: false,
    weeklyReports: true,
    productUpdates: false,
  });

  // Security Preferences
  const [security, setSecurity] = useState<SecurityPreferences>({
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: "30",
  });

  // API Preferences
  const [api, setApi] = useState<ApiPreferences>({
    apiKey: "",
    webhookUrl: "",
    webhookSecret: "",
    webhookEvents: [
      "message.delivered",
      "message.failed",
      "message.read",
      "message.received",
    ],
  });

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [error, setError] = useState("");
  const [showPhoneNumberId, setShowPhoneNumberId] = useState(false);
  const [showBusinessAccountId, setShowBusinessAccountId] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isRegeneratingKey, setIsRegeneratingKey] = useState(false);

  // Change Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
      window.setTimeout(() => setToast(null), 3500);
    },
    [],
  );

  // Fetch live workspace settings
  const loadWorkspaceSettings = useCallback(async () => {
    if (!activeWorkspace?.id) return;
    setIsLoadingSettings(true);
    setError("");

    try {
      const data = await settingsService.getWorkspaceSettings(
        activeWorkspace.id,
      );
      if (data.business) {
        setBusiness({
          businessName:
            data.business.businessName || activeWorkspace.name || "",
          businessEmail: data.business.businessEmail || user?.email || "",
          phoneNumber: data.business.phoneNumber || "",
          website: data.business.website || "",
          industry: data.business.industry || "Technology",
          timezone: data.business.timezone || "Asia/Dhaka",
          country: data.business.country || "Bangladesh",
          description: data.business.description || "",
        });
      }
      if (data.notifications) {
        setNotifications(data.notifications);
      }
      if (data.security) {
        setSecurity(data.security);
      }
      if (data.api) {
        setApi({
          apiKey: data.api.apiKey || "",
          webhookUrl: data.api.webhookUrl || "",
          webhookSecret: data.api.webhookSecret || "",
          webhookEvents: data.api.webhookEvents || [],
        });
      }
    } catch (err: any) {
      console.warn("Could not load backend workspace settings:", err);
    } finally {
      setIsLoadingSettings(false);
    }
  }, [activeWorkspace, user?.email]);

  useEffect(() => {
    if (activeWorkspace?.id) {
      loadWorkspaceSettings();
    }
  }, [loadWorkspaceSettings, activeWorkspace]);

  // Fetch real WhatsApp status & accounts
  const loadWhatsAppStatus = useCallback(async () => {
    if (!activeWorkspace?.id) return;
    setWaConfigLoading(true);

    try {
      const [configStatus, accounts] = await Promise.all([
        whatsappService.getConfigStatus(activeWorkspace.id).catch(() => null),
        whatsappService.getAccounts(activeWorkspace.id).catch(() => []),
      ]);

      setWaConfigStatus(configStatus);
      setWaAccounts(accounts || []);

      if (accounts && accounts.length > 0) {
        const primary = accounts[0];
        setWhatsapp({
          phoneNumberId: primary.phoneNumberId || "",
          businessAccountId: primary.businessAccountId || "",
          displayPhoneNumber: primary.displayPhoneNumber || "",
          connectionStatus:
            primary.status === "CONNECTED" ? "CONNECTED" : "DISCONNECTED",
          webhookVerified:
            primary.webhookVerified ?? configStatus?.webhook?.verified,
        });
      } else if (configStatus) {
        setWhatsapp((current) => ({
          ...current,
          connectionStatus:
            (configStatus.workspaceAccount?.connectedAccounts ?? 0) > 0
              ? "CONNECTED"
              : "DISCONNECTED",
          webhookVerified: configStatus.webhook?.verified,
        }));
      }
    } catch {
      // keep current state
    } finally {
      setWaConfigLoading(false);
    }
  }, [activeWorkspace]);

  useEffect(() => {
    if (activeTab === "whatsapp" && activeWorkspace?.id) {
      loadWhatsAppStatus();
    }
  }, [activeTab, activeWorkspace, loadWhatsAppStatus]);

  // Save Settings to Backend
  async function saveCurrentSettings() {
    if (!activeWorkspace?.id) {
      showToast("No active workspace selected.", "error");
      return;
    }

    setError("");

    // Tab-specific validation
    if (activeTab === "business") {
      if (business.businessName.trim().length < 2) {
        setError("Business name must contain at least 2 characters.");
        return;
      }

      if (
        business.businessEmail &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(business.businessEmail)
      ) {
        setError("Please enter a valid business email address.");
        return;
      }

      if (business.website.trim()) {
        try {
          const url = new URL(business.website);
          if (!["http:", "https:"].includes(url.protocol)) {
            throw new Error("Invalid protocol");
          }
        } catch {
          setError("Please enter a valid website URL (including https://).");
          return;
        }
      }
    }

    if (activeTab === "api" && api.webhookUrl.trim()) {
      try {
        const url = new URL(api.webhookUrl);
        if (url.protocol !== "https:") {
          setError("Webhook URL must use HTTPS for production security.");
          return;
        }
      } catch {
        setError("Please enter a valid HTTPS webhook URL.");
        return;
      }
    }

    setIsSaving(true);
    try {
      if (activeTab === "business") {
        await settingsService.updateWorkspaceSettings(activeWorkspace.id, {
          business,
        });
        showToast("Business profile updated successfully.", "success");
        refreshWorkspaces();
      } else if (activeTab === "notifications") {
        await settingsService.updateWorkspaceSettings(activeWorkspace.id, {
          notifications,
        });
        showToast("Notification preferences saved.", "success");
      } else if (activeTab === "security") {
        await settingsService.updateWorkspaceSettings(activeWorkspace.id, {
          security,
        });
        showToast("Security preferences saved.", "success");
      } else if (activeTab === "api") {
        await settingsService.updateWorkspaceSettings(activeWorkspace.id, {
          api: {
            webhookUrl: api.webhookUrl,
            webhookEvents: api.webhookEvents,
          },
        });
        showToast("API & Webhook configuration saved.", "success");
      }
    } catch (err: any) {
      console.error("Failed to save settings:", err);
      setError(
        err?.message || "Failed to update settings. Please check your inputs.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function toggleNotification(key: keyof NotificationPreferences) {
    setNotifications((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function toggleEvent(value: string) {
    setApi((current) => ({
      ...current,
      webhookEvents: current.webhookEvents.includes(value)
        ? current.webhookEvents.filter((event) => event !== value)
        : [...current.webhookEvents, value],
    }));
  }

  // Regenerate API Key
  async function handleRegenerateApiKey() {
    if (!activeWorkspace?.id) return;
    setIsRegeneratingKey(true);
    try {
      const res = await settingsService.generateApiKey(activeWorkspace.id);
      setApi((current) => ({ ...current, apiKey: res.apiKey }));
      showToast("New API key generated successfully.", "success");
    } catch (err: any) {
      showToast(err?.message || "Failed to generate API key", "error");
    } finally {
      setIsRegeneratingKey(false);
    }
  }

  // Copy API Key
  function copyApiKeyToClipboard() {
    if (!api.apiKey) return;
    navigator.clipboard.writeText(api.apiKey);
    setCopiedKey(true);
    showToast("API key copied to clipboard.", "success");
    window.setTimeout(() => setCopiedKey(false), 2500);
  }

  // Handle Change Password Form Submission
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await settingsService.changePassword({
        currentPassword,
        newPassword,
      });
      showToast(res.message || "Password changed successfully.", "success");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(
        err?.message ||
          "Failed to change password. Verify your current password.",
      );
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1450px] space-y-7 p-4">
        {/* Header */}
        <section>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
            <Activity size={15} />
            Workspace Preferences
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Settings
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage your business profile, WhatsApp integrations, messaging
            preferences, account security, and webhook APIs.
          </p>
        </section>

        {/* Live Workspace Configuration Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/90 to-indigo-50/70 p-4 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-700">
              <ShieldCheck size={22} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {activeWorkspace?.name || "Workspace"} Production Settings
              </p>
              <p className="text-xs text-slate-600">
                All business profile data, security rules, notification toggles,
                and API webhooks are synchronized live with your database.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 pl-1 sm:pl-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-bold text-emerald-700">
              Active Sync
            </span>
          </div>
        </div>

        {/* Settings layout */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="px-3 pb-3 pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Preferences
              </p>
            </div>

            <nav className="space-y-1" aria-label="Settings sections">
              {tabs.map((tab) => {
                const active = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setError("");
                    }}
                    className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition ${
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span
                      className={`mt-0.5 shrink-0 ${
                        active ? "text-blue-600" : "text-slate-400"
                      }`}
                    >
                      {tab.icon}
                    </span>

                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">
                        {tab.label}
                      </span>

                      <span
                        className={`mt-1 block text-xs leading-5 ${
                          active ? "text-blue-700/70" : "text-slate-400"
                        }`}
                      >
                        {tab.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-slate-700">
                  Live workspace
                </span>
              </div>
              <p className="mt-1.5 truncate text-xs font-medium text-slate-600">
                {activeWorkspace?.name || "Active Workspace"}
              </p>
            </div>
          </aside>

          {/* Content */}
          <div className="min-w-0 space-y-5">
            {/* Loading Indicator */}
            {isLoadingSettings && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <Loader2
                  size={24}
                  className="mx-auto animate-spin text-blue-600"
                />
                <p className="mt-2 text-sm text-slate-500">
                  Loading settings...
                </p>
              </div>
            )}

            {!isLoadingSettings && activeTab === "business" && (
              <SettingsCard
                title="Business Profile"
                description="Manage the basic information and branding associated with your workspace."
                icon={<Globe size={19} />}
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField label="Business name" required>
                    <input
                      value={business.businessName}
                      onChange={(event) =>
                        setBusiness((current) => ({
                          ...current,
                          businessName: event.target.value,
                        }))
                      }
                      maxLength={100}
                      className={inputClass}
                      placeholder="Your registered business name"
                    />
                  </FormField>

                  <FormField label="Business email">
                    <input
                      type="email"
                      value={business.businessEmail}
                      onChange={(event) =>
                        setBusiness((current) => ({
                          ...current,
                          businessEmail: event.target.value,
                        }))
                      }
                      maxLength={254}
                      className={inputClass}
                      placeholder="contact@company.com"
                    />
                  </FormField>

                  <FormField label="Phone number">
                    <input
                      type="tel"
                      value={business.phoneNumber}
                      onChange={(event) =>
                        setBusiness((current) => ({
                          ...current,
                          phoneNumber: event.target.value,
                        }))
                      }
                      maxLength={30}
                      className={inputClass}
                      placeholder="+880 1XXXXXXXXX"
                    />
                  </FormField>

                  <FormField label="Website">
                    <input
                      type="url"
                      value={business.website}
                      onChange={(event) =>
                        setBusiness((current) => ({
                          ...current,
                          website: event.target.value,
                        }))
                      }
                      maxLength={2048}
                      className={inputClass}
                      placeholder="https://example.com"
                    />
                  </FormField>

                  <FormField label="Industry">
                    <SelectField
                      value={business.industry}
                      onChange={(value) =>
                        setBusiness((current) => ({
                          ...current,
                          industry: value,
                        }))
                      }
                      options={[
                        { label: "Select industry", value: "" },
                        ...industryOptions.map((industry) => ({
                          label: industry,
                          value: industry,
                        })),
                      ]}
                    />
                  </FormField>

                  <FormField label="Timezone">
                    <SelectField
                      value={business.timezone}
                      onChange={(value) =>
                        setBusiness((current) => ({
                          ...current,
                          timezone: value,
                        }))
                      }
                      options={timezoneOptions.map((tz) => ({
                        label: tz,
                        value: tz,
                      }))}
                    />
                  </FormField>

                  <FormField label="Country">
                    <input
                      value={business.country}
                      onChange={(event) =>
                        setBusiness((current) => ({
                          ...current,
                          country: event.target.value,
                        }))
                      }
                      maxLength={80}
                      className={inputClass}
                      placeholder="e.g. Bangladesh"
                    />
                  </FormField>

                  <div className="sm:col-span-2">
                    <FormField label="Business description">
                      <textarea
                        value={business.description}
                        onChange={(event) =>
                          setBusiness((current) => ({
                            ...current,
                            description: event.target.value,
                          }))
                        }
                        rows={4}
                        maxLength={500}
                        className={`${inputClass} resize-y`}
                        placeholder="Explain your business, services, and audience..."
                      />
                      <p className="mt-1.5 text-right text-xs text-slate-400">
                        {business.description.length}/500
                      </p>
                    </FormField>
                  </div>
                </div>
              </SettingsCard>
            )}

            {!isLoadingSettings && activeTab === "whatsapp" && (
              <SettingsCard
                title="WhatsApp Business Configuration"
                description="Review connected Meta WhatsApp Cloud API credentials and operational status."
                icon={<MessageCircle size={19} />}
              >
                {/* Connection Status Banner */}
                {whatsapp.connectionStatus === "CONNECTED" ? (
                  <div className="flex flex-col gap-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-emerald-600 p-2 text-white shadow-xs">
                        <Smartphone size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-emerald-950">
                          WhatsApp Connected & Active
                        </p>
                        <p className="mt-1 text-sm leading-5 text-emerald-800">
                          {whatsapp.displayPhoneNumber
                            ? `Phone: ${whatsapp.displayPhoneNumber}`
                            : "WhatsApp Cloud API integration is live."}
                        </p>
                        {waConfigStatus?.webhook?.verified && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 size={14} />
                            Meta Webhook Verified & Receiving Inbound Events
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-xs border border-emerald-200">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Connected
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-white p-2 text-amber-600 shadow-xs">
                        <Smartphone size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-amber-900">
                          No Active WhatsApp Account Linked
                        </p>
                        <p className="mt-1 text-sm leading-5 text-amber-800/80">
                          Connect your official Meta WhatsApp Business Cloud API
                          to send templates, broadcast campaigns, and receive
                          customer chats.
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 border border-amber-200">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Disconnected
                    </span>
                  </div>
                )}

                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField label="Phone Number ID">
                    <SecretInput
                      value={whatsapp.phoneNumberId}
                      onChange={(value) =>
                        setWhatsapp((current) => ({
                          ...current,
                          phoneNumberId: value,
                        }))
                      }
                      visible={showPhoneNumberId}
                      onToggle={() =>
                        setShowPhoneNumberId((current) => !current)
                      }
                      placeholder="e.g. 109823485764321"
                    />
                  </FormField>

                  <FormField label="WhatsApp Business Account ID (WABA)">
                    <SecretInput
                      value={whatsapp.businessAccountId}
                      onChange={(value) =>
                        setWhatsapp((current) => ({
                          ...current,
                          businessAccountId: value,
                        }))
                      }
                      visible={showBusinessAccountId}
                      onToggle={() =>
                        setShowBusinessAccountId((current) => !current)
                      }
                      placeholder="e.g. 209823485764321"
                    />
                  </FormField>

                  <div className="sm:col-span-2">
                    <FormField label="Display phone number">
                      <input
                        type="tel"
                        value={whatsapp.displayPhoneNumber}
                        onChange={(event) =>
                          setWhatsapp((current) => ({
                            ...current,
                            displayPhoneNumber: event.target.value,
                          }))
                        }
                        maxLength={30}
                        className={inputClass}
                        placeholder="+880 1XXXXXXXXX"
                      />
                    </FormField>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <LockKeyhole
                      size={18}
                      className="mt-0.5 shrink-0 text-slate-500"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Enterprise Token Security
                      </p>
                      <p className="mt-1 text-sm leading-5 text-slate-500">
                        System access tokens are encrypted with AES-256-GCM in
                        the backend and are never exposed in browser runtime.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={loadWhatsAppStatus}
                    disabled={waConfigLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    <RefreshCw
                      size={16}
                      className={waConfigLoading ? "animate-spin" : ""}
                    />
                    Check connection
                  </button>

                  <a
                    href="https://developers.facebook.com/docs/whatsapp/cloud-api"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Meta Documentation
                    <ExternalLink size={14} />
                  </a>
                </div>
              </SettingsCard>
            )}

            {!isLoadingSettings && activeTab === "notifications" && (
              <SettingsCard
                title="Notification Preferences"
                description="Configure alerts, campaign summaries, and email triggers for your team."
                icon={<Bell size={19} />}
              >
                <div className="divide-y divide-slate-100">
                  <ToggleRow
                    title="Email notifications"
                    description="Receive workspace updates, transactional receipts, and alerts by email."
                    checked={notifications.emailNotifications}
                    onChange={() => toggleNotification("emailNotifications")}
                  />

                  <ToggleRow
                    title="Campaign updates"
                    description="Get notified as soon as broadcast campaigns finish dispatching."
                    checked={notifications.campaignUpdates}
                    onChange={() => toggleNotification("campaignUpdates")}
                  />

                  <ToggleRow
                    title="Message failure alerts"
                    description="Immediately alert workspace admins when recipient delivery fails or encounters a Meta error."
                    checked={notifications.messageFailureAlerts}
                    onChange={() => toggleNotification("messageFailureAlerts")}
                  />

                  <ToggleRow
                    title="Team activity alerts"
                    description="Receive alerts when new agents accept invitations or change assignments."
                    checked={notifications.teamActivityAlerts}
                    onChange={() => toggleNotification("teamActivityAlerts")}
                  />

                  <ToggleRow
                    title="Weekly messaging digest"
                    description="Receive a weekly analytics performance report covering delivery rate and inbound counts."
                    checked={notifications.weeklyReports}
                    onChange={() => toggleNotification("weeklyReports")}
                  />

                  <ToggleRow
                    title="Product updates"
                    description="Hear about new WhatsApp Cloud API releases and VexChat platform improvements."
                    checked={notifications.productUpdates}
                    onChange={() => toggleNotification("productUpdates")}
                  />
                </div>
              </SettingsCard>
            )}

            {!isLoadingSettings && activeTab === "security" && (
              <>
                <SettingsCard
                  title="Security Policies"
                  description="Enforce workspace session policies and verification parameters."
                  icon={<ShieldCheck size={19} />}
                >
                  <div className="divide-y divide-slate-100">
                    <ToggleRow
                      title="Two-factor authentication (2FA)"
                      description="Require secondary email OTP verification upon platform sign-in."
                      checked={security.twoFactorEnabled}
                      onChange={() =>
                        setSecurity((current) => ({
                          ...current,
                          twoFactorEnabled: !current.twoFactorEnabled,
                        }))
                      }
                    />

                    <ToggleRow
                      title="Login alerts"
                      description="Send immediate email alerts when your account is accessed from a new IP or device."
                      checked={security.loginAlerts}
                      onChange={() =>
                        setSecurity((current) => ({
                          ...current,
                          loginAlerts: !current.loginAlerts,
                        }))
                      }
                    />
                  </div>

                  <div className="mt-6">
                    <FormField label="Idle session timeout">
                      <SelectField
                        value={security.sessionTimeout}
                        onChange={(value) =>
                          setSecurity((current) => ({
                            ...current,
                            sessionTimeout: value,
                          }))
                        }
                        options={sessionTimeoutOptions}
                      />
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Automatically prompts step-up re-authentication after
                        inactivity.
                      </p>
                    </FormField>
                  </div>
                </SettingsCard>

                <SettingsCard
                  title="Account Password"
                  description="Update your account credentials to keep your workspace secure."
                  icon={<LockKeyhole size={19} />}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Change Password
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Ensure your account uses a strong password with at least
                        8 characters.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPasswordError("");
                        setShowPasswordModal(true);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      <LockKeyhole size={15} />
                      Update Password
                    </button>
                  </div>
                </SettingsCard>
              </>
            )}

            {!isLoadingSettings && activeTab === "api" && (
              <>
                <SettingsCard
                  title="API Key Credentials"
                  description="Use this API key to authenticate programmatic requests from your backend applications."
                  icon={<KeyRound size={19} />}
                >
                  <div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Workspace API Key
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Bearer token for REST API calls
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleRegenerateApiKey}
                        disabled={isRegeneratingKey}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                      >
                        <RefreshCw
                          size={14}
                          className={isRegeneratingKey ? "animate-spin" : ""}
                        />
                        Regenerate Key
                      </button>
                    </div>

                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                      <code className="flex-1 font-mono text-xs text-slate-800 overflow-x-auto px-2">
                        {showApiKey
                          ? api.apiKey || "No key generated"
                          : api.apiKey
                            ? `${api.apiKey.slice(0, 10)}••••••••••••••••••••••••••••••••`
                            : "••••••••••••••••"}
                      </code>

                      <button
                        type="button"
                        onClick={() => setShowApiKey((v) => !v)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700"
                        title={showApiKey ? "Hide key" : "Show key"}
                      >
                        {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>

                      <button
                        type="button"
                        onClick={copyApiKeyToClipboard}
                        className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100"
                      >
                        {copiedKey ? (
                          <>
                            <Check size={13} className="text-emerald-600" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </SettingsCard>

                <SettingsCard
                  title="Webhooks Ingress"
                  description="Register an HTTPS endpoint to receive live events when messages are delivered or received."
                  icon={<Webhook size={19} />}
                >
                  <FormField label="Webhook endpoint URL">
                    <input
                      type="url"
                      value={api.webhookUrl}
                      onChange={(event) =>
                        setApi((current) => ({
                          ...current,
                          webhookUrl: event.target.value,
                        }))
                      }
                      maxLength={2048}
                      className={inputClass}
                      placeholder="https://your-domain.com/api/webhooks/vexchat"
                    />
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Must be an active HTTPS URL with TLS certificate.
                    </p>
                  </FormField>

                  {api.webhookSecret && (
                    <div className="mt-4">
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                        Webhook Signing Secret (HMAC-SHA256)
                      </label>
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                        <code className="flex-1 font-mono text-xs text-slate-700">
                          {api.webhookSecret}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              api.webhookSecret || "",
                            );
                            showToast("Signing secret copied.", "success");
                          }}
                          className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100"
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <p className="text-sm font-semibold text-slate-800">
                      Webhook Subscriptions
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Select which message and campaign events should be pushed
                      to your endpoint.
                    </p>

                    <div className="mt-4 space-y-3">
                      {eventOptions.map((event) => {
                        const checked = api.webhookEvents.includes(event.value);

                        return (
                          <label
                            key={event.value}
                            className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/30"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleEvent(event.value)}
                              className="mt-1 h-4 w-4 rounded border-slate-300 accent-blue-600"
                            />

                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold text-slate-800">
                                {event.label}
                              </span>

                              <span className="mt-1 block text-xs leading-5 text-slate-500">
                                {event.description}
                              </span>

                              <code className="mt-2 inline-block rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
                                {event.value}
                              </code>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </SettingsCard>
              </>
            )}

            {/* Error Feedback */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <CircleAlert size={17} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {/* Save Bar */}
            {activeTab !== "whatsapp" && (
              <div className="flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <p className="text-xs leading-5 text-slate-500">
                  Settings are immediately persisted to your active workspace.
                </p>

                <button
                  type="button"
                  onClick={saveCurrentSettings}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save {tabs.find((tab) => tab.id === activeTab)?.label}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isChangingPassword) {
              setShowPasswordModal(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="password-modal-title"
            className="my-6 w-full max-w-md rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2
                  id="password-modal-title"
                  className="text-lg font-bold text-slate-900"
                >
                  Update Account Password
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Verify your current password to set a new one.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                disabled={isChangingPassword}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 p-5">
              {passwordError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {passwordError}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={`${inputClass} pr-10`}
                    placeholder="Enter existing password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`${inputClass} pr-10`}
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Repeat new password"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={isChangingPassword}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Save New Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[60] flex max-w-sm items-start gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium leading-5 text-white shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {toast.type === "success" ? (
            <CheckCircle2
              size={17}
              className="mt-0.5 shrink-0 text-emerald-400"
            />
          ) : (
            <CircleAlert size={17} className="mt-0.5 shrink-0 text-rose-400" />
          )}
          <span className="flex-1">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50";

function SettingsCard({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 p-5 sm:p-6">
        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">{icon}</div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} appearance-none pr-10`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

function SecretInput({
  value,
  onChange,
  visible,
  onToggle,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={200}
        autoComplete="off"
        className={`${inputClass} pr-12`}
        placeholder={placeholder}
      />

      <button
        type="button"
        onClick={onToggle}
        aria-label={visible ? "Hide value" : "Show value"}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-700"
      >
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-5 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="mt-1 max-w-xl text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={onChange}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
          checked ? "bg-blue-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
