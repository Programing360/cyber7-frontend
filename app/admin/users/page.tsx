"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  KeyRound,
  RotateCcw,
  Shield,
  ShieldAlert,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import AdminFilters from "@/src/component/admin/admin-filters";
import AdminPagination from "@/src/component/admin/admin-pagination";
import AdminStatusBadge from "@/src/component/admin/admin-status-badge";
import AdminDetailDrawer from "@/src/component/admin/admin-detail-drawer";
import AdminConfirmDialog from "@/src/component/admin/admin-confirm-dialog";
import { adminToast } from "@/src/component/admin/admin-toast";
import { adminService } from "@/src/services/admin-service";
import type { AdminPlatformUser } from "@/src/types/admin";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminPlatformUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<AdminPlatformUser | null>(
    null,
  );

  // Mutation states
  const [actionModal, setActionModal] = useState<"ROLE" | "REVOKE" | "STATUS" | "DELETE" | null>(null);
  const [targetUser, setTargetUser] = useState<AdminPlatformUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<"USER" | "FINANCE_ADMIN" | "SUPER_ADMIN">("USER");
  const [statusReason, setStatusReason] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.listUsers({
        search,
        role: roleFilter,
        page,
        limit: 10,
      });
      setUsers(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      if (err?.status === 403 || err?.code === "PLATFORM_ROLE_UNAUTHORIZED") {
        setError("PLATFORM_ROLE_UNAUTHORIZED");
      } else {
        setError("Failed to load user directory. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter, page]);

  // Action Triggers
  const handleOpenRoleModal = (u: AdminPlatformUser) => {
    setTargetUser(u);
    setSelectedRole(u.platformRole || "USER");
    setActionModal("ROLE");
  };

  const handleConfirmRoleChange = async () => {
    if (!targetUser) return;
    setActionLoading(true);
    try {
      await adminService.updateUserRole(targetUser.id, { platformRole: selectedRole });
      adminToast.success(
        "Platform Role Updated",
        `Role for "${targetUser.name}" changed to ${selectedRole}.`,
      );
      setActionModal(null);
      setSelectedUser(null);
      await loadUsers();
    } catch (err: any) {
      adminToast.error("Role Update Failed", err?.message || "Failed to update user platform role.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRevokeModal = (u: AdminPlatformUser) => {
    setTargetUser(u);
    setActionModal("REVOKE");
  };

  const handleConfirmRevokeSessions = async () => {
    if (!targetUser) return;
    setActionLoading(true);
    try {
      await adminService.revokeUserSessions(targetUser.id, { reason: "Admin revocation" });
      adminToast.success(
        "Sessions Invalidated",
        `All active tokens and sessions for "${targetUser.name}" were revoked immediately.`,
      );
      setActionModal(null);
      setSelectedUser(null);
      await loadUsers();
    } catch (err: any) {
      adminToast.error("Revocation Failed", err?.message || "Failed to revoke active sessions.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenStatusModal = (u: AdminPlatformUser) => {
    setTargetUser(u);
    setStatusReason("");
    setActionModal("STATUS");
  };

  const handleConfirmStatusChange = async () => {
    if (!targetUser) return;
    const nextIsActive = !targetUser.isActive;
    setActionLoading(true);
    try {
      await adminService.updateUserStatus(targetUser.id, {
        isActive: nextIsActive,
        reason: statusReason.trim() || undefined,
      });
      adminToast.success(
        `User ${nextIsActive ? "Activated" : "Deactivated"}`,
        `Account for "${targetUser.name}" is now ${nextIsActive ? "active" : "deactivated"}.`,
      );
      setActionModal(null);
      setSelectedUser(null);
      await loadUsers();
    } catch (err: any) {
      adminToast.error("Status Update Failed", err?.message || "Failed to toggle user status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDeleteModal = (u: AdminPlatformUser) => {
    setTargetUser(u);
    setDeleteConfirmation("");
    setActionModal("DELETE");
  };

  const handleConfirmDeleteUser = async () => {
    if (!targetUser) return;
    if (deleteConfirmation.trim() !== "DELETE") {
      adminToast.error("Validation Error", 'You must type "DELETE" exactly to confirm safe deletion.');
      return;
    }
    setActionLoading(true);
    try {
      await adminService.deleteUser(targetUser.id, { confirmation: "DELETE" });
      adminToast.success(
        "User Deleted",
        `User account "${targetUser.name}" has been permanently purged.`,
      );
      setActionModal(null);
      setSelectedUser(null);
      await loadUsers();
    } catch (err: any) {
      adminToast.error("Deletion Rejected", err?.message || "Failed to purge user account.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setRoleFilter("ALL");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            User & Platform Role Management
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            Manage platform users, roles (SUPER_ADMIN, FINANCE_ADMIN, USER), and tenant associations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
            Backend Status: SUPER_ADMIN ONLY
          </span>
        </div>
      </div>

      {/* Role Architecture Clarification Notice */}
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 text-xs text-indigo-950">
        <div className="flex items-start gap-2.5">
          <Shield size={16} className="text-indigo-600 mt-0.5 shrink-0" />
          <div>
            <strong className="font-bold">Role Architecture Clarification:</strong>{" "}
            Platform roles (<code>SUPER_ADMIN</code>, <code>FINANCE_ADMIN</code>, <code>USER</code>)
            govern system-wide administrative access. They are completely separate from customer
            workspace roles (<code>OWNER</code>, <code>ADMIN</code>, <code>AGENT</code>). A workspace
            OWNER does not have platform administrative privileges.
          </div>
        </div>
      </div>

      {/* Error / Unauthorized state alert */}
      {error && (
        error === "PLATFORM_ROLE_UNAUTHORIZED" ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 mb-3">
              <ShieldAlert size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Access Restricted — SUPER_ADMIN Privileges Required
            </h3>
            <p className="mt-1 text-xs text-slate-600 max-w-md mx-auto">
              Your administrator account is signed in with FINANCE_ADMIN privileges. Inspecting system-wide user directories and platform roles is restricted to SUPER_ADMIN sessions.
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={16} className="text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadUsers}
              className="inline-flex items-center gap-1 font-bold underline hover:no-underline"
            >
              <RotateCcw size={12} />
              <span>Retry</span>
            </button>
          </div>
        )
      )}

      {/* Filters */}
      <AdminFilters
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search by user name or email..."
        dropdowns={[
          {
            name: "role",
            label: "Platform Role",
            value: roleFilter,
            options: [
              { label: "All Platform Roles", value: "ALL" },
              { label: "Super Admin", value: "SUPER_ADMIN" },
              { label: "Finance Admin", value: "FINANCE_ADMIN" },
              { label: "Standard User", value: "USER" },
            ],
            onChange: (val) => {
              setRoleFilter(val);
              setPage(1);
            },
          },
        ]}
        onReset={handleResetFilters}
      />

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Platform Role</th>
                <th className="px-6 py-3.5">Primary Workspace</th>
                <th className="px-6 py-3.5">Workspace Role</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Registered</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#88da1c] border-t-transparent" />
                      <span>Loading user directory...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-2 text-slate-500">
                      <Users size={32} className="text-slate-300" />
                      <span className="font-semibold text-slate-700">
                        No platform users found
                      </span>
                      <p className="text-xs text-slate-400 text-center">
                        No user matches your search term or selected role filter.
                      </p>
                      {(search || roleFilter !== "ALL") && (
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
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-bold shrink-0">
                          {u.name.slice(0, 1)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">
                            {u.name}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <AdminStatusBadge
                        status={u.platformRole}
                        type="platformRole"
                      />
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 truncate">
                      {u.primaryWorkspaceName || (
                        <span className="text-slate-400 italic">None (Platform Admin)</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {u.workspaceRole ? (
                        <AdminStatusBadge
                          status={u.workspaceRole}
                          type="workspaceRole"
                        />
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${u.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                          }`}
                      >
                        {u.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
                        >
                          <Eye size={12} />
                          Inspect
                        </button>
                        <button
                          onClick={() => handleOpenRoleModal(u)}
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                        >
                          Edit Role
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

      {/* User Inspect Drawer */}
      <AdminDetailDrawer
        open={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        title={selectedUser?.name || "User Details"}
        subtitle={`User ID: ${selectedUser?.id}`}
      >
        {selectedUser && (
          <div className="space-y-6 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Platform Role
                </span>
                <AdminStatusBadge
                  status={selectedUser.platformRole}
                  type="platformRole"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Account Status
                </span>
                <span
                  className={`font-semibold ${selectedUser.isActive ? "text-emerald-700" : "text-rose-700"
                    }`}
                >
                  {selectedUser.isActive ? "Active Account" : "Inactive / Suspended"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Email Verification
                </span>
                <span className="font-medium text-slate-700">
                  {selectedUser.isEmailVerified ? "Verified Email" : "Unverified"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Last Active
                </span>
                <span className="text-slate-900 font-medium">
                  {selectedUser.lastLoginAt
                    ? new Date(selectedUser.lastLoginAt).toLocaleString("en-US")
                    : "No recorded activity"}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Customer Workspace Mapping
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Associated Workspace</span>
                <span className="font-semibold text-slate-900">
                  {selectedUser.primaryWorkspaceName || "None (Platform Admin)"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Workspace Role</span>
                <span className="font-semibold text-slate-900">
                  {selectedUser.workspaceRole || "N/A"}
                </span>
              </div>
            </div>

            {/* Quick Actions in Drawer */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Administrative & Security Operations
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleOpenRoleModal(selectedUser)}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-center font-semibold text-slate-700 hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c] cursor-pointer"
                >
                  Change Platform Role
                </button>
                <button
                  onClick={() => handleOpenRevokeModal(selectedUser)}
                  className="rounded-xl border border-amber-200 bg-amber-50/50 p-2.5 text-center font-semibold text-amber-800 hover:bg-amber-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  Revoke Sessions
                </button>
                <button
                  onClick={() => handleOpenStatusModal(selectedUser)}
                  className={`rounded-xl border p-2.5 text-center font-semibold cursor-pointer ${selectedUser.isActive
                      ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    }`}
                >
                  {selectedUser.isActive ? "Deactivate User" : "Activate User"}
                </button>
                <button
                  onClick={() => handleOpenDeleteModal(selectedUser)}
                  className="rounded-xl border border-rose-200 bg-rose-50/50 p-2.5 text-center font-semibold text-rose-700 hover:bg-rose-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  Safe Purge
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminDetailDrawer>

      {/* Change Platform Role Modal */}
      <AdminConfirmDialog
        open={actionModal === "ROLE"}
        onClose={() => setActionModal(null)}
        onConfirm={handleConfirmRoleChange}
        title="Change Platform Role"
        description={`Modify administrative platform role for "${targetUser?.name}" (${targetUser?.email}).`}
        confirmText="Save Role"
        isLoading={actionLoading}
        variant="primary"
      >
        <div className="mt-3 text-xs">
          <label className="font-semibold text-slate-700">Select Platform Role</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as any)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
          >
            <option value="USER">USER (Standard Customer / No Platform Access)</option>
            <option value="FINANCE_ADMIN">FINANCE_ADMIN (Billing & Manual Ledger Review)</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN (Full Platform Authority)</option>
          </select>
        </div>
      </AdminConfirmDialog>

      {/* Revoke Sessions Modal */}
      <AdminConfirmDialog
        open={actionModal === "REVOKE"}
        onClose={() => setActionModal(null)}
        onConfirm={handleConfirmRevokeSessions}
        title="Revoke Active Sessions"
        description={`Invalidate all active sessions, JWT tokens, and cookies for "${targetUser?.name}". The user will be immediately logged out of all devices.`}
        confirmText="Revoke All Sessions"
        isLoading={actionLoading}
        variant="warning"
      />

      {/* Toggle User Account Status Modal */}
      <AdminConfirmDialog
        open={actionModal === "STATUS"}
        onClose={() => setActionModal(null)}
        onConfirm={handleConfirmStatusChange}
        title={targetUser?.isActive ? "Deactivate User Account" : "Activate User Account"}
        description={
          targetUser?.isActive
            ? `Deactivating "${targetUser?.name}" will instantly revoke their active sessions and prevent login.`
            : `Activating "${targetUser?.name}" will restore their platform and workspace access.`
        }
        confirmText={targetUser?.isActive ? "Deactivate User" : "Activate User"}
        isLoading={actionLoading}
        variant={targetUser?.isActive ? "destructive" : "primary"}
      >
        {targetUser?.isActive && (
          <div className="mt-3 text-xs">
            <label className="font-semibold text-slate-700">Deactivation Reason (Optional)</label>
            <input
              type="text"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="e.g., Security policy violation"
              className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>
        )}
      </AdminConfirmDialog>

      {/* Safe Purge User Modal */}
      <AdminConfirmDialog
        open={actionModal === "DELETE"}
        onClose={() => setActionModal(null)}
        onConfirm={handleConfirmDeleteUser}
        title="Safe Purge User Account"
        description={`Permanently delete user "${targetUser?.name}" (${targetUser?.email}). The system will reject deletion if this user owns active paid workspaces or financial transactions.`}
        confirmText="Permanently Delete"
        isLoading={actionLoading}
        variant="destructive"
      >
        <div className="mt-3 text-xs">
          <label className="font-semibold text-rose-800">
            Type <strong className="font-mono font-bold">DELETE</strong> to confirm safe deletion *
          </label>
          <input
            type="text"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder="Type DELETE"
            className="mt-1 w-full rounded-xl border border-rose-300 p-2.5 text-slate-900 font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </AdminConfirmDialog>
    </div>
  );
}
