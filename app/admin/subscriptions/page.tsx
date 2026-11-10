"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  Edit2,
  Eye,
  Layers,
  Plus,
  Repeat,
  RotateCcw,
  Sparkles,
  Trash2,
  Users,
  Phone,
} from "lucide-react";
import AdminFilters from "@/src/component/admin/admin-filters";
import AdminPagination from "@/src/component/admin/admin-pagination";
import AdminStatusBadge from "@/src/component/admin/admin-status-badge";
import AdminDetailDrawer from "@/src/component/admin/admin-detail-drawer";
import AdminConfirmDialog from "@/src/component/admin/admin-confirm-dialog";
import { adminToast } from "@/src/component/admin/admin-toast";
import { adminService } from "@/src/services/admin-service";
import type { AdminSubscription, AdminPlan } from "@/src/types/admin";

export default function AdminSubscriptionsPage() {
  // Subscription list state
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [errorSubs, setErrorSubs] = useState<string | null>(null);

  // Dynamic Plans state
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [errorPlans, setErrorPlans] = useState<string | null>(null);

  // Drawer state
  const [selectedSub, setSelectedSub] = useState<AdminSubscription | null>(null);

  // Action Modals: CHANGE_PLAN | CANCEL_SUB | ADD_PLAN | EDIT_PLAN | DELETE_PLAN
  const [actionModal, setActionModal] = useState<
    "CHANGE_PLAN" | "CANCEL_SUB" | "ADD_PLAN" | "EDIT_PLAN" | "DELETE_PLAN" | null
  >(null);
  const [targetSub, setTargetSub] = useState<AdminSubscription | null>(null);
  const [targetPlan, setTargetPlan] = useState<AdminPlan | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Change Plan form state
  const [newPlanCode, setNewPlanCode] = useState<string>("");
  const [immediateChange, setImmediateChange] = useState<boolean>(true);

  // Cancel Sub form state
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState<boolean>(true);
  const [cancelReason, setCancelReason] = useState<string>("");

  // Plan Form state (for Add & Edit)
  const [planFormCode, setPlanFormCode] = useState("");
  const [planFormName, setPlanFormName] = useState("");
  const [planFormPrice, setPlanFormPrice] = useState("");
  const [planFormDescription, setPlanFormDescription] = useState("");
  const [planFormMaxWa, setPlanFormMaxWa] = useState("5");
  const [planFormMaxMembers, setPlanFormMaxMembers] = useState("20");
  const [planFormFeatures, setPlanFormFeatures] = useState("");

  // Load authoritative plan catalog from backend
  const loadPlans = async () => {
    setLoadingPlans(true);
    setErrorPlans(null);
    try {
      const res = await adminService.listPlans();
      setPlans(res.plans || []);
    } catch {
      setErrorPlans("Failed to load plan catalog. Please try again.");
    } finally {
      setLoadingPlans(false);
    }
  };

  // Load subscriptions list from backend
  const loadSubscriptions = async () => {
    setLoadingSubs(true);
    setErrorSubs(null);
    try {
      const res = await adminService.listSubscriptions({
        search,
        plan: planFilter !== "ALL" ? planFilter : undefined,
        status: statusFilter !== "ALL" ? (statusFilter as any) : undefined,
        page,
        limit: 10,
      });
      setSubscriptions(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setErrorSubs("Failed to load subscription list. Please try again.");
    } finally {
      setLoadingSubs(false);
    }
  };

  // Initial load & effect hooks
  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    loadSubscriptions();
  }, [search, planFilter, statusFilter, page]);

  // ==========================================
  // ACTION HANDLERS: SUBSCRIPTION
  // ==========================================

  const handleOpenChangePlan = (sub: AdminSubscription) => {
    setTargetSub(sub);
    // Default to the first plan in catalog or current sub plan
    setNewPlanCode(sub.planCode || (plans[0]?.code ?? "STARTER"));
    setImmediateChange(true);
    setActionModal("CHANGE_PLAN");
  };

  const handleConfirmChangePlan = async () => {
    if (!targetSub || !newPlanCode) return;
    setActionLoading(true);
    try {
      await adminService.modifySubscriptionPlan(targetSub.id, {
        planCode: newPlanCode,
        immediate: immediateChange,
      });
      adminToast.success(
        "Subscription Plan Changed",
        `Plan updated to ${newPlanCode} (${immediateChange ? "Immediate" : "Scheduled at Period End"}).`,
      );
      setActionModal(null);
      setSelectedSub(null);
      await Promise.all([loadSubscriptions(), loadPlans()]);
    } catch (err: any) {
      adminToast.error("Plan Change Failed", err?.message || "Failed to update subscription plan.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenCancelSub = (sub: AdminSubscription) => {
    setTargetSub(sub);
    setCancelAtPeriodEnd(true);
    setCancelReason("");
    setActionModal("CANCEL_SUB");
  };

  const handleConfirmCancelSub = async () => {
    if (!targetSub) return;
    setActionLoading(true);
    try {
      await adminService.cancelSubscription(targetSub.id, {
        cancelAtPeriodEnd,
        reason: cancelReason.trim() || undefined,
      });
      adminToast.success(
        "Subscription Canceled",
        cancelAtPeriodEnd
          ? "Subscription will remain active until current period end."
          : "Subscription canceled immediately. Workspace returned to unpaid state.",
      );
      setActionModal(null);
      setSelectedSub(null);
      await Promise.all([loadSubscriptions(), loadPlans()]);
    } catch (err: any) {
      adminToast.error("Cancellation Failed", err?.message || "Failed to cancel subscription.");
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // ACTION HANDLERS: PLAN MANAGEMENT
  // ==========================================

  const handleOpenAddCustomPlan = () => {
    setTargetPlan(null);
    setPlanFormCode("");
    setPlanFormName("");
    setPlanFormPrice("");
    setPlanFormDescription("");
    setPlanFormMaxWa("5");
    setPlanFormMaxMembers("20");
    setPlanFormFeatures("");
    setActionModal("ADD_PLAN");
  };

  const handleOpenEditPlan = (plan: AdminPlan) => {
    setTargetPlan(plan);
    setPlanFormCode(plan.code);
    setPlanFormName(plan.name);
    setPlanFormPrice(plan.priceBdt.toString());
    setPlanFormDescription(plan.description || "");
    setPlanFormMaxWa(plan.limits.maxWhatsAppNumbers.toString());
    setPlanFormMaxMembers(plan.limits.maxTeamMembers.toString());
    setPlanFormFeatures((plan.features || []).join("\n"));
    setActionModal("EDIT_PLAN");
  };

  const handleOpenDeletePlan = (plan: AdminPlan) => {
    setTargetPlan(plan);
    setActionModal("DELETE_PLAN");
  };

  const handleSavePlan = async () => {
    const isEditing = actionModal === "EDIT_PLAN";
    const code = planFormCode.trim().toUpperCase();
    const name = planFormName.trim();
    const price = parseInt(planFormPrice, 10);
    const maxWa = parseInt(planFormMaxWa, 10);
    const maxMembers = parseInt(planFormMaxMembers, 10);

    if (!code || !name || isNaN(price) || price < 0) {
      adminToast.error("Validation Error", "Plan Code, Name, and a valid non-negative Price (BDT) are required.");
      return;
    }

    const featuresList = planFormFeatures
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    setActionLoading(true);
    try {
      if (isEditing) {
        await adminService.updatePlan(code, {
          name,
          priceBdt: price,
          description: planFormDescription.trim(),
          limits: {
            maxWhatsAppNumbers: isNaN(maxWa) ? 1 : maxWa,
            maxTeamMembers: isNaN(maxMembers) ? 1 : maxMembers,
          },
          features: featuresList,
        });
        adminToast.success(
          "Plan Updated",
          `Plan "${name}" (${code}) configuration saved successfully.`,
        );
      } else {
        await adminService.createCustomPlan({
          planCode: code,
          name,
          priceBdt: price,
          description: planFormDescription.trim(),
          limits: {
            maxWhatsAppNumbers: isNaN(maxWa) ? 1 : maxWa,
            maxTeamMembers: isNaN(maxMembers) ? 1 : maxMembers,
          },
          features: featuresList,
        });
        adminToast.success(
          "Custom Plan Created",
          `Plan "${name}" (${code}) registered in catalog successfully.`,
        );
      }

      setActionModal(null);
      await Promise.all([loadPlans(), loadSubscriptions()]);
    } catch (err: any) {
      adminToast.error(
        isEditing ? "Plan Update Failed" : "Plan Creation Failed",
        err?.message || "Failed to save plan configuration.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDeletePlan = async () => {
    if (!targetPlan) return;
    setActionLoading(true);
    try {
      await adminService.deletePlan(targetPlan.code);
      adminToast.success(
        "Plan Deleted",
        `Plan "${targetPlan.name}" (${targetPlan.code}) deleted from catalog.`,
      );
      setActionModal(null);
      await Promise.all([loadPlans(), loadSubscriptions()]);
    } catch (err: any) {
      adminToast.error("Plan Deletion Failed", err?.message || "Failed to delete plan.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setPlanFilter("ALL");
    setStatusFilter("ALL");
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
            Live backend-driven monthly BDT plans and active workspace subscriptions
          </p>
        </div>

        <button
          onClick={handleOpenAddCustomPlan}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
        >
          <Plus size={14} />
          <span>Add Custom Plan</span>
        </button>
      </div>

      {/* Error state alert for subscriptions */}
      {errorSubs && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            <span>{errorSubs}</span>
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

      {/* Dynamic Backend Plan Catalog Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Plan Catalog (BDT Monthly)
            </h3>
            <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
              Backend Source of Truth
            </span>
          </div>

          <button
            onClick={loadPlans}
            disabled={loadingPlans}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            <RotateCcw size={12} className={loadingPlans ? "animate-spin" : ""} />
            <span>Refresh Catalog</span>
          </button>
        </div>

        {errorPlans && (
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-600 shrink-0" />
              <span>{errorPlans}</span>
            </div>
            <button
              onClick={loadPlans}
              className="font-bold underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {loadingPlans ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-72 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-20 bg-slate-200 rounded" />
                    <div className="h-4 w-12 bg-slate-100 rounded" />
                  </div>
                  <div className="h-8 w-28 bg-slate-200 rounded" />
                  <div className="h-12 w-full bg-slate-100 rounded" />
                </div>
                <div className="h-9 w-full bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <Layers size={32} className="mx-auto text-slate-300 mb-2" />
            <h4 className="font-semibold text-slate-700 text-sm">No plans registered</h4>
            <p className="text-xs text-slate-400 mt-1">
              Add your first custom or standard tier to initialize the catalog.
            </p>
            <button
              onClick={handleOpenAddCustomPlan}
              className="mt-4 inline-flex items-center gap-1 rounded-xl bg-[#88da1c] px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-[#78c418]"
            >
              <Plus size={14} />
              <span>Add Plan</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const isPopular = plan.code === "BUSINESS_PRO";
              return (
                <div
                  key={plan.code}
                  className={`rounded-2xl bg-white p-6 shadow-xs flex flex-col justify-between relative transition-shadow hover:shadow-md ${isPopular
                      ? "border-2 border-[#88da1c]"
                      : "border border-slate-200"
                    }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 right-6 rounded-full bg-[#88da1c] px-3 py-0.5 text-[10px] font-black uppercase text-slate-950 shadow-xs">
                      Popular Tier
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${plan.code === "STARTER"
                              ? "bg-sky-50 text-sky-700"
                              : plan.code === "BUSINESS_PRO"
                                ? "bg-[#effbdd] text-[#365314]"
                                : plan.code === "ENTERPRISE"
                                  ? "bg-purple-50 text-purple-700"
                                  : "bg-indigo-50 text-indigo-700"
                            }`}
                        >
                          {plan.code}
                        </span>

                        {plan.isCustom ? (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                            Custom
                          </span>
                        ) : (
                          <span className="rounded bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                            Built-in
                          </span>
                        )}
                      </div>

                      {typeof plan.activeSubscriptionsCount === "number" && (
                        <span className="text-[11px] font-medium text-slate-500">
                          {plan.activeSubscriptionsCount} active
                        </span>
                      )}
                    </div>

                    <div className="mt-4">
                      <h4 className="text-base font-bold text-slate-900 truncate">
                        {plan.name}
                      </h4>
                      <div className="mt-1">
                        <span className="text-2xl font-black text-slate-900">
                          ৳{plan.priceBdt.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {" "}
                          BDT / mo
                        </span>
                      </div>
                    </div>

                    {plan.description && (
                      <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                        {plan.description}
                      </p>
                    )}

                    <div className="mt-4 border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-slate-400 shrink-0" />
                        <span>
                          <strong>
                            {plan.limits.maxWhatsAppNumbers === -1
                              ? "Unlimited"
                              : plan.limits.maxWhatsAppNumbers}
                          </strong>{" "}
                          WhatsApp Numbers
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-slate-400 shrink-0" />
                        <span>
                          <strong>
                            {plan.limits.maxTeamMembers === -1
                              ? "Unlimited"
                              : plan.limits.maxTeamMembers}
                          </strong>{" "}
                          Team Members
                        </span>
                      </div>

                      {plan.features && plan.features.length > 0 && (
                        <div className="space-y-1 pt-1 border-t border-slate-50">
                          {plan.features.slice(0, 3).map((feat, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Check
                                size={13}
                                className="text-emerald-600 shrink-0"
                              />
                              <span className="truncate">{feat}</span>
                            </div>
                          ))}
                          {plan.features.length > 3 && (
                            <p className="text-[10px] text-slate-400 pl-5">
                              +{plan.features.length - 3} more features
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditPlan(plan)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
                    >
                      <Edit2 size={12} />
                      <span>Edit Tier</span>
                    </button>

                    {plan.isCustom && (
                      <button
                        onClick={() => handleOpenDeletePlan(plan)}
                        title="Delete Plan"
                        className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Subscriptions List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Active Workspace Subscriptions
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
                ...plans.map((p) => ({
                  label: `${p.name} (৳${p.priceBdt.toLocaleString()})`,
                  value: p.code,
                })),
              ],
              onChange: (val) => {
                setPlanFilter(val);
                setPage(1);
              },
            },
            {
              name: "status",
              label: "Status",
              value: statusFilter,
              options: [
                { label: "All Statuses", value: "ALL" },
                { label: "Active", value: "ACTIVE" },
                { label: "Expired", value: "EXPIRED" },
                { label: "Cancelled", value: "CANCELLED" },
              ],
              onChange: (val) => {
                setStatusFilter(val);
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
                {loadingSubs ? (
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
                          No subscription matches your search query or selected plan and status filters.
                        </p>
                        {(search || planFilter !== "ALL" || statusFilter !== "ALL") && (
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
                  onClick={() => handleOpenChangePlan(selectedSub)}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-center font-semibold text-slate-700 hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
                >
                  Change Plan
                </button>
                <button
                  onClick={() => handleOpenCancelSub(selectedSub)}
                  className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-center font-semibold text-rose-700 hover:bg-rose-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                >
                  Cancel Plan
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminDetailDrawer>

      {/* Change Plan Dialog (Dynamic from Backend Plans) */}
      <AdminConfirmDialog
        open={actionModal === "CHANGE_PLAN"}
        onClose={() => setActionModal(null)}
        onConfirm={handleConfirmChangePlan}
        title="Change Subscription Plan"
        description={`Modify the active billing plan for workspace "${targetSub?.workspaceName || ""}".`}
        confirmText="Update Plan"
        variant="warning"
        isLoading={actionLoading}
      >
        <div className="space-y-3 pt-2 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Target Billing Tier
            </label>
            <select
              value={newPlanCode}
              onChange={(e) => setNewPlanCode(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:border-[#88da1c] focus:outline-hidden focus:ring-1 focus:ring-[#88da1c]"
            >
              {plans.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name} ({p.code}) — ৳{p.priceBdt.toLocaleString()} BDT/mo
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={immediateChange}
              onChange={(e) => setImmediateChange(e.target.checked)}
              className="rounded border-slate-300 text-[#88da1c] focus:ring-[#88da1c]"
            />
            <span className="text-xs font-medium text-slate-700">
              Apply changes immediately (re-prorates quotas now)
            </span>
          </label>
        </div>
      </AdminConfirmDialog>

      {/* Cancel Subscription Dialog */}
      <AdminConfirmDialog
        open={actionModal === "CANCEL_SUB"}
        onClose={() => setActionModal(null)}
        onConfirm={handleConfirmCancelSub}
        title="Cancel Workspace Subscription"
        description={`Are you sure you want to cancel the subscription for "${targetSub?.workspaceName || ""}"?`}
        confirmText="Confirm Cancellation"
        variant="destructive"
        isLoading={actionLoading}
      >
        <div className="space-y-3 pt-2 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={cancelAtPeriodEnd}
              onChange={(e) => setCancelAtPeriodEnd(e.target.checked)}
              className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            <span className="text-xs font-medium text-slate-700">
              Cancel at period end (remain active until{" "}
              {targetSub?.currentPeriodEnd
                ? new Date(targetSub.currentPeriodEnd).toLocaleDateString()
                : "period end"}
              )
            </span>
          </label>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Reason / Admin Notes (Optional)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Requested by customer due to business downsizing..."
              rows={2}
              className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-[#88da1c] focus:outline-hidden focus:ring-1 focus:ring-[#88da1c]"
            />
          </div>
        </div>
      </AdminConfirmDialog>

      {/* Add / Edit Plan Dialog */}
      <AdminConfirmDialog
        open={actionModal === "ADD_PLAN" || actionModal === "EDIT_PLAN"}
        onClose={() => setActionModal(null)}
        onConfirm={handleSavePlan}
        title={
          actionModal === "EDIT_PLAN"
            ? `Edit Plan: ${targetPlan?.name || targetPlan?.code}`
            : "Create Custom Billing Plan"
        }
        description={
          actionModal === "EDIT_PLAN"
            ? "Update pricing, resource quotas, and features for this tier."
            : "Register a new custom enterprise plan tier in the system catalog."
        }
        confirmText={actionModal === "EDIT_PLAN" ? "Save Changes" : "Create Plan"}
        variant="primary"
        isLoading={actionLoading}
      >
        <div className="space-y-3 pt-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Plan Code *
              </label>
              <input
                type="text"
                value={planFormCode}
                disabled={actionModal === "EDIT_PLAN"}
                onChange={(e) => setPlanFormCode(e.target.value.toUpperCase())}
                placeholder="e.g. VIP_CUSTOM"
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono uppercase focus:border-[#88da1c] focus:outline-hidden focus:ring-1 focus:ring-[#88da1c] disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Monthly Price (BDT) *
              </label>
              <input
                type="number"
                value={planFormPrice}
                onChange={(e) => setPlanFormPrice(e.target.value)}
                placeholder="e.g. 15000"
                min="0"
                className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-[#88da1c] focus:outline-hidden focus:ring-1 focus:ring-[#88da1c]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Display Name *
            </label>
            <input
              type="text"
              value={planFormName}
              onChange={(e) => setPlanFormName(e.target.value)}
              placeholder="e.g. Enterprise VIP Custom"
              className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-[#88da1c] focus:outline-hidden focus:ring-1 focus:ring-[#88da1c]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={planFormDescription}
              onChange={(e) => setPlanFormDescription(e.target.value)}
              placeholder="e.g. Dedicated high-throughput tier for enterprise clients"
              className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-[#88da1c] focus:outline-hidden focus:ring-1 focus:ring-[#88da1c]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Max WhatsApp Numbers (-1 for unlimited)
              </label>
              <input
                type="number"
                value={planFormMaxWa}
                onChange={(e) => setPlanFormMaxWa(e.target.value)}
                placeholder="5"
                className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-[#88da1c] focus:outline-hidden focus:ring-1 focus:ring-[#88da1c]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Max Team Members (-1 for unlimited)
              </label>
              <input
                type="number"
                value={planFormMaxMembers}
                onChange={(e) => setPlanFormMaxMembers(e.target.value)}
                placeholder="20"
                className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-[#88da1c] focus:outline-hidden focus:ring-1 focus:ring-[#88da1c]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Features (One per line)
            </label>
            <textarea
              value={planFormFeatures}
              onChange={(e) => setPlanFormFeatures(e.target.value)}
              placeholder="Unlimited Team Members&#10;Dedicated Account Manager&#10;Custom SLA & 24/7 Phone Support"
              rows={3}
              className="w-full rounded-xl border border-slate-300 p-2 text-xs font-sans focus:border-[#88da1c] focus:outline-hidden focus:ring-1 focus:ring-[#88da1c]"
            />
          </div>
        </div>
      </AdminConfirmDialog>

      {/* Delete Plan Confirmation Dialog */}
      <AdminConfirmDialog
        open={actionModal === "DELETE_PLAN"}
        onClose={() => setActionModal(null)}
        onConfirm={handleConfirmDeletePlan}
        title={`Delete Plan: ${targetPlan?.name || targetPlan?.code}`}
        description={`Are you sure you want to permanently delete custom plan "${targetPlan?.code}" from the catalog?`}
        confirmText="Confirm Deletion"
        variant="destructive"
        isLoading={actionLoading}
      >
        <div className="space-y-3 pt-2 text-xs">
          {targetPlan?.activeSubscriptionsCount && targetPlan.activeSubscriptionsCount > 0 ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-800 flex items-start gap-2">
              <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Active Subscriptions Warning:</strong>
                <p className="mt-1">
                  This plan is currently assigned to{" "}
                  <strong>{targetPlan.activeSubscriptionsCount}</strong> active workspace
                  subscription(s). The backend will block deletion until those workspaces
                  are migrated to a different tier.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-slate-600">
              This custom plan has no active subscriptions and will be safely removed from the system.
            </p>
          )}
        </div>
      </AdminConfirmDialog>
    </div>
  );
}
