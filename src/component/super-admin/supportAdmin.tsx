"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Crown,
  Eye,
  LayoutDashboard,
  Search,
  ShieldAlert,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
} from "recharts";

import DashboardLayout from "@/src/component/dashboard/dashboard-layout";

import {
  adminUsers as initialUsers,
  platformStats,
  recentPlatformActivities,
  subscriptionDistribution,
  userGrowthData,
  type AdminUser,
  type AdminUserStatus,
  type AdminSubscriptionPlan,
} from "@/src/data/mock/super-admin";

const BRAND = "#88da1c";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getStatusClass(status: AdminUserStatus) {
  switch (status) {
    case "Active":
      return "bg-emerald-50 text-emerald-700";
    case "Pending":
      return "bg-amber-50 text-amber-700";
    case "Suspended":
      return "bg-red-50 text-red-700";
  }
}

function getPlanClass(plan: AdminSubscriptionPlan) {
  switch (plan) {
    case "Free":
      return "bg-slate-100 text-slate-600";
    case "Pro":
      return "bg-[#effbdd] text-[#426d14]";
    case "Business":
      return "bg-[#e6f7d1] text-[#29450c]";
  }
}

function StatCard({
  title,
  value,
  growth,
  description,
  icon: Icon,
  isCurrency = false,
}: {
  title: string;
  value: number;
  growth?: number;
  description: string;
  icon: typeof Users;
  isCurrency?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {" "}
      <div className="flex items-start justify-between gap-3">
        {" "}
        <div className="min-w-0">
          {" "}
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {isCurrency ? formatCurrency(value) : value.toLocaleString()}
          </h3>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </div>
        <div className="rounded-xl bg-[#effbdd] p-3 text-[#426d14]">
          <Icon size={21} />
        </div>
      </div>
      {typeof growth === "number" && (
        <div className="mt-4 flex items-center gap-1.5">
          {growth >= 0 ? (
            <ArrowUpRight size={15} className="text-emerald-600" />
          ) : (
            <ArrowDownRight size={15} className="text-red-600" />
          )}

          <span
            className={`text-xs font-bold ${
              growth >= 0 ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {Math.abs(growth)}%
          </span>

          <span className="text-xs text-slate-400">vs previous month</span>
        </div>
      )}
    </div>
  );
}

export default function SuperAdminPage() {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | AdminUserStatus>(
    "All",
  );
  const [planFilter, setPlanFilter] = useState<"All" | AdminSubscriptionPlan>(
    "All",
  );

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [showSuspendedOnly, setShowSuspendedOnly] = useState(false);

  const selectedUser = users.find((user) => user.id === selectedUserId);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.business.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || user.status === statusFilter;

      const matchesPlan = planFilter === "All" || user.plan === planFilter;

      const matchesSuspended =
        !showSuspendedOnly || user.status === "Suspended";

      return matchesSearch && matchesStatus && matchesPlan && matchesSuspended;
    });
  }, [users, search, statusFilter, planFilter, showSuspendedOnly]);

  const userStatusCounts = {
    active: users.filter((user) => user.status === "Active").length,
    pending: users.filter((user) => user.status === "Pending").length,
    suspended: users.filter((user) => user.status === "Suspended").length,
  };

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  }

  function updateUserStatus(userId: string, status: AdminUserStatus) {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === userId ? { ...user, status } : user,
      ),
    );

    showToast(
      `Demo account status changed to ${status}. No real account was modified.`,
    );
  }

  function updateUserPlan(userId: string, plan: AdminSubscriptionPlan) {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === userId ? { ...user, plan } : user,
      ),
    );

    showToast(
      `Demo plan changed to ${plan}. No real subscription was modified.`,
    );
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("All");
    setPlanFilter("All");
    setShowSuspendedOnly(false);
  }

  return (
    <DashboardLayout>
      {" "}
      <main className="min-h-screen bg-[#f7f9f4] px-4 py-6 sm:px-6 lg:px-8">
        {" "}
        <div className="mx-auto max-w-[1500px] space-y-7">
          {/* Page header */}{" "}
          <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            {" "}
            <div>
              {" "}
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                {" "}
                <span>Cyber7</span> <span>/</span>{" "}
                <span className="font-medium text-slate-800">
                  Super Admin{" "}
                </span>{" "}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Platform Overview
                </h1>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c5ed98] bg-[#effbdd] px-3 py-1 text-xs font-bold text-[#426d14]">
                  <ShieldCheck size={14} />
                  Super Admin
                </span>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Monitor platform growth, subscription performance, and business
                accounts from one central dashboard.
              </p>
            </div>
            <button
              type="button"
              onClick={() => showToast("These are sample demo statistics.")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#88da1c] px-5 py-3 text-sm font-bold text-[#20320d] shadow-sm transition hover:bg-[#79c516]"
            >
              <Activity size={17} />
              Platform status
            </button>
          </header>
          {/* Demo notice */}
          <div className="flex gap-3 rounded-2xl border border-[#c5ed98] bg-[#effbdd] p-4">
            <ShieldCheck size={20} className="mt-0.5 shrink-0 text-[#426d14]" />
            <div>
              <p className="text-sm font-bold text-[#29450c]">
                Super Admin demo environment
              </p>
              <p className="mt-1 text-sm leading-6 text-[#49682a]">
                All metrics and accounts are sample data. Account status and
                plan changes affect only temporary page state, not real users or
                subscriptions.
              </p>
            </div>
          </div>
          {/* Platform stats */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Users"
              value={platformStats.totalUsers}
              growth={platformStats.usersGrowth}
              description="Registered platform users"
              icon={Users}
            />

            <StatCard
              title="Business Accounts"
              value={platformStats.businessAccounts}
              growth={platformStats.businessGrowth}
              description="Registered businesses"
              icon={Building2}
            />

            <StatCard
              title="Active Subscriptions"
              value={platformStats.activeSubscriptions}
              growth={platformStats.subscriptionGrowth}
              description="Paid subscription accounts"
              icon={Crown}
            />

            <StatCard
              title="Monthly Revenue"
              value={platformStats.monthlyRevenue}
              growth={platformStats.revenueGrowth}
              description="Illustrative monthly revenue"
              icon={CircleDollarSign}
              isCurrency
            />
          </section>
          {/* Charts */}
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.7fr_1fr]">
            {/* User growth */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Platform Growth
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    User and business account growth over six months.
                  </p>
                </div>

                <span className="w-fit rounded-lg bg-[#effbdd] px-3 py-1.5 text-xs font-bold text-[#426d14]">
                  May – Oct 2026
                </span>
              </div>

              <div className="mt-6 h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={userGrowthData}
                    margin={{ top: 10, right: 8, left: -15, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="userGrowthFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={BRAND}
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor={BRAND}
                          stopOpacity={0.02}
                        />
                      </linearGradient>

                      <linearGradient
                        id="businessGrowthFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#365314"
                          stopOpacity={0.18}
                        />
                        <stop
                          offset="95%"
                          stopColor="#365314"
                          stopOpacity={0.01}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      stroke="#e9eee2"
                      strokeDasharray="4 4"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      dy={10}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      tickFormatter={(value: number) =>
                        `${(value / 1000).toFixed(0)}k`
                      }
                    />

                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                        fontSize: 12,
                      }}
                      formatter={(value, name) => [
                        Number(value).toLocaleString(),
                        name === "users" ? "Users" : "Businesses",
                      ]}
                    />

                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke={BRAND}
                      strokeWidth={3}
                      fill="url(#userGrowthFill)"
                      activeDot={{ r: 5, strokeWidth: 0 }}
                    />

                    <Area
                      type="monotone"
                      dataKey="businesses"
                      stroke="#365314"
                      strokeWidth={2}
                      fill="url(#businessGrowthFill)"
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 flex flex-wrap gap-5">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#88da1c]" />
                  Platform users
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#365314]" />
                  Business accounts
                </div>
              </div>
            </div>

            {/* Subscription distribution */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-slate-900">
                Subscription Distribution
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Breakdown of demo subscription accounts.
              </p>

              <div className="relative mt-4 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subscriptionDistribution}
                      dataKey="users"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={90}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {subscriptionDistribution.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value, name) => [
                        Number(value).toLocaleString(),
                        name,
                      ]}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900">
                    {platformStats.activeSubscriptions.toLocaleString()}
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    Paid accounts
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-4">
                {subscriptionDistribution.map((plan) => {
                  const total = subscriptionDistribution.reduce(
                    (sum, item) => sum + item.users,
                    0,
                  );
                  const percentage = (plan.users / total) * 100;

                  return (
                    <div key={plan.name}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: plan.color }}
                          />
                          <span className="text-sm font-medium text-slate-700">
                            {plan.name}
                          </span>
                        </div>

                        <span className="text-sm font-bold text-slate-900">
                          {plan.users.toLocaleString()}
                          <span className="ml-2 text-xs font-normal text-slate-400">
                            {percentage.toFixed(1)}%
                          </span>
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: plan.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
          {/* Account health */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <button
              type="button"
              onClick={() => {
                setStatusFilter("All");
                setShowSuspendedOnly(false);
                setSelectedUserId(null);
                document
                  .getElementById("user-management")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-[#b8e98b] hover:shadow-sm"
            >
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active sample accounts
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {userStatusCounts.active}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                <ShieldCheck size={21} />
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusFilter("Pending");
                setShowSuspendedOnly(false);
                setSelectedUserId(null);
                document
                  .getElementById("user-management")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-[#b8e98b] hover:shadow-sm"
            >
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Pending review
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {userStatusCounts.pending}
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
                <Clock3 size={21} />
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusFilter("All");
                setShowSuspendedOnly(true);
                setSelectedUserId(null);
                document
                  .getElementById("user-management")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-red-200 hover:shadow-sm"
            >
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Suspended sample accounts
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {userStatusCounts.suspended}
                </p>
              </div>
              <div className="rounded-xl bg-red-50 p-3 text-red-700">
                <ShieldAlert size={21} />
              </div>
            </button>
          </section>
          {/* User management */}
          <section
            id="user-management"
            className="scroll-mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  User Management
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Search accounts and inspect their plan and status.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-0 sm:w-64">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search users..."
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#88da1c] focus:ring-2 focus:ring-[#88da1c]/20"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(
                      event.target.value as "All" | AdminUserStatus,
                    );
                    setShowSuspendedOnly(false);
                  }}
                  aria-label="Filter accounts by status"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#88da1c]"
                >
                  <option value="All">All statuses</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Suspended">Suspended</option>
                </select>

                <select
                  value={planFilter}
                  onChange={(event) =>
                    setPlanFilter(
                      event.target.value as "All" | AdminSubscriptionPlan,
                    )
                  }
                  aria-label="Filter accounts by subscription plan"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#88da1c]"
                >
                  <option value="All">All plans</option>
                  <option value="Free">Free</option>
                  <option value="Pro">Pro</option>
                  <option value="Business">Business</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#fbfcf9] px-5 py-3">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-bold text-slate-700">
                  {filteredUsers.length}
                </span>{" "}
                of {users.length} sample accounts
                {showSuspendedOnly ? " · Suspended only" : ""}
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-bold text-[#548b18] transition hover:text-[#365314]"
              >
                Clear filters
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead className="border-y border-slate-200 bg-white">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-4">User</th>
                    <th className="px-5 py-4">Business</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Plan</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Joined</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 transition last:border-0 hover:bg-[#fbfdf8]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#effbdd] text-xs font-bold text-[#426d14]">
                            {getInitials(user.name)}
                          </div>

                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              {user.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {user.email}
                            </p>
                            <p className="mt-1 text-[10px] text-slate-400">
                              {user.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {user.business}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                          {user.role}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${getPlanClass(
                            user.plan,
                          )}`}
                        >
                          {user.plan}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1.5 text-xs font-bold ${getStatusClass(
                            user.status,
                          )}`}
                        >
                          {user.status}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                        {formatDate(user.joinedAt)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedUserId(user.id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-[#b8e98b] hover:bg-[#effbdd] hover:text-[#355c11]"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="px-5 py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#effbdd] text-[#548b18]">
                  <Search size={21} />
                </div>

                <h3 className="mt-3 font-bold text-slate-900">
                  No users found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Try changing the search term or filters.
                </p>
              </div>
            )}
          </section>
          {/* Recent activity */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Recent Platform Activity
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Sample events from across the platform.
                </p>
              </div>

              <div className="rounded-xl bg-[#effbdd] p-3 text-[#426d14]">
                <Activity size={20} />
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {recentPlatformActivities.map((activity, index) => {
                const activityIcon = {
                  user: Users,
                  subscription: Crown,
                  business: Building2,
                  security: ShieldAlert,
                };

                const Icon = activityIcon[activity.type];

                return (
                  <div key={activity.id} className="flex gap-3">
                    <div className="relative">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#effbdd] text-[#426d14]">
                        <Icon size={18} />
                      </div>

                      {index !== recentPlatformActivities.length - 1 && (
                        <div className="absolute left-1/2 top-11 h-5 w-px -translate-x-1/2 bg-slate-200" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 pb-1">
                      <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-start">
                        <p className="text-sm font-bold text-slate-800">
                          {activity.title}
                        </p>

                        <span className="shrink-0 text-xs text-slate-400">
                          {formatDateTime(activity.createdAt)}
                        </span>
                      </div>

                      <p className="mt-1 text-sm leading-5 text-slate-500">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          <footer className="border-t border-slate-200 pt-5 text-xs text-slate-400">
            Cyber7 Super Admin · environment 
          </footer>
        </div>
        {/* User details modal */}
        {selectedUser && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-[2px]"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedUserId(null);
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="admin-user-modal-title"
              className="my-6 w-full max-w-lg rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-start justify-between border-b border-slate-200 p-5 sm:p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    User account
                  </p>

                  <h2
                    id="admin-user-modal-title"
                    className="mt-1 text-xl font-bold text-slate-900"
                  >
                    Account Details
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedUserId(null)}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close user details"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#effbdd] text-lg font-bold text-[#426d14]">
                    {getInitials(selectedUser.name)}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-slate-900">
                      {selectedUser.name}
                    </h3>
                    <p className="break-all text-sm text-slate-500">
                      {selectedUser.email}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {selectedUser.id}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">Business</p>
                    <p className="mt-1 break-words text-sm font-bold text-slate-800">
                      {selectedUser.business}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">Role</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {selectedUser.role}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">Joined</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {formatDate(selectedUser.joinedAt)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">Last active</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {formatDateTime(selectedUser.lastActive)}
                    </p>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="admin-user-status"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Account status
                  </label>

                  <select
                    id="admin-user-status"
                    value={selectedUser.status}
                    onChange={(event) =>
                      updateUserStatus(
                        selectedUser.id,
                        event.target.value as AdminUserStatus,
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#88da1c]"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="admin-user-plan"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Subscription plan
                  </label>

                  <select
                    id="admin-user-plan"
                    value={selectedUser.plan}
                    onChange={(event) =>
                      updateUserPlan(
                        selectedUser.id,
                        event.target.value as AdminSubscriptionPlan,
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#88da1c]"
                  >
                    <option value="Free">Free</option>
                    <option value="Pro">Pro</option>
                    <option value="Business">Business</option>
                  </select>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Changes are local demo state only. A real platform must
                    verify admin permissions and enforce account changes on the
                    server.
                  </p>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedUserId(null)}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUserId(null);
                      showToast(
                        "Demo account changes are visible until the page refreshes.",
                      );
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#88da1c] px-5 py-3 text-sm font-bold text-[#20320d] transition hover:bg-[#79c516]"
                  >
                    <Check size={16} />
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Toast */}
        {toast && (
          <div
            role="status"
            className="fixed bottom-5 right-5 z-[60] flex max-w-sm items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xl"
          >
            <div className="mt-0.5 rounded-full bg-[#effbdd] p-1">
              <Check size={15} className="text-[#426d14]" />
            </div>

            <p className="flex-1 text-sm leading-5 text-slate-700">{toast}</p>

            <button
              type="button"
              onClick={() => setToast("")}
              className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100"
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}
