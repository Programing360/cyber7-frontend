"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Lock, ShieldAlert, X } from "lucide-react";

interface AdminUnimplementedModalProps {
  open: boolean;
  onClose: () => void;
  actionTitle: string;
  missingEndpoint?: string;
  explanation?: string;
  scheduledPhase?: string;
}

export default function AdminUnimplementedModal({
  open,
  onClose,
  actionTitle,
  missingEndpoint,
  explanation,
  scheduledPhase,
}: AdminUnimplementedModalProps) {
  const [copied, setCopied] = useState(false);

  // Keyboard dismiss (Escape) & body scroll locking
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleCopyEndpoint = () => {
    if (!missingEndpoint) return;
    navigator.clipboard.writeText(missingEndpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="unimplemented-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shrink-0 border border-amber-100">
            <Lock size={24} />
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c] transition"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4">
          <h3
            id="unimplemented-modal-title"
            className="text-base font-bold text-slate-900"
          >
            Action Unavailable: {actionTitle}
          </h3>
          <p className="mt-2 text-xs leading-5 text-slate-600">
            {explanation ||
              "This administrative mutation is disabled because the corresponding backend endpoint is not yet implemented in cyber7-backend."}
          </p>

          {missingEndpoint && (
            <div className="mt-3.5 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Missing Backend Endpoint
                </span>
                <button
                  onClick={handleCopyEndpoint}
                  className="inline-flex items-center gap-1 rounded bg-amber-200/60 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900 hover:bg-amber-200 transition"
                  title="Copy endpoint"
                >
                  {copied ? (
                    <>
                      <Check size={11} className="text-emerald-700" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={11} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="mt-1 font-mono text-xs font-semibold text-amber-950 break-all">
                {missingEndpoint}
              </p>
            </div>
          )}

          {scheduledPhase && (
            <div className="mt-2 text-[11px] font-medium text-slate-500">
              Scheduled for implementation in:{" "}
              <strong className="text-slate-700">{scheduledPhase}</strong>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-[11px] text-slate-600">
            <ShieldAlert size={16} className="text-amber-600 shrink-0" />
            <span>
              Simulated or fake mutations are strictly prohibited to preserve
              authoritative system integrity.
            </span>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#88da1c] transition"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
