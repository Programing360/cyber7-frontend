"use client";

import { useState } from "react";
import {
  AlertCircle,
  Check,
  Lock,
  RefreshCw,
  Save,
  Send,
  Settings,
  ShieldCheck,
} from "lucide-react";
import AdminUnimplementedModal from "@/src/component/admin/admin-unimplemented-modal";

export default function AdminSettingsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [actionTitle, setActionTitle] = useState("Save System Configuration");
  const [missingEndpoint, setMissingEndpoint] = useState("PATCH /api/admin/settings");
  const [explanation, setExplanation] = useState(
    "Dynamic system configuration modification is not supported in cyber7-backend. System variables are managed strictly via environment configuration.",
  );

  const handleAction = (title: string, endpoint: string, explainText: string) => {
    setActionTitle(title);
    setMissingEndpoint(endpoint);
    setExplanation(explainText);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Platform Settings & System Controls
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            Inspect platform configuration, environment limits, and security parameters
          </p>
        </div>

        <button
          onClick={() =>
            handleAction(
              "Save System Configuration",
              "PATCH /api/admin/settings",
              "Dynamic runtime settings mutation is not implemented in cyber7-backend. System variables are configured via environment files.",
            )
          }
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
        >
          <Save size={14} />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Backend Status Notice */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-950">
        <div className="flex items-start gap-2.5">
          <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <div>
            <strong className="font-bold">Backend Architecture Notice:</strong>{" "}
            System-wide platform settings are driven by authoritative backend configuration (
            <code>src/config/env.ts</code> and <code>src/modules/billing/billing.config.ts</code>). Dynamic runtime settings mutation via HTTP API is{" "}
            <strong>NOT_IMPLEMENTED</strong> in <code>cyber7-backend</code>. Modifying fields below does not mutate server configuration.
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Currency & Financial Controls */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Financial & Currency Policies
            </h3>
            <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              Locked to BDT
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700">Platform Base Currency</label>
              <input
                type="text"
                disabled
                value="BDT (Bangladeshi Taka)"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 p-2.5 font-medium text-slate-700 cursor-not-allowed"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Authoritative currency is locked to BDT in <code>billing.config.ts</code>.
              </p>
            </div>

            <div>
              <label className="font-semibold text-slate-700">Supported Payment Gateways</label>
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-800">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>bKash Online Payment (Auto Callback Verification)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>City Bank Manual Transfer (Admin Queue Review)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>City Bank Visa/Mastercard</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() =>
                  handleAction(
                    "Test Gateway Health",
                    "GET /api/admin/billing/gateways/health",
                    "Automated payment gateway health probing is not yet implemented on the backend.",
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
              >
                <RefreshCw size={12} />
                <span>Test Payment Gateways</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security & Authentication Policies */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Security & Session Policies
            </h3>
            <span className="rounded bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-800">
              Phase 02B Spec
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700">Admin Cookie Architecture</label>
              <input
                type="text"
                disabled
                value="__Host-vexchat_admin_session (HttpOnly, Secure, SameSite=Strict)"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 p-2.5 font-mono text-[11px] text-slate-700 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700">Idle Inactivity Timeout</label>
                <input
                  type="text"
                  disabled
                  value="15 minutes (Sliding)"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 p-2.5 text-slate-700 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Absolute Session Lifetime</label>
                <input
                  type="text"
                  disabled
                  value="8 hours (Hard Expire)"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 p-2.5 text-slate-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700">High-Value Transfer Step-Up</label>
              <input
                type="text"
                disabled
                value=">= ৳50,000 BDT (Requires TOTP Re-Authentication)"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 p-2.5 text-slate-700 cursor-not-allowed"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={() =>
                  handleAction(
                    "Flush Expired Sessions",
                    "POST /api/admin/auth/sessions/purge",
                    "Database session cleanup cron runs out-of-band and cannot be invoked manually via the client.",
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
              >
                <ShieldCheck size={12} />
                <span>Flush Expired Sessions</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <AdminUnimplementedModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        actionTitle={actionTitle}
        missingEndpoint={missingEndpoint}
        explanation={explanation}
      />
    </div>
  );
}
