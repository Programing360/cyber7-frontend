"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  CreditCard,
  HelpCircle,
  Hourglass,
  Layers,
  LineChart,
  Repeat,
  RotateCcw,
  ShieldAlert,
  Users,
} from "lucide-react";
import AdminStatCard from "@/src/component/admin/admin-stat-card";
import AdminStatusBadge from "@/src/component/admin/admin-status-badge";
import { adminService } from "@/src/services/admin-service";
import type { AdminPlatformOverviewMetrics } from "@/src/types/admin";

export default function AdminPage() {
  const [metrics, setMetrics] = useState<AdminPlatformOverviewMetrics | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getOverviewMetrics();
      // console.log(res);
      setMetrics(res.metrics);
    } catch {
      setError("Failed to load platform overview metrics. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#88da1c] border-t-transparent" />
          <span className="text-xs font-semibold text-slate-500">
            Loading platform metrics...
          </span>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 mb-3">
          <AlertTriangle size={20} />
        </div>
        <h3 className="text-sm font-bold text-slate-900">
          {error || "Unable to display overview metrics."}
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          An error occurred while preparing platform analytics.
        </p>
        <button
          onClick={loadMetrics}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          <RotateCcw size={14} />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  const formatBdt = (num: number) =>
    `৳${num.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      {/* Header block */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Platform Overview
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            High-level real-time metrics and system status aggregated directly
            from backend.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/payments"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#88da1c] px-3.5 py-2 text-xs font-bold text-slate-950 shadow-xs hover:bg-[#78c418] focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
          >
            <Hourglass size={14} />
            <span>
              Review Pending Transfers ({metrics.pendingTransfersCount})
            </span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          title="Total Workspaces"
          value={metrics.totalWorkspaces}
          subtext="Across all tenants"
          backendSupport={metrics.backendSupport.totalWorkspaces}
          icon={<Building2 size={20} />}
        />

        <AdminStatCard
          title="Platform Users"
          value={metrics.totalUsers}
          subtext="Owners, Admins & Agents"
          backendSupport={metrics.backendSupport.totalUsers}
          icon={<Users size={20} />}
        />

        <AdminStatCard
          title="Active Subscriptions"
          value={metrics.activeSubscriptions}
          subtext="Monthly billed workspaces"
          backendSupport={metrics.backendSupport.activeSubscriptions}
          icon={<Repeat size={20} />}
        />

        <AdminStatCard
          title="Monthly Run-Rate (BDT)"
          value={formatBdt(metrics.subscriptionRevenueBdt)}
          subtext="Denominated strictly in BDT"
          backendSupport={metrics.backendSupport.subscriptionRevenue}
          icon={<CreditCard size={20} />}
        />
      </div>

      {/* Pending Transfers Callout & Backend Contract Card */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pending Bank Transfers (Demo Preview - Dedicated Admin Auth Required) */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 shadow-xs lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
                <Hourglass size={16} className="text-amber-600" />
                Pending Bank Transfers
              </span>
              <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                (Dedicated Auth Required)
              </span>
            </div>

            <div className="mt-4">
              <div className="text-3xl font-black text-slate-900">
                {metrics.pendingTransfersCount}{" "}
                <span className="text-sm font-semibold text-slate-500">
                  deposits pending
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600">
                Total volume:{" "}
                <strong className="text-slate-900">
                  {formatBdt(metrics.pendingTransfersAmountBdt)}
                </strong>{" "}
                awaiting manual verification in City Bank portal (Direct Admin
                Auth Required).
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-amber-200/60 pt-4">
            <Link
              href="/admin/payments"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-black hover:text-white shadow-xs hover:scale-105 focus:outline-hidden focus:ring-2 "
            >
              <span>Open Transfer Queue</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Plan Distribution (Authoritative Backend Plans) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Active Subscription Plan Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Distribution across official backend plans (BDT pricing)
              </p>
            </div>
            <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 uppercase tracking-wider">
              Live Distribution
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-4">
              <div className="flex items-center justify-between">
                <AdminStatusBadge status="STARTER" />
                <span className="text-xs font-bold text-sky-900">
                  ৳3,000/mo
                </span>
              </div>
              <div className="mt-3 text-2xl font-black text-slate-900">
                {metrics.plansBreakdown.STARTER}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Workspaces (1 WhatsApp num, 3 agents)
              </p>
            </div>

            <div className="rounded-xl border border-[#d4f2aa] bg-[#effbdd]/60 p-4">
              <div className="flex items-center justify-between">
                <AdminStatusBadge status="BUSINESS_PRO" />
                <span className="text-xs font-bold text-[#365314]">
                  ৳7,400/mo
                </span>
              </div>
              <div className="mt-3 text-2xl font-black text-slate-900">
                {metrics.plansBreakdown.BUSINESS_PRO}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Workspaces (2 WhatsApp nums, 10 agents)
              </p>
            </div>

            <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4">
              <div className="flex items-center justify-between">
                <AdminStatusBadge status="ENTERPRISE" />
                <span className="text-xs font-bold text-purple-900">
                  ৳18,600/mo
                </span>
              </div>
              <div className="mt-3 text-2xl font-black text-slate-900">
                {metrics.plansBreakdown.ENTERPRISE}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Workspaces (Unlimited nums & agents)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Module Navigation Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Platform Administration Modules
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/workspaces"
            className="flex flex-col justify-between rounded-xl border border-slate-200 p-4 transition hover:border-[#88da1c] hover:bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
          >
            <div>
              <div className="flex items-center justify-between">
                <Building2 size={20} className="text-slate-700" />
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 uppercase">
                  Live
                </span>
              </div>
              <h4 className="mt-3 text-sm font-bold text-slate-900">
                Workspace Management
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Tenants, owners, member counts, suspension status
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#426d14]">
              View Workspaces <ArrowRight size={12} />
            </span>
          </Link>

          <Link
            href="/admin/users"
            className="flex flex-col justify-between rounded-xl border border-slate-200 p-4 transition hover:border-[#88da1c] hover:bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
          >
            <div>
              <div className="flex items-center justify-between">
                <Users size={20} className="text-slate-700" />
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 uppercase">
                  Live
                </span>
              </div>
              <h4 className="mt-3 text-sm font-bold text-slate-900">
                User Management
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Platform roles (SUPER_ADMIN, FINANCE_ADMIN, USER)
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#426d14]">
              View Users <ArrowRight size={12} />
            </span>
          </Link>

          <Link
            href="/admin/subscriptions"
            className="flex flex-col justify-between rounded-xl border border-slate-200 p-4 transition hover:border-[#88da1c] hover:bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
          >
            <div>
              <div className="flex items-center justify-between">
                <Repeat size={20} className="text-slate-700" />
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 uppercase">
                  Live
                </span>
              </div>
              <h4 className="mt-3 text-sm font-bold text-slate-900">
                Subscriptions & Plans
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Billing cycles, anchor days, renewal windows
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#426d14]">
              Manage Plans <ArrowRight size={12} />
            </span>
          </Link>

          <Link
            href="/admin/payments"
            className="flex flex-col justify-between rounded-xl border border-slate-200 p-4 transition hover:border-[#88da1c] hover:bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
          >
            <div>
              <div className="flex items-center justify-between">
                <CreditCard size={20} className="text-slate-700" />
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 uppercase">
                  Live
                </span>
              </div>
              <h4 className="mt-3 text-sm font-bold text-slate-900">
                Payment Verification
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                City Bank manual transfers & transaction audits
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#426d14]">
              Review Queue <ArrowRight size={12} />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
