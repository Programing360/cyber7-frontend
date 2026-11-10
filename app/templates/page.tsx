"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Eye,
  FileText,
  Languages,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import DashboardLayout from "@/src/component/dashboard/dashboard-layout";
import { useWorkspace } from "@/src/context/workspace-context";
import { templateService } from "@/src/services/template-service";
import type {
  MetaTemplateCategory,
  MetaTemplateStatus,
  TemplateCounts,
  WhatsAppTemplateItem,
} from "@/src/types/api";

type CategoryFilter = "All" | "MARKETING" | "UTILITY" | "AUTHENTICATION";
type StatusFilter =
  | "All"
  | "APPROVED"
  | "PENDING"
  | "REJECTED"
  | "PAUSED"
  | "DRAFT";

const statusStyles: Record<string, string> = {
  APPROVED: "bg-green-50 text-green-700 ring-1 ring-green-600/20",
  Approved: "bg-green-50 text-green-700 ring-1 ring-green-600/20",
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  REJECTED: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
  Rejected: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
  PAUSED: "bg-yellow-50 text-yellow-800 ring-1 ring-yellow-600/20",
  Paused: "bg-yellow-50 text-yellow-800 ring-1 ring-yellow-600/20",
  DISABLED: "bg-slate-100 text-slate-600 ring-1 ring-slate-400/20",
  Disabled: "bg-slate-100 text-slate-600 ring-1 ring-slate-400/20",
  IN_APPEAL: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
  DRAFT: "bg-slate-100 text-slate-600 ring-1 ring-slate-400/20",
  Draft: "bg-slate-100 text-slate-600 ring-1 ring-slate-400/20",
};

const categoryStyles: Record<string, string> = {
  MARKETING: "bg-violet-50 text-violet-700 ring-1 ring-violet-600/20",
  Marketing: "bg-violet-50 text-violet-700 ring-1 ring-violet-600/20",
  UTILITY: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
  Utility: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
  AUTHENTICATION: "bg-orange-50 text-orange-700 ring-1 ring-orange-600/20",
  Authentication: "bg-orange-50 text-orange-700 ring-1 ring-orange-600/20",
};

function formatLabel(value?: string): string {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function formatDate(dateString?: string): string {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export default function TemplatesPage() {
  const { activeWorkspace } = useWorkspace();

  const [templates, setTemplates] = useState<WhatsAppTemplateItem[]>([]);
  const [counts, setCounts] = useState<TemplateCounts>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    draft: 0,
    paused: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  const [previewTemplate, setPreviewTemplate] = useState<
    WhatsAppTemplateItem | undefined
  >();

  const [notice, setNotice] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const [metaDialog, setMetaDialog] = useState<{
    open: boolean;
    action: "create" | "edit" | "delete";
    templateName?: string;
  }>({
    open: false,
    action: "create",
  });

  function showNotice(type: "success" | "error" | "info", text: string) {
    setNotice({ type, text });
  }

  // Load templates from backend for the active workspace
  const loadTemplates = useCallback(async () => {
    if (!activeWorkspace?.id) {
      setTemplates([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await templateService.getTemplates(activeWorkspace.id, {
        search: search.trim() || undefined,
        category: categoryFilter !== "All" ? categoryFilter : undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        limit: 100,
      });

      setTemplates(data.templates);
      setCounts(data.counts);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load templates";
      showNotice("error", msg);
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace?.id, search, categoryFilter, statusFilter]);

  // Reload when active workspace, search, or filters change (preventing stale data)
  useEffect(() => {
    let isCancelled = false;

    if (!activeWorkspace?.id) {
      setTemplates([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    templateService
      .getTemplates(activeWorkspace.id, {
        search: search.trim() || undefined,
        category: categoryFilter !== "All" ? categoryFilter : undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        limit: 100,
      })
      .then((data) => {
        if (!isCancelled) {
          setTemplates(data.templates);
          setCounts(data.counts);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          const msg =
            err instanceof Error ? err.message : "Failed to load templates";
          showNotice("error", msg);
          setTemplates([]);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [activeWorkspace?.id, search, categoryFilter, statusFilter]);

  // Sync templates from Meta Graph API
  async function handleSync() {
    if (!activeWorkspace?.id) {
      showNotice("error", "No active workspace selected.");
      return;
    }

    setIsSyncing(true);
    showNotice("info", "Syncing message templates from Meta Graph API...");

    try {
      const result = await templateService.syncTemplates(activeWorkspace.id);
      showNotice(
        "success",
        `Successfully synced ${result.syncedCount} message template${
          result.syncedCount === 1 ? "" : "s"
        } from Meta.`,
      );
      await loadTemplates();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to sync templates from Meta.";
      showNotice("error", msg);
    } finally {
      setIsSyncing(false);
    }
  }

  // Filter templates locally as well to ensure snappy UI interaction
  const filteredTemplates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return templates.filter((template) => {
      const matchesSearch =
        !query ||
        template.name.toLowerCase().includes(query) ||
        template.body.toLowerCase().includes(query) ||
        (template.header?.text &&
          template.header.text.toLowerCase().includes(query)) ||
        (template.footer && template.footer.toLowerCase().includes(query)) ||
        template.category.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "All" ||
        template.category.toUpperCase() === categoryFilter;

      const matchesStatus =
        statusFilter === "All" ||
        template.status.toUpperCase() === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [templates, search, categoryFilter, statusFilter]);

  return (
    <DashboardLayout>
      <main className="min-h-full bg-[#f8fafc] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <FileText size={16} />
                <span>WhatsApp</span>
                <span>/</span>
                <span>Templates</span>
              </div>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Message Templates
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Manage and preview reusable WhatsApp Business templates synced
                from Meta.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSync}
                disabled={isSyncing || isLoading || !activeWorkspace}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={isSyncing ? "animate-spin text-green-600" : ""}
                />
                <span>
                  {isSyncing ? "Syncing with Meta..." : "Sync with Meta"}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setMetaDialog({
                    open: true,
                    action: "create",
                  })
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#88da1c] px-4 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:bg-green-700 hover:text-white"
              >
                <Plus size={18} />
                Create Template
              </button>
            </div>
          </div>

          {/* Dismissible Notice */}
          {notice && (
            <div
              role="status"
              className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                notice.type === "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : notice.type === "error"
                    ? "border-red-200 bg-red-50 text-red-800"
                    : "border-blue-200 bg-blue-50 text-blue-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {notice.type === "success" && <CheckCircle2 size={17} />}
                {notice.type === "error" && <AlertTriangle size={17} />}
                {notice.type === "info" && (
                  <Loader2 size={17} className="animate-spin" />
                )}
                <span>{notice.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setNotice(null)}
                aria-label="Dismiss notification"
                className="shrink-0 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Total Templates",
                value: counts.total,
                detail: "Synced from Meta",
                icon: FileText,
                color: "bg-blue-50 text-blue-600",
              },
              {
                title: "Approved",
                value: counts.approved,
                detail: "Ready for messaging",
                icon: CheckCircle2,
                color: "bg-green-50 text-green-600",
              },
              {
                title: "Pending Review",
                value: counts.pending,
                detail: "Awaiting Meta approval",
                icon: Clock3,
                color: "bg-amber-50 text-amber-600",
              },
              {
                title: "Rejected",
                value: counts.rejected,
                detail: "Requires revision in Meta",
                icon: XCircle,
                color: "bg-red-50 text-red-600",
              },
            ].map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:scale-105 transition-all duration-300"
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

          {/* Filters & Content Area */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="font-bold text-slate-900">All Templates</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {filteredTemplates.length} template
                  {filteredTemplates.length === 1 ? "" : "s"} found
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="relative sm:min-w-[220px]">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search templates..."
                    aria-label="Search templates"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(event) =>
                    setCategoryFilter(event.target.value as CategoryFilter)
                  }
                  aria-label="Filter by category"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-green-500"
                >
                  <option value="All">All categories</option>
                  <option value="MARKETING">Marketing</option>
                  <option value="UTILITY">Utility</option>
                  <option value="AUTHENTICATION">Authentication</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as StatusFilter)
                  }
                  aria-label="Filter by approval status"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-green-500"
                >
                  <option value="All">All statuses</option>
                  <option value="APPROVED">Approved</option>
                  <option value="PENDING">Pending</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="PAUSED">Paused</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
            </div>

            {/* Loading Indicator */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Loader2 size={32} className="animate-spin text-green-600" />
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  Loading message templates...
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Retrieving templates for{" "}
                  {activeWorkspace?.name || "workspace"}
                </p>
              </div>
            ) : (
              /* Template cards */
              <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3 sm:p-5">
                {filteredTemplates.map((template) => {
                  const upperStatus =
                    template.status?.toUpperCase() || "PENDING";
                  const upperCategory =
                    template.category?.toUpperCase() || "UTILITY";

                  return (
                    <article
                      key={
                        template._id || template.id || template.metaTemplateId
                      }
                      className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="break-words text-sm font-bold text-slate-900">
                            {template.name}
                          </h3>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                categoryStyles[upperCategory] ||
                                "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {formatLabel(template.category)}
                            </span>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                statusStyles[upperStatus] ||
                                "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {formatLabel(template.status)}
                            </span>

                            {template.header?.format &&
                              template.header.format !== "TEXT" && (
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600">
                                  {template.header.format}
                                </span>
                              )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setMetaDialog({
                              open: true,
                              action: "delete",
                              templateName: template.name,
                            })
                          }
                          title="Delete template in Meta"
                          aria-label={`Delete ${template.name}`}
                          className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* WhatsApp Message Preview Bubble */}
                      <div className="mt-4 rounded-xl bg-[#f0f7f2] p-3 text-slate-700">
                        {template.header?.text && (
                          <p className="mb-1 text-xs font-bold text-slate-900">
                            {template.header.text}
                          </p>
                        )}

                        <p className="whitespace-pre-wrap break-words text-sm leading-6">
                          {template.body}
                        </p>

                        {template.footer && (
                          <p className="mt-2 border-t border-slate-200/80 pt-2 text-xs text-slate-500">
                            {template.footer}
                          </p>
                        )}

                        {/* Interactive Buttons Preview */}
                        {template.buttons && template.buttons.length > 0 && (
                          <div className="mt-3 flex flex-col gap-1.5 border-t border-slate-200/80 pt-2">
                            {template.buttons.map((btn, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-center rounded-lg bg-white/80 py-1.5 text-xs font-medium text-blue-600 shadow-2xs"
                              >
                                {btn.text || btn.type}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Language and Variables */}
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Languages size={14} />
                          {template.language}
                        </span>

                        <span>
                          {template.variables?.length || 0} variable
                          {(template.variables?.length || 0) === 1 ? "" : "s"}
                        </span>
                      </div>

                      {/* Meta Sync Info */}
                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                        <span
                          className="truncate"
                          title={template.metaTemplateId}
                        >
                          ID: {template.metaTemplateId}
                        </span>
                        <span>
                          Synced{" "}
                          {formatDate(template.syncedAt || template.updatedAt)}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewTemplate(template)}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          <Eye size={14} />
                          Preview
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setMetaDialog({
                              open: true,
                              action: "edit",
                              templateName: template.name,
                            })
                          }
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          <MoreHorizontal size={14} />
                          Edit
                        </button>

                        {upperStatus === "APPROVED" && (
                          <div className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
                            <ShieldCheck size={14} />
                            Approved by Meta
                          </div>
                        )}

                        {upperStatus === "PENDING" && (
                          <div className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                            <Clock3 size={14} />
                            In Meta Review
                          </div>
                        )}

                        {upperStatus === "REJECTED" && (
                          <div
                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                            title={
                              template.rejectedReason || "Rejected by Meta"
                            }
                          >
                            <XCircle size={14} />
                            Rejected by Meta
                          </div>
                        )}

                        {upperStatus === "PAUSED" && (
                          <div className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-yellow-50 px-3 py-2 text-xs font-semibold text-yellow-800">
                            <Clock3 size={14} />
                            Paused by Meta
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}

                {filteredTemplates.length === 0 && (
                  <div className="col-span-full py-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <FileText size={21} />
                    </div>

                    {templates.length === 0 ? (
                      <>
                        <p className="mt-3 font-semibold text-slate-800">
                          No WhatsApp Templates Synced
                        </p>
                        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                          Connect your WhatsApp Business Account and click
                          &quot;Sync with Meta&quot; to import your approved
                          message templates.
                        </p>
                        <div className="mt-5 flex justify-center gap-3">
                          <button
                            type="button"
                            onClick={handleSync}
                            disabled={isSyncing || !activeWorkspace}
                            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:opacity-60"
                          >
                            <RefreshCw
                              size={16}
                              className={isSyncing ? "animate-spin" : ""}
                            />
                            <span>
                              {isSyncing
                                ? "Syncing..."
                                : "Sync Templates from Meta"}
                            </span>
                          </button>
                          <Link
                            href="/integrations/whatsapp"
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                          >
                            WhatsApp Settings
                          </Link>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="mt-3 font-semibold text-slate-800">
                          No templates found
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Try adjusting your search query or filters.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSearch("");
                            setCategoryFilter("All");
                            setStatusFilter("All");
                          }}
                          className="mt-4 text-sm font-semibold text-green-700 hover:underline"
                        >
                          Clear filters
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
              Showing {filteredTemplates.length} of {templates.length} templates
            </div>
          </section>
        </div>
      </main>

      {/* Realistic WhatsApp Template Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="template-detail-title"
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="min-w-0">
                <h2
                  id="template-detail-title"
                  className="break-words font-bold text-slate-900"
                >
                  {previewTemplate.name}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Meta Template Preview &bull; {previewTemplate.metaTemplateId}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPreviewTemplate(undefined)}
                aria-label="Close template details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[80vh] space-y-4 overflow-y-auto p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    categoryStyles[
                      previewTemplate.category?.toUpperCase() || ""
                    ] || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {formatLabel(previewTemplate.category)}
                </span>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    statusStyles[previewTemplate.status?.toUpperCase() || ""] ||
                    "bg-slate-100 text-slate-700"
                  }`}
                >
                  {formatLabel(previewTemplate.status)}
                </span>

                {previewTemplate.qualityScore && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                    Quality: {previewTemplate.qualityScore}
                  </span>
                )}
              </div>

              {/* Chat Bubble Rendering */}
              <div className="rounded-xl bg-[#e8f5e9] p-4">
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  {previewTemplate.header?.format && (
                    <div className="mb-2">
                      {previewTemplate.header.format === "TEXT" &&
                      previewTemplate.header.text ? (
                        <p className="font-bold text-slate-900">
                          {previewTemplate.header.text}
                        </p>
                      ) : (
                        <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
                          <span>
                            [Media Header: {previewTemplate.header.format}]
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">
                    {previewTemplate.body.replace(
                      /\{\{\d+\}\}/g,
                      (variable) => `[Variable ${variable.replace(/\D/g, "")}]`,
                    )}
                  </p>

                  {previewTemplate.footer && (
                    <p className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-500">
                      {previewTemplate.footer}
                    </p>
                  )}

                  {/* Buttons in Bubble */}
                  {previewTemplate.buttons &&
                    previewTemplate.buttons.length > 0 && (
                      <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-2">
                        {previewTemplate.buttons.map((btn, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/70 py-2 text-xs font-semibold text-blue-600 shadow-2xs"
                          >
                            <span>{btn.text || btn.type}</span>
                            {btn.url && <ExternalLink size={12} />}
                          </div>
                        ))}
                      </div>
                    )}

                  <p className="mt-2 text-right text-[10px] text-slate-400">
                    10:30 AM &bull; Delivered
                  </p>
                </div>
              </div>

              {/* Rejection Reason if applicable */}
              {previewTemplate.rejectedReason && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <p className="font-semibold">Meta Rejection Reason:</p>
                  <p className="mt-1">{previewTemplate.rejectedReason}</p>
                </div>
              )}

              {/* Technical Details */}
              <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Language</span>
                  <span className="font-medium text-slate-800">
                    {previewTemplate.language}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Meta Template ID</span>
                  <span className="font-mono text-xs font-medium text-slate-800">
                    {previewTemplate.metaTemplateId}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Synced Date</span>
                  <span className="font-medium text-slate-800">
                    {formatDate(
                      previewTemplate.syncedAt || previewTemplate.updatedAt,
                    )}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewTemplate(undefined)}
                className="w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                Close Preview
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Meta Management Guidance Modal */}
      {metaDialog.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="meta-dialog-title"
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 id="meta-dialog-title" className="font-bold text-slate-900">
                {metaDialog.action === "create" && "Create Template in Meta"}
                {metaDialog.action === "edit" && "Edit Template in Meta"}
                {metaDialog.action === "delete" && "Delete Template in Meta"}
              </h2>

              <button
                type="button"
                onClick={() => setMetaDialog({ open: false, action: "create" })}
                aria-label="Close dialog"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3.5 text-sm text-blue-900">
                <p className="font-semibold">
                  Official WhatsApp Business Requirement
                </p>
                <p className="mt-1 text-xs leading-5 text-blue-800">
                  {metaDialog.action === "create" &&
                    "WhatsApp message templates must be authored and submitted for Meta approval directly within your Meta WhatsApp Business Manager."}
                  {metaDialog.action === "edit" &&
                    `The template "${metaDialog.templateName}" must be edited directly in your Meta WhatsApp Business Account to preserve Meta compliance and approval.`}
                  {metaDialog.action === "delete" &&
                    `To delete "${metaDialog.templateName}", remove it from your Meta WhatsApp Business Manager. Then click "Sync with Meta" to update VexChat.`}
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">How to proceed:</p>
                <ol className="list-inside list-decimal space-y-1 pl-1">
                  <li>Open your Meta WhatsApp Business Manager.</li>
                  <li>
                    Navigate to{" "}
                    <strong>WhatsApp Manager &gt; Message Templates</strong>.
                  </li>
                  <li>
                    {metaDialog.action === "create" &&
                      "Create your new template and submit for Meta review."}
                    {metaDialog.action === "edit" &&
                      "Edit your template components and re-submit if required."}
                    {metaDialog.action === "delete" &&
                      "Delete the template from your WABA templates list."}
                  </li>
                  <li>
                    Return here and click{" "}
                    <strong>&quot;Sync with Meta&quot;</strong>.
                  </li>
                </ol>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <a
                  href="https://business.facebook.com/wa/manage/message-templates/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
                >
                  <span>Open Meta Business Manager</span>
                  <ExternalLink size={16} />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setMetaDialog({ open: false, action: "create" });
                    handleSync();
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <RefreshCw size={15} />
                  <span>Sync with Meta Now</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </DashboardLayout>
  );
}
