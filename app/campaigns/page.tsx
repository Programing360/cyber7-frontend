"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Eye,
  Megaphone,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  Send,
  X,
  XCircle,
} from "lucide-react";

import DashboardLayout from "@/src/component/dashboard/dashboard-layout";

import {
  Campaign,
  CampaignStatus,
  initialCampaigns,
} from "@/src/data/mock/campaigns";
import CampaignForm from "@/src/component/campaigns/campaign-form";

type StatusFilter = "All" | CampaignStatus;

const statusStyles: Record<CampaignStatus, string> = {
  Draft: "bg-slate-100 text-slate-600",
  Scheduled: "bg-blue-50 text-blue-700",
  Running: "bg-green-50 text-green-700",
  Paused: "bg-amber-50 text-amber-700",
  Completed: "bg-violet-50 text-violet-700",
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [formOpen, setFormOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const filteredCampaigns = useMemo(() => {
    const query = search.trim().toLowerCase();

    return campaigns.filter((campaign) => {
      const matchesSearch =
        !query ||
        campaign.name.toLowerCase().includes(query) ||
        campaign.audience.toLowerCase().includes(query) ||
        campaign.templateName.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || campaign.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [campaigns, search, statusFilter]);

  const totalRecipients = campaigns.reduce(
    (sum, campaign) => sum + campaign.recipients,
    0,
  );

  const totalSent = campaigns.reduce((sum, campaign) => sum + campaign.sent, 0);

  const completedCount = campaigns.filter(
    (campaign) => campaign.status === "Completed",
  ).length;

  const scheduledCount = campaigns.filter(
    (campaign) => campaign.status === "Scheduled",
  ).length;

  function handleCreate(campaign: Campaign) {
    setCampaigns((current) => [campaign, ...current]);
    setFormOpen(false);
    setNotice(`Campaign "${campaign.name}" created as ${campaign.status}.`);
  }

  function updateCampaign(campaignId: string, updates: Partial<Campaign>) {
    setCampaigns((current) =>
      current.map((campaign) =>
        campaign.id === campaignId ? { ...campaign, ...updates } : campaign,
      ),
    );
  }

  function handleLaunch(campaign: Campaign) {
    if (campaign.status !== "Draft") return;

    updateCampaign(campaign.id, { status: "Running" });

    setNotice(
      `"${campaign.name}" marked as Running in demo mode. No messages were sent.`,
    );
  }

  function handlePause(campaign: Campaign) {
    if (campaign.status !== "Running") return;

    updateCampaign(campaign.id, { status: "Paused" });
    setNotice(`"${campaign.name}" paused in demo mode.`);
  }

  function handleResume(campaign: Campaign) {
    if (campaign.status !== "Paused") return;

    updateCampaign(campaign.id, { status: "Running" });
    setNotice(`"${campaign.name}" resumed in demo mode.`);
  }

  function handleDelete(campaign: Campaign) {
    if (!window.confirm(`Delete campaign "${campaign.name}"?`)) return;

    setCampaigns((current) =>
      current.filter((item) => item.id !== campaign.id),
    );

    setNotice(`"${campaign.name}" deleted from the demo.`);
  }

  function formatDate(value: string) {
    if (!value) return "Not scheduled";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <DashboardLayout>
      <main className="min-h-full bg-[#f8fafc] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Megaphone size={16} />
                <span>Marketing</span>
                <span>/</span>
                <span>Campaigns</span>
              </div>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Campaigns
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Create, organize and monitor WhatsApp marketing campaigns.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
            >
              <Plus size={18} />
              Create Campaign
            </button>
          </div>

          {/* Demo banner */}
          {/* <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-semibold text-amber-900">
              Demo campaign management
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-800">
              Campaigns and status changes use local demo state. Delivery
              statistics are illustrative and do not represent live WhatsApp API
              results.
            </p>
          </div> */}

          {/* Notification */}
          {notice && (
            <div
              role="status"
              className="flex items-start justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
            >
              <span>{notice}</span>
              <button
                type="button"
                onClick={() => setNotice("")}
                aria-label="Dismiss notification"
                className="shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Total Campaigns",
                value: campaigns.length.toLocaleString(),
                detail: "All campaigns in demo",
                icon: Megaphone,
                color: "bg-blue-50 text-blue-600",
              },
              {
                title: "Total Recipients",
                value: totalRecipients.toLocaleString(),
                detail: "Illustrative audience counts",
                icon: Send,
                color: "bg-violet-50 text-violet-600",
              },
              {
                title: "Messages Sent",
                value: totalSent.toLocaleString(),
                detail: "Sample delivery data",
                icon: CheckCircle2,
                color: "bg-green-50 text-green-600",
              },
              {
                title: "Scheduled",
                value: scheduledCount.toLocaleString(),
                detail: `${completedCount} completed campaigns`,
                icon: CalendarClock,
                color: "bg-amber-50 text-amber-600",
              },
            ].map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {stat.title}
                      </p>
                      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                        {stat.value}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        {stat.detail}
                      </p>
                    </div>

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}
                    >
                      <Icon size={21} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="font-bold text-slate-900">All Campaigns</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {filteredCampaigns.length} campaigns found
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative sm:min-w-[260px]">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search campaigns..."
                    aria-label="Search campaigns"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as StatusFilter)
                  }
                  aria-label="Filter campaigns by status"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500"
                >
                  <option value="All">All statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Running">Running</option>
                  <option value="Paused">Paused</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Campaign
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Audience
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Recipients
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Sent / Delivered
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Schedule
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredCampaigns.map((campaign) => {
                    const deliveryRate =
                      campaign.sent > 0
                        ? Math.round((campaign.delivered / campaign.sent) * 100)
                        : 0;

                    return (
                      <tr
                        key={campaign.id}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="max-w-[260px]">
                            <p className="font-semibold text-slate-900">
                              {campaign.name}
                            </p>
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                              {campaign.description || "No description"}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">
                              {campaign.templateName}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-slate-700">
                            {campaign.audience}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                          {campaign.recipients.toLocaleString()}
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-slate-800">
                            {campaign.sent.toLocaleString()} /{" "}
                            {campaign.delivered.toLocaleString()}
                          </p>

                          <div className="mt-2 h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-green-500"
                              style={{ width: `${deliveryRate}%` }}
                            />
                          </div>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {deliveryRate}% delivery rate
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[campaign.status]}`}
                          >
                            {campaign.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-xs leading-5 text-slate-500">
                          {formatDate(campaign.scheduledAt)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            {campaign.status === "Draft" && (
                              <button
                                type="button"
                                onClick={() => handleLaunch(campaign)}
                                title="Launch demo campaign"
                                aria-label={`Launch ${campaign.name}`}
                                className="rounded-lg p-2 text-green-600 hover:bg-green-50"
                              >
                                <Play size={16} />
                              </button>
                            )}

                            {campaign.status === "Running" && (
                              <button
                                type="button"
                                onClick={() => handlePause(campaign)}
                                title="Pause demo campaign"
                                aria-label={`Pause ${campaign.name}`}
                                className="rounded-lg p-2 text-amber-600 hover:bg-amber-50"
                              >
                                <Pause size={16} />
                              </button>
                            )}

                            {campaign.status === "Paused" && (
                              <button
                                type="button"
                                onClick={() => handleResume(campaign)}
                                title="Resume demo campaign"
                                aria-label={`Resume ${campaign.name}`}
                                className="rounded-lg p-2 text-green-600 hover:bg-green-50"
                              >
                                <Play size={16} />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                setNotice(
                                  `${campaign.name}: ${campaign.sent} sent, ${campaign.delivered} delivered, ${campaign.read} read and ${campaign.failed} failed (sample data).`,
                                )
                              }
                              title="View campaign details"
                              aria-label={`View ${campaign.name} details`}
                              className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(campaign)}
                              title="Delete campaign"
                              aria-label={`Delete ${campaign.name}`}
                              className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <MoreHorizontal size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredCampaigns.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <Search size={21} />
                        </div>
                        <p className="mt-3 font-semibold text-slate-800">
                          No campaigns found
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Try another search or status filter.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSearch("");
                            setStatusFilter("All");
                          }}
                          className="mt-4 text-sm font-semibold text-green-700"
                        >
                          Clear filters
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {filteredCampaigns.length} of {campaigns.length}{" "}
                campaigns
              </span>
              <span>Demo mode · No live WhatsApp delivery</span>
            </div>
          </section>
        </div>
      </main>

      {formOpen && (
        <CampaignForm
          onSave={handleCreate}
          onClose={() => setFormOpen(false)}
        />
      )}
    </DashboardLayout>
  );
}
