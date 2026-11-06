"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertCircle,
  AlertTriangle,
  Download,
  LineChart,
  PieChart as PieIcon,
  RotateCcw,
} from "lucide-react";
import AdminUnimplementedModal from "@/src/component/admin/admin-unimplemented-modal";
import { adminService, type AdminRevenueData, AdminApiError } from "@/src/services/admin-service";
import type { AdminPlatformOverviewMetrics } from "@/src/types/admin";

export default function AdminAnalyticsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [revenueData, setRevenueData] = useState<AdminRevenueData | null>(null);
  const [overviewMetrics, setOverviewMetrics] = useState<AdminPlatformOverviewMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rev, ov] = await Promise.all([
        adminService.getRevenueMetrics(),
        adminService.getOverviewMetrics(),
      ]);

      setRevenueData(rev);
      setOverviewMetrics(ov.metrics);
    } catch (err: unknown) {
      console.error("[AdminAnalyticsPage] Fetch Error Details:", err);

      if (err instanceof AdminApiError) {
        if (err.status === 401) {
          setError("Administrator session has expired. Please sign in again.");
        } else if (err.status === 403) {
          setError("Insufficient permissions. SUPER_ADMIN or FINANCE_ADMIN privileges required.");
        } else {
          setError(`Backend Error (${err.code}): ${err.message}`);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load platform analytics. Please retry.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#88da1c] border-t-transparent" />
          <span className="text-xs font-semibold text-slate-500">
            Loading platform analytics...
          </span>
        </div>
      </div>
    );
  }

  if (error || !revenueData || !overviewMetrics) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 mb-3">
          <AlertTriangle size={20} />
        </div>
        <h3 className="text-sm font-bold text-slate-900">
          {error || "Unable to display analytics."}
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          An error occurred while loading revenue and subscription metrics. Check your network or permissions.
        </p>
        <button
          onClick={loadAnalytics}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
        >
          <RotateCcw size={14} />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  // Safe data mapping with empty-state protection
  const monthlyRevenueChartData = (revenueData.monthly || []).map((m) => ({
    month: m.month,
    revenue: m.amount,
    count: m.count,
  }));

  const plans = overviewMetrics.plansBreakdown || {
    STARTER: 0,
    BUSINESS_PRO: 0,
    ENTERPRISE: 0,
  };

  const planDistributionChartData = [
    {
      name: "Starter (৳3k)",
      value: plans.STARTER || 0,
      color: "#0284c7",
    },
    {
      name: "Business Pro (৳7.4k)",
      value: plans.BUSINESS_PRO || 0,
      color: "#88da1c",
    },
    {
      name: "Enterprise (৳18.6k)",
      value: plans.ENTERPRISE || 0,
      color: "#7e22ce",
    },
  ];

  const totalActiveSubscriptions = overviewMetrics.activeSubscriptions ?? 0;
  const currentRunRate = revenueData.totalRevenueBdt ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Platform Analytics & Growth
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            Platform-wide growth trajectories and revenue volume across Bangladesh
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
            Backend Status: LIVE_READONLY
          </span>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
          >
            <Download size={14} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Backend API Notice */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-950">
        <div className="flex items-start gap-2.5">
          <AlertCircle size={16} className="text-emerald-700 mt-0.5 shrink-0" />
          <div>
            <strong className="font-bold">Live Backend Aggregation:</strong> Platform analytics are dynamically fetched from backend routes{" "}
            <code className="rounded bg-emerald-100 px-1 py-0.5 font-mono text-[11px]">
              GET /api/platform-admin/dashboard/revenue
            </code>{" "}
            and{" "}
            <code className="rounded bg-emerald-100 px-1 py-0.5 font-mono text-[11px]">
              GET /api/platform-admin/dashboard/overview
            </code>
            .
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Volume */}
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Monthly Recurring Revenue Trend (BDT)
              </h3>
              <p className="text-xs text-slate-500">
                Monthly billed subscription volume in Bangladeshi Taka
              </p>
            </div>
            <span className="self-start sm:self-auto text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              ৳{currentRunRate.toLocaleString("en-BD")} / mo
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {monthlyRevenueChartData.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-400 gap-2">
                <LineChart size={32} className="text-slate-300" />
                <span className="text-xs font-semibold">No revenue transactions recorded yet</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenueChartData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#88da1c" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#88da1c" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => `৳${Number(val) / 1000}k`}
                  />
                  <Tooltip
                    formatter={(val: unknown) => [
                      `৳${Number(val || 0).toLocaleString()} BDT`,
                      "Revenue",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#88da1c"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Plan Distribution by Active Workspaces
              </h3>
              <p className="text-xs text-slate-500">
                Tenant volume broken down by STARTER, BUSINESS_PRO, and ENTERPRISE
              </p>
            </div>
            <span className="self-start sm:self-auto text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              {totalActiveSubscriptions} Active
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full flex items-center justify-center">
            {planDistributionChartData.every((d) => d.value === 0) ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-400 gap-2">
                <PieIcon size={32} className="text-slate-300" />
                <span className="text-xs font-semibold">No active subscriptions found</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistributionChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {planDistributionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 border-t border-slate-100 pt-3">
            {planDistributionChartData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 sm:gap-2 text-xs">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-slate-600">{item.name}</span>
                <span className="font-bold text-slate-900">({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AdminUnimplementedModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        actionTitle="Export Aggregated Analytics"
        missingEndpoint="GET /api/admin/analytics/export"
        explanation="Multi-tenant aggregate metrics and platform CSV/PDF export endpoints are not implemented in cyber7-backend."
      />
    </div>
  );
}