"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileText,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X,
  Receipt,
  CalendarDays,
  Zap,
} from "lucide-react";

import DashboardLayout from "@/src/component/dashboard/dashboard-layout";
import { useWorkspace } from "@/src/context/workspace-context";
import { billingService } from "@/src/services/billing-service";
import CheckoutModal from "@/src/component/billing/checkout-modal";

import type {
  BillingOverviewData,
  BillingPlan,
  InvoiceItem,
} from "@/src/types/billing";

// --------------------------------------------------
// Helpers
// --------------------------------------------------

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
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "VOID":
    case "FAILED":
      return "bg-rose-50 text-rose-700 border-rose-200";

    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

// --------------------------------------------------
// Reusable Section Heading
// --------------------------------------------------

function SectionHeading({
  title,
  description,
  badge,
}: {
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {title}
        </h2>

        <p className="mt-1.5 text-sm text-slate-500">{description}</p>
      </div>

      {badge && (
        <span className="w-fit rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
          {badge}
        </span>
      )}
    </div>
  );
}

// --------------------------------------------------
// Main Page
// --------------------------------------------------

export default function BillingPage() {
  const { activeWorkspace, isLoading: isWorkspaceLoading } = useWorkspace();

  const [overview, setOverview] = useState<BillingOverviewData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedPlanForCheckout, setSelectedPlanForCheckout] =
    useState<BillingPlan | null>(null);

  const [invoiceFilter, setInvoiceFilter] = useState("ALL");
  const [toastMessage, setToastMessage] = useState("");

  const [paymentNotice, setPaymentNotice] = useState<{
    type: "success" | "cancelled" | "failed" | "pending";
    message: string;
  } | null>(null);

  // --------------------------------------------------
  // AOS Animation
  // --------------------------------------------------

  useEffect(() => {
    let aosInstance: typeof import("aos") | undefined;

    let mounted = true;

    import("aos").then((AOS) => {
      if (!mounted) return;

      aosInstance = AOS.default;

      aosInstance.init({
        duration: 650,
        easing: "ease-out-cubic",
        once: true,
        offset: 70,
        delay: 0,
        mirror: false,
      });
    });

    return () => {
      mounted = false;
      aosInstance?.refreshHard();
    };
  }, []);

  // --------------------------------------------------
  // Payment Status
  // --------------------------------------------------

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const status = params.get("payment_status");
    const invoice = params.get("invoice");

    if (status === "success") {
      setPaymentNotice({
        type: "success",
        message: invoice
          ? `Payment verified and activated successfully! Invoice: ${invoice}`
          : "Payment verified and activated successfully! Your plan is now active.",
      });
    } else if (status === "cancelled") {
      setPaymentNotice({
        type: "cancelled",
        message: "Payment checkout was cancelled. You have not been charged.",
      });
    } else if (status === "failed") {
      setPaymentNotice({
        type: "failed",
        message:
          "Payment attempt failed or could not be verified. Please try again.",
      });
    } else if (status === "pending") {
      setPaymentNotice({
        type: "pending",
        message:
          "Payment is pending verification by the gateway. Access will activate upon confirmation.",
      });
    }
  }, []);

  // --------------------------------------------------
  // Permissions
  // --------------------------------------------------

  const isOwnerOrAdmin =
    activeWorkspace?.role === "OWNER" || activeWorkspace?.role === "ADMIN";

  // --------------------------------------------------
  // Toast
  // --------------------------------------------------

  function showToast(message: string) {
    setToastMessage(message);

    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  }

  // --------------------------------------------------
  // Fetch Billing Data
  // --------------------------------------------------

  const loadBillingData = useCallback(async () => {
    if (!activeWorkspace) return;

    if (!isOwnerOrAdmin) {
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

  // --------------------------------------------------
  // Invoice Download
  // --------------------------------------------------

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

    const blob = new Blob([text], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `${inv.invoiceNumber}.txt`;
    a.click();

    URL.revokeObjectURL(url);

    showToast(`Invoice ${inv.invoiceNumber} downloaded.`);
  }

  // --------------------------------------------------
  // Derived Data
  // --------------------------------------------------

  const displayedInvoices = (overview?.recentInvoices || []).filter((inv) => {
    if (invoiceFilter === "ALL") return true;

    return inv.status.toUpperCase() === invoiceFilter;
  });

  const activeSub = overview?.subscription;
  const currentPlanCode = activeSub?.planCode || null;
  // console.log(overview);
  // --------------------------------------------------
  // Loading Skeleton
  // --------------------------------------------------

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-[#f8faf7] px-4 py-7 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-7 animate-pulse">
            <div className="h-10 w-64 rounded-lg bg-slate-200" />

            <div className="h-64 rounded-2xl bg-slate-200" />

            <div className="grid gap-5 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-80 rounded-2xl bg-slate-200" />
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // --------------------------------------------------
  // Main UI
  // --------------------------------------------------

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#f8faf7] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-9">
          {/* ==========================================
              HEADER
          ========================================== */}

          <header
            data-aos="fade-down"
            className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                <span>{activeWorkspace?.name || "Workspace"}</span>

                <span>/</span>

                <span className="text-slate-600">Billing</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Billing & Subscription
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Manage your subscription, payments and invoices.
              </p>
            </div>

            {isOwnerOrAdmin && (
              <button
                type="button"
                onClick={() =>
                  document.getElementById("pricing-plans")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#88da1c] px-5 py-3 text-sm font-bold text-slate-950 transition-all hover:bg-[#79c51a] hover:shadow-md hover:shadow-[#88da1c]/20 active:scale-[0.98]"
              >
                <Sparkles size={17} />
                Explore Plans
                <ArrowUpRight size={15} />
              </button>
            )}
          </header>

          {/* ==========================================
              PAYMENT NOTIFICATION
          ========================================== */}

          {paymentNotice && (
            <div
              data-aos="fade-up"
              className={`flex items-start justify-between gap-4 rounded-xl border p-4 ${
                paymentNotice.type === "success"
                  ? "border-emerald-200 bg-emerald-50"
                  : paymentNotice.type === "cancelled"
                    ? "border-amber-200 bg-amber-50"
                    : paymentNotice.type === "pending"
                      ? "border-blue-200 bg-blue-50"
                      : "border-rose-200 bg-rose-50"
              }`}
            >
              <div className="flex items-start gap-3">
                {paymentNotice.type === "success" ? (
                  <CheckCircle2 size={20} className="mt-0.5 text-emerald-600" />
                ) : paymentNotice.type === "pending" ? (
                  <Clock size={20} className="mt-0.5 text-blue-600" />
                ) : (
                  <AlertCircle
                    size={20}
                    className={
                      paymentNotice.type === "cancelled"
                        ? "mt-0.5 text-amber-600"
                        : "mt-0.5 text-rose-600"
                    }
                  />
                )}

                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {paymentNotice.type === "success"
                      ? "Payment Successful"
                      : paymentNotice.type === "cancelled"
                        ? "Payment Cancelled"
                        : paymentNotice.type === "pending"
                          ? "Payment Under Verification"
                          : "Payment Failed"}
                  </h4>

                  <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">
                    {paymentNotice.message}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPaymentNotice(null)}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-white hover:text-slate-700"
                aria-label="Dismiss notification"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* ==========================================
              ACCESS RESTRICTED
          ========================================== */}

          {!isOwnerOrAdmin ? (
            <div
              data-aos="fade-up"
              className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <ShieldCheck size={28} />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                Billing Access Restricted
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                You are viewing this workspace as an Agent. Subscription
                management, upgrades and invoices are available only to
                workspace Owners and Admins.
              </p>

              <Link
                href="/inbox"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Return to Team Inbox
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : errorMessage ? (
            /* ==========================================
                ERROR STATE
            ========================================== */

            <div
              data-aos="fade-up"
              className="rounded-2xl border border-rose-200 bg-white p-10 text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <AlertCircle size={25} />
              </div>

              <h3 className="mt-4 font-bold text-slate-900">
                Unable to load billing data
              </h3>

              <p className="mt-2 text-sm text-slate-500">{errorMessage}</p>

              <button
                type="button"
                onClick={loadBillingData}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <RefreshCw size={15} />
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* ==========================================
                  CURRENT SUBSCRIPTION
              ========================================== */}

              <section
                data-aos="fade-up"
                className="grid grid-cols-1 gap-5 lg:grid-cols-3"
              >
                {/* Current Plan Card */}

                <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#17221b] p-6 text-white lg:col-span-2 sm:p-8">
                  <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[35px] border-[#88da1c]/[0.06]" />

                  <div className="absolute -bottom-28 right-24 h-64 w-64 rounded-full border border-white/[0.05]" />

                  <div className="relative">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-[#88da1c] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-950">
                        Current Subscription
                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold text-slate-300">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            overview?.isSubscriptionActive
                              ? "bg-[#88da1c]"
                              : "bg-amber-400"
                          }`}
                        />

                        {activeSub ? activeSub.status : "NO ACTIVE PLAN"}
                      </span>
                    </div>

                    <div className="mt-7 flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-sm font-medium text-slate-400">
                          Your workspace is currently on
                        </p>

                        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                          {activeSub ? activeSub.planName : "Free Trial"}
                        </h2>

                        <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                          {activeSub
                            ? `Your plan includes ${activeSub.limits.maxWhatsAppNumbers} WhatsApp number(s) and ${activeSub.limits.maxTeamMembers} team seat(s).`
                            : "Choose a plan to unlock WhatsApp Business API features and manage your workspace."}
                        </p>
                      </div>

                      <div className="min-w-[160px] rounded-xl border border-white/10 bg-white/[0.05] p-4">
                        <p className="text-xs font-medium text-slate-400">
                          Monthly Price
                        </p>

                        <p className="mt-2 text-3xl font-bold tracking-tight">
                          {activeSub ? formatBdt(activeSub.price) : "৳ 0"}
                        </p>

                        <p className="mt-1 text-[11px] font-medium text-[#a7e76a]">
                          Manual Renewal
                        </p>
                      </div>
                    </div>

                    {/* Subscription Details */}

                    <div className="mt-8 grid grid-cols-1 gap-5 border-t border-white/10 pt-6 sm:grid-cols-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <CalendarDays size={14} />
                          Period Started
                        </div>

                        <p className="mt-2 text-sm font-semibold text-white">
                          {activeSub
                            ? formatDate(activeSub.currentPeriodStart)
                            : "—"}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock size={14} />
                          Expires On
                        </div>

                        <p className="mt-2 text-sm font-semibold text-white">
                          {activeSub
                            ? formatDate(activeSub.currentPeriodEnd)
                            : "—"}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Zap size={14} />
                          Remaining Period
                        </div>

                        <p
                          className={`mt-2 text-sm font-semibold ${
                            (overview?.daysRemaining || 0) <= 5
                              ? "text-amber-300"
                              : "text-[#a7e76a]"
                          }`}
                        >
                          {overview?.daysRemaining
                            ? `${overview.daysRemaining} days left`
                            : "Expired / Inactive"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}

                <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#88da1c]/15 text-[#4b8e08]">
                      <ShieldCheck size={21} />
                    </div>

                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                      SECURE
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-900">
                    Payment Methods
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Available payment options for your monthly subscription.
                  </p>

                  <div className="mt-5 space-y-3">
                    {/* bKash */}

                    <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-pink-200 hover:bg-pink-50/30">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-[#E2136E]">
                        <Smartphone size={19} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          bKash Checkout
                        </p>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          Mobile payment
                        </p>
                      </div>

                      <CheckCircle2
                        size={16}
                        className="ml-auto text-emerald-500"
                      />
                    </div>

                    {/* Cards */}

                    <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-blue-200 hover:bg-blue-50/30">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <CreditCard size={19} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          City Bank Cards
                        </p>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          Visa, Mastercard, Amex
                        </p>
                      </div>

                      <CheckCircle2
                        size={16}
                        className="ml-auto text-emerald-500"
                      />
                    </div>

                    {/* Bank */}

                    <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/30">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                        <Building2 size={19} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          Bank Transfer
                        </p>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          Direct deposit
                        </p>
                      </div>

                      <CheckCircle2
                        size={16}
                        className="ml-auto text-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="mt-auto pt-5">
                    <div className="flex items-start gap-2 rounded-xl bg-[#f5f9f0] p-3">
                      <ShieldCheck
                        size={16}
                        className="mt-0.5 shrink-0 text-[#5b9b19]"
                      />

                      <p className="text-[11px] leading-5 text-slate-600">
                        No automatic charges. You stay in control of every
                        renewal.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* ==========================================
                  PRICING PLANS
              ========================================== */}

              <section id="pricing-plans" className="scroll-mt-8 pt-2">
                <SectionHeading
                  title="Choose Your Plan"
                  description="Find the right plan for your business. Upgrade or renew whenever you need."
                  badge="Monthly Billing"
                />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {(overview?.plans || []).map((plan, index) => {
                    const isCurrent = plan.code === currentPlanCode;

                    const isPopular = plan.code === "BUSINESS_PRO";

                    return (
                      <div
                        key={plan.code}
                        data-aos="fade-up"
                        data-aos-delay={index * 100}
                        className={`group relative flex flex-col rounded-2xl border bg-white p-6 transition-all duration-300 hover:-translate-y-1 ${
                          isPopular
                            ? "border-[#88da1c] shadow-md shadow-[#88da1c]/10"
                            : "border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50"
                        }`}
                      >
                        {/* Popular Badge */}

                        {isPopular && (
                          <div className="absolute -top-3 left-6">
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#88da1c] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-950 shadow-sm">
                              <Sparkles size={12} />
                              Most Popular
                            </span>
                          </div>
                        )}

                        {/* Plan Header */}

                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">
                              {plan.name}
                            </h3>

                            <p className="mt-2 min-h-[40px] text-xs leading-5 text-slate-500">
                              {plan.description}
                            </p>
                          </div>

                          {isCurrent && (
                            <span className="shrink-0 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                              CURRENT
                            </span>
                          )}
                        </div>

                        {/* Price */}

                        <div className="mt-6">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                              {formatBdt(plan.priceBdt)}
                            </span>

                            <span className="text-xs font-medium text-slate-400">
                              / month
                            </span>
                          </div>

                          <p className="mt-2 text-[11px] text-slate-400">
                            Billed monthly · No auto-renewal
                          </p>
                        </div>

                        {/* Divider */}

                        <div className="my-6 h-px bg-slate-100" />

                        {/* Features */}

                        <div className="flex-1">
                          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                            What&apos;s included
                          </p>

                          <ul className="space-y-3">
                            {plan.features.map((feature) => (
                              <li
                                key={feature}
                                className="flex items-start gap-2.5 text-xs leading-5 text-slate-600"
                              >
                                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#88da1c]/15 text-[#579b0d]">
                                  <Check size={11} strokeWidth={3} />
                                </span>

                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* CTA */}

                        <div className="mt-8 border-t border-slate-100 pt-5">
                          <button
                            type="button"
                            onClick={() => setSelectedPlanForCheckout(plan)}
                            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all active:scale-[0.98] ${
                              isCurrent
                                ? "bg-slate-900 text-white hover:bg-slate-800"
                                : isPopular
                                  ? "bg-[#88da1c] text-slate-950 shadow-sm hover:bg-[#79c51a] hover:shadow-md"
                                  : "border border-slate-200 bg-white text-slate-800 hover:border-[#88da1c] hover:bg-[#f8fdf2]"
                            }`}
                          >
                            {isCurrent
                              ? "Renew Current Plan"
                              : "Choose This Plan"}

                            <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ==========================================
                  INVOICE HISTORY
              ========================================== */}

              <section data-aos="fade-up" className="pt-2">
                <SectionHeading
                  title="Invoices & Payments"
                  description="View your payment history and download official invoice records."
                />

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {/* Table Header */}

                  <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#88da1c]/15 text-[#579b0d]">
                        <Receipt size={19} />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Payment Records
                        </h3>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {overview?.recentInvoices?.length || 0} recent
                          invoices
                        </p>
                      </div>
                    </div>

                    {/* Filter */}

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">
                        Status:
                      </span>

                      <select
                        value={invoiceFilter}
                        onChange={(e) => setInvoiceFilter(e.target.value)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-[#88da1c] focus:ring-2 focus:ring-[#88da1c]/15"
                      >
                        <option value="ALL">All Invoices</option>
                        <option value="PAID">Paid</option>
                        <option value="PENDING">Pending</option>
                        <option value="VOID">Void / Refunded</option>
                      </select>
                    </div>
                  </div>

                  {/* Table */}

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[750px] text-left">
                      <thead className="bg-slate-50/80">
                        <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <th className="px-6 py-4">Invoice</th>

                          <th className="px-6 py-4">Date</th>

                          <th className="px-6 py-4">Plan & Coverage</th>

                          <th className="px-6 py-4">Amount</th>

                          <th className="px-6 py-4">Gateway</th>

                          <th className="px-6 py-4">Status</th>

                          <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {displayedInvoices.map((inv) => (
                          <tr
                            key={inv._id}
                            className="group transition-colors hover:bg-[#f8fbf5]"
                          >
                            <td className="px-6 py-4">
                              <p className="font-mono text-xs font-bold text-slate-800">
                                {inv.invoiceNumber}
                              </p>
                            </td>

                            <td className="px-6 py-4 text-xs text-slate-500">
                              {formatDate(inv.createdAt)}
                            </td>

                            <td className="px-6 py-4">
                              <p className="text-xs font-bold text-slate-800">
                                {inv.planName}
                              </p>

                              <p className="mt-1 text-[10px] text-slate-400">
                                {formatDate(inv.periodCoveredStart)}
                                {" – "}
                                {formatDate(inv.periodCoveredEnd)}
                              </p>
                            </td>

                            <td className="px-6 py-4">
                              <p className="text-xs font-bold text-slate-900">
                                {formatBdt(inv.amount)}
                              </p>
                            </td>

                            <td className="px-6 py-4 text-xs font-medium text-slate-600">
                              {inv.paymentMethod}
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${getInvoiceStatusBadge(
                                  inv.status,
                                )}`}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />

                                {inv.status}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleDownloadInvoice(inv)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 transition hover:border-[#88da1c] hover:bg-[#f8fdf2] hover:text-slate-900"
                              >
                                <Download size={13} />
                                Download
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Empty State */}

                  {displayedInvoices.length === 0 && (
                    <div className="px-5 py-16 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                        <FileText size={27} />
                      </div>

                      <h3 className="mt-4 text-sm font-bold text-slate-800">
                        No invoices found
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        No invoices match your selected filter.
                      </p>

                      {invoiceFilter !== "ALL" && (
                        <button
                          type="button"
                          onClick={() => setInvoiceFilter("ALL")}
                          className="mt-4 text-xs font-bold text-[#579b0d] hover:underline"
                        >
                          View all invoices
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {/* ==========================================
              FOOTER NOTE
          ========================================== */}

          {isOwnerOrAdmin && !errorMessage && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
              <p className="text-xs text-slate-400">
                © VexChat. Secure billing for your workspace.
              </p>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <ShieldCheck size={15} className="text-emerald-600" />
                Your payment information is handled securely.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          CHECKOUT MODAL
      ========================================== */}

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

      {/* ==========================================
          TOAST
      ========================================== */}

      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[100] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-xl shadow-slate-900/10"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={17} />
          </div>

          <p className="text-xs font-semibold text-slate-700">{toastMessage}</p>

          <button
            type="button"
            onClick={() => setToastMessage("")}
            className="ml-2 text-slate-400 transition hover:text-slate-700"
            aria-label="Close notification"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
