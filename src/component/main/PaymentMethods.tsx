"use client";

import React, { useState } from "react";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";

export default function PaymentMethods() {
  const [selectedMethod, setSelectedMethod] = useState<"bKash" | "Nagad" | "Card" | "Crypto">("bKash");

  return (
    <section className="py-16 sm:py-20 bg-[#f7f9f4] border-t border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 mb-4">
            <CreditCard className="h-4 w-4 text-emerald-600" />
            <span>Local & Global Billing (PDF Sec 7 & 9)</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Pay Easily with <span className="text-emerald-600">bKash, Nagad, Cards & Crypto</span>
          </h2>
          <p className="mt-3 text-xs sm:text-base text-slate-600">
            Instant automated subscription activation. As soon as payment completes, your WhatsApp Business
            connection, team inbox, and messaging service are enabled immediately.
          </p>
        </div>

        {/* 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* Left Column: Payment Method Badges & Selector */}
          <div className="lg:col-span-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              {/* bKash Card */}
              <div
                onClick={() => setSelectedMethod("bKash")}
                className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${selectedMethod === "bKash"
                    ? "bg-white border-[#E2136E] ring-2 ring-[#E2136E]/20 shadow-md"
                    : "bg-white/70 border-slate-200 hover:bg-white"
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-base sm:text-lg text-[#E2136E]">bKash</span>
                  <span className="text-[10px] bg-pink-100 text-[#E2136E] font-bold px-2 py-0.5 rounded-full">
                    Instant Auto-Verify
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Pay directly using bKash merchant gateway. Instant TRX verification in under 5 seconds.
                </p>
              </div>

              {/* Nagad Card */}
              <div
                onClick={() => setSelectedMethod("Nagad")}
                className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${selectedMethod === "Nagad"
                    ? "bg-white border-[#F7941D] ring-2 ring-[#F7941D]/20 shadow-md"
                    : "bg-white/70 border-slate-200 hover:bg-white"
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-base sm:text-lg text-[#F7941D]">Nagad</span>
                  <span className="text-[10px] bg-amber-100 text-[#F7941D] font-bold px-2 py-0.5 rounded-full">
                    Direct Payment
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Seamless payment via Nagad mobile banking with immediate automated invoice generation.
                </p>
              </div>

              {/* Visa / Mastercard */}
              <div
                onClick={() => setSelectedMethod("Card")}
                className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${selectedMethod === "Card"
                    ? "bg-white border-blue-600 ring-2 ring-blue-600/20 shadow-md"
                    : "bg-white/70 border-slate-200 hover:bg-white"
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-base sm:text-lg text-blue-700">Visa / Master</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                    Auto-Renewal
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  International credit & debit cards supported with 3D Secure bank encryption.
                </p>
              </div>

              {/* Binance / Crypto */}
              <div
                onClick={() => setSelectedMethod("Crypto")}
                className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${selectedMethod === "Crypto"
                    ? "bg-white border-emerald-600 ring-2 ring-emerald-600/20 shadow-md"
                    : "bg-white/70 border-slate-200 hover:bg-white"
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-base sm:text-lg text-slate-900">Binance Pay</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    USDT / BTC
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Where legally and technically supported, seamless USDT settlement via Binance Pay.
                </p>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Automated PDF Invoices & Tax Receipts with every transaction</span>
              </div>
              <span className="text-emerald-700 font-semibold cursor-pointer shrink-0 ml-2">Sample</span>
            </div>
          </div>

          {/* Right Column: Connection Relationship Flowchart */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900 text-white p-5 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800 mb-5 sm:mb-6">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Automated Activation Pipeline (PDF Sec 9)</h4>
                  <p className="text-[11px] sm:text-xs text-slate-400">Zero manual waiting. Fully synchronized.</p>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  Instant Webhook
                </span>
              </div>

              {/* Step Sequence */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">Payment Processed via {selectedMethod}</h5>
                    <p className="text-[11px] text-slate-400">
                      Automated TRX confirmation validates the payment and generates customer invoice.
                    </p>
                  </div>
                </div>

                <div className="ml-3 sm:ml-3.5 h-3 sm:h-4 w-[2px] bg-emerald-600/50" />

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">Subscription Activated & Quotas Allocated</h5>
                    <p className="text-[11px] text-slate-400">
                      Multi-agent limits, phone numbers, and template permissions assigned to client tenant.
                    </p>
                  </div>
                </div>

                <div className="ml-3 sm:ml-3.5 h-3 sm:h-4 w-[2px] bg-emerald-600/50" />

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">Meta WhatsApp Cloud Service Enabled</h5>
                    <p className="text-[11px] text-slate-400">
                      Team members log in to the shared inbox immediately and start sending messages.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-800 text-[10px] sm:text-[11px] text-slate-400 flex items-center justify-between">
                <span>Grace period notification if subscription nears expiry</span>
                <span className="text-emerald-400 font-semibold">14-Day Free Trial</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}