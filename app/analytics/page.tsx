"use client";

import { useMemo, useState } from "react";
import {
  Activity,
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

import {
  analyticsData,
  analyticsSummary,
  campaignMetrics,
  getMessageStatusMetrics,
  type AnalyticsPeriod,
} from "@/src/data/mock/analytics";

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
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");
  const [chartView, setChartView] = useState<"area" | "line">("area");
  const [toast, setToast] = useState("");

  const summary = analyticsSummary[period];
  const chartData = analyticsData[period];

  const deliveryRate = Number(percentage(summary.delivered, summary.totalSent));

  const readRate = Number(percentage(summary.read, summary.delivered));

  const failureRate = Number(percentage(summary.failed, summary.totalSent));

  const statusData = useMemo(() => getMessageStatusMetrics(summary), [summary]);

  const totalStatusCount = statusData.reduce(
    (total, item) => total + item.value,
    0,
  );

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  }

  function exportReport() {
    const headers = ["Date", "Sent", "Delivered", "Read", "Failed"];

    const rows = chartData.map((item) => [
      item.date,
      item.sent,
      item.delivered,
      item.read,
      item.failed,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `cyber7-analytics-${period}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    showToast("Demo analytics CSV exported.");
  }

  return (
    <DashboardLayout>
      {" "}
      <div className="mx-auto max-w-[1500px] space-y-7">
        {/* Header */}{" "}
        <section className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          {" "}
          <div>
            {" "}
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              {" "}
              <BarChart3 size={15} />
              Performance Insights{" "}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Analytics
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Track message delivery, customer engagement, and campaign
              performance from one dashboard.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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

            <button
              type="button"
              onClick={exportReport}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Download size={17} />
              Export Report
            </button>
          </div>
        </section>
        {/* Demo notice */}
        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
          <Activity size={19} className="mt-0.5 shrink-0 text-blue-600" />

          <div>
            <p className="text-sm font-semibold text-blue-900">
              Analytics preview
            </p>

            <p className="mt-1 text-sm leading-5 text-blue-800/80">
              This dashboard uses sample data for demonstration. Metrics do not
              represent actual WhatsApp delivery, read receipts, or campaign
              results.
            </p>
          </div>
        </div>
        {/* KPI cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <MetricCard
            title="Total Messages Sent"
            value={summary.totalSent}
            subtitle={`During the selected period`}
            icon={<Send size={20} />}
            iconClass="bg-blue-50 text-blue-600"
            change="+12.8%"
            positive
          />

          <MetricCard
            title="Delivered Messages"
            value={summary.delivered}
            subtitle={`${deliveryRate}% delivery rate`}
            icon={<CheckCircle2 size={20} />}
            iconClass="bg-emerald-50 text-emerald-600"
            change="+8.4%"
            positive
          />

          <MetricCard
            title="Messages Read"
            value={summary.read}
            subtitle={`${readRate}% of delivered`}
            icon={<Eye size={20} />}
            iconClass="bg-violet-50 text-violet-600"
            change="+6.2%"
            positive
          />

          <MetricCard
            title="Failed Messages"
            value={summary.failed}
            subtitle={`${failureRate}% failure rate`}
            icon={<XCircle size={20} />}
            iconClass="bg-red-50 text-red-600"
            change="-2.1%"
            positive={false}
            isImprovement
          />
        </section>
        {/* Delivery/read rates */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <RateCard
            title="Delivery Rate"
            value={deliveryRate}
            description="Delivered messages / messages sent"
            color="bg-emerald-500"
            icon={<CheckCircle2 size={19} />}
          />

          <RateCard
            title="Read Rate"
            value={readRate}
            description="Read messages / delivered messages"
            color="bg-violet-500"
            icon={<Eye size={19} />}
          />

          <RateCard
            title="Pending Messages"
            value={summary.pending}
            description="Messages awaiting a final status"
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
                Sent, delivered, and read message trends
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
                Breakdown for the selected period
              </p>
            </div>

            <div className="relative mt-5 h-[245px]">
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
                    formatter={(value) => numberFormatter.format(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-medium text-slate-500">
                  Total statuses
                </span>

                <span className="mt-1 text-2xl font-bold text-slate-900">
                  {numberFormatter.format(totalStatusCount)}
                </span>
              </div>
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
                value={deliveryRate}
                description={`${numberFormatter.format(summary.delivered)} delivered out of ${numberFormatter.format(summary.totalSent)} sent`}
                color="bg-emerald-500"
              />

              <InsightBar
                title="Read engagement"
                value={readRate}
                description={`${numberFormatter.format(summary.read)} messages read out of ${numberFormatter.format(summary.delivered)} delivered`}
                color="bg-violet-500"
              />

              <InsightBar
                title="Message failure"
                value={failureRate}
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
                    of illustrative demo statistics.
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
                Compare delivery and engagement across demo campaigns
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              <MessageSquare size={13} />
              {campaignMetrics.length} campaigns
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  <TableHeading>Campaign</TableHeading>
                  <TableHeading>Sent</TableHeading>
                  <TableHeading>Delivered</TableHeading>
                  <TableHeading>Delivery Rate</TableHeading>
                  <TableHeading>Read Rate</TableHeading>
                  <TableHeading>Failed</TableHeading>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {campaignMetrics.map((campaign) => {
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

                        <p className="mt-1 text-xs text-slate-500">
                          Demo campaign
                        </p>
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
                        <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                          {numberFormatter.format(campaign.failed)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
            Campaign values are illustrative and are not linked to the Campaigns
            module.
          </div>
        </section>
      </div>
      {/* Toast */}
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
      {" "}
      <div className="flex items-start justify-between gap-3">
        {" "}
        <div>
          {" "}
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
      {" "}
      <div className="flex items-center justify-between gap-3">
        {" "}
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
      {" "}
      <div className="mb-2 flex items-center justify-between gap-3">
        {" "}
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
      {children}{" "}
    </th>
  );
}
