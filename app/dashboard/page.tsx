"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Send,
  Users,
  FileText,
  ArrowRight,
  MessageCircle,
  MessageSquare,
  AlertTriangle,
  RotateCw,
} from "lucide-react";
import DashboardLayout from "@/src/component/dashboard/dashboard-layout";
import StatCard, { type StatCardData } from "@/src/component/dashboard/stat-card";
import MessagesChart from "@/src/component/dashboard/messages-chart";
import WhatsAppStatus from "@/src/component/dashboard/whatsapp-status";
import RecentConversations from "@/src/component/dashboard/recent-conversations";
import RecentCampaigns from "@/src/component/dashboard/recent-campaigns";
import { useWorkspace } from "@/src/context/workspace-context";
import dashboardService from "@/src/services/dashboard-service";
import type { DashboardStatsData } from "@/src/types/api";

export default function DashboardPage() {
  const { activeWorkspace, isLoading: isWorkspaceLoading } = useWorkspace();
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>("7 days");
  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    if (!activeWorkspace?.id) {
      setStats(null);
      setIsLoading(false);
      return;
    }

    let isCurrent = true;
    const currentWorkspaceId = activeWorkspace.id;
    const daysCount =
      period === "30 days" ? 30 : period === "90 days" ? 90 : 7;

    const fetchStats = async () => {
      // Immediately clear error and start loading to prevent showing stale workspace data
      setIsLoading(true);
      setError(null);

      try {
        const data = await dashboardService.getDashboardStats({
          workspaceId: currentWorkspaceId,
          days: daysCount,
        });

        if (isCurrent && activeWorkspace.id === currentWorkspaceId) {
          setStats(data);
        }
      } catch (err: unknown) {
        if (isCurrent && activeWorkspace.id === currentWorkspaceId) {
          const msg =
            err instanceof Error
              ? err.message
              : "Failed to load dashboard statistics";
          setError(msg);
        }
      } finally {
        if (isCurrent && activeWorkspace.id === currentWorkspaceId) {
          setIsLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isCurrent = false;
    };
  }, [activeWorkspace?.id, period, refreshKey]);

  // Map real database metrics into the 4 overview cards
  const statCards: StatCardData[] = [
    {
      title: "Total Contacts",
      value: (stats?.overview.totalContacts ?? 0).toLocaleString(),
      description: "Workspace contacts",
      icon: Users,
    },
    {
      title: "Total Messages",
      value: (stats?.overview.totalMessages ?? 0).toLocaleString(),
      description: `${stats?.messages.today ?? 0} today (${stats?.messages.thisWeek ?? 0} this week)`,
      icon: MessageCircle,
    },
    {
      title: "Messages Sent",
      value: (stats?.overview.outboundMessages ?? 0).toLocaleString(),
      description: `${(stats?.overview.inboundMessages ?? 0).toLocaleString()} inbound received`,
      icon: Send,
    },
    {
      title: "Active Conversations",
      value: (stats?.overview.openConversations ?? 0).toLocaleString(),
      description: `${stats?.overview.pendingConversations ?? 0} pending, ${stats?.overview.closedConversations ?? 0} closed`,
      icon: MessageSquare,
    },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1600px]">
        {/* Page heading */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-slate-500">
              Workspace / {activeWorkspace?.name || "Overview"}
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Monitor your messaging activity and manage your workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setRefreshKey((k) => k + 1)}
              disabled={isLoading || isWorkspaceLoading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
              title="Refresh statistics"
            >
              <RotateCw size={15} className={isLoading ? "animate-spin" : ""} />
              Refresh
            </button>

            <Link
              href="/campaigns"
              className="inline-flex items-center gap-2 rounded-xl bg-[#88da1c] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
            >
              <Plus size={17} />
              Create Campaign
            </Link>
          </div>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setRefreshKey((k) => k + 1)}
              className="ml-4 font-semibold text-red-700 underline hover:text-red-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Section */}
        <section
          aria-label="Dashboard statistics"
          className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
        >
          {statCards.map((stat) => (
            <StatCard
              key={stat.title}
              stat={stat}
              isLoading={isLoading || isWorkspaceLoading}
            />
          ))}
        </section>

        {/* Charts and connection */}
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
          <MessagesChart
            data={stats?.messageActivity}
            isLoading={isLoading || isWorkspaceLoading}
            period={period}
            onPeriodChange={(p) => setPeriod(p)}
          />
          <WhatsAppStatus
            whatsapp={stats?.whatsapp}
            workspaceId={activeWorkspace?.id}
            isLoading={isLoading || isWorkspaceLoading}
          />
        </div>

        {/* Conversations and campaigns */}
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <RecentConversations
            conversations={stats?.recentConversations}
            isLoading={isLoading || isWorkspaceLoading}
          />
          <RecentCampaigns isLoading={isLoading || isWorkspaceLoading} />
        </div>

        {/* Quick actions */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Access frequently used workspace features.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Link
              href="/contacts"
              className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-green-300 hover:bg-green-50/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Users size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  Manage Contacts
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  View your contacts
                </p>
              </div>

              <ArrowRight
                size={16}
                className="text-slate-400 transition group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/campaigns"
              className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-green-300 hover:bg-green-50/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
                <Send size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  Send Campaign
                </p>

                <p className="mt-1 text-xs text-slate-500">Create a campaign</p>
              </div>

              <ArrowRight
                size={16}
                className="text-slate-400 transition group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/templates"
              className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-green-300 hover:bg-green-50/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                <FileText size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  Message Templates
                </p>

                <p className="mt-1 text-xs text-slate-500">Browse templates</p>
              </div>

              <ArrowRight
                size={16}
                className="text-slate-400 transition group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/inbox"
              className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-green-300 hover:bg-green-50/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <Send size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  Open Inbox
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  View conversations
                </p>
              </div>

              <ArrowRight
                size={16}
                className="text-slate-400 transition group-hover:translate-x-1"
              />
            </Link>
          </div>
        </section>

        {/* Footer note */}
        <div className="mt-6 flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row">
          <p>VexChat · WhatsApp Business Platform</p>

          <p>Workspace-scoped live statistics.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
