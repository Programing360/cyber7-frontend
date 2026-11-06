"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Building2,
  Eye,
  Info,
  Lock,
  RotateCcw,
  ShieldAlert,
  Sliders,
} from "lucide-react";
import AdminFilters from "@/src/component/admin/admin-filters";
import AdminPagination from "@/src/component/admin/admin-pagination";
import AdminStatusBadge from "@/src/component/admin/admin-status-badge";
import AdminDetailDrawer from "@/src/component/admin/admin-detail-drawer";
import AdminUnimplementedModal from "@/src/component/admin/admin-unimplemented-modal";
import { adminService } from "@/src/services/admin-service";
import type { AdminWorkspace } from "@/src/types/admin";

export default function AdminWorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<AdminWorkspace[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected for drawer
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<AdminWorkspace | null>(null);

  // Modal for disabled mutation
  const [mutationModalOpen, setMutationModalOpen] = useState(false);
  const [mutationActionTitle, setMutationActionTitle] = useState("");
  const [missingEndpoint, setMissingEndpoint] = useState(
    "PATCH /api/admin/workspaces/:workspaceId/status",
  );

  const loadWorkspaces = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.listWorkspaces({
        search,
        status: statusFilter,
        page,
        limit: 10,
      });

     
      setWorkspaces(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setError("Failed to load workspace directory. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, [search, statusFilter, page]);

  const handleActionClick = (
    actionName: string,
    endpoint = "PATCH /api/admin/workspaces/:workspaceId/status",
  ) => {
    setMutationActionTitle(actionName);
    setMissingEndpoint(endpoint);
    setMutationModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Title & Backend Contract Disclaimer */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Workspace Management
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            Inspect all registered multi-tenant business workspaces across the platform
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
            Backend Status: LIVE_READONLY
          </span>
        </div>
      </div>

      {/* Error state alert */}
      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadWorkspaces}
            className="inline-flex items-center gap-1 font-bold underline hover:no-underline"
          >
            <RotateCcw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Filter controls */}
      <AdminFilters
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search by workspace name, slug, or owner email..."
        dropdowns={[
          {
            name: "status",
            label: "Status",
            value: statusFilter,
            options: [
              { label: "All Statuses", value: "ALL" },
              { label: "Active", value: "ACTIVE" },
              { label: "Suspended", value: "SUSPENDED" },
            ],
            onChange: (val) => {
              setStatusFilter(val);
              setPage(1);
            },
          },
        ]}
        onReset={handleResetFilters}
      />

      {/* Workspaces Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Workspace</th>
                <th className="px-6 py-3.5">Owner</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Plan & Billing</th>
                <th className="px-6 py-3.5">Members</th>
                <th className="px-6 py-3.5">Created</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#88da1c] border-t-transparent" />
                      <span>Loading workspaces...</span>
                    </div>
                  </td>
                </tr>
              ) : workspaces.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-2 text-slate-500">
                      <Building2 size={32} className="text-slate-300" />
                      <span className="font-semibold text-slate-700">
                        No workspaces found
                      </span>
                      <p className="text-xs text-slate-400 text-center">
                        No workspace matches your search term or selected status filter.
                      </p>
                      {(search || statusFilter !== "ALL") && (
                        <button
                          onClick={handleResetFilters}
                          className="mt-2 inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                workspaces.map((ws) => (
                  <tr key={ws.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold shrink-0">
                          <Building2 size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">
                            {ws.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono truncate">
                            /{ws.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 truncate">
                        {ws.ownerName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {ws.ownerEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <AdminStatusBadge status={ws.status} type="workspace" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <AdminStatusBadge status={ws.activePlan} type="plan" />
                        <AdminStatusBadge
                          status={ws.subscriptionStatus}
                          type="subscription"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800">
                        {ws.memberCount}
                      </span>{" "}
                      <span className="text-slate-400">members</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(ws.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedWorkspace(ws)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
                        >
                          <Eye size={12} />
                          Inspect
                        </button>
                        <button
                          onClick={() =>
                            handleActionClick(
                              ws.status === "ACTIVE"
                                ? "Suspend Workspace"
                                : "Activate Workspace",
                              "PATCH /api/admin/workspaces/:workspaceId/status",
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                        >
                          <Lock size={12} />
                          {ws.status === "ACTIVE" ? "Suspend" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <AdminPagination
          page={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={10}
          onPageChange={setPage}
          source="LIVE_BACKEND"
        />
      </div>

      {/* Workspace Inspect Drawer */}
      <AdminDetailDrawer
        open={Boolean(selectedWorkspace)}
        onClose={() => setSelectedWorkspace(null)}
        title={selectedWorkspace?.name || "Workspace Details"}
        subtitle={`Database ID: ${selectedWorkspace?.id}`}
      >
        {selectedWorkspace && (
          <div className="space-y-6 text-xs">
            {/* Meta status card */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Lifecycle Status
                </span>
                <AdminStatusBadge
                  status={selectedWorkspace.status}
                  type="workspace"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Slug / URL Path
                </span>
                <code className="font-mono text-slate-900 font-semibold">
                  /{selectedWorkspace.slug}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Timezone
                </span>
                <span className="text-slate-900 font-medium">
                  {selectedWorkspace.timezone}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Default Currency
                </span>
                <span className="font-bold text-emerald-800">
                  {selectedWorkspace.currency} (Bangladeshi Taka)
                </span>
              </div>
            </div>

            {/* Owner Section */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Owner Information
              </h4>
              <div className="text-sm font-semibold text-slate-900">
                {selectedWorkspace.ownerName}
              </div>
              <div className="text-slate-500">
                {selectedWorkspace.ownerEmail}
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                User ID: {selectedWorkspace.ownerId}
              </div>
            </div>

            {/* Subscription Snapshot */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Active Subscription
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Plan Code</span>
                <AdminStatusBadge
                  status={selectedWorkspace.activePlan}
                  type="plan"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Subscription Status</span>
                <AdminStatusBadge
                  status={selectedWorkspace.subscriptionStatus}
                  type="subscription"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Team Size</span>
                <span className="font-semibold text-slate-900">
                  {selectedWorkspace.memberCount} members active
                </span>
              </div>
            </div>

            {/* Quick Actions in Drawer */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Administrative Actions
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    handleActionClick(
                      "Update Workspace Quotas",
                      "PATCH /api/admin/workspaces/:workspaceId/quotas",
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-center font-semibold text-slate-700 hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
                >
                  Adjust Quotas
                </button>
                <button
                  onClick={() =>
                    handleActionClick(
                      "Inspect Workspace Audit Logs",
                      "GET /api/admin/workspaces/:workspaceId/audit-logs",
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-center font-semibold text-slate-700 hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
                >
                  Audit Logs
                </button>
              </div>
            </div>

            {/* Actions Warning */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 flex items-start gap-2.5">
              <ShieldAlert size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <div className="text-amber-900 text-[11px]">
                <strong>Administrative Restriction:</strong> Workspace mutations
                (e.g., suspension, quota updates, plan changes) are disabled
                because backend API endpoints are in specification phase.
              </div>
            </div>
          </div>
        )}
      </AdminDetailDrawer>

      {/* Mutation Unavailable Modal */}
      <AdminUnimplementedModal
        open={mutationModalOpen}
        onClose={() => setMutationModalOpen(false)}
        actionTitle={mutationActionTitle}
        missingEndpoint={missingEndpoint}
        explanation="The endpoint to mutate workspace status or quotas across the multi-tenant platform does not exist in cyber7-backend. Fake database mutations are disabled to maintain architectural integrity."
      />
    </div>
  );
}
