"use client";

import React from "react";
import { ArrowRight, ShieldCheck, MessageCircle, Sparkles, PhoneCall } from "lucide-react";

interface CtaBannerProps {
  onOpenDemoModal: () => void;
  onOpenContactModal: () => void;
}

export default function CtaBanner({ onOpenDemoModal, onOpenContactModal }: CtaBannerProps) {
  return (
    <section className="py-16 sm:py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-6 sm:p-14 text-center text-white shadow-2xl">
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 sm:px-4 py-1.5 text-xs font-semibold text-emerald-300 mb-5 sm:mb-6">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>Transform Your Business Messaging Today</span>
            </div>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Ready to Upgrade to the Official <br className="hidden sm:block" />
              <span className="text-emerald-400">Meta WhatsApp Cloud API?</span>
            </h2>

            <p className="mt-4 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Join leading businesses streamlining sales, support, and marketing with VexChat. Get instant
              multi-agent routing, automated campaigns, browser voice calling, and native bKash/Nagad checkout.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={onOpenDemoModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-7 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-extrabold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <span>Start Free 14-Day Trial</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={onOpenContactModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-800 hover:bg-slate-750 text-white px-6 sm:px-7 py-3.5 sm:py-4 text-sm sm:text-base font-bold shadow-sm hover:border-slate-600 hover:-translate-y-0.5 transition-all"
              >
                <PhoneCall className="h-4 w-4 text-emerald-400" />
                <span>Talk to Sales Team</span>
              </button>
            </div>

            <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Zero Ban Guarantee
              </span>
              <span>•</span>
              <span>No Credit Card Required</span>
              <span>•</span>
              <span>2-Minute Setup with Meta OAuth</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}