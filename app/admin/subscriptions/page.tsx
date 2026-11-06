"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  Eye,
  HelpCircle,
  Layers,
  Plus,
  Repeat,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import AdminFilters from "@/src/component/admin/admin-filters";
import AdminPagination from "@/src/component/admin/admin-pagination";
import AdminStatusBadge from "@/src/component/admin/admin-status-badge";
import AdminDetailDrawer from "@/src/component/admin/admin-detail-drawer";
import AdminUnimplementedModal from "@/src/component/admin/admin-unimplemented-modal";
import { adminService } from "@/src/services/admin-service";
import type { AdminSubscription } from "@/src/types/admin";

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSub, setSelectedSub] = useState<AdminSubscription | null>(null);
  const [mutationModalOpen, setMutationModalOpen] = useState(false);
  const [mutationActionTitle, setMutationActionTitle] = useState("");
  const [missingEndpoint, setMissingEndpoint] = useState(
    "POST /api/admin/billing/plans",
  );

  const loadSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.listSubscriptions({
        search,
        plan: planFilter,
        page,
        limit: 10,
      });
      setSubscriptions(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setError("Failed to load subscription list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, [search, planFilter, page]);

  const handleActionClick = (
    actionName: string,
    endpoint = "POST /api/admin/billing/plans",
  ) => {
    setMutationActionTitle(actionName);
    setMissingEndpoint(endpoint);
    setMutationModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearch("");
    setPlanFilter("ALL");
    setPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Subscription & Plan Catalog
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            Authoritative monthly BDT pricing plans and active workspace subscriptions
          </p>
        </div>

        <button
          onClick={() => handleActionClick("Create New Billing Plan")}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
        >
          <Plus size={14} />
          <span>Add Custom Plan</span>
        </button>
      </div>

      {/* Error state alert */}
      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadSubscriptions}
            className="inline-flex items-center gap-1 font-bold underline hover:no-underline"
          >
            <RotateCcw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Authoritative Backend Plan Catalog Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Authoritative Plan Catalog (BDT Monthly)
          </h3>
          <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
            Aligned with billing.config.ts
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* STARTER */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-700">
                  STARTER
                </span>
                <span className="text-xs font-bold text-slate-500">Monthly</span>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-slate-900">৳3,000</span>
                <span className="text-xs text-slate-500 font-medium"> / month</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Ideal for small businesses starting with WhatsApp Business API.
              </p>
              <div className="mt-4 border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span><strong>1</strong> WhatsApp Number</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span><strong>3</strong> Team Agents</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>Standard Messaging API</span>
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                handleActionClick(
                  "Configure Starter Plan",
                  "PATCH /api/admin/billing/plans/STARTER",
                )
              }
              className="mt-6 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
            >
              Configure Tier
            </button>
          </div>

          {/* BUSINESS_PRO */}
          <div className="rounded-2xl border-2 border-[#88da1c] bg-white p-6 shadow-sm flex flex-col justify-between relative">
            <span className="absolute -top-3 right-6 rounded-full bg-[#88da1c] px-3 py-0.5 text-[10px] font-black uppercase text-slate-950 shadow-xs">
              Most Popular
            </span>
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#effbdd] px-2.5 py-0.5 text-xs font-bold text-[#365314]">
                  BUSINESS_PRO
                </span>
                <span className="text-xs font-bold text-slate-500">Monthly</span>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-slate-900">৳7,400</span>
                <span className="text-xs text-slate-500 font-medium"> / month</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                For scaling teams requiring multi-agent inboxes and broadcast campaigns.
              </p>
              <div className="mt-4 border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span><strong>2</strong> WhatsApp Numbers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span><strong>10</strong> Team Agents</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>Bulk Broadcast Campaigns</span>
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                handleActionClick(
                  "Configure Business Pro Plan",
                  "PATCH /api/admin/billing/plans/BUSINESS_PRO",
                )
              }
              className="mt-6 w-full rounded-xl bg-[#88da1c] py-2 text-xs font-bold text-slate-950 hover:bg-[#78c418] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
            >
              Configure Tier
            </button>
          </div>

          {/* ENTERPRISE */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-700">
                  ENTERPRISE
                </span>
                <span className="text-xs font-bold text-slate-500">Monthly</span>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-slate-900">৳18,600</span>
                <span className="text-xs text-slate-500 font-medium"> / month</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Custom enterprise volume, priority throughput, and SLA support.
              </p>
              <div className="mt-4 border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span><strong>Unlimited</strong> WhatsApp Numbers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span><strong>Unlimited</strong> Team Agents</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>Dedicated Account Manager & SLA</span>
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                handleActionClick(
                  "Configure Enterprise Plan",
                  "PATCH /api/admin/billing/plans/ENTERPRISE",
                )
              }
              className="mt-6 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
            >
              Configure Tier
            </button>
          </div>
        </div>
      </div>

      {/* Active Subscriptions List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Active Workspace Subscriptions (Demo Records)
        </h3>

        <AdminFilters
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="Search by workspace name..."
          dropdowns={[
            {
              name: "plan",
              label: "Plan",
              value: planFilter,
              options: [
                { label: "All Plans", value: "ALL" },
                { label: "Starter (৳3k)", value: "STARTER" },
                { label: "Business Pro (৳7.4k)", value: "BUSINESS_PRO" },
                { label: "Enterprise (৳18.6k)", value: "ENTERPRISE" },
              ],
              onChange: (val) => {
                setPlanFilter(val);
                setPage(1);
              },
            },
          ]}
          onReset={handleResetFilters}
        />

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Workspace</th>
                  <th className="px-6 py-3.5">Plan</th>
                  <th className="px-6 py-3.5">Monthly Fee</th>
                  <th className="px-6 py-3.5">Anchor Day</th>
                  <th className="px-6 py-3.5">Current Period</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#88da1c] border-t-transparent" />
                        <span>Loading subscriptions...</span>
                      </div>
                    </td>
                  </tr>
                ) : subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-2 text-slate-500">
                        <Repeat size={32} className="text-slate-300" />
                        <span className="font-semibold text-slate-700">
                          No subscriptions found
                        </span>
                        <p className="text-xs text-slate-400 text-center">
                          No subscription matches your search query or selected plan filter.
                        </p>
                        {(search || planFilter !== "ALL") && (
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
                  subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 truncate">
                        {sub.workspaceName}
                      </td>
                      <td className="px-6 py-4">
                        <AdminStatusBadge status={sub.planCode} type="plan" />
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900 whitespace-nowrap">
                        ৳{sub.price.toLocaleString()} BDT
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-700">
                          {sub.billingCycleAnchorDay}th of month
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {new Date(sub.currentPeriodStart).toLocaleDateString()} —{" "}
                        {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <AdminStatusBadge
                          status={sub.status}
                          type="subscription"
                        />
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedSub(sub)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
                        >
                          <Eye size={12} />
                          Inspect
                        </button>
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
      </div>

      {/* Subscription Drawer */}
      <AdminDetailDrawer
        open={Boolean(selectedSub)}
        onClose={() => setSelectedSub(null)}
        title={selectedSub?.workspaceName || "Subscription Details"}
        subtitle={`Subscription ID: ${selectedSub?.id}`}
      >
        {selectedSub && (
          <div className="space-y-6 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Plan Code
                </span>
                <AdminStatusBadge status={selectedSub.planCode} type="plan" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Monthly Rate
                </span>
                <span className="font-black text-slate-900 text-sm">
                  ৳{selectedSub.price.toLocaleString()} BDT / month
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Billing Anchor Day
                </span>
                <span className="font-semibold text-slate-800">
                  Day {selectedSub.billingCycleAnchorDay} of each calendar month
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Current Period
                </span>
                <span className="text-slate-700">
                  {new Date(selectedSub.currentPeriodStart).toLocaleDateString()} to{" "}
                  {new Date(selectedSub.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Enforced Quotas & Limits
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Connected Phone Numbers</span>
                <span className="font-semibold text-slate-900">
                  {selectedSub.limits.maxWhatsAppNumbers === -1
                    ? "Unlimited"
                    : selectedSub.limits.maxWhatsAppNumbers}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Allowed Team Members</span>
                <span className="font-semibold text-slate-900">
                  {selectedSub.limits.maxTeamMembers === -1
                    ? "Unlimited"
                    : selectedSub.limits.maxTeamMembers}
                </span>
              </div>
            </div>

            {/* Quick Actions in Drawer */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Subscription Management
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    handleActionClick(
                      "Change Billing Plan",
                      "PATCH /api/admin/subscriptions/:subscriptionId/plan",
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-center font-semibold text-slate-700 hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
                >
                  Change Plan
                </button>
                <button
                  onClick={() =>
                    handleActionClick(
                      "Cancel Subscription",
                      "POST /api/admin/subscriptions/:subscriptionId/cancel",
                    )
                  }
                  className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-center font-semibold text-rose-700 hover:bg-rose-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                >
                  Cancel Plan
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminDetailDrawer>

      <AdminUnimplementedModal
        open={mutationModalOpen}
        onClose={() => setMutationModalOpen(false)}
        actionTitle={mutationActionTitle}
        missingEndpoint={missingEndpoint}
        explanation="Custom plan creation and subscription overrides are not yet implemented in cyber7-backend. Billing plans are strictly driven by billing.config.ts."
      />
    </div>
  );
}
