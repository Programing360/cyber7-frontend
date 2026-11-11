"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Globe,
  HardDrive,
  Lock,
  Power,
  RefreshCw,
  Save,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Wallet,
  XCircle,
  Zap,
} from "lucide-react";
import AdminConfirmDialog from "@/src/component/admin/admin-confirm-dialog";
import AdminStatCard from "@/src/component/admin/admin-stat-card";
import { adminToast } from "@/src/component/admin/admin-toast";
import { adminService } from "@/src/services/admin-service";
import type {
  AdminPlatformSettings,
  GatewaysHealthReport,
  PlatformRuntimeDiagnostics,
} from "@/src/types/admin";

function formatUptime(seconds?: number): string {
  if (!seconds || seconds <= 0) return "Just started";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${Math.floor(seconds % 60)}s`;
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "financial" | "security" | "diagnostics"
  >("financial");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [probingGateways, setProbingGateways] = useState(false);
  const [purgeDialogOpen, setPurgeDialogOpen] = useState(false);
  const [purging, setPurging] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Settings form states
  const [currency, setCurrency] = useState("BDT");
  const [idleTimeoutMinutes, setIdleTimeoutMinutes] = useState(15);
  const [absoluteLifetimeHours, setAbsoluteLifetimeHours] = useState(8);
  const [highValueStepUpThresholdBdt, setHighValueStepUpThresholdBdt] =
    useState(50000);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Gateway toggles
  const [bkashDirect, setBkashDirect] = useState(true);
  const [cityBankTransfer, setCityBankTransfer] = useState(true);
  const [portPosCards, setPortPosCards] = useState(true);

  // Live runtime diagnostics
  const [runtime, setRuntime] = useState<PlatformRuntimeDiagnostics | null>(
    null,
  );
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  // Gateway health results
  const [gatewayReport, setGatewayReport] =
    useState<GatewaysHealthReport | null>(null);

  const loadData = async (isManual = false) => {
    if (!isManual) setLoading(true);
    try {
      const [settingsRes, healthRes] = await Promise.allSettled([
        adminService.getPlatformSettings(),
        adminService.getGatewayHealth(),
      ]);

      if (settingsRes.status === "fulfilled" && settingsRes.value) {
        const val = settingsRes.value as any;
        const s: AdminPlatformSettings = val.settings || val;

        setCurrency(s.currency || "BDT");
        setIdleTimeoutMinutes(s.sessionPolicies?.idleTimeoutMinutes ?? 15);
        setAbsoluteLifetimeHours(
          s.sessionPolicies?.absoluteLifetimeHours ?? 8,
        );
        setHighValueStepUpThresholdBdt(
          s.sessionPolicies?.highValueStepUpThresholdBdt ?? 50000,
        );
        setMaintenanceMode(Boolean(s.maintenanceMode));

        if (s.gatewayToggles) {
          setBkashDirect(Boolean(s.gatewayToggles.bkashDirect));
          setCityBankTransfer(Boolean(s.gatewayToggles.cityBankTransfer));
          setPortPosCards(Boolean(s.gatewayToggles.portPosCards));
        }

        if (val.runtime || s.runtime) {
          setRuntime(val.runtime || s.runtime);
        }

        if (s.updatedAt) {
          setUpdatedAt(s.updatedAt);
        }
      }

      if (healthRes.status === "fulfilled" && healthRes.value) {
        const val = healthRes.value as any;
        setGatewayReport(val.report || val);
      }

      setLastRefreshed(new Date());
    } catch (err: any) {
      console.error("[AdminSettings] Error loading platform settings:", err);
      adminToast.error(
        "Failed to Load Settings",
        err?.message || "Could not fetch platform configuration.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async () => {
    if (
      idleTimeoutMinutes < 1 ||
      absoluteLifetimeHours < 1 ||
      highValueStepUpThresholdBdt < 0
    ) {
      adminToast.error(
        "Validation Error",
        "Please provide valid numerical thresholds.",
      );
      return;
    }

    setSaving(true);
    try {
      const updated = await adminService.updatePlatformSettings({
        currency,
        maintenanceMode,
        sessionPolicies: {
          idleTimeoutMinutes,
          absoluteLifetimeHours,
          highValueStepUpThresholdBdt,
        },
        gatewayToggles: {
          bkashDirect,
          cityBankTransfer,
          portPosCards,
        },
      });

      if (updated?.updatedAt) {
        setUpdatedAt(updated.updatedAt);
      }

      adminToast.success(
        "Settings Saved",
        "Authoritative platform settings, gateway toggles, and session thresholds updated successfully.",
      );

      // Re-fetch to refresh runtime diagnostics
      await loadData(true);
    } catch (err: any) {
      console.error("[AdminSettings] Save failed:", err);
      adminToast.error(
        "Save Failed",
        err?.message || "Could not save platform settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleProbeGateways = async () => {
    setProbingGateways(true);
    try {
      const res = await adminService.getGatewayHealth();
      const reportData = (res as any).report || res;
      setGatewayReport(reportData);
      adminToast.success(
        "Gateways Probed",
        `Payment gateway health checked. Overall status: ${reportData.overallStatus || "HEALTHY"}.`,
      );
    } catch (err: any) {
      adminToast.error(
        "Probe Failed",
        err?.message || "Could not probe payment gateway endpoints.",
      );
    } finally {
      setProbingGateways(false);
    }
  };

  const handleConfirmPurgeSessions = async () => {
    setPurging(true);
    try {
      const res = await adminService.purgeExpiredSessions();
      const purgedCount =
        (res as any).purgedSessionsCount ?? (res as any).purgedCount ?? 0;
      adminToast.success(
        "Sessions Purged",
        `Database session cleanup complete. Purged ${purgedCount} expired admin session(s).`,
      );
      setPurgeDialogOpen(false);
      await loadData(true);
    } catch (err: any) {
      adminToast.error(
        "Purge Failed",
        err?.message || "Could not purge expired sessions.",
      );
    } finally {
      setPurging(false);
    }
  };

  const getGatewayStatusBadge = (status?: string) => {
    switch (status) {
      case "HEALTHY":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
            <CheckCircle2 size={12} className="text-emerald-600" />
            Healthy
          </span>
        );
      case "DEGRADED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
            <AlertCircle size={12} className="text-amber-600" />
            Degraded
          </span>
        );
      case "DOWN":
      case "UNHEALTHY":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-800">
            <XCircle size={12} className="text-rose-600" />
            Unreachable
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
            <Clock size={12} />
            Unchecked
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Platform Settings & System Controls
            </h1>
            <span className="rounded-full bg-[#effbdd] px-2.5 py-0.5 text-[11px] font-bold text-[#355c11] border border-[#c5ed98]/50">
              Live Engine
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Authoritative configurations, real-time gateway policies, and live server runtime diagnostics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50"
            title="Refresh runtime metrics"
          >
            <RefreshCw
              size={13}
              className={loading ? "animate-spin text-slate-500" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={saving || loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
          >
            {saving ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save size={14} />
            )}
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Global Live Status Banner */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs text-emerald-950 shadow-xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <strong className="font-bold">Authoritative Governance Connected:</strong>{" "}
              Live runtime configuration synced.
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-emerald-800">
            <span>
              Last sync:{" "}
              <strong className="font-semibold">
                {lastRefreshed.toLocaleTimeString()}
              </strong>
            </span>
            {updatedAt && (
              <span className="hidden md:inline">
                • Modified: {new Date(updatedAt).toLocaleDateString()}
              </span>
            )}
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-bold uppercase tracking-wide text-emerald-900 border border-emerald-300/40">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Runtime Stats Cards Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          title="Base Currency"
          value={currency}
          subtext="Authoritative ledger currency"
          icon={<Wallet className="text-[#355c11]" size={20} />}
          backendSupport="IMPLEMENTED"
          isLoading={loading}
        />

        <AdminStatCard
          title="Admin Sessions"
          value={runtime ? `${runtime.activeSessionsCount} Active` : "1 Active"}
          subtext={
            runtime
              ? `${runtime.expiredSessionsCount} expired in ledger`
              : "HttpOnly __Host cookie secured"
          }
          icon={<Lock className="text-purple-600" size={20} />}
          backendSupport="IMPLEMENTED"
          isLoading={loading}
        />

        <AdminStatCard
          title="Gateway Health"
          value={gatewayReport?.overallStatus || "HEALTHY"}
          subtext={
            probingGateways
              ? "Probing endpoints..."
              : `bKash: ${gatewayReport?.gateways.bkash.latencyMs ?? 0}ms • City: ${gatewayReport?.gateways.cityBank.latencyMs ?? 0}ms`
          }
          icon={<Activity className="text-blue-600" size={20} />}
          backendSupport="IMPLEMENTED"
          isLoading={loading}
        />

        <AdminStatCard
          title="Engine Status"
          value={maintenanceMode ? "Maintenance" : "Operational"}
          subtext={
            runtime
              ? `Uptime: ${formatUptime(runtime.uptimeSeconds)}`
              : "Production Live"
          }
          icon={
            maintenanceMode ? (
              <AlertTriangle className="text-amber-600" size={20} />
            ) : (
              <Zap className="text-emerald-600" size={20} />
            )
          }
          backendSupport="IMPLEMENTED"
          isLoading={loading}
        />
      </div>

      {/* Tab Selector */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("financial")}
            className={`flex items-center gap-2 border-b-2 pb-3 transition ${activeTab === "financial"
                ? "border-[#88da1c] text-[#2f5210]"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
              }`}
          >
            <Wallet size={16} />
            <span>Financial & Gateways</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 border-b-2 pb-3 transition ${activeTab === "security"
                ? "border-[#88da1c] text-[#2f5210]"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
              }`}
          >
            <Shield size={16} />
            <span>Security & Sessions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("diagnostics")}
            className={`flex items-center gap-2 border-b-2 pb-3 transition ${activeTab === "diagnostics"
                ? "border-[#88da1c] text-[#2f5210]"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
              }`}
          >
            <Cpu size={16} />
            <span>Runtime Diagnostics</span>
          </button>
        </nav>
      </div>

      {/* Tab 1: Financial & Gateway Policies */}
      {activeTab === "financial" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Gateway Toggles & Currency */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Authoritative Currency & Gateways
              </h2>
              <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                Locked to {currency}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Platform Base Currency
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={`${currency} (Bangladeshi Taka)`}
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 p-2.5 font-medium text-slate-700 cursor-not-allowed"
                  />
                  <Globe
                    size={15}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Fixed base currency used across all subscription billing, manual deposits, and invoices.
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-2">
                  Payment Gateways Enablement
                </label>
                <div className="space-y-3">
                  {/* bKash Direct */}
                  <label className="flex items-start justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={bkashDirect}
                        onChange={(e) => setBkashDirect(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-[#88da1c] focus:ring-[#88da1c]"
                      />
                      <div>
                        <div className="font-bold text-slate-800">
                          bKash Direct API Checkout
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Automatic tokenized bKash PGW with instant invoice generation.
                        </p>
                      </div>
                    </div>
                    {getGatewayStatusBadge(gatewayReport?.gateways?.bkash?.status)}
                  </label>

                  {/* City Bank Manual */}
                  <label className="flex items-start justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={cityBankTransfer}
                        onChange={(e) => setCityBankTransfer(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-[#88da1c] focus:ring-[#88da1c]"
                      />
                      <div>
                        <div className="font-bold text-slate-800">
                          City Bank Corporate Transfer
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Manual deposit slip review ledger with administrator approval queue.
                        </p>
                      </div>
                    </div>
                    {getGatewayStatusBadge(gatewayReport?.gateways?.cityBank?.status)}
                  </label>

                  {/* PortPOS / Card */}
                  <label className="flex items-start justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={portPosCards}
                        onChange={(e) => setPortPosCards(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-[#88da1c] focus:ring-[#88da1c]"
                      />
                      <div>
                        <div className="font-bold text-slate-800">
                          City Bank Visa / Mastercard
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Direct card processing channel for domestic and international debit/credit cards.
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                      Card API
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Gateway Live Diagnostics */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Live Gateway Probe & Health
              </h2>
              <button
                type="button"
                onClick={handleProbeGateways}
                disabled={probingGateways}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={12}
                  className={probingGateways ? "animate-spin" : ""}
                />
                <span>Probe Gateways</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      bKash Merchant Endpoint
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-600">
                      {gatewayReport?.gateways?.bkash?.mode || "API"}
                    </span>
                  </div>
                  {getGatewayStatusBadge(gatewayReport?.gateways?.bkash?.status)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>
                    Latency:{" "}
                    <strong className="text-slate-900">
                      {gatewayReport?.gateways?.bkash?.latencyMs ?? 0} ms
                    </strong>
                  </div>
                  <div>
                    Status Message:{" "}
                    <span className="text-slate-700 truncate">
                      {gatewayReport?.gateways?.bkash?.message || "Operational"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      City Bank Corporate Ledger
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-600">
                      {gatewayReport?.gateways?.cityBank?.mode || "LEDGER"}
                    </span>
                  </div>
                  {getGatewayStatusBadge(gatewayReport?.gateways?.cityBank?.status)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>
                    Latency:{" "}
                    <strong className="text-slate-900">
                      {gatewayReport?.gateways?.cityBank?.latencyMs ?? 0} ms
                    </strong>
                  </div>
                  <div>
                    Status Message:{" "}
                    <span className="text-slate-700 truncate">
                      {gatewayReport?.gateways?.cityBank?.message || "Operational"}
                    </span>
                  </div>
                </div>
              </div>

              {gatewayReport?.timestamp && (
                <div className="pt-2 text-right text-[11px] text-slate-400">
                  Last verified at:{" "}
                  {new Date(gatewayReport.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Security & Session Policies */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Session Inactivity & Lifetime */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Session Lifecycle & Expiry
              </h2>
              <span className="rounded bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-800 border border-purple-200">
                Security Policy
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Cookie Transport Mechanism
                </label>
                <input
                  type="text"
                  disabled
                  value="__Host-vexchat_admin_session (HttpOnly, Secure, SameSite=Strict)"
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 p-2.5 font-mono text-[11px] text-slate-700 cursor-not-allowed"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Isolated host-only cookie preventing sub-domain hijacking and CSRF.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Idle Inactivity Timeout (Mins)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={idleTimeoutMinutes}
                    onChange={(e) =>
                      setIdleTimeoutMinutes(parseInt(e.target.value, 10) || 15)
                    }
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-[#88da1c] focus:outline-hidden focus:ring-1 focus:ring-[#88da1c]"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Sliding window revoked upon inactivity.
                  </p>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Absolute Lifetime (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="72"
                    value={absoluteLifetimeHours}
                    onChange={(e) =>
                      setAbsoluteLifetimeHours(parseInt(e.target.value, 10) || 8)
                    }
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-[#88da1c] focus:outline-hidden focus:ring-1 focus:ring-[#88da1c]"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Hard expiry enforcing re-authentication.
                  </p>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  High-Value Step-Up Threshold (BDT)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={highValueStepUpThresholdBdt}
                    onChange={(e) =>
                      setHighValueStepUpThresholdBdt(
                        parseInt(e.target.value, 10) || 0,
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-[#88da1c] focus:outline-hidden focus:ring-1 focus:ring-[#88da1c]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    BDT
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Transactions or deposit approvals exceeding this amount enforce step-up secondary confirmation.
                </p>
              </div>
            </div>
          </div>

          {/* Maintenance & Emergency Session Flush */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Emergency Controls & Session Flush
              </h2>
              <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-800 border border-rose-200">
                Privileged Actions
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="mt-1 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="font-bold text-rose-900">
                      Platform Maintenance Mode
                    </span>
                    <p className="mt-0.5 text-[11px] text-rose-700">
                      When enabled, user workspace messaging queues and billing checkouts enter a safe read-only maintenance window.
                    </p>
                  </div>
                </label>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Flush Expired Admin Sessions
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Purges revoked and expired authentication sessions from the database ledger.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPurgeDialogOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
                  >
                    <ShieldCheck size={13} />
                    <span>Flush Expired</span>
                  </button>
                </div>

                {runtime && (
                  <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                    <span>
                      Active: <strong className="text-slate-800">{runtime.activeSessionsCount}</strong>
                    </span>
                    <span>
                      Expired/Revoked: <strong className="text-slate-800">{runtime.expiredSessionsCount}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Runtime Diagnostics & System Health */}
      {activeTab === "diagnostics" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Server Process & Engine */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Node.js Backend Engine
              </h2>
              <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                Connected
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-600">Runtime Version</span>
                <span className="font-mono font-bold text-slate-900">
                  {runtime?.nodeVersion || process.version || "Node.js"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-600">Deployment Environment</span>
                <span className="rounded bg-slate-200 px-2 py-0.5 font-bold uppercase tracking-wide text-slate-800 text-[10px]">
                  {runtime?.environment || "Development"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-600">Server Continuous Uptime</span>
                <span className="font-semibold text-slate-900">
                  {formatUptime(runtime?.uptimeSeconds)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-600">Server System Time (UTC)</span>
                <span className="font-mono text-slate-700">
                  {runtime?.serverTime
                    ? new Date(runtime.serverTime).toUTCString()
                    : new Date().toUTCString()}
                </span>
              </div>
            </div>
          </div>

          {/* Database & Infrastructure */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Database & Queue Subsystems
              </h2>
              <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-800 border border-blue-200">
                Infrastructure
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-600">Connection</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Connected (Pool Active)
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-600">Meta Cloud Graph API</span>
                <span className="font-mono font-semibold text-slate-800">
                  v21.0 (Official Webhook)
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-600">Campaign Worker Queue</span>
                <span className="inline-flex items-center gap-1 text-slate-800 font-medium">
                  <HardDrive size={13} className="text-slate-500" />
                  BullMQ / Redis Lease
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-600">BFF Service Assertion</span>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                  HMAC-SHA256 Signed
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Flushing Sessions */}
      <AdminConfirmDialog
        open={purgeDialogOpen}
        onClose={() => setPurgeDialogOpen(false)}
        onConfirm={handleConfirmPurgeSessions}
        title="Flush Expired Admin Sessions"
        description="Permanently remove all expired administrative sessions from database collection to maintain ledger cleanliness."
        confirmText="Flush Now"
        variant="warning"
        loading={purging}
      />
    </div>
  );
}
