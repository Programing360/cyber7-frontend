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
import AdminConfirmDialog from "@/src/component/admin/admin-confirm-dialog";
import { adminToast } from "@/src/component/admin/admin-toast";
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

  // Mutation states
  const [targetWorkspace, setTargetWorkspace] = useState<AdminWorkspace | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [quotaModalOpen, setQuotaModalOpen] = useState(false);
  const [maxWhatsAppNumbers, setMaxWhatsAppNumbers] = useState("");
  const [maxTeamMembers, setMaxTeamMembers] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleToggleStatus = (ws: AdminWorkspace) => {
    setTargetWorkspace(ws);
    setSuspensionReason("");
    setStatusModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!targetWorkspace) return;
    const nextStatus = targetWorkspace.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setActionLoading(true);
    try {
      await adminService.updateWorkspaceStatus(targetWorkspace.id, {
        status: nextStatus,
        reason: suspensionReason.trim() || undefined,
      });
      adminToast.success(
        `Workspace ${nextStatus === "ACTIVE" ? "Reactivated" : "Suspended"}`,
        `Workspace "${targetWorkspace.name}" is now ${nextStatus.toLowerCase()}.`,
      );
      setStatusModalOpen(false);
      setSelectedWorkspace(null);
      await loadWorkspaces();
    } catch (err: any) {
      adminToast.error("Status Update Failed", err?.message || "Failed to update workspace status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenQuotas = (ws: AdminWorkspace) => {
    setTargetWorkspace(ws);
    setMaxWhatsAppNumbers("");
    setMaxTeamMembers("");
    setQuotaModalOpen(true);
  };

  const handleConfirmQuotas = async () => {
    if (!targetWorkspace) return;
    setActionLoading(true);
    try {
      const parsedWhatsApp = maxWhatsAppNumbers.trim() ? parseInt(maxWhatsAppNumbers, 10) : null;
      const parsedMembers = maxTeamMembers.trim() ? parseInt(maxTeamMembers, 10) : null;

      await adminService.updateWorkspaceQuotas(targetWorkspace.id, {
        maxWhatsAppNumbers: parsedWhatsApp,
        maxTeamMembers: parsedMembers,
      });

      adminToast.success(
        "Quotas Updated",
        `Custom limits applied to workspace "${targetWorkspace.name}".`,
      );
      setQuotaModalOpen(false);
      setSelectedWorkspace(null);
      await loadWorkspaces();
    } catch (err: any) {
      adminToast.error("Quota Update Failed", err?.message || "Failed to adjust workspace quotas.");
    } finally {
      setActionLoading(false);
    }
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
                          onClick={() => handleToggleStatus(ws)}
                          className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold focus:outline-hidden focus:ring-2 ${
                            ws.status === "ACTIVE"
                              ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 focus:ring-amber-400"
                              : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 focus:ring-emerald-400"
                          }`}
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
                  onClick={() => handleOpenQuotas(selectedWorkspace)}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-center font-semibold text-slate-700 hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c] cursor-pointer"
                >
                  Adjust Quotas
                </button>
                <button
                  onClick={() => handleToggleStatus(selectedWorkspace)}
                  className={`rounded-xl border p-2.5 text-center font-semibold cursor-pointer ${
                    selectedWorkspace.status === "ACTIVE"
                      ? "border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-100"
                      : "border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  {selectedWorkspace.status === "ACTIVE" ? "Suspend Workspace" : "Reactivate Workspace"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminDetailDrawer>

      {/* Workspace Status Toggle Modal */}
      <AdminConfirmDialog
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onConfirm={handleConfirmStatusChange}
        title={targetWorkspace?.status === "ACTIVE" ? "Suspend Workspace" : "Reactivate Workspace"}
        description={
          targetWorkspace?.status === "ACTIVE"
            ? `Are you sure you want to suspend workspace "${targetWorkspace?.name}"? Its users will be prevented from sending messages or triggering campaigns.`
            : `Are you sure you want to reactivate workspace "${targetWorkspace?.name}"? Normal operations will resume immediately.`
        }
        confirmText={targetWorkspace?.status === "ACTIVE" ? "Suspend Workspace" : "Reactivate Workspace"}
        isLoading={actionLoading}
        variant={targetWorkspace?.status === "ACTIVE" ? "destructive" : "primary"}
      >
        {targetWorkspace?.status === "ACTIVE" && (
          <div className="mt-3 text-xs">
            <label className="font-semibold text-slate-700">Suspension Reason (Optional)</label>
            <input
              type="text"
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              placeholder="e.g., Billing default or violation of terms"
              className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>
        )}
      </AdminConfirmDialog>

      {/* Workspace Quotas Adjustment Modal */}
      <AdminConfirmDialog
        open={quotaModalOpen}
        onClose={() => setQuotaModalOpen(false)}
        onConfirm={handleConfirmQuotas}
        title="Adjust Workspace Quotas"
        description={`Set custom tier overrides for "${targetWorkspace?.name}". Leave blank to inherit default plan tier limits, or enter -1 for unlimited.`}
        confirmText="Save Quotas"
        isLoading={actionLoading}
        variant="primary"
      >
        <div className="space-y-3 mt-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700">Max WhatsApp Numbers</label>
            <input
              type="number"
              value={maxWhatsAppNumbers}
              onChange={(e) => setMaxWhatsAppNumbers(e.target.value)}
              placeholder="e.g., 5 (-1 for unlimited, blank to reset)"
              className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700">Max Team Members</label>
            <input
              type="number"
              value={maxTeamMembers}
              onChange={(e) => setMaxTeamMembers(e.target.value)}
              placeholder="e.g., 20 (-1 for unlimited, blank to reset)"
              className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
            />
          </div>
        </div>
      </AdminConfirmDialog>
    </div>
  );
}
