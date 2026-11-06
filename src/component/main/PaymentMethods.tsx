"use client";

import React, { useState } from "react";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  Building2,
  Smartphone,
} from "lucide-react";

export default function PaymentMethods() {
  const [selectedMethod, setSelectedMethod] = useState<"bKash" | "CityCard" | "CityTransfer">("bKash");

  return (
    <section className="py-16 sm:py-20 bg-[#f7f9f4] border-t border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 mb-4">
            <CreditCard className="h-4 w-4 text-emerald-600" />
            <span>Approved Bangladesh Payment Infrastructure</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Pay Easily with <span className="text-emerald-600">bKash, Cards & City Bank</span>
          </h2>
          <p className="mt-3 text-xs sm:text-base text-slate-600">
            Secure, verified subscription activation in BDT. Manual monthly renewal with zero
            automated recurring surprise debits.
          </p>
        </div>

        {/* 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* Left Column: Payment Method Badges & Selector */}
          <div className="lg:col-span-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
              {/* bKash Card */}
              <div
                onClick={() => setSelectedMethod("bKash")}
                className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${
                  selectedMethod === "bKash"
                    ? "bg-white border-[#E2136E] ring-2 ring-[#E2136E]/20 shadow-md"
                    : "bg-white/70 border-slate-200 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-base sm:text-lg text-[#E2136E]">bKash</span>
                  <Smartphone className="h-4 w-4 text-[#E2136E]" />
                </div>
                <p className="text-xs text-slate-600">
                  Direct tokenized checkout with instant OTP & PIN verification in BDT.
                </p>
              </div>

              {/* City Bank Cards */}
              <div
                onClick={() => setSelectedMethod("CityCard")}
                className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${
                  selectedMethod === "CityCard"
                    ? "bg-white border-blue-600 ring-2 ring-blue-600/20 shadow-md"
                    : "bg-white/70 border-slate-200 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-base sm:text-lg text-blue-700">Cards</span>
                  <CreditCard className="h-4 w-4 text-blue-700" />
                </div>
                <p className="text-xs text-slate-600">
                  Visa, Mastercard, and Amex via City Bank Merchant 3D Secure Gateway.
                </p>
              </div>

              {/* City Bank Transfer */}
              <div
                onClick={() => setSelectedMethod("CityTransfer")}
                className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${
                  selectedMethod === "CityTransfer"
                    ? "bg-white border-emerald-600 ring-2 ring-emerald-600/20 shadow-md"
                    : "bg-white/70 border-slate-200 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-base sm:text-lg text-emerald-800">Bank Transfer</span>
                  <Building2 className="h-4 w-4 text-emerald-800" />
                </div>
                <p className="text-xs text-slate-600">
                  Direct City Bank account transfer with deposit slip upload & admin verification.
                </p>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Automated PDF Invoices & Tax Receipts for every transaction</span>
              </div>
              <span className="text-emerald-700 font-semibold shrink-0 ml-2">BDT Invoices</span>
            </div>
          </div>

          {/* Right Column: Connection Relationship Flowchart */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900 text-white p-5 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800 mb-5 sm:mb-6">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    Verified Subscription Activation
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-400">
                    Server-side verification required before activation.
                  </p>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  Manual Monthly
                </span>
              </div>

              {/* Step Sequence */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">
                      Payment Initiated via {selectedMethod === "bKash" ? "bKash Checkout" : selectedMethod === "CityCard" ? "City Bank Cards" : "City Bank Transfer"}
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      Backend generates unique invoice number and authoritative BDT pricing.
                    </p>
                  </div>
                </div>

                <div className="ml-3 sm:ml-3.5 h-3 sm:h-4 w-[2px] bg-emerald-600/50" />

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">Authoritative Server-Side Verification</h5>
                    <p className="text-[11px] text-slate-400">
                      Server directly queries gateway or verifies bank credit before activating subscription.
                    </p>
                  </div>
                </div>

                <div className="ml-3 sm:ml-3.5 h-3 sm:h-4 w-[2px] bg-emerald-600/50" />

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">Subscription Active & Limits Unlocked</h5>
                    <p className="text-[11px] text-slate-400">
                      Team members access shared WhatsApp inbox, campaigns, and templates immediately.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-800 text-[10px] sm:text-[11px] text-slate-400 flex items-center justify-between">
                <span>Renewal reminder notification before expiry</span>
                <span className="text-emerald-400 font-semibold">Zero Auto-Debits</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
