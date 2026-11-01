"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import type { DashboardMessageActivityItem } from "@/src/types/api";

interface MessagesChartProps {
  data?: DashboardMessageActivityItem[];
  isLoading?: boolean;
  period?: string;
  onPeriodChange?: (period: string) => void;
}

export default function MessagesChart({
  data = [],
  isLoading = false,
  period = "7 days",
  onPeriodChange,
}: MessagesChartProps) {
  const [localPeriod, setLocalPeriod] = useState(period);

  const handlePeriodChange = (val: string) => {
    setLocalPeriod(val);
    onPeriodChange?.(val);
  };

  const chartData = data.length > 0 ? data : [
    { day: "Mon", incoming: 0, outgoing: 0 },
    { day: "Tue", incoming: 0, outgoing: 0 },
    { day: "Wed", incoming: 0, outgoing: 0 },
    { day: "Thu", incoming: 0, outgoing: 0 },
    { day: "Fri", incoming: 0, outgoing: 0 },
    { day: "Sat", incoming: 0, outgoing: 0 },
    { day: "Sun", incoming: 0, outgoing: 0 },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Message Analytics
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Incoming and outgoing message activity
          </p>
        </div>

        <select
          aria-label="Select chart period"
          value={period || localPeriod}
          onChange={(event) => handlePeriodChange(event.target.value)}
          className="w-fit rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-green-500"
        >
          <option value="7 days">Last 7 days</option>
          <option value="30 days">Last 30 days</option>
          <option value="90 days">Last 90 days</option>
        </select>
      </div>

      <div className="mt-6 h-[280px] w-full">
        {isLoading ? (
          <div className="flex h-full w-full animate-pulse items-center justify-center rounded-xl bg-slate-50">
            <span className="text-xs text-slate-400">Loading activity data...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 5, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="incomingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="#16a34a"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="100%"
                    stopColor="#16a34a"
                    stopOpacity={0}
                  />
                </linearGradient>

                <linearGradient id="outgoingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="#3b82f6"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="100%"
                    stopColor="#3b82f6"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="#e2e8f0"
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                allowDecimals={false}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                }}
              />

              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{
                  fontSize: "12px",
                  paddingBottom: "20px",
                }}
              />

              <Area
                type="monotone"
                dataKey="incoming"
                name="Incoming"
                stroke="#16a34a"
                strokeWidth={2}
                fill="url(#incomingGradient)"
                activeDot={{ r: 5 }}
              />

              <Area
                type="monotone"
                dataKey="outgoing"
                name="Outgoing"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#outgoingGradient)"
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Live message activity strictly scoped to your active workspace.
      </p>
    </section>
  );
}