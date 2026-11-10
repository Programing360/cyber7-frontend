"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  MessageSquare,
  RefreshCw,
  Send,
  TrendingUp,
  XCircle,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import DashboardLayout from "@/src/component/dashboard/dashboard-layout";
import { useWorkspace } from "@/src/context/workspace-context";
import { analyticsService } from "@/src/services/analytics-service";
import type {
  AnalyticsPeriod,
  WorkspaceAnalyticsCampaignItem,
  WorkspaceAnalyticsData,
  WorkspaceAnalyticsRates,
  WorkspaceAnalyticsSummary,
  WorkspaceAnalyticsTimeSeriesItem,
  WorkspaceAnalyticsTrend,
} from "@/src/types/api";

const numberFormatter = new Intl.NumberFormat("en-US");

const chartColors = {
  sent: "#2563EB",
  delivered: "#10B981",
  read: "#8B5CF6",
  failed: "#EF4444",
  pending: "#F59E0B",
};

const statusColors = [
  chartColors.delivered,
  chartColors.read,
  chartColors.pending,
  chartColors.failed,
];

const periodOptions: { label: string; value: AnalyticsPeriod }[] = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
];

function percentage(value: number, total: number) {
  if (total <= 0) return "0.0";
  return ((value / total) * 100).toFixed(1);
}

export default function AnalyticsPage() {
  const { activeWorkspace, isLoading: isWorkspaceLoading } = useWorkspace();

  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");
  const [chartView, setChartView] = useState<"area" | "line">("area");
  const [analytics, setAnalytics] = useState<WorkspaceAnalyticsData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string>("");

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3500);
  }

  const fetchAnalytics = useCallback(
    async (isManualRefresh = false) => {
      if (!activeWorkspace?.id) {
        setAnalytics(null);
        setIsLoading(false);
        return;
      }

      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await analyticsService.getWorkspaceAnalytics({
          workspaceId: activeWorkspace.id,
          period,
        });
        setAnalytics(data);
        if (isManualRefresh) {
          showToast("Live analytics updated successfully.");
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load real-time analytics data";
        setError(message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [activeWorkspace?.id, period],
  );

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Fallbacks for zero or pending state
  const summary: WorkspaceAnalyticsSummary = useMemo(
    () =>
      analytics?.summary ?? {
        totalSent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        pending: 0,
      },
    [analytics],
  );

  const rates: WorkspaceAnalyticsRates = useMemo(
    () =>
      analytics?.rates ?? {
        deliveryRate: 0,
        readRate: 0,
        failureRate: 0,
      },
    [analytics],
  );

  const trends: WorkspaceAnalyticsTrend = useMemo(
    () =>
      analytics?.trends ?? {
        totalSentChange: "0.0%",
        totalSentPositive: true,
        deliveredChange: "0.0%",
        deliveredPositive: true,
        readChange: "0.0%",
        readPositive: true,
        failedChange: "0.0%",
        failedPositive: false,
      },
    [analytics],
  );

  const chartData: WorkspaceAnalyticsTimeSeriesItem[] = useMemo(
    () => analytics?.chartData ?? [],
    [analytics],
  );

  const statusData = useMemo(
    () =>
      analytics?.statusData ?? [
        { name: "Delivered", value: 0 },
        { name: "Read", value: 0 },
        { name: "Pending", value: 0 },
        { name: "Failed", value: 0 },
      ],
    [analytics],
  );

  const campaigns: WorkspaceAnalyticsCampaignItem[] = useMemo(
    () => analytics?.campaigns ?? [],
    [analytics],
  );

  const totalStatusCount = useMemo(
    () => statusData.reduce((total, item) => total + item.value, 0),
    [statusData],
  );

  function exportReport() {
    if (!chartData || chartData.length === 0) {
      showToast("No analytics data available to export for this period.");
      return;
    }

    const headers = ["Date", "Sent", "Delivered", "Read", "Failed"];

    const rows = chartData.map((item) => [
      item.date,
      item.sent,
      item.delivered,
      item.read,
      item.failed,
    ]);

    let csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\r\n");

    if (campaigns && campaigns.length > 0) {
      csv += "\r\n\r\nCampaigns,Sent,Delivered,Read,Failed,Status\r\n";
      const campaignRows = campaigns.map((c) => [
        c.name,
        c.sent,
        c.delivered,
        c.read,
        c.failed,
        c.status,
      ]);
      csv += campaignRows
        .map((row) =>
          row
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(","),
        )
        .join("\r\n");
    }

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const workspaceSlug = (activeWorkspace?.name || "workspace")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    link.href = url;
    link.download = `vexchat-analytics-${workspaceSlug}-${period}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    showToast("Live analytics CSV exported successfully.");
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1500px] space-y-7 p-4">
        {/* Header */}
        <section className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              <BarChart3 size={15} />
              Performance Insights
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Analytics
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Track real-time message delivery, recipient engagement, and
              campaign performance for{" "}
              {activeWorkspace?.name || "your workspace"}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Period Selector */}
            <div className="relative">
              <select
                value={period}
                onChange={(event) =>
                  setPeriod(event.target.value as AnalyticsPeriod)
                }
                aria-label="Analytics date range"
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50 sm:w-44"
              >
                {periodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                ▾
              </span>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => fetchAnalytics(true)}
              disabled={isLoading || isRefreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
              title="Refresh live metrics"
            >
              <RefreshCw
                size={16}
                className={
                  isRefreshing ? "animate-spin text-blue-600" : "text-slate-500"
                }
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={exportReport}
              disabled={isLoading || chartData.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#88da1c] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#72b41b] disabled:opacity-50"
            >
              <Download size={17} />
              Export Report
            </button>
          </div>
        </section>

        {/* Real-time Live Status Banner */}
        <div className="flex flex-col gap-2 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
            <div>
              <p className="text-sm font-semibold text-emerald-950">
                Live Messaging Analytics
              </p>
              <p className="text-xs text-emerald-800">
                Synchronized with Meta WhatsApp Cloud API webhooks and workspace
                outbound dispatch logs.
              </p>
            </div>
          </div>
          <div className="text-xs font-medium text-emerald-700 sm:text-right">
            Active Workspace:{" "}
            <span className="font-semibold text-emerald-900">
              {activeWorkspace?.name || "Connected"}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => fetchAnalytics()}
              className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && !analytics ? (
          <AnalyticsSkeleton />
        ) : (
          <>
            {/* KPI cards */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              <MetricCard
                title="Total Messages Sent"
                value={summary.totalSent}
                subtitle={`During the selected period`}
                icon={<Send size={20} />}
                iconClass="bg-blue-50 text-blue-600"
                change={trends.totalSentChange}
                positive={trends.totalSentPositive}
              />

              <MetricCard
                title="Delivered Messages"
                value={summary.delivered}
                subtitle={`${rates.deliveryRate.toFixed(1)}% delivery rate`}
                icon={<CheckCircle2 size={20} />}
                iconClass="bg-emerald-50 text-emerald-600"
                change={trends.deliveredChange}
                positive={trends.deliveredPositive}
              />

              <MetricCard
                title="Messages Read"
                value={summary.read}
                subtitle={`${rates.readRate.toFixed(1)}% of delivered`}
                icon={<Eye size={20} />}
                iconClass="bg-violet-50 text-violet-600"
                change={trends.readChange}
                positive={trends.readPositive}
              />

              <MetricCard
                title="Failed Messages"
                value={summary.failed}
                subtitle={`${rates.failureRate.toFixed(1)}% failure rate`}
                icon={<XCircle size={20} />}
                iconClass="bg-red-50 text-red-600"
                change={trends.failedChange}
                positive={trends.failedPositive}
                isImprovement={!trends.failedPositive}
              />
            </section>

            {/* Delivery/read rates */}
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <RateCard
                title="Delivery Rate"
                value={rates.deliveryRate}
                description="Delivered messages / total outbound messages"
                color="bg-emerald-500"
                icon={<CheckCircle2 size={19} />}
              />

              <RateCard
                title="Read Rate"
                value={rates.readRate}
                description="Read messages / delivered messages"
                color="bg-violet-500"
                icon={<Eye size={19} />}
              />

              <RateCard
                title="Pending Messages"
                value={summary.pending}
                description="Messages sent awaiting delivery confirmation"
                color="bg-amber-500"
                icon={<Clock3 size={19} />}
                isCount
              />
            </section>

            {/* Message trend chart */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Message Performance
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Live outbound sent, delivered, and read volume
                  </p>
                </div>

                <div className="flex rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setChartView("area")}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      chartView === "area"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Area
                  </button>

                  <button
                    type="button"
                    onClick={() => setChartView("line")}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      chartView === "line"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Line
                  </button>
                </div>
              </div>

              <div className="mt-7 h-[320px] w-full">
                {chartData.length === 0 || summary.totalSent === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <Activity size={32} className="text-slate-300" />
                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      No message activity recorded in this period
                    </p>
                    <p className="text-xs text-slate-400">
                      Start sending messages or campaigns to see real-time
                      trends.
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    {chartView === "area" ? (
                      <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 8, left: -18, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="sentGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor={chartColors.sent}
                              stopOpacity={0.2}
                            />
                            <stop
                              offset="95%"
                              stopColor={chartColors.sent}
                              stopOpacity={0}
                            />
                          </linearGradient>

                          <linearGradient
                            id="deliveredGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor={chartColors.delivered}
                              stopOpacity={0.18}
                            />
                            <stop
                              offset="95%"
                              stopColor={chartColors.delivered}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          stroke="#E2E8F0"
                          strokeDasharray="4 4"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "#94A3B8", fontSize: 12 }}
                          dy={10}
                        />

                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "#94A3B8", fontSize: 12 }}
                        />

                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            border: "1px solid #E2E8F0",
                            boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                          }}
                        />

                        <Legend
                          verticalAlign="top"
                          align="right"
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ paddingBottom: 24, fontSize: 12 }}
                        />

                        <Area
                          type="monotone"
                          dataKey="sent"
                          name="Sent"
                          stroke={chartColors.sent}
                          strokeWidth={2.5}
                          fill="url(#sentGradient)"
                        />

                        <Area
                          type="monotone"
                          dataKey="delivered"
                          name="Delivered"
                          stroke={chartColors.delivered}
                          strokeWidth={2.5}
                          fill="url(#deliveredGradient)"
                        />

                        <Area
                          type="monotone"
                          dataKey="read"
                          name="Read"
                          stroke={chartColors.read}
                          strokeWidth={2.5}
                          fill="transparent"
                        />
                      </AreaChart>
                    ) : (
                      <LineChart
                        data={chartData}
                        margin={{ top: 10, right: 8, left: -18, bottom: 0 }}
                      >
                        <CartesianGrid
                          stroke="#E2E8F0"
                          strokeDasharray="4 4"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "#94A3B8", fontSize: 12 }}
                          dy={10}
                        />

                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "#94A3B8", fontSize: 12 }}
                        />

                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            border: "1px solid #E2E8F0",
                          }}
                        />

                        <Legend
                          verticalAlign="top"
                          align="right"
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ paddingBottom: 24, fontSize: 12 }}
                        />

                        <Line
                          type="monotone"
                          dataKey="sent"
                          name="Sent"
                          stroke={chartColors.sent}
                          strokeWidth={2.5}
                          dot={false}
                        />

                        <Line
                          type="monotone"
                          dataKey="delivered"
                          name="Delivered"
                          stroke={chartColors.delivered}
                          strokeWidth={2.5}
                          dot={false}
                        />

                        <Line
                          type="monotone"
                          dataKey="read"
                          name="Read"
                          stroke={chartColors.read}
                          strokeWidth={2.5}
                          dot={false}
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                )}
              </div>
            </section>

            {/* Status breakdown and delivery insights */}
            <section className="grid grid-cols-1 gap-5 xl:grid-cols-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Message Status
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Live distribution for the selected period
                  </p>
                </div>

                <div className="relative mt-5 h-[245px]">
                  {totalStatusCount === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <Clock3 size={28} className="text-slate-300" />
                      <p className="mt-2 text-xs font-medium text-slate-400">
                        No messages in this timeframe
                      </p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={92}
                          paddingAngle={3}
                          stroke="none"
                        >
                          {statusData.map((item, index) => (
                            <Cell
                              key={item.name}
                              fill={statusColors[index % statusColors.length]}
                            />
                          ))}
                        </Pie>

                        <Tooltip
                          formatter={(value) =>
                            numberFormatter.format(Number(value))
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}

                  {totalStatusCount > 0 && (
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xs font-medium text-slate-500">
                        Total messages
                      </span>

                      <span className="mt-1 text-2xl font-bold text-slate-900">
                        {numberFormatter.format(totalStatusCount)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {statusData.map((item, index) => {
                    const color = statusColors[index % statusColors.length];

                    return (
                      <div
                        key={item.name}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: color }}
                          />

                          <span className="text-sm text-slate-600">
                            {item.name}
                          </span>
                        </div>

                        <span className="text-sm font-semibold text-slate-900">
                          {numberFormatter.format(item.value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Delivery Insights
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Key messaging health indicators
                    </p>
                  </div>

                  <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                    <TrendingUp size={20} />
                  </div>
                </div>

                <div className="mt-7 space-y-6">
                  <InsightBar
                    title="Delivery success"
                    value={rates.deliveryRate}
                    description={`${numberFormatter.format(summary.delivered)} delivered out of ${numberFormatter.format(summary.totalSent)} sent`}
                    color="bg-emerald-500"
                  />

                  <InsightBar
                    title="Read engagement"
                    value={rates.readRate}
                    description={`${numberFormatter.format(summary.read)} messages read out of ${numberFormatter.format(summary.delivered)} delivered`}
                    color="bg-violet-500"
                  />

                  <InsightBar
                    title="Message failure"
                    value={rates.failureRate}
                    description={`${numberFormatter.format(summary.failed)} failed messages`}
                    color="bg-red-500"
                  />
                </div>

                <div className="mt-7 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <RefreshCw
                      size={18}
                      className="mt-0.5 shrink-0 text-slate-500"
                    />

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Selected reporting period
                      </p>

                      <p className="mt-1 text-sm leading-5 text-slate-500">
                        {period === "7d"
                          ? "Last 7 days"
                          : period === "30d"
                            ? "Last 30 days"
                            : "Last 90 days"}{" "}
                        of live database metrics in Asia/Dhaka time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Campaign performance */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Campaign Performance
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Compare delivery and engagement across workspace campaigns
                  </p>
                </div>

                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  <MessageSquare size={13} />
                  {campaigns.length}{" "}
                  {campaigns.length === 1 ? "campaign" : "campaigns"}
                </span>
              </div>

              {campaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="rounded-full bg-slate-100 p-3 text-slate-400">
                    <MessageSquare size={24} />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-800">
                    No campaigns created yet
                  </p>
                  <p className="mt-1 max-w-sm text-xs text-slate-500">
                    Create a broadcast campaign to track recipient delivery and
                    read rates here in real-time.
                  </p>
                  <Link
                    href="/campaigns"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    Go to Campaigns
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <TableHeading>Campaign</TableHeading>
                        <TableHeading>Status</TableHeading>
                        <TableHeading>Sent</TableHeading>
                        <TableHeading>Delivered</TableHeading>
                        <TableHeading>Delivery Rate</TableHeading>
                        <TableHeading>Read Rate</TableHeading>
                        <TableHeading>Failed</TableHeading>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {campaigns.map((campaign) => {
                        const campaignDeliveryRate = Number(
                          percentage(campaign.delivered, campaign.sent),
                        );

                        const campaignReadRate = Number(
                          percentage(campaign.read, campaign.delivered),
                        );

                        return (
                          <tr
                            key={campaign.id}
                            className="transition hover:bg-slate-50/70"
                          >
                            <td className="px-5 py-4">
                              <p className="text-sm font-semibold text-slate-900">
                                {campaign.name}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {new Date(
                                  campaign.createdAt,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  campaign.status === "COMPLETED"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : campaign.status === "PROCESSING"
                                      ? "bg-blue-50 text-blue-700 animate-pulse"
                                      : campaign.status === "SCHEDULED"
                                        ? "bg-amber-50 text-amber-700"
                                        : campaign.status === "FAILED"
                                          ? "bg-red-50 text-red-700"
                                          : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {campaign.status}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-sm font-medium text-slate-700">
                              {numberFormatter.format(campaign.sent)}
                            </td>

                            <td className="px-5 py-4 text-sm font-medium text-slate-700">
                              {numberFormatter.format(campaign.delivered)}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex min-w-28 items-center gap-3">
                                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                                  <div
                                    className="h-full rounded-full bg-emerald-500"
                                    style={{
                                      width: `${Math.min(campaignDeliveryRate, 100)}%`,
                                    }}
                                  />
                                </div>

                                <span className="text-xs font-semibold text-slate-700">
                                  {campaignDeliveryRate.toFixed(1)}%
                                </span>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-sm font-medium text-slate-700">
                              {campaignReadRate.toFixed(1)}%
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  campaign.failed > 0
                                    ? "bg-red-50 text-red-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {numberFormatter.format(campaign.failed)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
                Campaign metrics are synchronized in real-time with Meta Cloud
                API webhooks.
              </div>
            </section>
          </>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[60] flex max-w-sm items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl"
        >
          <CheckCircle2 size={17} className="shrink-0 text-emerald-400" />
          {toast}
        </div>
      )}
    </DashboardLayout>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  iconClass,
  change,
  positive,
  isImprovement = false,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  iconClass: string;
  change: string;
  positive: boolean;
  isImprovement?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {numberFormatter.format(value)}
          </p>
        </div>
        <div className={`rounded-xl p-3 ${iconClass}`}>{icon}</div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
            positive || isImprovement
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {change}
        </span>

        <span className="text-xs text-slate-500">{subtitle}</span>
      </div>
    </div>
  );
}

function RateCard({
  title,
  value,
  description,
  color,
  icon,
  isCount = false,
}: {
  title: string;
  value: number;
  description: string;
  color: string;
  icon: React.ReactNode;
  isCount?: boolean;
}) {
  const progress = isCount ? 0 : Math.min(Math.max(value, 0), 100);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        <div className={`rounded-lg p-2 ${color} text-white`}>{icon}</div>
      </div>
      <p className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
        {isCount ? numberFormatter.format(value) : `${value.toFixed(1)}%`}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
      {!isCount && (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${color}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

function InsightBar({
  title,
  value,
  description,
  color,
}: {
  title: string;
  value: number;
  description: string;
  color: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-700">{title}</span>
        <span className="text-sm font-bold text-slate-900">
          {value.toFixed(1)}%
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}

function TableHeading({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
      {children}
    </th>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-7 animate-pulse">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl border border-slate-200 bg-slate-100/70 p-5"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-36 rounded-2xl border border-slate-200 bg-slate-100/70 p-5"
          />
        ))}
      </div>
      <div className="h-80 rounded-2xl border border-slate-200 bg-slate-100/70 p-5" />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <div className="h-72 rounded-2xl border border-slate-200 bg-slate-100/70 p-5 xl:col-span-2" />
        <div className="h-72 rounded-2xl border border-slate-200 bg-slate-100/70 p-5 xl:col-span-3" />
      </div>
    </div>
  );
}
