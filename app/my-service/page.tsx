"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Package,
  CreditCard,
  Sparkles,
  MessageSquare,
  Users,
  Bot,
  RefreshCw,
  AlertCircle,
  Download,
} from "lucide-react";
import DashboardLayout from "@/src/component/dashboard/dashboard-layout";
import { useWorkspace } from "@/src/context/workspace-context";
import { billingService } from "@/src/services/billing-service";
import type { MyServicesData } from "@/src/types/billing";

// Dynamic Lucide icon lookup map
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquare,
  Zap,
  Users,
  Bot,
  ShieldCheck,
  Sparkles,
  Package,
  CreditCard,
  CheckCircle2,
};

export default function MyServicesPage() {
  const { activeWorkspace, isLoading: isWorkspaceLoading } = useWorkspace();

  const [data, setData] = useState<MyServicesData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string>("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const loadServices = useCallback(async () => {
    if (!activeWorkspace?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await billingService.getMyServices(activeWorkspace.id);
      setData(res);
    } catch (err: any) {
      console.error("[MyServicesPage Error]", err);
      setError(
        err?.message || "Failed to load active plan details. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace?.id]);

  useEffect(() => {
    if (!isWorkspaceLoading && activeWorkspace?.id) {
      loadServices();
    } else if (!isWorkspaceLoading && !activeWorkspace) {
      setIsLoading(false);
    }
  }, [activeWorkspace?.id, isWorkspaceLoading, loadServices]);

  const handleDownloadInvoice = () => {
    if (!data?.subscription) return;
    const { subscription, userInfo } = data;

    const invoiceContent = [
      "===========================================================",
      "                  VEXCHAT INVOICE RECEIPT                  ",
      "===========================================================",
      `Invoice Number   : ${subscription.invoiceNumber}`,
      `Date Generated   : ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`,
      `Workspace Name   : ${activeWorkspace?.name || "Workspace"}`,
      `Customer Name    : ${userInfo.name} (${userInfo.email})`,
      `User Role        : ${userInfo.role}`,
      "-----------------------------------------------------------",
      `Plan Code        : ${subscription.planCode}`,
      `Plan Name        : ${subscription.planName}`,
      `Subscription Fee : ${subscription.amount} ${subscription.currency}`,
      `Billing Cycle    : ${subscription.billingCycle}`,
      `Valid Period     : ${subscription.startDate} to ${subscription.expiryDate}`,
      `Payment Gateway  : ${subscription.paymentMethod}`,
      `Gateway Trx ID   : ${subscription.paymentId}`,
      `Payment Status   : ${subscription.isPaid ? "PAID & VERIFIED" : subscription.status}`,
      "-----------------------------------------------------------",
      "Included Limits:",
      `  * Connected WhatsApp Numbers : ${subscription.limits?.maxWhatsAppNumbers === -1 ? "Unlimited" : (subscription.limits?.maxWhatsAppNumbers ?? "Standard")}`,
      `  * Team Member Seats          : ${subscription.limits?.maxTeamMembers === -1 ? "Unlimited" : (subscription.limits?.maxTeamMembers ?? "Standard")}`,
      "===========================================================",
      "Thank you for choosing VexChat for your WhatsApp SaaS needs.",
      "Support: support@vexchat.app | https://vexchat.io",
      "===========================================================",
    ].join("\n");

    const blob = new Blob([invoiceContent], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${subscription.invoiceNumber || "VexChat-Invoice"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Invoice ${subscription.invoiceNumber} downloaded.`);
  };

  const subscription = data?.subscription;
  const userInfo = data?.userInfo;
  const unlockedFeatures = data?.unlockedFeatures || [];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#f7f9f4] text-slate-800 p-6 md:p-10">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#88da1c] px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-200/70 animate-in fade-in slide-in-from-bottom-2">
              {toastMessage}
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading ? (
            <div className="space-y-8 animate-pulse">
              <div className="h-44 w-full rounded-2xl bg-white border border-slate-200/80" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-64 rounded-2xl bg-white border border-slate-200/80" />
                  <div className="h-72 rounded-2xl bg-white border border-slate-200/80" />
                </div>
                <div className="h-96 rounded-2xl bg-white border border-slate-200/80" />
              </div>
            </div>
          ) : error ? (
            /* Error Card */
            <div className="rounded-2xl bg-white border border-slate-200/80 p-8 shadow-sm text-center max-w-xl mx-auto space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <AlertCircle size={28} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Unable to Load Services
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">{error}</p>
              <button
                type="button"
                onClick={loadServices}
                className="inline-flex items-center gap-2 rounded-xl bg-[#88da1c] px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-[#79c719] transition shadow-sm"
              >
                <RefreshCw size={15} />
                Try Again
              </button>
            </div>
          ) : subscription && userInfo ? (
            <>
              {/* Top Header Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-[#f4fbe9] to-[#eaf7d9] border border-[#88da1c]/20 p-8 shadow-sm transition-all duration-300">
                <div className="absolute -right-10 -top-10 w-60 h-60 bg-[#88da1c]/15 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#88da1c]/15 text-[#5b9415] text-xs font-semibold mb-3">
                      <Sparkles className="w-3.5 h-3.5" />
                      {subscription.status === "ACTIVE"
                        ? "Active Subscription"
                        : `${subscription.status} Plan`}
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                      My Services & Plan
                    </h1>
                    <p className="text-slate-500 mt-1">
                      Real-time subscription, billing verification, and unlocked
                      enterprise features for{" "}
                      {activeWorkspace?.name || "your workspace"}.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 bg-white border border-slate-200/80 backdrop-blur-md px-5 py-3 rounded-xl shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-[#88da1c]/20 flex items-center justify-center text-[#5b9415] font-bold uppercase">
                      {userInfo.name.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-semibold text-slate-900">
                          {userInfo.name}
                        </h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#88da1c]/15 text-[#5b9415] font-bold uppercase tracking-wider">
                          {userInfo.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{userInfo.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Grid Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left 2 Columns: Active Plan & Features */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Current Plan Card */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#88da1c]/10 rounded-full blur-2xl" />

                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs uppercase tracking-wider text-[#5b9415] font-bold">
                          Current Subscription
                        </span>
                        <h2 className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
                          {subscription.planName}
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              subscription.status === "ACTIVE"
                                ? "bg-[#88da1c]/20 text-[#4f8610]"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {subscription.status}
                          </span>
                        </h2>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-extrabold text-slate-900">
                          ৳{subscription.amount.toLocaleString("en-BD")}
                        </span>
                        <span className="text-xs text-slate-500 block">
                          / {subscription.billingCycle.toLowerCase()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-200">
                      <div className="flex items-center gap-3 text-slate-600 text-sm">
                        <div className="p-2 rounded-lg bg-[#f0f7e7] text-[#5b9415]">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 block">
                            Billing Cycle Period
                          </span>
                          <span className="font-medium text-slate-700">
                            {subscription.startDate} to{" "}
                            {subscription.expiryDate}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-slate-600 text-sm">
                        <div className="p-2 rounded-lg bg-[#f0f7e7] text-[#5b9415]">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 block">
                            Payment Gateway
                          </span>
                          <span className="uppercase font-medium text-slate-700">
                            {subscription.paymentMethod}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Unlocked Features Grid */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Package className="w-5 h-5 text-[#5b9415]" />
                        Unlocked Services & Features
                      </h3>
                      <Link
                        href="/billing"
                        className="text-xs font-semibold text-[#5b9415] hover:text-[#4f8610] flex items-center gap-1 transition"
                      >
                        Upgrade Plan <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {unlockedFeatures.map((feat, index) => {
                        const IconComp = ICON_MAP[feat.icon] || Package;
                        return (
                          <div
                            key={index}
                            className="p-4 rounded-xl bg-[#f7f9f4] border border-slate-200/80 shadow-sm transition-all duration-300 hover:bg-[#f0f7e7] hover:border-[#88da1c]/40 flex items-start gap-3.5 group"
                          >
                            <div className="p-2.5 rounded-lg bg-[#88da1c]/15 text-[#5b9415] group-hover:scale-110 transition-transform duration-300 shrink-0">
                              <IconComp className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                                {feat.title}
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#5b9415] shrink-0" />
                              </h4>
                              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                {feat.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Invoice & Billing Metadata */}
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                    <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#5b9415]" />
                      Payment & Invoice Info
                    </h3>

                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between items-center py-2.5 border-b border-slate-200">
                        <span className="text-slate-500">Invoice No</span>
                        <span className="font-mono text-[#5b9415] font-semibold text-xs sm:text-sm">
                          {subscription.invoiceNumber}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2.5 border-b border-slate-200">
                        <span className="text-slate-500">Payment Status</span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            subscription.isPaid
                              ? "bg-[#88da1c]/20 text-[#4f8610]"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {subscription.isPaid ? "Paid & Verified" : "Pending"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2.5 border-b border-slate-200">
                        <span className="text-slate-500">Gateway Ref ID</span>
                        <span
                          className="font-mono text-xs text-slate-600 truncate max-w-[150px]"
                          title={subscription.paymentId}
                        >
                          {subscription.paymentId}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2.5">
                        <span className="text-slate-500">
                          Subscription Cycle
                        </span>
                        <span className="text-[#5b9415] font-medium text-xs bg-[#88da1c]/15 px-2.5 py-1 rounded-full">
                          {subscription.billingCycle}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 space-y-2">
                      <button
                        type="button"
                        onClick={handleDownloadInvoice}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#f0f7e7] hover:bg-[#eaf5dc] text-slate-700 text-sm font-medium transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-[#5b9415]" />
                        Download Invoice Receipt
                      </button>

                      <Link
                        href="/billing"
                        className="w-full py-2 px-4 rounded-xl text-slate-500 hover:text-slate-900 text-xs font-medium transition text-center block"
                      >
                        Manage Billing & Invoices →
                      </Link>
                    </div>
                  </div>

                  {/* Support Box */}
                  <div className="bg-gradient-to-br from-[#eef8df] to-white border border-[#88da1c]/20 rounded-2xl p-6 shadow-sm transition-all duration-300">
                    <h4 className="text-sm font-bold text-slate-900 mb-1">
                      Need Help With Your Plan?
                    </h4>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                      Our customer engineering team is available 24/7 to assist
                      with WhatsApp Cloud API setup, phone number onboarding,
                      and automation flows.
                    </p>
                    <Link
                      href="/support"
                      className="inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-[#88da1c] hover:bg-[#79c719] text-slate-950 text-sm font-semibold transition-all duration-300 shadow-sm gap-1.5"
                    >
                      Open Support Ticket <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl bg-white border border-slate-200/80 p-8 shadow-sm text-center max-w-xl mx-auto space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                No Active Plan Found
              </h3>
              <p className="text-sm text-slate-500">
                You do not have an active subscription record in this workspace.
              </p>
              <Link
                href="/billing"
                className="inline-flex items-center gap-2 rounded-xl bg-[#88da1c] px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-[#79c719] transition shadow-sm"
              >
                Choose a Plan
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
