"use client";

import { useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Smartphone,
  Zap,
  X,
} from "lucide-react";
import {
  CITY_BANK_CONFIG,
  type BillingPlan,
  type PaymentMethod,
} from "@/src/types/billing";
import { billingService } from "@/src/services/billing-service";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  plan: BillingPlan | null;
  workspaceId: string;
  onPaymentSuccess?: () => void;
}

export default function CheckoutModal({
  open,
  onClose,
  plan,
  workspaceId,
}: CheckoutModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("ZINIPAY");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!open || !plan) return null;

  const formattedPrice = new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(plan.priceBdt);

  async function handleCheckout() {
    if (!plan || !workspaceId) return;
    setErrorMessage("");

    if (selectedMethod === "ZINIPAY" || selectedMethod === "BKASH") {
      setIsSubmitting(true);
      try {
        const res = await billingService.payWithZinipay(workspaceId, plan.code);
        if (res.gatewayUrl) {
          // Hard redirect to ZiniPay secure hosted checkout page
          window.location.href = res.gatewayUrl;
        } else {
          throw new Error("ZiniPay did not return a valid checkout URL.");
        }
      } catch (err: any) {
        setIsSubmitting(false);
        setErrorMessage(
          err?.message || "Failed to initialize ZiniPay payment session. Please try again.",
        );
      }
      return;
    }

    if (selectedMethod === "CITY_BANK_CARD") {
      setErrorMessage(
        "Direct City Bank Card Gateway is currently being onboarded. Please select 'ZiniPay Instant Pay' to pay instantly via Visa, MasterCard, or Mobile Wallets.",
      );
      return;
    }

    if (selectedMethod === "CITY_BANK_TRANSFER") {
      setErrorMessage(
        "For City Bank manual transfers, please deposit to our bank account below and submit your deposit slip to support.",
      );
      return;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                Monthly Renewal
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-medium text-slate-500">
                No Auto-Debit
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Upgrade to VexChat {plan.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Authoritative price:{" "}
              <span className="font-bold text-slate-900">{formattedPrice}</span>{" "}
              / calendar month
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
            <p className="leading-5">{errorMessage}</p>
          </div>
        )}

        <div className="mt-6 space-y-6">
          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Select Payment Method
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. ZiniPay Instant Checkout (Primary) */}
              <button
                type="button"
                onClick={() => setSelectedMethod("ZINIPAY")}
                className={`relative flex flex-col items-start p-4 rounded-2xl border text-left transition-all ${
                  selectedMethod === "ZINIPAY"
                    ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-1.5 font-extrabold text-base text-emerald-800">
                    <Zap size={16} className="text-emerald-600 fill-emerald-600" />
                    ZiniPay
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                    Instant
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-900">
                  bKash, Nagad, Cards
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  Automated live activation
                </span>
              </button>

              {/* 2. Direct Cards */}
              <button
                type="button"
                onClick={() => setSelectedMethod("CITY_BANK_CARD")}
                className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all ${
                  selectedMethod === "CITY_BANK_CARD"
                    ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="font-extrabold text-base text-blue-700">
                    Direct Cards
                  </span>
                  <CreditCard size={16} className="text-blue-700" />
                </div>
                <span className="text-xs font-semibold text-slate-900">
                  Bank Card Gateway
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  Visa, Master (3D Secure)
                </span>
              </button>

              {/* 3. City Bank Account Transfer */}
              <button
                type="button"
                onClick={() => setSelectedMethod("CITY_BANK_TRANSFER")}
                className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all ${
                  selectedMethod === "CITY_BANK_TRANSFER"
                    ? "border-slate-700 bg-slate-50 ring-2 ring-slate-700/20 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="font-extrabold text-base text-slate-800">
                    Bank Transfer
                  </span>
                  <Building2 size={16} className="text-slate-700" />
                </div>
                <span className="text-xs font-semibold text-slate-900">
                  City Bank Account
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  Deposit slip & manual approval
                </span>
              </button>
            </div>
          </div>

          {/* Dynamic Method Details View */}
          {selectedMethod === "ZINIPAY" && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wide">
                  <Zap size={15} className="text-emerald-600 fill-emerald-600" />
                  ZiniPay Hosted Automated Gateway
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  Active & Ready
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pay instantly and securely using <span className="font-semibold text-slate-800">bKash, Nagad, Rocket, Upay, Visa, MasterCard</span> or Bangladeshi Internet Banking through ZiniPay. Your VexChat subscription and limits are activated automatically upon payment completion.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-emerald-900 font-medium">
                <span className="rounded-md bg-white border border-emerald-200 px-2 py-1 shadow-2xs">bKash (MFS)</span>
                <span className="rounded-md bg-white border border-emerald-200 px-2 py-1 shadow-2xs">Nagad (MFS)</span>
                <span className="rounded-md bg-white border border-emerald-200 px-2 py-1 shadow-2xs">Rocket (MFS)</span>
                <span className="rounded-md bg-white border border-emerald-200 px-2 py-1 shadow-2xs">Visa / Master Cards</span>
              </div>
            </div>
          )}

          {selectedMethod === "CITY_BANK_CARD" && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50/20 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wide">
                  <CreditCard size={15} />
                  City Bank Card Gateway (3D Secure)
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                  Alternative Available
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct merchant onboarding for standalone City Bank IPG is in progress. You can already use your Visa or MasterCard directly through the <strong className="text-emerald-800">ZiniPay</strong> payment option.
              </p>
            </div>
          )}

          {selectedMethod === "CITY_BANK_TRANSFER" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wide">
                  <AlertCircle size={15} className="text-amber-700" />
                  Bank Transfer Notice
                </div>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  {CITY_BANK_CONFIG.notice}
                </p>
              </div>
            </div>
          )}

          {/* Subscription Policy Guarantee */}
          <div className="flex items-start gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-600" />
            <div className="leading-5">
              <span className="font-semibold text-slate-900">
                Manual Monthly Renewal Policy:
              </span>{" "}
              VexChat does not perform automatic recurring card debits. Each renewal is
              initiated manually by you. Early renewal preserves all remaining days.
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={isSubmitting}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition ${
                selectedMethod === "ZINIPAY" || selectedMethod === "BKASH"
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 cursor-pointer"
                  : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Redirecting to ZiniPay...
                </>
              ) : selectedMethod === "ZINIPAY" ? (
                <>
                  Pay {formattedPrice} with ZiniPay
                  <ExternalLink size={15} />
                </>
              ) : selectedMethod === "CITY_BANK_CARD" ? (
                <>
                  Use ZiniPay for Cards
                  <ExternalLink size={15} />
                </>
              ) : (
                <>
                  Bank Transfer Details
                  <AlertCircle size={15} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
