"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  FileCheck2,
  Send,
  Kanban,
  Megaphone,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  BarChart3,
  Bot,
  Zap,
  Lock,
} from "lucide-react";

export default function BentoFeatures() {
  const [activePipelineTab, setActivePipelineTab] = useState<"New" | "Contacted" | "Converted">("Contacted");

  return (
    <section id="features" className="py-20 sm:py-24 bg-[#f7f9f4] relative scroll-mt-24 sm:scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 mb-4">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span>Complete SaaS Feature Suite (PDF Sec 2-5)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Built for Modern Teams. <br className="hidden sm:block" />
            <span className="text-emerald-600">Engineered for Massive Scale.</span>
          </h2>
          <p className="mt-4 text-sm sm:text-lg text-slate-600">
            From multi-agent inboxes to automated campaign scheduling, VexChat brings every Meta WhatsApp
            capability under one unified, compliant dashboard.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
          {/* Bento Card 1: Multi-Agent Inbox & Role Hierarchy (col-span-8) */}
          <div className="md:col-span-12 lg:col-span-8 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Team Management (PDF Sec 2)
                </span>
                <h3 className="text-lg sm:text-2xl font-bold text-slate-900 mt-2">
                  Multi-Agent Routing & Department System
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Users className="h-4 w-4 text-emerald-600" />
                <span>Unlimited Staff Logins</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              Assign chats automatically by department: <strong>Sales</strong>, <strong>Support</strong>,{" "}
              <strong>Marketing</strong>, or <strong>Billing</strong>. Track agent online status, response times,
              and maintain private internal notes between team members without customers knowing.
            </p>

            {/* Visual Agent Matrix */}
            <div className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800">Admin Account</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-xs text-slate-500">
                  Full control: WABA setup, billing, payment verification, and security logs.
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800">Department Manager</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-xs text-slate-500">
                  Reassign conversations, manage agent workload, monitor response SLAs.
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800">Support / Sales Agent</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-xs text-slate-500">
                  Fast replying, CRM tag updates, private notes, and template messaging.
                </p>
              </div>
            </div>
          </div>

          {/* Bento Card 2: Meta Official Template Manager (col-span-4) */}
          <div className="md:col-span-12 lg:col-span-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Template Engine (PDF Sec 3)
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">WhatsApp Template Sync</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Create, submit, and preview templates directly with Meta. Live status sync: Approved, Pending,
              Rejected, or Disabled.
            </p>

            <div className="mt-5 space-y-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-800">order_confirmation_v2</div>
                  <div className="text-[10px] text-slate-400">Utility • Variables: 3</div>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  Approved
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-800">flash_sale_bangladesh</div>
                  <div className="text-[10px] text-slate-400">Marketing • Media: Image</div>
                </div>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  Review
                </span>
              </div>
            </div>
          </div>

          {/* Bento Card 3: Interactive Messages (CTA, Lists, Catalogs) (col-span-4) */}
          <div className="md:col-span-12 lg:col-span-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Engagement (PDF Sec 4)
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">Interactive Messages & CTA</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Boost response rates with Quick Reply buttons, Call-to-Action URL links, list picker menus, and
              Meta product catalogs.
            </p>

            <div className="mt-5 p-3.5 sm:p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
              <div className="font-semibold text-emerald-950">Special Promotion Menu</div>
              <p className="text-emerald-800 text-[11px]">
                Enjoy 15% off on all items! Select your preferred service category below:
              </p>
              <div className="pt-2 space-y-1.5">
                <button className="w-full py-1.5 rounded-lg bg-white border border-emerald-300 font-semibold text-emerald-800 text-xs shadow-sm">
                  1. View Catalog Items
                </button>
                <button className="w-full py-1.5 rounded-lg bg-emerald-600 font-semibold text-white text-xs shadow-sm">
                  2. Talk to Live Agent
                </button>
              </div>
            </div>
          </div>

          {/* Bento Card 4: Mini CRM & Lead Pipeline (col-span-4) */}
          <div className="md:col-span-12 lg:col-span-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              CRM Engine (PDF Sec 13)
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">Customer Mini CRM</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Track customer lifecycle from cold lead to converted subscriber. Custom fields, contact tags, and
              instant conversation timeline.
            </p>

            <div className="mt-5">
              <div className="flex border-b border-slate-200 text-xs font-medium pb-2 gap-3 sm:gap-4 overflow-x-auto">
                {(["New", "Contacted", "Converted"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActivePipelineTab(tab)}
                    className={`pb-1 whitespace-nowrap ${activePipelineTab === tab
                        ? "border-b-2 border-emerald-600 text-emerald-700 font-bold"
                        : "text-slate-500 hover:text-slate-800"
                      }`}
                  >
                    {tab} Leads
                  </button>
                ))}
              </div>

              <div className="mt-3 space-y-2">
                {activePipelineTab === "New" && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="font-semibold text-slate-800">Kazi Enterprises</div>
                    <div className="text-[11px] text-slate-500">Inquired via Website Click-to-WhatsApp</div>
                  </div>
                )}
                {activePipelineTab === "Contacted" && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="font-semibold text-slate-800">TechBD Solutions</div>
                    <div className="text-[11px] text-emerald-600 font-medium">Proposal Sent • Agent Asad</div>
                  </div>
                )}
                {activePipelineTab === "Converted" && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="font-semibold text-slate-800">Rahim Logistics</div>
                    <div className="text-[11px] text-slate-500">Enterprise Plan Active (bKash)</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bento Card 5: Broadcast Campaigns & Analytics (col-span-4) */}
          <div className="md:col-span-12 lg:col-span-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Marketing (PDF Sec 14)
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">Broadcast Campaigns</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Launch targeted campaigns with CSV audience import, scheduled delivery, and live tracking: Sent,
              Delivered, Read, and Failed.
            </p>

            <div className="mt-5 p-3.5 sm:p-4 rounded-2xl bg-slate-900 text-white text-xs space-y-2.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Campaign: Winter Promo</span>
                <span className="text-emerald-400 font-bold">Completed</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span>Total Recipients:</span>
                  <span className="font-bold">12,500</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[96%]" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Delivered: 99.4%</span>
                  <span>Read: 84.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}