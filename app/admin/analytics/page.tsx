"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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
  ArrowUpRight,
  CreditCard,
  Download,
  Layers,
  LineChart,
  PieChart as PieIcon,
  RotateCcw,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { adminService, AdminApiError } from "@/src/services/admin-service";
import type { AdminAnalyticsData } from "@/src/types/admin";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getAnalyticsData();
      setData(res);
    } catch (err: unknown) {
      console.error("[AdminAnalyticsPage] Fetch Error Details:", err);

      if (err instanceof AdminApiError) {
        if (err.status === 401) {
          setError("Administrator session has expired. Please sign in again.");
        } else if (err.status === 403) {
          setError(
            "Insufficient permissions. SUPER_ADMIN or FINANCE_ADMIN privileges required.",
          );
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

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      setExportNotice(null);
      await adminService.downloadAnalyticsCsv();
      setExportNotice("Analytics report downloaded successfully.");
      setTimeout(() => setExportNotice(null), 4000);
    } catch (err: unknown) {
      console.error("[AdminAnalyticsPage] Export Error:", err);
      const msg =
        err instanceof Error ? err.message : "Failed to export CSV report";
      setExportNotice(`Export failed: ${msg}`);
      setTimeout(() => setExportNotice(null), 5000);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#88da1c] border-t-transparent" />
          <span className="text-xs font-semibold text-slate-500">
            Loading live platform analytics...
          </span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 mb-3">
          <AlertTriangle size={20} />
        </div>
        <h3 className="text-sm font-bold text-slate-900">
          {error || "Unable to display analytics."}
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          An error occurred while loading revenue and subscription metrics.
          Check your network or permissions.
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

  const {
    overview,
    revenueTrend,
    planDistribution,
    paymentMethods,
    growthTrend,
  } = data;

  const totalCompletedVolume = paymentMethods.reduce(
    (sum, m) => sum + m.amount,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Platform Analytics & Growth
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            Live platform metrics, subscription recurring revenue, and tenant
            adoption across Bangladesh
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadAnalytics}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 transition"
            title="Refresh metrics"
          >
            <RotateCcw size={13} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 disabled:opacity-60 transition"
          >
            {exporting ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border border-white border-t-transparent" />
            ) : (
              <Download size={14} />
            )}
            <span>{exporting ? "Generating..." : "Export CSV"}</span>
          </button>
        </div>
      </div>

      {/* Export Notification Notice */}
      {exportNotice && (
        <div
          className={`rounded-xl border p-3 text-xs font-medium transition ${
            exportNotice.includes("failed")
              ? "border-rose-200 bg-rose-50 text-rose-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-900"
          }`}
        >
          {exportNotice}
        </div>
      )}

      {/* Top Level Metric Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Platform Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Total Revenue
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              ৳{overview.totalRevenueBdt.toLocaleString("en-BD")}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            All-time collected revenue
          </p>
        </div>

        {/* Monthly Recurring Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Monthly Recurring (MRR)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-50 text-lime-700">
              <CreditCard size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              ৳{overview.monthlyRecurringRevenueBdt.toLocaleString("en-BD")}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Active paid subscription run rate
          </p>
        </div>

        {/* Active Subscriptions & ARPU */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Active Subscriptions
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Layers size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {overview.totalActiveSubscriptions}
            </span>
            <span className="text-xs font-medium text-slate-500">
              / {overview.activeWorkspaces} active tenants
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            ARPU: ৳{overview.averageRevenuePerAccount.toLocaleString("en-BD")}
            /mo
          </p>
        </div>

        {/* Total Users & Trial Conversion */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Registered Users
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {overview.totalUsers}
            </span>
            <span className="text-xs font-medium text-emerald-600">
              ({overview.paidUsers} Paid)
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {overview.trialUsers} free trial / unverified accounts
          </p>
        </div>
      </div>

      {/* Analytics Charts Grid - Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Revenue Trend */}
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Monthly Revenue Trend (BDT)
              </h3>
              <p className="text-xs text-slate-500">
                Completed billing and payment volume aggregated by month
              </p>
            </div>
            <span className="self-start sm:self-auto text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              ৳{overview.monthlyRecurringRevenueBdt.toLocaleString("en-BD")} /
              mo
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {revenueTrend.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-400 gap-2">
                <LineChart size={32} className="text-slate-300" />
                <span className="text-xs font-semibold">
                  No completed revenue transactions recorded yet
                </span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend}>
                  <defs>
                    <linearGradient
                      id="revenueGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#88da1c" stopOpacity={0.4} />
                      <stop
                        offset="95%"
                        stopColor="#88da1c"
                        stopOpacity={0.0}
                      />
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
                      "Volume",
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
                Active tenants by Starter, Business Pro, and Enterprise tiers
              </p>
            </div>
            <span className="self-start sm:self-auto text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              {overview.totalActiveSubscriptions} Active Plans
            </span>
          </div>

          <div className="h-56 sm:h-64 w-full flex items-center justify-center">
            {planDistribution.every((d) => d.value === 0) ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-400 gap-2">
                <PieIcon size={32} className="text-slate-300" />
                <span className="text-xs font-semibold">
                  No active subscriptions found
                </span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      `${val} Workspaces`,
                      String(name ?? "Plan"),
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 border-t border-slate-100 pt-3">
            {planDistribution.map((item) => (
              <div
                key={item.planCode}
                className="flex items-center gap-1.5 sm:gap-2 text-xs"
              >
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-slate-600">{item.name}</span>
                <span className="font-bold text-slate-900">({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid - Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Workspace & User Growth Trend */}
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Platform Onboarding & Growth
              </h3>
              <p className="text-xs text-slate-500">
                New tenant workspaces and user registrations created each month
              </p>
            </div>
            <span className="self-start sm:self-auto text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              {overview.totalWorkspaces} Workspaces Total
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {growthTrend.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-400 gap-2">
                <Users size={32} className="text-slate-300" />
                <span className="text-xs font-semibold">
                  No monthly growth data available
                </span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Bar
                    dataKey="workspaces"
                    name="Workspaces"
                    fill="#0284c7"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="users"
                    name="Users"
                    fill="#88da1c"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Payment Gateways & Methods
              </h3>
              <p className="text-xs text-slate-500">
                Transaction volume distribution across bKash, Nagad, and City
                Bank
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              <Wallet size={12} />
              <span>৳{totalCompletedVolume.toLocaleString("en-BD")}</span>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {paymentMethods.length === 0 ? (
              <div className="flex h-56 flex-col items-center justify-center text-slate-400 gap-2">
                <CreditCard size={32} className="text-slate-300" />
                <span className="text-xs font-semibold">
                  No completed payments by method recorded
                </span>
              </div>
            ) : (
              paymentMethods.map((pm) => {
                const percent =
                  totalCompletedVolume > 0
                    ? Math.round((pm.amount / totalCompletedVolume) * 100)
                    : 0;

                return (
                  <div
                    key={pm.method}
                    className="rounded-xl border border-slate-100 p-3 hover:bg-slate-50/70 transition"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-semibold text-slate-800">
                        {pm.label}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          ৳{pm.amount.toLocaleString("en-BD")}
                        </span>
                        <span className="text-slate-400 font-medium">
                          ({pm.count} txns)
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#88da1c]"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="mt-1 flex justify-end text-[10px] text-slate-400 font-medium">
                      {percent}% of volume
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Backend Live Architecture Footer */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
        <div className="flex items-start gap-2.5">
          <AlertCircle size={16} className="text-slate-500 mt-0.5 shrink-0" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-slate-900">
              Live Data Disclaimer:
            </strong>{" "}
            . All metrics are computed dynamically with zero mock fallback.
          </div>
        </div>
      </div>
    </div>
  );
}
