"use client";

import React from "react";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Lock,
  KeyRound,
  Server,
  Layers,
  FileCheck,
} from "lucide-react";

export default function ComplianceSection() {
  return (
    <section id="compliance" className="py-20 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 mb-4">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Zero-Ban Compliance Guarantee (PDF Sec 26, 27 & 34)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Why Leading Businesses Choose <br className="hidden sm:block" />
            <span className="text-emerald-600">Official Meta Cloud API Over QR Bots</span>
          </h2>
          <p className="mt-4 text-sm sm:text-lg text-slate-600">
            Unofficial QR scrapers get WhatsApp numbers permanently banned by Meta. VexChat connects directly
            through Meta's official OAuth Cloud API infrastructure.
          </p>
        </div>

        {/* Side by Side Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch mb-12 sm:mb-16">
          {/* Bad: Unofficial QR Web Automation */}
          <div className="rounded-2xl sm:rounded-3xl border border-rose-200 bg-rose-50/40 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold shrink-0">
                  <XCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-rose-950">Unofficial QR / Web Scrapers</h3>
                  <p className="text-xs text-rose-700">Dangerous & against WhatsApp TOS</p>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-rose-900 pt-2">
                <li className="flex items-start gap-2.5">
                  <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Permanent Phone Number Bans:</strong> Meta detects headless browser sessions and bans
                    business numbers permanently without warning.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Frequent Disconnections:</strong> QR code session expires, requiring constant phone
                    re-scans during live work hours.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Zero Multi-Agent Scalability:</strong> Cannot assign distinct agents or handle hundreds
                    of simultaneous customer conversations cleanly.
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>High Risk of Brand Loss & Regulatory Penalties</span>
            </div>
          </div>

          {/* Good: VexChat Official Meta Cloud API */}
          <div className="rounded-2xl sm:rounded-3xl border-2 border-emerald-500/80 bg-white p-6 sm:p-8 shadow-xl shadow-emerald-500/10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 sm:px-4 py-1 rounded-bl-xl shadow">
              Recommended Standard
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">VexChat (Official Meta Cloud API)</h3>
                  <p className="text-xs text-emerald-600 font-medium">100% Legitimate & Enterprise Certified</p>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-700 pt-2">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Zero Ban Guarantee:</strong> Official Meta OAuth authorization means your business number
                    is completely protected and whitelisted.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Verified Green Tick Eligibility:</strong> Qualify for Meta's official WhatsApp Green
                    Badge verification on your business brand.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Multi-Agent Team Routing & VoIP:</strong> True multi-tenant architecture with browser voice
                    calling and departmental inbox.
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Full SLA Uptime & Continuous Meta Cloud API Sync</span>
            </div>
          </div>
        </div>

        {/* Security & Multi-Tenant Highlights Grid */}
        <div className="rounded-2xl sm:rounded-3xl bg-slate-900 text-white p-6 sm:p-10 border border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8 pb-5 sm:pb-6 border-b border-slate-800">
            <div>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-400">
                Enterprise Grade Architecture (PDF Sec 26 & 27)
              </span>
              <h3 className="text-lg sm:text-2xl font-bold text-white mt-1">
                Multi-Tenant Isolation & Bank-Grade Security
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs bg-slate-800 px-3 py-1.5 rounded-xl text-slate-300 border border-slate-700">
              <Lock className="h-4 w-4 text-emerald-400" />
              <span>AES-256 Token Encryption</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-slate-300 text-xs">
            <div className="p-4 rounded-xl sm:rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <Layers className="h-4 w-4" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">Database-Level Isolation</h4>
              <p className="text-slate-400 leading-relaxed">
                Tenant data (messages, contacts, payment tokens) are strictly isolated with row-level security.
              </p>
            </div>

            <div className="p-4 rounded-xl sm:rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <KeyRound className="h-4 w-4" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">Two-Factor Auth (2FA)</h4>
              <p className="text-slate-400 leading-relaxed">
                Mandatory 2FA for all team agents, password hashing with Bcrypt, and automated session expiry.
              </p>
            </div>

            <div className="p-4 rounded-xl sm:rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <Server className="h-4 w-4" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">Idempotent Webhooks</h4>
              <p className="text-slate-400 leading-relaxed">
                Meta SHA-256 signature verification on all incoming webhook payloads, preventing replay attacks.
              </p>
            </div>

            <div className="p-4 rounded-xl sm:rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <FileCheck className="h-4 w-4" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">Comprehensive Audit Logs</h4>
              <p className="text-slate-400 leading-relaxed">
                Admin tracks all login history, agent actions, message events, and payment audits with zero leaks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}