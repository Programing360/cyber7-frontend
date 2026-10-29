import Link from "next/link";
import { Plus, Send, Users, FileText, ArrowRight } from "lucide-react";
import DashboardLayout from "@/src/component/dashboard/dashboard-layout";
import { dashboardStats } from "@/src/data/mock/dashboard";
import StatCard from "@/src/component/dashboard/stat-card";
import MessagesChart from "@/src/component/dashboard/messages-chart";
import WhatsAppStatus from "@/src/component/dashboard/whatsapp-status";
import RecentConversations from "@/src/component/dashboard/recent-conversations";
import RecentCampaigns from "@/src/component/dashboard/recent-campaigns";





export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1600px]">
        {/* Page heading */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-slate-500">Workspace / Overview</p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Monitor your messaging activity and manage your workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Demo Data
            </span>

            <Link
              href="/campaigns"
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
            >
              <Plus size={17} />
              Create Campaign
            </Link>
          </div>
        </div>

        {/* Stats */}
        <section
          aria-label="Dashboard statistics"
          className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
        >
          {dashboardStats.map((stat) => (
            <StatCard key={stat.title} stat={stat} />
          ))}
        </section>

        {/* Charts and connection */}
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
          <MessagesChart />
          <WhatsAppStatus />
        </div>

        {/* Conversations and campaigns */}
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <RecentConversations />
          <RecentCampaigns />
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
          <p>Cyber7 · WhatsApp Business Platform</p>

          <p>Frontend demonstration. Real integrations are not configured.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
