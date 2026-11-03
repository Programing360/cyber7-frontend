"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Activity,
  Check,
  ChevronDown,
  Clock,
  Loader2,
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";

import DashboardLayout from "@/src/component/dashboard/dashboard-layout";
import { useWorkspace } from "@/src/context/workspace-context";
import { useAuth } from "@/src/context/auth-context";
import { teamService } from "@/src/services/team-service";
import { ApiClientError } from "@/src/lib/api-client";
import type {
  UserRole,
  WorkspaceInvitationItem,
  WorkspaceMemberItem,
  WorkspaceMemberStatus,
} from "@/src/types/api";

type MemberForm = {
  email: string;
  role: "ADMIN" | "AGENT";
};

const emptyForm: MemberForm = {
  email: "",
  role: "AGENT",
};

const roleStyles: Record<string, string> = {
  OWNER: "bg-amber-50 text-amber-800 ring-amber-200",
  ADMIN: "bg-violet-50 text-violet-700 ring-violet-200",
  AGENT: "bg-slate-100 text-slate-700 ring-slate-200",
  MANAGER: "bg-blue-50 text-blue-700 ring-blue-200",
};

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  SUSPENDED: "bg-red-50 text-red-700",
  INACTIVE: "bg-slate-100 text-slate-600",
  PENDING: "bg-amber-50 text-amber-700",
};

function formatLabel(value: string) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function getInitials(name?: string, email?: string) {
  const source = name && name.trim().length > 0 ? name : email || "U";
  return source
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function TeamPageFallback() {
  return (
    <DashboardLayout>
      <main className="min-h-full bg-[#f8fafc] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto flex max-w-7xl items-center justify-center py-24 text-slate-400">
          <Loader2 size={28} className="animate-spin" />
        </div>
      </main>
    </DashboardLayout>
  );
}

export default function TeamPage() {
  return (
    <Suspense fallback={<TeamPageFallback />}>
      <TeamPageContent />
    </Suspense>
  );
}

function TeamPageContent() {
  const { activeWorkspace, refreshWorkspaces } = useWorkspace();
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [members, setMembers] = useState<WorkspaceMemberItem[]>([]);
  const [invitations, setInvitations] = useState<WorkspaceInvitationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [viewTab, setViewTab] = useState<"members" | "invitations">("members");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<WorkspaceMemberItem | null>(null);
  const [form, setForm] = useState<MemberForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Invitation token handling from URL query params
  const inviteToken = searchParams.get("token") || searchParams.get("invitationToken");
  const [acceptingInvite, setAcceptingInvite] = useState(false);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3500);
  }

  // Fetch team members and invitations
  const loadTeamData = useCallback(async () => {
    if (!activeWorkspace) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [membersResult, invitationsResult] = await Promise.allSettled([
        teamService.getMembers(activeWorkspace.id),
        activeWorkspace.role === "OWNER" || activeWorkspace.role === "ADMIN"
          ? teamService.getInvitations(activeWorkspace.id)
          : Promise.resolve({ invitations: [], total: 0 }),
      ]);

      if (membersResult.status === "fulfilled") {
        setMembers(membersResult.value.members);
      } else {
        console.error("Failed to load members:", membersResult.reason);
      }

      if (invitationsResult.status === "fulfilled") {
        setInvitations(invitationsResult.value.invitations);
      } else {
        setInvitations([]);
      }
    } catch (err) {
      console.error("Error loading team data:", err);
      showToast("Unable to load team members.");
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace]);

  useEffect(() => {
    loadTeamData();
  }, [loadTeamData]);

  // Handle invitation acceptance if token in URL
  const handleAcceptInvite = async () => {
    if (!inviteToken) return;
    setAcceptingInvite(true);
    try {
      await teamService.acceptInvitation(inviteToken);
      showToast("Invitation accepted successfully! Refreshing workspaces...");
      await refreshWorkspaces();
      await loadTeamData();
    } catch (err: unknown) {
      const msg = err instanceof ApiClientError ? err.message : "Failed to accept invitation";
      showToast(msg);
    } finally {
      setAcceptingInvite(false);
    }
  };

  // Role permissions
  const myRole = activeWorkspace?.role;
  const isOwnerOrAdmin = myRole === "OWNER" || myRole === "ADMIN";

  // Filter members
  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return members.filter((member) => {
      const name = member.user?.name || "";
      const email = member.user?.email || "";
      const matchesSearch =
        !query ||
        name.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query);

      const matchesRole = roleFilter === "ALL" || member.role === roleFilter;
      const matchesStatus = statusFilter === "ALL" || member.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, search, roleFilter, statusFilter]);

  // Filter pending invitations
  const filteredInvitations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return invitations.filter((inv) => {
      const matchesSearch =
        !query ||
        inv.email.toLowerCase().includes(query) ||
        (inv.invitedBy?.name && inv.invitedBy.name.toLowerCase().includes(query));
      const matchesRole = roleFilter === "ALL" || inv.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [invitations, search, roleFilter]);

  const activeCount = members.filter((m) => m.status === "ACTIVE").length;
  const adminCount = members.filter((m) => m.role === "ADMIN" || m.role === "OWNER").length;
  const agentCount = members.filter((m) => m.role === "AGENT").length;

  function openCreateModal() {
    setEditingMember(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(member: WorkspaceMemberItem) {
    setEditingMember(member);
    setForm({
      email: member.user.email,
      role: member.role === "ADMIN" ? "ADMIN" : "AGENT",
    });
    setFormError("");
    setOpenMenuId(null);
    setModalOpen(true);
  }

  // Handle invitation dispatch or member role update
  async function handleSaveMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeWorkspace) return;
    setFormError("");
    setIsSubmitting(true);

    try {
      if (editingMember) {
        // Updating existing member role
        await teamService.updateMemberRole(
          activeWorkspace.id,
          editingMember.user.id,
          form.role,
        );

        setMembers((current) =>
          current.map((m) =>
            m.membershipId === editingMember.membershipId
              ? { ...m, role: form.role }
              : m,
          ),
        );
        showToast("Team member role updated successfully.");
      } else {
        // Sending new invitation
        const email = form.email.trim().toLowerCase();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
          setFormError("Please provide a valid email address.");
          setIsSubmitting(false);
          return;
        }

        const res = await teamService.inviteMember(activeWorkspace.id, {
          email,
          role: form.role,
        });

        // Add to pending invitations
        const newInvitation: WorkspaceInvitationItem = {
          _id: res.invitation.id,
          workspaceId: activeWorkspace.id,
          email: res.invitation.email,
          role: res.invitation.role,
          status: res.invitation.status,
          invitedBy: {
            _id: user?.id || "",
            name: user?.name || "Admin",
            email: user?.email || "",
          },
          expiresAt: res.invitation.expiresAt,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setInvitations((prev) => [newInvitation, ...prev]);
        showToast("Invitation sent successfully.");
      }

      setModalOpen(false);
      setEditingMember(null);
      setForm(emptyForm);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setFormError(err.message);
      } else {
        setFormError("Action failed. Please verify your permissions and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Toggle member status (ACTIVE <-> SUSPENDED)
  async function toggleMemberStatus(member: WorkspaceMemberItem) {
    if (!activeWorkspace) return;
    const nextStatus: WorkspaceMemberStatus =
      member.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

    try {
      await teamService.updateMemberStatus(
        activeWorkspace.id,
        member.user.id,
        nextStatus,
      );

      setMembers((current) =>
        current.map((m) =>
          m.membershipId === member.membershipId
            ? { ...m, status: nextStatus }
            : m,
        ),
      );

      setOpenMenuId(null);
      showToast(
        nextStatus === "ACTIVE" ? "Member reactivated." : "Member suspended.",
      );
    } catch (err: unknown) {
      const msg = err instanceof ApiClientError ? err.message : "Failed to update member status";
      showToast(msg);
      setOpenMenuId(null);
    }
  }

  // Remove member from workspace
  async function removeMember(member: WorkspaceMemberItem) {
    if (!activeWorkspace) return;
    const confirmed = window.confirm(
      `Are you sure you want to remove ${member.user.name || member.user.email} from this workspace?`,
    );

    if (!confirmed) return;

    try {
      await teamService.removeMember(activeWorkspace.id, member.user.id);
      setMembers((current) =>
        current.filter((m) => m.membershipId !== member.membershipId),
      );
      setOpenMenuId(null);
      showToast("Team member removed from workspace.");
    } catch (err: unknown) {
      const msg = err instanceof ApiClientError ? err.message : "Failed to remove member";
      showToast(msg);
      setOpenMenuId(null);
    }
  }

  // Revoke invitation
  async function revokeInvitation(invitation: WorkspaceInvitationItem) {
    if (!activeWorkspace) return;
    const confirmed = window.confirm(
      `Revoke invitation for ${invitation.email}?`,
    );
    if (!confirmed) return;

    try {
      await teamService.revokeInvitation(activeWorkspace.id, invitation._id);
      setInvitations((prev) => prev.filter((i) => i._id !== invitation._id));
      showToast("Invitation revoked successfully.");
    } catch (err: unknown) {
      const msg = err instanceof ApiClientError ? err.message : "Failed to revoke invitation";
      showToast(msg);
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1400px] space-y-7">
        {/* Invitation Token Alert if user opened an invitation link */}
        {inviteToken && (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Mail className="text-green-700 shrink-0" size={20} />
              <div>
                <p className="text-sm font-semibold text-green-900">
                  Workspace Invitation Received
                </p>
                <p className="text-xs text-green-800">
                  You have been invited to join a team workspace. Click accept to activate your membership.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={acceptingInvite}
              onClick={handleAcceptInvite}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:opacity-50"
            >
              {acceptingInvite ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Accepting...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Accept Invitation</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Page heading */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
              <Users size={15} />
              Workspace Management
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Team Management
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage your workspace members, invite collaborators, and administer role permissions.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={loadTeamData}
              disabled={isLoading}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              title="Refresh team data"
            >
              <RefreshCw size={17} className={isLoading ? "animate-spin" : ""} />
            </button>

            {isOwnerOrAdmin && (
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#88da1c] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6bb609]"
              >
                <Plus size={18} />
                Invite Member
              </button>
            )}
          </div>
        </section>

        {/* Role overview notice */}
        <div className="flex items-start gap-3 rounded-2xl border border-green-100 bg-[#effbdd] p-4 shadow-sm">
          <Activity className="mt-0.5 shrink-0 text-green-700" size={19} />
          <div>
            <p className="text-sm font-semibold text-green-900">
              Workspace Role Governance
            </p>
            <p className="mt-1 text-sm leading-5 text-green-900/80">
              You are signed in as{" "}
              <span className="font-semibold">{myRole || "MEMBER"}</span> of{" "}
              <span className="font-semibold">{activeWorkspace?.name || "this workspace"}</span>.
              {myRole === "OWNER"
                ? " You have full administrative control to invite members, modify roles, and remove accounts."
                : myRole === "ADMIN"
                  ? " You can invite new collaborators and manage Agent memberships."
                  : " You have read-only access to view team members."}
            </p>
          </div>
        </div>

        {/* Statistics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Members"
            value={members.length}
            subtitle="Active workspace members"
            icon={<Users size={20} />}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Active Members"
            value={activeCount}
            subtitle="Currently active accounts"
            icon={<UserCheck size={20} />}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Administrators"
            value={adminCount}
            subtitle="Owner & Admin roles"
            icon={<ShieldCheck size={20} />}
            iconClass="bg-violet-50 text-violet-600"
          />

          <StatCard
            title="Pending Invitations"
            value={invitations.length}
            subtitle="Awaiting acceptance"
            icon={<Clock size={20} />}
            iconClass="bg-amber-50 text-amber-600"
          />
        </section>

        {/* Role Cards */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <RoleCard
            title="Owner"
            description="Full organization authority, workspace ownership, and team governance."
            badge="OWNER"
            color="violet"
          />

          <RoleCard
            title="Admin"
            description="Team management, invitation authority, and operational supervision."
            badge="ADMIN"
            color="blue"
          />

          <RoleCard
            title="Agent"
            description="Customer messaging, conversation handling, and assigned contacts."
            badge="AGENT"
            color="slate"
          />
        </section>

        {/* Members & Invitations Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Table Header Controls */}
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewTab("members")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  viewTab === "members"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Members ({members.length})
              </button>

              {isOwnerOrAdmin && (
                <button
                  type="button"
                  onClick={() => setViewTab("invitations")}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    viewTab === "invitations"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Pending Invitations ({invitations.length})
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="relative sm:col-span-1">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={viewTab === "members" ? "Search members..." : "Search invites..."}
                  aria-label="Search"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
                />
              </div>

              <FilterSelect
                label="Filter by role"
                value={roleFilter}
                onChange={setRoleFilter}
                options={[
                  { label: "All roles", value: "ALL" },
                  { label: "Admin", value: "ADMIN" },
                  { label: "Agent", value: "AGENT" },
                  ...(viewTab === "members" ? [{ label: "Owner", value: "OWNER" }] : []),
                ]}
              />

              {viewTab === "members" ? (
                <FilterSelect
                  label="Filter by status"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { label: "All statuses", value: "ALL" },
                    { label: "Active", value: "ACTIVE" },
                    { label: "Suspended", value: "SUSPENDED" },
                  ]}
                />
              ) : (
                <div />
              )}
            </div>
          </div>

          {/* Members Table View */}
          {viewTab === "members" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <TableHeading>Member</TableHeading>
                    <TableHeading>Role</TableHeading>
                    <TableHeading>Status</TableHeading>
                    <TableHeading>Joined Date</TableHeading>
                    <TableHeading>
                      <span className="sr-only">Actions</span>
                    </TableHeading>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((member) => {
                    const isSelf = member.user?.id === user?.id;
                    const isTargetOwner = member.role === "OWNER";
                    const isTargetAdmin = member.role === "ADMIN";

                    // Governance rule enforcement
                    const canEdit =
                      !isSelf &&
                      !isTargetOwner &&
                      (myRole === "OWNER" || (myRole === "ADMIN" && !isTargetAdmin));

                    return (
                      <tr key={member.membershipId} className="transition hover:bg-slate-50/70">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                              {getInitials(member.user?.name, member.user?.email)}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {member.user?.name || "Team Member"}
                                {isSelf && (
                                  <span className="ml-2 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                                    You
                                  </span>
                                )}
                              </p>

                              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                <Mail size={12} />
                                {member.user?.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                              roleStyles[member.role] || roleStyles.AGENT
                            }`}
                          >
                            {formatLabel(member.role)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              statusStyles[member.status] || statusStyles.INACTIVE
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                member.status === "ACTIVE"
                                  ? "bg-emerald-500"
                                  : "bg-red-500"
                              }`}
                            />
                            {formatLabel(member.status)}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {member.joinedAt
                            ? new Date(member.joinedAt).toLocaleDateString()
                            : "—"}
                        </td>

                        <td className="px-5 py-4 text-right">
                          {canEdit ? (
                            <div className="relative inline-block">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenMenuId((current) =>
                                    current === member.membershipId
                                      ? null
                                      : member.membershipId,
                                  )
                                }
                                aria-label="Member options"
                                aria-expanded={openMenuId === member.membershipId}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                              >
                                <MoreHorizontal size={19} />
                              </button>

                              {openMenuId === member.membershipId && (
                                <div className="absolute right-0 z-20 mt-1 w-52 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl">
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(member)}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                                  >
                                    <Pencil size={15} />
                                    Change role
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => toggleMemberStatus(member)}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                                  >
                                    {member.status === "ACTIVE" ? (
                                      <X size={15} />
                                    ) : (
                                      <Check size={15} />
                                    )}
                                    {member.status === "ACTIVE"
                                      ? "Suspend member"
                                      : "Reactivate member"}
                                  </button>

                                  <div className="my-1 border-t border-slate-100" />

                                  <button
                                    type="button"
                                    onClick={() => removeMember(member)}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 size={15} />
                                    Remove member
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredMembers.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={5} className="px-5 py-16 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                          <Users size={22} />
                        </div>
                        <h3 className="mt-4 text-sm font-semibold text-slate-900">
                          No team members found
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Try adjusting your search query or filters.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Invitations Table View */}
          {viewTab === "invitations" && isOwnerOrAdmin && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <TableHeading>Invited Email</TableHeading>
                    <TableHeading>Role</TableHeading>
                    <TableHeading>Status</TableHeading>
                    <TableHeading>Invited By</TableHeading>
                    <TableHeading>Expires At</TableHeading>
                    <TableHeading>
                      <span className="sr-only">Actions</span>
                    </TableHeading>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredInvitations.map((inv) => (
                    <tr key={inv._id} className="transition hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-sm font-bold text-amber-700">
                            <Mail size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {inv.email}
                            </p>
                            <span className="text-xs text-slate-400">
                              Pending Acceptance
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                            roleStyles[inv.role] || roleStyles.AGENT
                          }`}
                        >
                          {formatLabel(inv.role)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          Pending
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {inv.invitedBy?.name || inv.invitedBy?.email || "Admin"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {inv.expiresAt
                          ? new Date(inv.expiresAt).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => revokeInvitation(inv)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 size={13} />
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredInvitations.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                          <Clock size={22} />
                        </div>
                        <h3 className="mt-4 text-sm font-semibold text-slate-900">
                          No pending invitations
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          All sent invitations have been accepted or expired.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}
          <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing{" "}
              {viewTab === "members"
                ? `${filteredMembers.length} members`
                : `${filteredInvitations.length} pending invitations`}
            </span>
            <span>VexChat Multi-Tenant Team Governance</span>
          </div>
        </section>
      </div>

      {/* Invite/Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-modal-title"
            className="my-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 id="team-modal-title" className="text-lg font-bold text-slate-900">
                  {editingMember ? "Change Member Role" : "Invite Team Member"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {editingMember
                    ? "Update workspace permissions for this account."
                    : "Send an invitation link to add a collaborator to this workspace."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-5 p-6">
              <div>
                <label
                  htmlFor="member-email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="member-email"
                  type="email"
                  required
                  disabled={!!editingMember}
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="collaborator@company.com"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/20 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              <div>
                <label
                  htmlFor="member-role"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Workspace Role
                </label>

                <div className="relative">
                  <select
                    id="member-role"
                    value={form.role}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        role: event.target.value as "ADMIN" | "AGENT",
                      }))
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
                  >
                    <option value="ADMIN">Admin (Invite & Manage Agents)</option>
                    <option value="AGENT">Agent (Handle Messaging)</option>
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Admins can manage team agents and invitations. Agents have read-only team permissions.
                </p>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {formError}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={isSubmitting}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#88da1c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#76bb1c] disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {editingMember
                    ? "Update Role"
                    : isSubmitting
                      ? "Sending Invitation..."
                      : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[60] flex max-w-sm items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl"
        >
          <Check size={17} className="shrink-0 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}
    </DashboardLayout>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconClass,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className={`rounded-xl p-3 ${iconClass}`}>{icon}</div>
      </div>
    </div>
  );
}

function RoleCard({
  title,
  description,
  badge,
  color,
}: {
  title: string;
  description: string;
  badge: UserRole | string;
  color: "violet" | "blue" | "slate";
}) {
  const colors = {
    violet: "border-violet-100 bg-violet-50/40",
    blue: "border-blue-100 bg-blue-50/40",
    slate: "border-slate-200 bg-slate-50/70",
  };

  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold text-slate-900">{title}</h3>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${
            roleStyles[badge] || roleStyles.AGENT
          }`}
        >
          {badge}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm text-slate-700 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

function TableHeading({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
      {children}
    </th>
  );
}
