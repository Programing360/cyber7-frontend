"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Check,
  ChevronDown,
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  UserCheck,
  UserRound,
  X,
} from "lucide-react";

import DashboardLayout from "@/src/component/dashboard/dashboard-layout";
import {
  initialTeamMembers,
  type TeamMember,
  type TeamMemberStatus,
  type TeamRole,
} from "@/src/data/mock/team";

type MemberForm = {
  name: string;
  email: string;
  role: TeamRole;
};

const emptyForm: MemberForm = {
  name: "",
  email: "",
  role: "AGENT",
};

const roleStyles: Record<TeamRole, string> = {
  ADMIN: "bg-violet-50 text-violet-700 ring-violet-200",
  MANAGER: "bg-blue-50 text-blue-700 ring-blue-200",
  AGENT: "bg-slate-100 text-slate-700 ring-slate-200",
};

const statusStyles: Record<TeamMemberStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  INACTIVE: "bg-slate-100 text-slate-600",
  INVITED: "bg-amber-50 text-amber-700",
};

function formatLabel(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(initialTeamMembers);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [form, setForm] = useState<MemberForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return members.filter((member) => {
      const matchesSearch =
        !query ||
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query);

      const matchesRole = roleFilter === "ALL" || member.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" || member.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, search, roleFilter, statusFilter]);

  const activeCount = members.filter(
    (member) => member.status === "ACTIVE",
  ).length;

  const adminCount = members.filter((member) => member.role === "ADMIN").length;

  const agentCount = members.filter((member) => member.role === "AGENT").length;

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  }

  function openCreateModal() {
    setEditingMember(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(member: TeamMember) {
    setEditingMember(member);
    setForm({
      name: member.name,
      email: member.email,
      role: member.role,
    });
    setFormError("");
    setOpenMenuId(null);
    setModalOpen(true);
  }

  function handleSaveMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (name.length < 2) {
      setFormError("Name must contain at least 2 characters.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    const duplicateEmail = members.some(
      (member) =>
        member.email.toLowerCase() === email && member.id !== editingMember?.id,
    );

    if (duplicateEmail) {
      setFormError("A team member with this email already exists.");
      return;
    }

    if (editingMember) {
      setMembers((current) =>
        current.map((member) =>
          member.id === editingMember.id
            ? { ...member, name, email, role: form.role }
            : member,
        ),
      );

      showToast("Team member updated successfully.");
    } else {
      const newMember: TeamMember = {
        id: `member-${Date.now()}`,
        name,
        email,
        role: form.role,
        status: "INVITED",
        assignedConversations: 0,
        joinedAt: new Date().toISOString().slice(0, 10),
      };

      setMembers((current) => [newMember, ...current]);
      showToast(" invitation created successfully.");
    }

    setModalOpen(false);
    setEditingMember(null);
    setForm(emptyForm);
  }

  function toggleMemberStatus(member: TeamMember) {
    const nextStatus: TeamMemberStatus =
      member.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    setMembers((current) =>
      current.map((item) =>
        item.id === member.id ? { ...item, status: nextStatus } : item,
      ),
    );

    setOpenMenuId(null);
    showToast(
      nextStatus === "ACTIVE" ? "Member activated." : "Member deactivated.",
    );
  }

  function removeMember(member: TeamMember) {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${member.name} from the  team?`,
    );

    if (!confirmed) return;

    setMembers((current) => current.filter((item) => item.id !== member.id));

    setOpenMenuId(null);
    showToast("Team member removed from the data.");
  }

  function assignAgent(member: TeamMember) {
    if (member.role !== "AGENT" || member.status !== "ACTIVE") {
      showToast("Only active agents can be assigned.");
      setOpenMenuId(null);
      return;
    }

    setMembers((current) =>
      current.map((item) =>
        item.id === member.id
          ? {
              ...item,
              assignedConversations: item.assignedConversations + 1,
            }
          : item,
      ),
    );

    setOpenMenuId(null);
    showToast(` conversation assigned to ${member.name}.`);
  }

  return (
    <DashboardLayout>
      {" "}
      <div className="mx-auto max-w-[1400px] space-y-7">
        {/* Page heading */}{" "}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          {" "}
          <div>
            {" "}
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              {" "}
              <Users size={15} />
              Workspace Management{" "}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Team Management
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage your team members, control their roles, and assign
              conversations to agents.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Invite Member
          </button>
        </section>
        {/*  notice */}
        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
          <Activity className="mt-0.5 shrink-0 text-blue-600" size={19} />

          <div>
            <p className="text-sm font-semibold text-blue-900">
              Team workspace 
            </p>
            <p className="mt-1 text-sm leading-5 text-blue-800/80">
              Changes are stored in this page&apos;s temporary state.
              Invitations are not emailed, and role permissions are not enforced
              by a backend.
            </p>
          </div>
        </div>
        {/* Statistics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Members"
            value={members.length}
            subtitle="All team accounts"
            icon={<Users size={20} />}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Active Members"
            value={activeCount}
            subtitle="Currently active"
            icon={<UserCheck size={20} />}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Administrators"
            value={adminCount}
            subtitle="Admin role assigned"
            icon={<ShieldCheck size={20} />}
            iconClass="bg-violet-50 text-violet-600"
          />

          <StatCard
            title="Support Agents"
            value={agentCount}
            subtitle="Members with agent role"
            icon={<UserRound size={20} />}
            iconClass="bg-amber-50 text-amber-600"
          />
        </section>
        {/* Role information */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <RoleCard
            title="Admin"
            description="Workspace ownership and overall team management."
            badge="ADMIN"
            color="violet"
          />

          <RoleCard
            title="Manager"
            description="Team coordination and conversation oversight."
            badge="MANAGER"
            color="blue"
          />

          <RoleCard
            title="Agent"
            description="Handle customer conversations and support tasks."
            badge="AGENT"
            color="slate"
          />
        </section>
        {/* Members table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Team Members</h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredMembers.length} of {members.length} members
              </p>
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
                  placeholder="Search members..."
                  aria-label="Search team members"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <FilterSelect
                label="Filter by role"
                value={roleFilter}
                onChange={setRoleFilter}
                options={[
                  { label: "All roles", value: "ALL" },
                  { label: "Admin", value: "ADMIN" },
                  { label: "Manager", value: "MANAGER" },
                  { label: "Agent", value: "AGENT" },
                ]}
              />

              <FilterSelect
                label="Filter by status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { label: "All statuses", value: "ALL" },
                  { label: "Active", value: "ACTIVE" },
                  { label: "Inactive", value: "INACTIVE" },
                  { label: "Invited", value: "INVITED" },
                ]}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  <TableHeading>Member</TableHeading>
                  <TableHeading>Role</TableHeading>
                  <TableHeading>Status</TableHeading>
                  <TableHeading>Assigned Conversations</TableHeading>
                  <TableHeading>Joined</TableHeading>
                  <TableHeading>
                    <span className="sr-only">Actions</span>
                  </TableHeading>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                          {getInitials(member.name)}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {member.name}
                          </p>

                          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                            <Mail size={12} />
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${roleStyles[member.role]}`}
                      >
                        {formatLabel(member.role)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[member.status]}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            member.status === "ACTIVE"
                              ? "bg-emerald-500"
                              : member.status === "INACTIVE"
                                ? "bg-slate-400"
                                : "bg-amber-500"
                          }`}
                        />
                        {formatLabel(member.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-slate-700">
                        {member.assignedConversations}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {member.joinedAt}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuId((current) =>
                              current === member.id ? null : member.id,
                            )
                          }
                          aria-label={`Actions for ${member.name}`}
                          aria-expanded={openMenuId === member.id}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                          <MoreHorizontal size={19} />
                        </button>

                        {openMenuId === member.id && (
                          <div className="absolute right-0 z-20 mt-1 w-52 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl">
                            <button
                              type="button"
                              onClick={() => openEditModal(member)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <Pencil size={15} />
                              Edit member
                            </button>

                            <button
                              type="button"
                              onClick={() => assignAgent(member)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <UserCheck size={15} />
                              Assign  conversation
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
                                ? "Deactivate member"
                                : "Activate member"}
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
                    </td>
                  </tr>
                ))}

                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                        <Users size={22} />
                      </div>

                      <h3 className="mt-4 text-sm font-semibold text-slate-900">
                        No team members found
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Try another search or change your filters.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setRoleFilter("ALL");
                          setStatusFilter("ALL");
                        }}
                        className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
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
            <span>Showing {filteredMembers.length} members</span>
            <span> data · No backend connected</span>
          </div>
        </section>
      </div>
      {/* Create/Edit modal */}
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
                <h2
                  id="team-modal-title"
                  className="text-lg font-bold text-slate-900"
                >
                  {editingMember ? "Edit team member" : "Invite team member"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingMember
                    ? "Update this member's  details."
                    : "Add a member to the  workspace."}
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
                  htmlFor="member-name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Full name
                </label>

                <input
                  id="member-name"
                  autoFocus
                  required
                  minLength={2}
                  maxLength={80}
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Alex Morgan"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                />
              </div>

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
                  maxLength={254}
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="alex@company.com"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div>
                <label
                  htmlFor="member-role"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Team role
                </label>

                <div className="relative">
                  <select
                    id="member-role"
                    value={form.role}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        role: event.target.value as TeamRole,
                      }))
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="MANAGER">Manager</option>
                    <option value="AGENT">Agent</option>
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Roles are for demonstration only. Actual permissions require
                  backend authorization.
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
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  {editingMember ? "Save changes" : "Create  invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[60] flex max-w-sm items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl"
        >
          <Check size={17} className="shrink-0 text-emerald-400" />
          {toast}
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
      {" "}
      <div className="flex items-start justify-between gap-3">
        {" "}
        <div>
          {" "}
          <p className="text-sm font-medium text-slate-500">{title}</p>{" "}
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}{" "}
          </p>{" "}
          <p className="mt-2 text-xs text-slate-500">{subtitle}</p>{" "}
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
  badge: TeamRole;
  color: "violet" | "blue" | "slate";
}) {
  const colors = {
    violet: "border-violet-100 bg-violet-50/40",
    blue: "border-blue-100 bg-blue-50/40",
    slate: "border-slate-200 bg-slate-50/70",
  };

  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      {" "}
      <div className="flex items-center justify-between gap-3">
        {" "}
        <h3 className="font-bold text-slate-900">{title}</h3>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${roleStyles[badge]}`}
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
        className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}{" "}
          </option>
        ))}{" "}
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
      {children}{" "}
    </th>
  );
}
