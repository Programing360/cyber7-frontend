"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  RefreshCw,
  Search,
  Send,
  Trash2,
  X,
  XCircle,
  BookOpen,
  Users,
  AlertCircle,
  Loader2,
  PhoneCall,
  Check,
} from "lucide-react";

import DashboardLayout from "@/src/component/dashboard/dashboard-layout";
import { useWorkspace } from "@/src/context/workspace-context";
import { campaignService } from "@/src/services/campaign-service";
import CampaignForm from "@/src/component/campaigns/campaign-form";
import type {
  BackendCampaignStatus,
  CampaignItem,
  CampaignRecipientItem,
} from "@/src/types/api";

type StatusFilter = "All" | BackendCampaignStatus;

const statusBadgeStyles: Record<BackendCampaignStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  SCHEDULED: "bg-blue-50 text-blue-700 border-blue-200",
  PROCESSING: "bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse",
  PAUSED: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-violet-50 text-violet-700 border-violet-200",
  FAILED: "bg-rose-50 text-rose-700 border-rose-200",
  CANCELLED: "bg-slate-100 text-slate-500 border-slate-200 line-through",
};

function formatDate(value?: string | null) {
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
  const { activeWorkspace, isLoading: isWorkspaceLoading } = useWorkspace();

  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  const [formOpen, setFormOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<CampaignItem | null>(
    null,
  );
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignItem | null>(
    null,
  );
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [recipients, setRecipients] = useState<CampaignRecipientItem[]>([]);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch campaigns from backend
  const loadCampaigns = useCallback(
    async (silent = false) => {
      if (!activeWorkspace?.id) return;
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      setErrorMessage("");

      try {
        const response = await campaignService.getCampaigns(
          activeWorkspace.id,
          {
            search: search.trim() || undefined,
            status: statusFilter === "All" ? undefined : statusFilter,
            limit: 100,
          },
        );

        setCampaigns(response.campaigns || []);
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Failed to load marketing campaigns.",
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [activeWorkspace?.id, search, statusFilter],
  );

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  // Real-time polling when any campaign is currently active
  useEffect(() => {
    const hasActiveCampaign = campaigns.some(
      (c) => c.status === "PROCESSING" || c.status === "SCHEDULED",
    );

    if (!hasActiveCampaign) return;

    const interval = setInterval(() => {
      loadCampaigns(true);
    }, 15000);

    return () => clearInterval(interval);
  }, [campaigns, loadCampaigns]);

  // Load recipients whenever a campaign details modal opens
  useEffect(() => {
    if (!selectedCampaign || !activeWorkspace?.id) {
      setRecipients([]);
      return;
    }

    let isMounted = true;
    setIsLoadingRecipients(true);

    campaignService
      .getRecipients(activeWorkspace.id, selectedCampaign.id, { limit: 50 })
      .then((res) => {
        if (isMounted) setRecipients(res.recipients || []);
      })
      .catch((err) => {
        console.error("Failed to load campaign recipients", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingRecipients(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCampaign, activeWorkspace?.id]);

  // Notice helper
  function triggerNotice(text: string, type: "success" | "error" = "success") {
    setNotice({ text, type });
    setTimeout(() => setNotice(null), 4000);
  }

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    const query = search.trim().toLowerCase();
    return campaigns.filter((campaign) => {
      const matchesSearch =
        !query ||
        campaign.name.toLowerCase().includes(query) ||
        (campaign.description &&
          campaign.description.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All" || campaign.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [campaigns, search, statusFilter]);

  // Metrics
  const totalRecipients = useMemo(
    () => campaigns.reduce((sum, c) => sum + (c.totalRecipients || 0), 0),
    [campaigns],
  );

  const totalSent = useMemo(
    () => campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0),
    [campaigns],
  );

  const totalDelivered = useMemo(
    () => campaigns.reduce((sum, c) => sum + (c.deliveredCount || 0), 0),
    [campaigns],
  );

  const totalRead = useMemo(
    () => campaigns.reduce((sum, c) => sum + (c.readCount || 0), 0),
    [campaigns],
  );

  const scheduledCount = useMemo(
    () => campaigns.filter((c) => c.status === "SCHEDULED").length,
    [campaigns],
  );

  const completedCount = useMemo(
    () => campaigns.filter((c) => c.status === "COMPLETED").length,
    [campaigns],
  );

  // Handlers
  function openCreateForm() {
    setEditingCampaign(null);
    setFormOpen(true);
  }

  function openEditForm(campaign: CampaignItem) {
    if (campaign.status !== "DRAFT") {
      triggerNotice("Only draft campaigns can be edited.", "error");
      return;
    }
    setEditingCampaign(campaign);
    setActionMenuId(null);
    setFormOpen(true);
  }

  async function handlePause(campaign: CampaignItem) {
    if (!activeWorkspace?.id) return;
    setActionLoadingId(campaign.id);
    try {
      const res = await campaignService.pauseCampaign(
        activeWorkspace.id,
        campaign.id,
      );
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaign.id ? res.campaign : c)),
      );
      triggerNotice(`"${campaign.name}" has been paused.`);
    } catch (err: unknown) {
      triggerNotice(
        err instanceof Error ? err.message : "Failed to pause campaign.",
        "error",
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleResume(campaign: CampaignItem) {
    if (!activeWorkspace?.id) return;
    setActionLoadingId(campaign.id);
    try {
      const res = await campaignService.resumeCampaign(
        activeWorkspace.id,
        campaign.id,
      );
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaign.id ? res.campaign : c)),
      );
      triggerNotice(`"${campaign.name}" has been resumed.`);
    } catch (err: unknown) {
      triggerNotice(
        err instanceof Error ? err.message : "Failed to resume campaign.",
        "error",
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleCancel(campaign: CampaignItem) {
    if (!activeWorkspace?.id) return;
    if (
      !window.confirm(`Are you sure you want to cancel "${campaign.name}"?`)
    ) {
      return;
    }

    setActionLoadingId(campaign.id);
    try {
      const res = await campaignService.cancelCampaign(
        activeWorkspace.id,
        campaign.id,
      );
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaign.id ? res.campaign : c)),
      );
      triggerNotice(`"${campaign.name}" has been cancelled.`);
    } catch (err: unknown) {
      triggerNotice(
        err instanceof Error ? err.message : "Failed to cancel campaign.",
        "error",
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDelete(campaign: CampaignItem) {
    if (!activeWorkspace?.id) return;
    setActionMenuId(null);

    if (
      !window.confirm(`Permanently delete draft campaign "${campaign.name}"?`)
    ) {
      return;
    }

    setActionLoadingId(campaign.id);
    try {
      await campaignService.deleteCampaign(activeWorkspace.id, campaign.id);
      setCampaigns((prev) => prev.filter((c) => c.id !== campaign.id));
      if (selectedCampaign?.id === campaign.id) {
        setSelectedCampaign(null);
      }
      triggerNotice(`Campaign "${campaign.name}" deleted.`);
    } catch (err: unknown) {
      triggerNotice(
        err instanceof Error ? err.message : "Failed to delete campaign.",
        "error",
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  function handleSaveSuccess(savedCampaign: CampaignItem) {
    setCampaigns((current) => {
      const exists = current.some((c) => c.id === savedCampaign.id);
      if (exists) {
        return current.map((c) =>
          c.id === savedCampaign.id ? savedCampaign : c,
        );
      }
      return [savedCampaign, ...current];
    });

    triggerNotice(`Campaign "${savedCampaign.name}" saved successfully.`);
    setFormOpen(false);
    setEditingCampaign(null);
  }

  const statCards = [
    {
      title: "Total Campaigns",
      value: campaigns.length.toLocaleString(),
      detail: `${completedCount} completed · ${scheduledCount} scheduled`,
      icon: Megaphone,
      color: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      title: "Target Recipients",
      value: totalRecipients.toLocaleString(),
      detail: "Live audience reach across campaigns",
      icon: Users,
      color: "bg-violet-50 text-violet-600 border-violet-100",
    },
    {
      title: "Messages Sent",
      value: totalSent.toLocaleString(),
      detail: `${totalDelivered.toLocaleString()} confirmed delivered`,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      title: "Avg. Delivery Rate",
      value: `${calculateRate(totalDelivered, totalSent)}%`,
      detail: `${totalRead.toLocaleString()} read receipts (${calculateRate(totalRead, totalDelivered)}% read rate)`,
      icon: CalendarClock,
      color: "bg-amber-50 text-amber-600 border-amber-100",
    },
  ];

  return (
    <DashboardLayout>
      <main className="min-h-full bg-[#f8fafc] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Megaphone size={14} className="text-emerald-500" />
                <span>Marketing & Broadcasts</span>
                <span>/</span>
                <span>Campaigns</span>
              </div>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Marketing Campaigns
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Create, schedule, and track WhatsApp broadcast campaigns with
                dynamic Meta templates.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => loadCampaigns(true)}
                disabled={isRefreshing || isLoading}
                title="Refresh campaigns"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={
                    isRefreshing
                      ? "animate-spin text-emerald-600"
                      : "text-slate-500"
                  }
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                type="button"
                onClick={openCreateForm}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <Plus size={18} />
                Create Campaign
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {notice && (
            <div
              role="status"
              className={`flex items-start justify-between gap-3 rounded-xl border p-4 text-sm shadow-sm transition ${
                notice.type === "error"
                  ? "border-rose-200 bg-rose-50 text-rose-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {notice.type === "error" ? (
                  <AlertCircle size={18} className="shrink-0 text-rose-600" />
                ) : (
                  <Check size={18} className="shrink-0 text-emerald-600" />
                )}
                <span className="font-medium">{notice.text}</span>
              </div>

              <button
                type="button"
                onClick={() => setNotice(null)}
                aria-label="Dismiss notification"
                className="shrink-0 p-0.5 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 shadow-sm">
              <div className="flex items-center gap-2.5">
                <AlertCircle size={18} className="text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => loadCampaigns()}
                className="font-semibold text-rose-900 underline hover:no-underline"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {stat.title}
                      </p>
                      <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                        {stat.value}
                      </p>
                      <p className="mt-1.5 text-xs text-slate-500">
                        {stat.detail}
                      </p>
                    </div>

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border ${stat.color}`}
                    >
                      <Icon size={20} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Campaign Table Section */}
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            {/* Table Filter Toolbar */}
            <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Broadcast Campaigns
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {filteredCampaigns.length} total campaigns loaded
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative sm:min-w-[260px]">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name or description..."
                    aria-label="Search campaigns"
                    className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as StatusFilter)
                  }
                  aria-label="Filter campaigns by status"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-emerald-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="PAUSED">Paused</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="FAILED">Failed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Table Content */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Loader2 size={32} className="animate-spin text-emerald-600" />
                <p className="mt-3 text-sm font-medium text-slate-500">
                  Loading workspace campaigns...
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      {[
                        "Campaign Name",
                        "Audience",
                        "Recipients",
                        "Sent / Delivered",
                        "Status",
                        "Schedule",
                        "Actions",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 ${
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
                        campaign.deliveredCount,
                        campaign.sentCount,
                      );
                      const isActionBusy = actionLoadingId === campaign.id;

                      return (
                        <tr
                          key={campaign.id}
                          className="transition hover:bg-slate-50/70"
                        >
                          <td className="px-5 py-4">
                            <div className="max-w-[280px]">
                              <p className="font-semibold text-slate-900">
                                {campaign.name}
                              </p>
                              {campaign.description && (
                                <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                                  {campaign.description}
                                </p>
                              )}
                              <p className="mt-1 text-[11px] font-mono text-slate-400">
                                ID: {campaign.id.slice(-8)}
                              </p>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                              <Users size={12} />
                              {campaign.audience?.mode === "ALL_CONTACTS"
                                ? "All Contacts"
                                : `${campaign.audience?.contactIds?.length || 0} Contacts`}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                            {(campaign.totalRecipients || 0).toLocaleString()}
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-slate-800">
                              {(campaign.sentCount || 0).toLocaleString()} /{" "}
                              {(campaign.deliveredCount || 0).toLocaleString()}
                            </p>

                            <div className="mt-1.5 h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                style={{ width: `${deliveryRate}%` }}
                              />
                            </div>

                            <p className="mt-1 text-[10px] text-slate-400">
                              {deliveryRate}% delivery rate
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                                statusBadgeStyles[campaign.status] ||
                                "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {campaign.status}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-xs leading-5 text-slate-500">
                            {formatDate(campaign.scheduledAt)}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {isActionBusy ? (
                                <Loader2
                                  size={16}
                                  className="animate-spin text-slate-400"
                                />
                              ) : (
                                <>
                                  {/* Draft Edit */}
                                  {campaign.status === "DRAFT" && (
                                    <button
                                      type="button"
                                      onClick={() => openEditForm(campaign)}
                                      title="Edit draft campaign"
                                      aria-label={`Edit ${campaign.name}`}
                                      className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                                    >
                                      <Pencil size={15} />
                                    </button>
                                  )}

                                  {/* Pause (Scheduled/Processing) */}
                                  {(campaign.status === "PROCESSING" ||
                                    campaign.status === "SCHEDULED") && (
                                    <button
                                      type="button"
                                      onClick={() => handlePause(campaign)}
                                      title="Pause campaign"
                                      aria-label={`Pause ${campaign.name}`}
                                      className="rounded-lg p-2 text-amber-600 hover:bg-amber-50"
                                    >
                                      <Pause size={15} />
                                    </button>
                                  )}

                                  {/* Resume (Paused) */}
                                  {campaign.status === "PAUSED" && (
                                    <button
                                      type="button"
                                      onClick={() => handleResume(campaign)}
                                      title="Resume campaign"
                                      aria-label={`Resume ${campaign.name}`}
                                      className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"
                                    >
                                      <Play size={15} />
                                    </button>
                                  )}

                                  {/* View Details */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSelectedCampaign(campaign)
                                    }
                                    title="View campaign details"
                                    aria-label={`View ${campaign.name} details`}
                                    className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                                  >
                                    <Eye size={15} />
                                  </button>

                                  {/* Dropdown Menu */}
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
                                      aria-expanded={
                                        actionMenuId === campaign.id
                                      }
                                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                    >
                                      <MoreHorizontal size={15} />
                                    </button>

                                    {actionMenuId === campaign.id && (
                                      <div className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                                        {campaign.status === "DRAFT" && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              openEditForm(campaign)
                                            }
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                                          >
                                            <Pencil size={14} />
                                            Edit Draft
                                          </button>
                                        )}

                                        {(campaign.status === "DRAFT" ||
                                          campaign.status === "SCHEDULED" ||
                                          campaign.status === "PROCESSING" ||
                                          campaign.status === "PAUSED") && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setActionMenuId(null);
                                              handleCancel(campaign);
                                            }}
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-amber-700 hover:bg-amber-50"
                                          >
                                            <XCircle size={14} />
                                            Cancel Campaign
                                          </button>
                                        )}

                                        {campaign.status === "DRAFT" && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleDelete(campaign)
                                            }
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50"
                                          >
                                            <Trash2 size={14} />
                                            Delete Draft
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredCampaigns.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-16 text-center">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <Search size={22} />
                          </div>

                          <p className="mt-3 font-semibold text-slate-800">
                            No campaigns found
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {campaigns.length === 0
                              ? "You haven't created any campaigns yet for this workspace."
                              : "No campaigns matched your current search or status filters."}
                          </p>

                          {campaigns.length === 0 ? (
                            <button
                              type="button"
                              onClick={openCreateForm}
                              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                            >
                              <Plus size={15} />
                              Create Your First Campaign
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSearch("");
                                setStatusFilter("All");
                              }}
                              className="mt-4 text-xs font-semibold text-emerald-700 hover:underline"
                            >
                              Clear filters
                            </button>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Campaign Create/Edit Modal */}
      {formOpen && activeWorkspace?.id && (
        <CampaignForm
          workspaceId={activeWorkspace.id}
          campaign={editingCampaign}
          onSave={handleSaveSuccess}
          onClose={() => {
            setFormOpen(false);
            setEditingCampaign(null);
          }}
        />
      )}

      {/* Campaign Details & Recipient Logs Modal */}
      {selectedCampaign && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
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
            className="my-auto w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-100"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2
                  id="campaign-details-title"
                  className="text-lg font-bold text-slate-900"
                >
                  Campaign Details & Recipient Log
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 font-mono">
                  ID: {selectedCampaign.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCampaign(null)}
                aria-label="Close campaign details"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={19} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto space-y-5 p-5 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedCampaign.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedCampaign.description || "No description provided."}
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
                    statusBadgeStyles[selectedCampaign.status]
                  }`}
                >
                  {selectedCampaign.status}
                </span>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
                  <span className="text-[11px] font-medium text-slate-400">
                    Audience Mode
                  </span>
                  <p className="mt-1 text-xs font-bold text-slate-800">
                    {selectedCampaign.audience?.mode === "ALL_CONTACTS"
                      ? "All Contacts"
                      : "Selected"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
                  <span className="text-[11px] font-medium text-slate-400">
                    Total Audience
                  </span>
                  <p className="mt-1 text-xs font-bold text-slate-800">
                    {(selectedCampaign.totalRecipients || 0).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
                  <span className="text-[11px] font-medium text-slate-400">
                    Created At
                  </span>
                  <p className="mt-1 text-xs font-bold text-slate-800">
                    {formatDate(selectedCampaign.createdAt)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
                  <span className="text-[11px] font-medium text-slate-400">
                    Scheduled For
                  </span>
                  <p className="mt-1 text-xs font-bold text-slate-800">
                    {formatDate(selectedCampaign.scheduledAt)}
                  </p>
                </div>
              </div>

              {/* Metrics Breakdown */}
              <div className="rounded-xl border border-slate-200/80 bg-white p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Delivery Metrics Breakdown
                </h4>

                <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                  <div className="rounded-lg bg-slate-50 p-2.5">
                    <p className="text-[11px] text-slate-500">Sent</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {(selectedCampaign.sentCount || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-lg bg-emerald-50 p-2.5">
                    <p className="text-[11px] text-emerald-700">Delivered</p>
                    <p className="mt-1 text-lg font-bold text-emerald-700">
                      {(selectedCampaign.deliveredCount || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-2.5">
                    <p className="text-[11px] text-blue-700">Read</p>
                    <p className="mt-1 text-lg font-bold text-blue-700">
                      {(selectedCampaign.readCount || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-lg bg-rose-50 p-2.5">
                    <p className="text-[11px] text-rose-700">Failed</p>
                    <p className="mt-1 text-lg font-bold text-rose-700">
                      {(selectedCampaign.failedCount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Recipients Sub-List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Sample Recipient Delivery Log
                </h4>

                {isLoadingRecipients ? (
                  <div className="flex items-center justify-center py-6 text-xs text-slate-400">
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Fetching recipient logs...
                  </div>
                ) : recipients.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
                    No recipient records generated yet.
                  </p>
                ) : (
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs">
                    {recipients.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between p-2.5 hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-2">
                          <PhoneCall size={13} className="text-slate-400" />
                          <span className="font-semibold text-slate-800">
                            {r.phoneNumber}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              r.status === "DELIVERED"
                                ? "bg-emerald-50 text-emerald-700"
                                : r.status === "READ"
                                  ? "bg-blue-50 text-blue-700"
                                  : r.status === "FAILED"
                                    ? "bg-rose-50 text-rose-700"
                                    : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {r.status}
                          </span>
                          {r.errorMessage && (
                            <span
                              title={r.errorMessage}
                              className="text-[10px] text-rose-500 truncate max-w-[120px]"
                            >
                              {r.errorMessage}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-3">
              {selectedCampaign.status === "DRAFT" && (
                <button
                  type="button"
                  onClick={() => {
                    const c = selectedCampaign;
                    setSelectedCampaign(null);
                    openEditForm(c);
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Edit Draft
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedCampaign(null)}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </DashboardLayout>
  );
}
