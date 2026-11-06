"use client";

import { useState } from "react";
import {
  AlertCircle,
  Building2,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import {
  CITY_BANK_CONFIG,
  type BillingPlan,
  type PaymentMethod,
} from "@/src/types/billing";

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
}: CheckoutModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("BKASH");
  const [errorMessage, setErrorMessage] = useState("");

  if (!open || !plan) return null;

  const formattedPrice = new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(plan.priceBdt);

  async function handleCheckout() {
    setErrorMessage(
      "Payment gateway integrations and manual bank transfers are currently undergoing certification and are not yet operational. No payment was initiated.",
    );
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
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
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
                Select Approved Payment Method
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. bKash Checkout */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod("BKASH")}
                  className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all ${
                    selectedMethod === "BKASH"
                      ? "border-[#E2136E] bg-pink-50/40 ring-2 ring-[#E2136E]/20 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="font-extrabold text-base text-[#E2136E]">
                      bKash
                    </span>
                    <Smartphone size={16} className="text-[#E2136E]" />
                  </div>
                  <span className="text-xs font-semibold text-slate-900">
                    Online Checkout
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1">
                    Instant OTP & PIN verification
                  </span>
                </button>

                {/* 2. City Bank Card */}
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
                      Cards
                    </span>
                    <CreditCard size={16} className="text-blue-700" />
                  </div>
                  <span className="text-xs font-semibold text-slate-900">
                    City Bank Card Gateway
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1">
                    Visa, Master, Amex (3D Secure)
                  </span>
                </button>

                {/* 3. City Bank Account Transfer */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod("CITY_BANK_TRANSFER")}
                  className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all ${
                    selectedMethod === "CITY_BANK_TRANSFER"
                      ? "border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/20 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="font-extrabold text-base text-emerald-800">
                      Bank Transfer
                    </span>
                    <Building2 size={16} className="text-emerald-700" />
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
            {selectedMethod === "BKASH" && (
              <div className="rounded-2xl border border-pink-100 bg-pink-50/20 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#E2136E] uppercase tracking-wide">
                    <Smartphone size={15} />
                    bKash Online Checkout
                  </div>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                    Coming Soon / Sandbox Testing
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  bKash Tokenized Checkout integration is currently undergoing backend sandbox
                  testing and compliance verification. Automated payment processing will be enabled upon gateway certification.
                </p>
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                  Online bKash checkout is temporarily disabled in this release.
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
                    Integration Pending
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  City Bank Card Gateway checkout is currently undergoing merchant provider contract
                  onboarding. Direct credit and debit card payments will be enabled once the provider contract is active.
                </p>
                <div className="rounded-xl bg-slate-100 border border-slate-200 p-3 text-xs text-slate-700">
                  Card checkout is temporarily disabled in this release.
                </div>
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
                className="w-full sm:w-auto rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={true}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed"
              >
                {selectedMethod === "BKASH" ? (
                  <>
                    bKash Checkout (Sandbox Testing)
                    <ExternalLink size={15} />
                  </>
                ) : selectedMethod === "CITY_BANK_CARD" ? (
                  <>
                    Card Checkout (Coming Soon)
                    <ExternalLink size={15} />
                  </>
                ) : (
                  <>
                    Bank Transfer (Unavailable)
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

