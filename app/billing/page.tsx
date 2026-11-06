"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileText,
  Loader2,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Smartphone,
  X,
} from "lucide-react";
import DashboardLayout from "@/src/component/dashboard/dashboard-layout";
import { useWorkspace } from "@/src/context/workspace-context";
import { billingService } from "@/src/services/billing-service";
import CheckoutModal from "@/src/component/billing/checkout-modal";
import type {
  BillingOverviewData,
  BillingPlan,
  InvoiceItem,
  PaymentItem,
  PlanCode,
} from "@/src/types/billing";

function formatBdt(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getInvoiceStatusBadge(status: string) {
  switch (status.toUpperCase()) {
    case "PAID":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "PENDING":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "VOID":
    case "FAILED":
      return "bg-rose-50 text-rose-800 border-rose-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export default function BillingPage() {
  const { activeWorkspace, isLoading: isWorkspaceLoading } = useWorkspace();

  const [overview, setOverview] = useState<BillingOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<BillingPlan | null>(null);
  const [invoiceFilter, setInvoiceFilter] = useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState("");

  const isOwnerOrAdmin =
    activeWorkspace?.role === "OWNER" || activeWorkspace?.role === "ADMIN";

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  }

  const loadBillingData = useCallback(async () => {
    if (!activeWorkspace) return;
    if (!isOwnerOrAdmin) {
      // Backend enforces strict OWNER/ADMIN authorization on billing routes.
      // Do not trigger unauthorized requests that produce 403 errors.
      setIsLoading(false);
      setErrorMessage("");
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await billingService.getOverview(activeWorkspace.id);
      setOverview(data);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to load billing details.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace, isOwnerOrAdmin]);

  useEffect(() => {
    if (!isWorkspaceLoading && activeWorkspace) {
      loadBillingData();
    } else if (!isWorkspaceLoading && !activeWorkspace) {
      setIsLoading(false);
    }
  }, [activeWorkspace, isWorkspaceLoading, loadBillingData]);

  function handleDownloadInvoice(inv: InvoiceItem) {
    const text = [
      "==============================================",
      "             VEXCHAT INVOICE RECEIPT          ",
      "==============================================",
      `Invoice Number : ${inv.invoiceNumber}`,
      `Date           : ${formatDate(inv.createdAt)}`,
      `Workspace      : ${inv.issuedTo.workspaceName}`,
      `Customer       : ${inv.issuedTo.userName} (${inv.issuedTo.userEmail})`,
      `Plan           : ${inv.planName} (${inv.planCode})`,
      `Billing Cycle  : Monthly (Manual Renewal)`,
      `Period Start   : ${formatDate(inv.periodCoveredStart)}`,
      `Period End     : ${formatDate(inv.periodCoveredEnd)}`,
      `Amount         : ${formatBdt(inv.amount)} BDT`,
      `Payment Method : ${inv.paymentMethod}`,
      `Payment Status : ${inv.status}`,
      `Paid At        : ${inv.paidAt ? formatDate(inv.paidAt) : "N/A"}`,
      "==============================================",
      "Thank you for choosing VexChat for your WhatsApp SaaS.",
    ].join("\n");

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${inv.invoiceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Invoice ${inv.invoiceNumber} downloaded.`);
  }

  const displayedInvoices = (overview?.recentInvoices || []).filter((inv) => {
    if (invoiceFilter === "ALL") return true;
    return inv.status.toUpperCase() === invoiceFilter;
  });

  const activeSub = overview?.subscription;
  const currentPlanCode = activeSub?.planCode || null;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                <span>{activeWorkspace?.name || "Workspace"}</span>
                <span>/</span>
                <span className="font-medium text-slate-700">Billing & Subscription</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Subscription & Billing
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                Manage your workspace plan, view authoritative BDT invoices, and initiate manual renewals.
              </p>
            </div>

            {isOwnerOrAdmin && (
              <button
                type="button"
                onClick={() =>
                  document.getElementById("pricing-plans")?.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#88da1c] px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-xs transition hover:bg-[#78c418]"
              >
                <Sparkles size={16} />
                Explore Plans
              </button>
            )}
          </div>

          {/* Loading Skeleton */}
          {isLoading ? (
            <div className="space-y-6">
              <div className="h-56 w-full animate-pulse rounded-2xl bg-slate-200" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="h-44 animate-pulse rounded-2xl bg-slate-200" />
                <div className="h-44 animate-pulse rounded-2xl bg-slate-200" />
                <div className="h-44 animate-pulse rounded-2xl bg-slate-200" />
              </div>
            </div>
          ) : !isOwnerOrAdmin ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <AlertCircle size={28} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Billing Access Restricted
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                You are viewing this workspace as an <strong>Agent</strong>. Subscription overviews, plan upgrades,
                and invoices are restricted to workspace <strong>Owners</strong> and <strong>Admins</strong>.
              </p>
              <p className="text-xs text-slate-500">
                If your team requires additional message capacity or seats, please contact your workspace administrator.
              </p>
              <div className="pt-2">
                <Link
                  href="/inbox"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
                >
                  Return to Team Inbox
                </Link>
              </div>
            </div>
          ) : errorMessage ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <AlertCircle size={36} className="text-red-600 mb-3" />
              <h3 className="text-base font-bold text-red-900">Unable to load billing data</h3>
              <p className="mt-1 text-xs text-red-700 max-w-sm">{errorMessage}</p>
              <button
                type="button"
                onClick={loadBillingData}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          ) : (
            <>
              {/* Current Subscription Hero Banner */}
              <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#1d3513] p-6 sm:p-8 text-white shadow-lg lg:col-span-2">
                  <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-[#88da1c]/10 blur-2xl" />
                  <div className="relative">
                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">
                            ACTIVE PLAN
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                            <span
                              className={`h-2 w-2 rounded-full ${overview?.isSubscriptionActive ? "bg-[#88da1c]" : "bg-amber-400"
                                }`}
                            />
                            {activeSub ? activeSub.status : "NO ACTIVE PLAN"}
                          </span>
                          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                            Manual Monthly
                          </span>
                        </div>

                        <h2 className="mt-4 text-3xl font-extrabold tracking-tight">
                          {activeSub ? `VexChat ${activeSub.planName}` : "Free Trial / Inactive"}
                        </h2>

                        <p className="mt-1.5 max-w-md text-sm text-slate-300 leading-relaxed">
                          {activeSub
                            ? `Connected WhatsApp Business API capacity with ${activeSub.limits.maxWhatsAppNumbers} number(s) and ${activeSub.limits.maxTeamMembers} team seat(s).`
                            : "Upgrade your workspace to connect WhatsApp Business numbers and send broadcast campaigns."}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:min-w-40 text-left">
                        <span className="text-xs text-slate-400">Monthly Plan Rate</span>
                        <p className="mt-1 text-3xl font-bold">
                          {activeSub ? formatBdt(activeSub.price) : "৳ 0"}
                        </p>
                        <span className="text-[11px] text-[#88da1c] font-medium">
                          No auto-renewals
                        </span>
                      </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-4 border-t border-white/10 pt-5 sm:grid-cols-3 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Period Started</span>
                        <span className="font-semibold text-slate-100">
                          {activeSub ? formatDate(activeSub.currentPeriodStart) : "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Expires On</span>
                        <span className="font-semibold text-slate-100">
                          {activeSub ? formatDate(activeSub.currentPeriodEnd) : "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Remaining Period</span>
                        <span
                          className={`font-semibold ${(overview?.daysRemaining || 0) <= 5 ? "text-amber-300" : "text-[#88da1c]"
                            }`}
                        >
                          {overview?.daysRemaining ? `${overview.daysRemaining} day(s) left` : "Expired / Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Approved Payment Methods Sidecard */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Payment Methods
                      </span>
                      <ShieldCheck size={18} className="text-emerald-600" />
                    </div>
                    <h3 className="mt-2 text-lg font-bold text-slate-900">
                      Approved Local Gateways
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      We support three secure methods for manual monthly renewals:
                    </p>

                    <div className="mt-4 space-y-2.5">
                      <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100 text-[#E2136E]">
                          <Smartphone size={16} />
                        </div>
                        <div className="text-xs">
                          <p className="font-bold text-slate-900">bKash Checkout</p>
                          <p className="text-slate-500">Instant OTP & PIN verification</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                          <CreditCard size={16} />
                        </div>
                        <div className="text-xs">
                          <p className="font-bold text-slate-900">City Bank Cards</p>
                          <p className="text-slate-500">Visa, Mastercard, Amex 3DS</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                          <Building2 size={16} />
                        </div>
                        <div className="text-xs">
                          <p className="font-bold text-slate-900">City Bank Account</p>
                          <p className="text-slate-500">Direct deposit & manual review</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-3 text-[11px] text-emerald-900">
                    <p className="font-semibold mb-0.5">Zero Recurring Traps</p>
                    <p>You are never charged automatically. Each renewal is initiated by you.</p>
                  </div>
                </div>
              </section>

              {/* Pricing Catalog Section */}
              <section id="pricing-plans" className="scroll-mt-6 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                      Choose or Renew Your Plan
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Authoritative BDT pricing. Early renewals extend your expiry without losing remaining days.
                    </p>
                  </div>
                  <div className="rounded-full bg-slate-200/70 px-3.5 py-1 text-xs font-semibold text-slate-700 w-fit">
                    Monthly Billing Only
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {(overview?.plans || []).map((plan) => {
                    const isCurrent = plan.code === currentPlanCode;
                    const isPopular = plan.code === "BUSINESS_PRO";

                    return (
                      <div
                        key={plan.code}
                        className={`relative flex flex-col rounded-3xl border bg-white p-6 sm:p-7 transition-all ${isPopular
                            ? "border-[#88da1c] shadow-lg shadow-[#88da1c]/10 ring-1 ring-[#88da1c]/30"
                            : "border-slate-200 shadow-xs hover:border-slate-300"
                          }`}
                      >
                        {isPopular && (
                          <div className="absolute -top-3 left-6 rounded-full bg-[#88da1c] px-3.5 py-0.5 text-xs font-bold text-slate-950">
                            Most Popular
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">
                              {plan.name}
                            </h3>
                            <p className="mt-1 text-xs text-slate-500 leading-relaxed min-h-[36px]">
                              {plan.description}
                            </p>
                          </div>
                          {isCurrent && (
                            <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                              Current
                            </span>
                          )}
                        </div>

                        <div className="mt-6 flex items-baseline gap-1">
                          <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                            {formatBdt(plan.priceBdt)}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            / month
                          </span>
                        </div>

                        <div className="my-6 h-px bg-slate-100" />

                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                          Included Features & Limits
                        </p>

                        <ul className="flex-1 space-y-2.5 text-xs text-slate-600">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2.5">
                              <Check
                                size={14}
                                className="mt-0.5 shrink-0 text-emerald-600"
                              />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-8 pt-4 border-t border-slate-100">
                          {isOwnerOrAdmin ? (
                            <button
                              type="button"
                              onClick={() => setSelectedPlanForCheckout(plan)}
                              className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${isCurrent
                                  ? "bg-slate-900 text-white hover:bg-slate-800"
                                  : isPopular
                                    ? "bg-[#88da1c] text-slate-950 hover:bg-[#79c518] shadow-xs"
                                    : "border border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                                }`}
                            >
                              {isCurrent ? "Renew Current Plan" : "Select & Upgrade"}
                              <ArrowRight size={15} />
                            </button>
                          ) : (
                            <div className="text-center py-2.5 text-xs text-slate-400 font-medium">
                              Admin authorization required
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Invoices Table Section */}
              <section className="pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Invoices & Payment History
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Official records generated on verified payment completion.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Filter:</span>
                    <select
                      value={invoiceFilter}
                      onChange={(e) => setInvoiceFilter(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-emerald-500"
                    >
                      <option value="ALL">All Invoices</option>
                      <option value="PAID">Paid</option>
                      <option value="PENDING">Pending</option>
                      <option value="VOID">Void / Refunded</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left">
                      <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="px-6 py-4">Invoice #</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Plan & Coverage</th>
                          <th className="px-6 py-4">Amount</th>
                          <th className="px-6 py-4">Gateway</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {displayedInvoices.map((inv) => (
                          <tr key={inv._id} className="hover:bg-slate-50/50 transition">
                            <td className="px-6 py-4 font-mono font-bold text-slate-900">
                              {inv.invoiceNumber}
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                              {formatDate(inv.createdAt)}
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-semibold text-slate-800">{inv.planName}</p>
                              <p className="text-[11px] text-slate-400">
                                {formatDate(inv.periodCoveredStart)} – {formatDate(inv.periodCoveredEnd)}
                              </p>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-900">
                              {formatBdt(inv.amount)}
                            </td>
                            <td className="px-6 py-4 text-slate-600 font-medium">
                              {inv.paymentMethod}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${getInvoiceStatusBadge(
                                  inv.status,
                                )}`}
                              >
                                {inv.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleDownloadInvoice(inv)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                              >
                                <Download size={13} />
                                Receipt
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {displayedInvoices.length === 0 && (
                    <div className="py-12 text-center">
                      <FileText size={32} className="mx-auto text-slate-300" />
                      <p className="mt-3 font-semibold text-slate-800 text-sm">
                        No invoices match this filter
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Invoices are issued automatically upon verified payment completion.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {selectedPlanForCheckout && activeWorkspace && (
        <CheckoutModal
          open={!!selectedPlanForCheckout}
          onClose={() => setSelectedPlanForCheckout(null)}
          plan={selectedPlanForCheckout}
          workspaceId={activeWorkspace.id}
          onPaymentSuccess={() => {
            loadBillingData();
          }}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl text-xs text-slate-800"
        >
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <p>{toastMessage}</p>
          <button
            type="button"
            onClick={() => setToastMessage("")}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
