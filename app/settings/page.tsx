"use client";

import { useState, type ReactNode } from "react";
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

import {
  initialApiPreferences,
  initialBusinessProfile,
  initialNotificationPreferences,
  initialSecurityPreferences,
  initialWhatsAppConfiguration,
  industryOptions,
  sessionTimeoutOptions,
  timezoneOptions,
  type ApiPreferences,
  type BusinessProfile,
  type NotificationPreferences,
  type SecurityPreferences,
  type WhatsAppConfiguration,
} from "@/src/data/mock/settings";

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

const eventOptions = [
  {
    value: "message.delivered",
    label: "Message delivered",
    description: "When a message is delivered",
  },
  {
    value: "message.failed",
    label: "Message failed",
    description: "When message delivery fails",
  },
  {
    value: "message.read",
    label: "Message read",
    description: "When a message is marked as read",
  },
  {
    value: "message.received",
    label: "Message received",
    description: "When a customer message is received",
  },
  {
    value: "campaign.completed",
    label: "Campaign completed",
    description: "When a campaign finishes",
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("business");

  const [business, setBusiness] = useState<BusinessProfile>(
    initialBusinessProfile,
  );

  const [whatsapp, setWhatsapp] = useState<WhatsAppConfiguration>(
    initialWhatsAppConfiguration,
  );

  const [notifications, setNotifications] = useState<NotificationPreferences>(
    initialNotificationPreferences,
  );

  const [security, setSecurity] = useState<SecurityPreferences>(
    initialSecurityPreferences,
  );

  const [api, setApi] = useState<ApiPreferences>(initialApiPreferences);

  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [showPhoneNumberId, setShowPhoneNumberId] = useState(false);
  const [showBusinessAccountId, setShowBusinessAccountId] = useState(false);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  }

  function saveCurrentSettings() {
    setError("");

    if (activeTab === "business") {
      if (business.businessName.trim().length < 2) {
        setError("Business name must contain at least 2 characters.");
        return;
      }

      if (
        business.businessEmail &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(business.businessEmail)
      ) {
        setError("Please enter a valid business email.");
        return;
      }

      if (business.website.trim()) {
        try {
          const url = new URL(business.website);

          if (!["http:", "https:"].includes(url.protocol)) {
            throw new Error("Invalid protocol");
          }
        } catch {
          setError("Please enter a valid website URL.");
          return;
        }
      }
    }

    if (activeTab === "api" && api.webhookUrl.trim()) {
      try {
        const url = new URL(api.webhookUrl);

        if (url.protocol !== "https:") {
          setError("Webhook URL must use HTTPS.");
          return;
        }
      } catch {
        setError("Please enter a valid HTTPS webhook URL.");
        return;
      }
    }

    showToast("Settings updated in the current demo session.");
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

  function simulateWhatsAppConnection() {
    setWhatsapp((current) => ({
      ...current,
      connectionStatus: "DISCONNECTED",
    }));

    showToast("Demo only: WhatsApp connection requires backend integration.");
  }

  return (
    <DashboardLayout>
      {" "}
      <div className="mx-auto max-w-[1450px] space-y-7">
        {/* Header */}{" "}
        <section>
          {" "}
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
            {" "}
            <Activity size={15} />
            Workspace Preferences{" "}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Settings
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage your business profile, messaging preferences, account
            security, and integration settings.
          </p>
        </section>
        {/* Demo notice */}
        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
          <CircleAlert size={19} className="mt-0.5 shrink-0 text-blue-600" />

          <div>
            <p className="text-sm font-semibold text-blue-900">Settings demo</p>

            <p className="mt-1 text-sm leading-5 text-blue-800/80">
              Settings are held in temporary page state. They are not persisted
              to a database, and WhatsApp, API, webhook, and security
              integrations are not connected.
            </p>
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
                <span className="h-2 w-2 rounded-full bg-amber-500" />

                <span className="text-xs font-semibold text-slate-700">
                  Demo environment
                </span>
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                External integrations are not connected.
              </p>
            </div>
          </aside>

          {/* Content */}
          <div className="min-w-0 space-y-5">
            {activeTab === "business" && (
              <SettingsCard
                title="Business Profile"
                description="Manage the basic information associated with your workspace."
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
                      placeholder="Your business name"
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
                      placeholder="hello@company.com"
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
                      options={timezoneOptions.map((timezone) => ({
                        label: timezone,
                        value: timezone,
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
                        placeholder="Tell us about your business..."
                      />

                      <p className="mt-1.5 text-right text-xs text-slate-400">
                        {business.description.length}/500
                      </p>
                    </FormField>
                  </div>
                </div>
              </SettingsCard>
            )}

            {activeTab === "whatsapp" && (
              <>
                <SettingsCard
                  title="WhatsApp Configuration"
                  description="Configure the identifiers associated with your WhatsApp Business account."
                  icon={<MessageCircle size={19} />}
                >
                  <div className="flex flex-col gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-white p-2 text-amber-600">
                        <Smartphone size={20} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-amber-900">
                          WhatsApp is not connected
                        </p>

                        <p className="mt-1 text-sm leading-5 text-amber-800/80">
                          Add your account identifiers to preview the
                          configuration. Saving these fields does not connect a
                          WhatsApp account.
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-amber-700">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Disconnected
                    </span>
                  </div>

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
                        placeholder="Enter Phone Number ID"
                      />
                    </FormField>

                    <FormField label="WhatsApp Business Account ID">
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
                        placeholder="Enter Business Account ID"
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
                          Protect your credentials
                        </p>

                        <p className="mt-1 text-sm leading-5 text-slate-500">
                          Never put a permanent access token or app secret in
                          frontend code. A real integration should store secrets
                          securely on the server.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={simulateWhatsAppConnection}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      <RefreshCw size={16} />
                      Check connection
                    </button>

                    <a
                      href="https://developers.facebook.com/docs/whatsapp/cloud-api"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Documentation
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </SettingsCard>
              </>
            )}

            {activeTab === "notifications" && (
              <SettingsCard
                title="Notification Preferences"
                description="Choose which updates and alerts you would like to receive."
                icon={<Bell size={19} />}
              >
                <div className="divide-y divide-slate-100">
                  <ToggleRow
                    title="Email notifications"
                    description="Receive workspace updates by email."
                    checked={notifications.emailNotifications}
                    onChange={() => toggleNotification("emailNotifications")}
                  />

                  <ToggleRow
                    title="Campaign updates"
                    description="Receive updates about campaign completion and progress."
                    checked={notifications.campaignUpdates}
                    onChange={() => toggleNotification("campaignUpdates")}
                  />

                  <ToggleRow
                    title="Message failure alerts"
                    description="Get notified when message delivery fails."
                    checked={notifications.messageFailureAlerts}
                    onChange={() => toggleNotification("messageFailureAlerts")}
                  />

                  <ToggleRow
                    title="Team activity alerts"
                    description="Receive updates about team member activity."
                    checked={notifications.teamActivityAlerts}
                    onChange={() => toggleNotification("teamActivityAlerts")}
                  />

                  <ToggleRow
                    title="Weekly reports"
                    description="Receive a weekly messaging performance summary."
                    checked={notifications.weeklyReports}
                    onChange={() => toggleNotification("weeklyReports")}
                  />

                  <ToggleRow
                    title="Product updates"
                    description="Hear about new features and product announcements."
                    checked={notifications.productUpdates}
                    onChange={() => toggleNotification("productUpdates")}
                  />
                </div>
              </SettingsCard>
            )}

            {activeTab === "security" && (
              <>
                <SettingsCard
                  title="Security Settings"
                  description="Review the security preferences available for this demo account."
                  icon={<ShieldCheck size={19} />}
                >
                  <div className="divide-y divide-slate-100">
                    <ToggleRow
                      title="Two-factor authentication"
                      description="Preview the option to require a second verification step at sign-in."
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
                      description="Preview notifications about new account sign-ins."
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
                    <FormField label="Session timeout">
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
                        This selection does not change actual login sessions.
                        Server-side session enforcement is required.
                      </p>
                    </FormField>
                  </div>
                </SettingsCard>

                <SettingsCard
                  title="Account Security"
                  description="Security actions that require a real authentication system."
                  icon={<LockKeyhole size={19} />}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Change password
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Password changes are not available in this demo.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        showToast(
                          "Password management requires backend authentication.",
                        )
                      }
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Change password
                    </button>
                  </div>
                </SettingsCard>
              </>
            )}

            {activeTab === "api" && (
              <>
                <SettingsCard
                  title="API Settings"
                  description="Preview API credentials and integration configuration."
                  icon={<KeyRound size={19} />}
                >
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                      <CircleAlert
                        size={19}
                        className="mt-0.5 shrink-0 text-amber-600"
                      />

                      <div>
                        <p className="text-sm font-semibold text-amber-900">
                          API credentials are unavailable
                        </p>

                        <p className="mt-1 text-sm leading-5 text-amber-800/80">
                          This demo does not generate or store real API keys.
                          Never treat a frontend-generated value as a secure
                          credential.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          API key
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Real key management requires a secure backend.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          showToast(
                            "API key generation is not available in the demo.",
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <KeyRound size={16} />
                        Generate API key
                      </button>
                    </div>

                    <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="rounded-lg bg-white p-2 text-slate-500">
                        <Code2 size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          No API keys created
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Connect a backend to enable secure API key management.
                        </p>
                      </div>
                    </div>
                  </div>
                </SettingsCard>

                <SettingsCard
                  title="Webhooks"
                  description="Choose an endpoint and select the events your application wants to receive."
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
                      placeholder="https://your-domain.com/webhooks"
                    />

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Use HTTPS. This demo validates the URL format only; it
                      does not register or call your endpoint.
                    </p>
                  </FormField>

                  <div className="mt-6">
                    <p className="text-sm font-semibold text-slate-800">
                      Webhook events
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Select the events to include in your demo configuration.
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

            {/* Form feedback */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <CircleAlert size={17} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {/* Save bar */}
            <div className="flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <p className="text-xs leading-5 text-slate-500">
                Changes apply only to the current page session.
              </p>

              <button
                type="button"
                onClick={saveCurrentSettings}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <Save size={16} />
                Save {tabs.find((tab) => tab.id === activeTab)?.label}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[60] flex max-w-sm items-start gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium leading-5 text-white shadow-xl"
        >
          <CheckCircle2
            size={17}
            className="mt-0.5 shrink-0 text-emerald-400"
          />
          {toast}
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
      {" "}
      <div className="flex items-start gap-3 border-b border-slate-100 p-5 sm:p-6">
        {" "}
        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">{icon} </div>
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
      {" "}
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}{" "}
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
            {option.label}{" "}
          </option>
        ))}{" "}
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
      {" "}
      <div className="min-w-0">
        {" "}
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
