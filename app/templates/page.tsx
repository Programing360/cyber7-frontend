"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Languages,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import DashboardLayout from "@/src/component/dashboard/dashboard-layout";

import {
  initialTemplates,
  MessageTemplate,
  TemplateCategory,
  TemplateStatus,
} from "@/src/data/mock/templates";
import TemplateForm from "@/src/component/templates/template-form";

type CategoryFilter = "All" | TemplateCategory;
type StatusFilter = "All" | TemplateStatus;

const statusStyles: Record<TemplateStatus, string> = {
  Draft: "bg-slate-100 text-slate-600",
  Pending: "bg-amber-50 text-amber-700",
  Approved: "bg-green-50 text-green-700",
  Rejected: "bg-red-50 text-red-700",
};

const categoryStyles: Record<TemplateCategory, string> = {
  Marketing: "bg-violet-50 text-violet-700",
  Utility: "bg-blue-50 text-blue-700",
  Authentication: "bg-orange-50 text-orange-700",
};

export default function TemplatesPage() {
  const [templates, setTemplates] =
    useState<MessageTemplate[]>(initialTemplates);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  const [formOpen, setFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<
    MessageTemplate | undefined
  >();
  const [previewTemplate, setPreviewTemplate] = useState<
    MessageTemplate | undefined
  >();
  const [notice, setNotice] = useState("");

  const filteredTemplates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return templates.filter((template) => {
      const matchesSearch =
        !query ||
        template.name.toLowerCase().includes(query) ||
        template.body.toLowerCase().includes(query) ||
        template.category.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "All" || template.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All" || template.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [templates, search, categoryFilter, statusFilter]);

  const approvedCount = templates.filter(
    (template) => template.status === "Approved",
  ).length;

  const pendingCount = templates.filter(
    (template) => template.status === "Pending",
  ).length;

  const rejectedCount = templates.filter(
    (template) => template.status === "Rejected",
  ).length;

  function openCreateForm() {
    setEditingTemplate(undefined);
    setFormOpen(true);
  }

  function openEditForm(template: MessageTemplate) {
    setEditingTemplate(template);
    setFormOpen(true);
  }

  function handleSave(template: MessageTemplate) {
    const duplicate = templates.some(
      (item) =>
        item.name.toLowerCase() === template.name.toLowerCase() &&
        item.id !== template.id,
    );

    if (duplicate) {
      setNotice("A template with this name already exists.");
      return;
    }

    const exists = templates.some((item) => item.id === template.id);

    if (exists) {
      setTemplates((current) =>
        current.map((item) => (item.id === template.id ? template : item)),
      );

      setNotice(`Template "${template.name}" updated.`);
    } else {
      setTemplates((current) => [template, ...current]);

      setNotice(`Template "${template.name}" created.`);
    }

    setFormOpen(false);
    setEditingTemplate(undefined);
  }

  function handleDelete(template: MessageTemplate) {
    if (!window.confirm(`Delete template "${template.name}"?`)) return;

    setTemplates((current) =>
      current.filter((item) => item.id !== template.id),
    );

    setNotice(`Template "${template.name}" deleted from the demo.`);
  }

  function handleSubmitForReview(template: MessageTemplate) {
    if (template.status === "Approved") {
      setNotice(
        "This template is already marked Approved in the demo. Real approval must be verified through Meta.",
      );
      return;
    }

    setTemplates((current) =>
      current.map((item) =>
        item.id === template.id ? { ...item, status: "Pending" } : item,
      ),
    );

    setNotice(
      `"${template.name}" marked Pending in demo mode. It was not submitted to Meta.`,
    );
  }

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
                Manage reusable messages for customer communication.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#88da1c] text-black px-4 py-2.5 text-sm font-semibold hover:text-white shadow-sm transition hover:bg-green-700"
            >
              <Plus size={18} />
              Create Template
            </button>
          </div>

          {/* Demo notice */}
          {/* <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-semibold text-amber-900">
              Template demo workspace
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-800">
              Template records and approval statuses are sample data. Real
              template creation, approval and sending require Meta WhatsApp
              Cloud API integration.
            </p>
          </div> */}

          {/* Notice */}
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

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Total Templates",
                value: templates.length,
                detail: "All demo templates",
                icon: FileText,
                color: "bg-blue-50 text-blue-600",
              },
              {
                title: "Approved",
                value: approvedCount,
                detail: "Sample approved status",
                icon: CheckCircle2,
                color: "bg-green-50 text-green-600",
              },
              {
                title: "Pending Review",
                value: pendingCount,
                detail: "Sample pending status",
                icon: Clock3,
                color: "bg-amber-50 text-amber-600",
              },
              {
                title: "Rejected",
                value: rejectedCount,
                detail: "Sample rejected status",
                icon: XCircle,
                color: "bg-red-50 text-red-600",
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

          {/* Filters */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="font-bold text-slate-900">All Templates</h2>

                <p className="mt-1 text-xs text-slate-500">
                  {filteredTemplates.length} templates found
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
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(event) =>
                    setCategoryFilter(event.target.value as CategoryFilter)
                  }
                  aria-label="Filter by category"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500"
                >
                  <option value="All">All categories</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Utility">Utility</option>
                  <option value="Authentication">Authentication</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as StatusFilter)
                  }
                  aria-label="Filter by approval status"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500"
                >
                  <option value="All">All statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Template cards */}
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3 sm:p-5">
              {filteredTemplates.map((template) => (
                <article
                  key={template.id}
                  className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words text-sm font-bold text-slate-900">
                        {template.name}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${categoryStyles[template.category]}`}
                        >
                          {template.category}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[template.status]}`}
                        >
                          {template.status}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(template)}
                      title="Delete template"
                      aria-label={`Delete ${template.name}`}
                      className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-4 rounded-xl bg-[#f0f7f2] p-3">
                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                      {template.body}
                    </p>

                    {template.footer && (
                      <p className="mt-2 border-t border-slate-200 pt-2 text-xs text-slate-500">
                        {template.footer}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Languages size={14} />
                      {template.language}
                    </span>

                    <span>
                      {template.variables.length} variable
                      {template.variables.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                    <span>Updated {template.updatedAt}</span>
                    {/* <span>Demo template</span> */}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewTemplate(template)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Eye size={14} />
                      Preview
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditForm(template)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <MoreHorizontal size={14} />
                      Edit
                    </button>

                    {template.status !== "Approved" && (
                      <button
                        type="button"
                        onClick={() => handleSubmitForReview(template)}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
                      >
                        <Send size={14} />
                        Mark for review
                      </button>
                    )}

                    {template.status === "Approved" && (
                      <div className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
                        <ShieldCheck size={14} />
                        Approved
                      </div>
                    )}
                  </div>
                </article>
              ))}

              {filteredTemplates.length === 0 && (
                <div className="col-span-full py-16 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Search size={21} />
                  </div>

                  <p className="mt-3 font-semibold text-slate-800">
                    No templates found
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Try a different search or filter.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setCategoryFilter("All");
                      setStatusFilter("All");
                    }}
                    className="mt-4 text-sm font-semibold text-green-700"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
              Showing {filteredTemplates.length} of {templates.length} templates
            </div>
          </section>
        </div>
      </main>

      {formOpen && (
        <TemplateForm
          template={editingTemplate}
          onSave={handleSave}
          onClose={() => {
            setFormOpen(false);
            setEditingTemplate(undefined);
          }}
        />
      )}

      {previewTemplate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="template-detail-title"
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="min-w-0">
                <h2
                  id="template-detail-title"
                  className="break-words font-bold text-slate-900"
                >
                  {previewTemplate.name}
                </h2>
                <p className="mt-1 text-xs text-slate-500">Template details</p>
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

            <div className="space-y-4 p-5">
              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${categoryStyles[previewTemplate.category]}`}
                >
                  {previewTemplate.category}
                </span>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[previewTemplate.status]}`}
                >
                  {previewTemplate.status}
                </span>
              </div>

              <div className="rounded-xl bg-[#e8f5e9] p-4">
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">
                    {previewTemplate.body.replace(
                      /\{\{\d+\}\}/g,
                      (variable) => `Sample ${variable.replace(/\D/g, "")}`,
                    )}
                  </p>

                  {previewTemplate.footer && (
                    <p className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-500">
                      {previewTemplate.footer}
                    </p>
                  )}

                  <p className="mt-2 text-right text-[10px] text-slate-400">
                    10:30 AM
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Language</span>
                  <span className="font-medium text-slate-800">
                    {previewTemplate.language}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Created</span>
                  <span className="font-medium text-slate-800">
                    {previewTemplate.createdAt}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Updated</span>
                  <span className="font-medium text-slate-800">
                    {previewTemplate.updatedAt}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewTemplate(undefined)}
                className="w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
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
