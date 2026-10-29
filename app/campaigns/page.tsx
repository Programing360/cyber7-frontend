"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Copy,
  Eye,
  Megaphone,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  Send,
  Trash2,
  X,
  XCircle,
  BookOpen,
  Users,
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

function calculateRate(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;

  return Math.round((numerator / denominator) * 100);
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  const [formOpen, setFormOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const filteredCampaigns = useMemo(() => {
    const query = search.trim().toLowerCase();

    return campaigns.filter((campaign) => {
      const matchesSearch =
        !query ||
        campaign.name.toLowerCase().includes(query) ||
        campaign.audience.toLowerCase().includes(query) ||
        campaign.templateName.toLowerCase().includes(query) ||
        campaign.description.toLowerCase().includes(query);

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

  const totalDelivered = campaigns.reduce(
    (sum, campaign) => sum + campaign.delivered,
    0,
  );

  const totalRead = campaigns.reduce((sum, campaign) => sum + campaign.read, 0);

  const totalFailed = campaigns.reduce(
    (sum, campaign) => sum + campaign.failed,
    0,
  );

  function openCreateForm() {
    setEditingCampaign(null);
    setFormOpen(true);
  }

  function openEditForm(campaign: Campaign) {
    if (campaign.status !== "Draft") {
      setNotice("Only draft campaigns can be edited in this demo.");
      return;
    }

    setEditingCampaign(campaign);
    setActionMenuId(null);
    setFormOpen(true);
  }

  function handleSave(campaign: Campaign) {
    const isEditing = campaigns.some((item) => item.id === campaign.id);

    if (isEditing) {
      setCampaigns((current) =>
        current.map((item) => (item.id === campaign.id ? campaign : item)),
      );

      setNotice(`"${campaign.name}" updated in demo mode.`);
    } else {
      setCampaigns((current) => [campaign, ...current]);

      setNotice(
        `"${campaign.name}" created as ${campaign.status} in demo mode.`,
      );
    }

    setFormOpen(false);
    setEditingCampaign(null);
  }

  function updateCampaign(campaignId: string, updates: Partial<Campaign>) {
    setCampaigns((current) =>
      current.map((campaign) =>
        campaign.id === campaignId ? { ...campaign, ...updates } : campaign,
      ),
    );

    setSelectedCampaign((current) =>
      current?.id === campaignId ? { ...current, ...updates } : current,
    );
  }

  function handleLaunch(campaign: Campaign) {
    if (campaign.status !== "Draft") return;

    if (
      !window.confirm(
        `Launch "${campaign.name}" in demo mode? No real messages will be sent.`,
      )
    ) {
      return;
    }

    updateCampaign(campaign.id, {
      status: "Running",
    });

    setNotice(
      `"${campaign.name}" marked as Running. No WhatsApp messages were sent.`,
    );
  }

  function handlePause(campaign: Campaign) {
    if (campaign.status !== "Running") return;

    updateCampaign(campaign.id, {
      status: "Paused",
    });

    setNotice(`"${campaign.name}" paused in demo mode.`);
  }

  function handleResume(campaign: Campaign) {
    if (campaign.status !== "Paused") return;

    updateCampaign(campaign.id, {
      status: "Running",
    });

    setNotice(`"${campaign.name}" resumed in demo mode.`);
  }

  function handleDuplicate(campaign: Campaign) {
    const duplicate: Campaign = {
      ...campaign,
      id: `campaign-${Date.now()}`,
      name: `${campaign.name} (Copy)`,
      status: "Draft",
      scheduledAt: "",
      // Server-generated timestamps will replace this when the backend
      // is connected. The mock model currently requires a string.
      createdAt: "",
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0,
    };

    setCampaigns((current) => [duplicate, ...current]);
    setActionMenuId(null);

    setNotice(`"${campaign.name}" duplicated as a draft. Demo only.`);
  }

  function handleDelete(campaign: Campaign) {
    setActionMenuId(null);

    if (!window.confirm(`Delete campaign "${campaign.name}" from the demo?`)) {
      return;
    }

    setCampaigns((current) =>
      current.filter((item) => item.id !== campaign.id),
    );

    if (selectedCampaign?.id === campaign.id) {
      setSelectedCampaign(null);
    }

    setNotice(`"${campaign.name}" deleted from demo state.`);
  }

  const statCards = [
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
      icon: Users,
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
  ];

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
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
            >
              <Plus size={18} />
              Create Campaign
            </button>
          </div>

          {/* Demo notice */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-semibold text-amber-900">
              Campaign demo mode
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-800">
              Campaign data and actions are stored in local React state. No live
              WhatsApp messages are sent, and metrics are sample values. Backend
              persistence and Meta API integration are not connected yet.
            </p>
          </div>

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
            {statCards.map((stat) => {
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

          {/* Campaign table */}
          <section className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 rounded-t-2xl border-b border-slate-100 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
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
                    {[
                      "Campaign",
                      "Audience",
                      "Recipients",
                      "Sent / Delivered",
                      "Status",
                      "Schedule",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${
                          heading === "Actions" ? "text-right" : ""
                        }`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredCampaigns.map((campaign) => {
                    const deliveryRate = calculateRate(
                      campaign.delivered,
                      campaign.sent,
                    );

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
                              style={{
                                width: `${deliveryRate}%`,
                              }}
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
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleLaunch(campaign)}
                                  title="Launch demo campaign"
                                  aria-label={`Launch ${campaign.name}`}
                                  className="rounded-lg p-2 text-green-600 hover:bg-green-50"
                                >
                                  <Play size={16} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openEditForm(campaign)}
                                  title="Edit campaign"
                                  aria-label={`Edit ${campaign.name}`}
                                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                                >
                                  <Pencil size={16} />
                                </button>
                              </>
                            )}

                            {campaign.status === "Running" && (
                              <button
                                type="button"
                                onClick={() => handlePause(campaign)}
                                title="Pause campaign"
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
                                title="Resume campaign"
                                aria-label={`Resume ${campaign.name}`}
                                className="rounded-lg p-2 text-green-600 hover:bg-green-50"
                              >
                                <Play size={16} />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setSelectedCampaign(campaign)}
                              title="View campaign details"
                              aria-label={`View ${campaign.name} details`}
                              className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                            >
                              <Eye size={16} />
                            </button>

                            <div className="relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setActionMenuId((current) =>
                                    current === campaign.id
                                      ? null
                                      : campaign.id,
                                  )
                                }
                                title="More actions"
                                aria-label={`More actions for ${campaign.name}`}
                                aria-expanded={actionMenuId === campaign.id}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                              >
                                <MoreHorizontal size={16} />
                              </button>

                              {actionMenuId === campaign.id && (
                                <div className="absolute right-0 z-20 mt-1 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                                  <button
                                    type="button"
                                    onClick={() => handleDuplicate(campaign)}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                  >
                                    <Copy size={15} />
                                    Duplicate
                                  </button>

                                  {campaign.status === "Draft" && (
                                    <button
                                      type="button"
                                      onClick={() => openEditForm(campaign)}
                                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                    >
                                      <Pencil size={15} />
                                      Edit
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleDelete(campaign)}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 size={15} />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
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

            <div className="flex flex-col gap-2 rounded-b-2xl border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {filteredCampaigns.length} of {campaigns.length}{" "}
                campaigns
              </span>

              <span>Demo mode · No live WhatsApp delivery</span>
            </div>
          </section>

          {/* Summary analytics */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <BookOpen size={19} className="text-green-600" />
              <h2 className="font-bold text-slate-900">
                Campaign Performance Overview
              </h2>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Aggregated sample metrics across all campaigns.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                {
                  label: "Delivered",
                  value: totalDelivered,
                  icon: CheckCircle2,
                  color: "text-green-600",
                },
                {
                  label: "Read",
                  value: totalRead,
                  icon: Eye,
                  color: "text-blue-600",
                },
                {
                  label: "Failed",
                  value: totalFailed,
                  icon: XCircle,
                  color: "text-red-600",
                },
                {
                  label: "Read rate",
                  value: `${calculateRate(totalRead, totalDelivered)}%`,
                  icon: Send,
                  color: "text-violet-600",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={16} className={item.color} />
                      <span className="text-xs text-slate-500">
                        {item.label}
                      </span>
                    </div>

                    <p className="mt-3 text-2xl font-bold text-slate-900">
                      {typeof item.value === "number"
                        ? item.value.toLocaleString()
                        : item.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {/* Create/Edit form */}
      {formOpen && (
        <CampaignForm
          campaign={editingCampaign ?? undefined}
          onSave={handleSave}
          onClose={() => {
            setFormOpen(false);
            setEditingCampaign(null);
          }}
        />
      )}

      {/* Campaign details modal */}
      {selectedCampaign && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedCampaign(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="campaign-details-title"
            className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2
                  id="campaign-details-title"
                  className="text-lg font-bold text-slate-900"
                >
                  Campaign Details
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Sample campaign data for demo purposes.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCampaign(null)}
                aria-label="Close campaign details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedCampaign.name}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {selectedCampaign.description || "No description"}
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[selectedCampaign.status]}`}
                >
                  {selectedCampaign.status}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <BookOpen size={16} />
                    <span className="text-xs">Message template</span>
                  </div>

                  <p className="mt-2 break-words text-sm font-semibold text-slate-900">
                    {selectedCampaign.templateName}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Users size={16} />
                    <span className="text-xs">Target audience</span>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {selectedCampaign.audience}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <CalendarClock size={16} />
                    <span className="text-xs">Schedule</span>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {formatDate(selectedCampaign.scheduledAt)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Users size={16} />
                    <span className="text-xs">Recipients</span>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {selectedCampaign.recipients.toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Delivery metrics
                </h4>

                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    {
                      label: "Sent",
                      value: selectedCampaign.sent,
                      color: "text-slate-900",
                    },
                    {
                      label: "Delivered",
                      value: selectedCampaign.delivered,
                      color: "text-green-700",
                    },
                    {
                      label: "Read",
                      value: selectedCampaign.read,
                      color: "text-blue-700",
                    },
                    {
                      label: "Failed",
                      value: selectedCampaign.failed,
                      color: "text-red-700",
                    },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-xl bg-slate-50 p-3"
                    >
                      <p className="text-xs text-slate-500">{metric.label}</p>

                      <p className={`mt-2 text-xl font-bold ${metric.color}`}>
                        {metric.value.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-blue-900">Delivery rate</span>

                  <span className="text-sm font-bold text-blue-900">
                    {calculateRate(
                      selectedCampaign.delivered,
                      selectedCampaign.sent,
                    )}
                    %
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{
                      width: `${calculateRate(
                        selectedCampaign.delivered,
                        selectedCampaign.sent,
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-sm text-blue-900">
                    Read rate (of delivered)
                  </span>

                  <span className="text-sm font-bold text-blue-900">
                    {calculateRate(
                      selectedCampaign.read,
                      selectedCampaign.delivered,
                    )}
                    %
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{
                      width: `${calculateRate(
                        selectedCampaign.read,
                        selectedCampaign.delivered,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <p className="text-xs leading-5 text-slate-500">
                These figures are illustrative. Real delivery and read metrics
                must be collected from backend processing and WhatsApp webhook
                events.
              </p>

              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
                {selectedCampaign.status === "Draft" && (
                  <button
                    type="button"
                    onClick={() => {
                      const campaign = selectedCampaign;
                      setSelectedCampaign(null);
                      openEditForm(campaign);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil size={16} />
                    Edit Draft
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedCampaign(null)}
                  className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                >
                  Close
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </DashboardLayout>
  );
}
