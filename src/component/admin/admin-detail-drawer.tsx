"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Check, Copy, X } from "lucide-react";

interface AdminDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: "default" | "wide";
}

export default function AdminDetailDrawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = "default",
}: AdminDetailDrawerProps) {
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

  const handleCopySubtitle = () => {
    if (!subtitle) return;
    // Extract ID or copy raw string
    const textToCopy = subtitle.includes(":")
      ? subtitle.split(":")[1].trim()
      : subtitle;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const drawerWidthClass =
    width === "wide"
      ? "sm:max-w-2xl"
      : "sm:max-w-lg";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 flex w-full ${drawerWidthClass} flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6 bg-slate-50/50">
          <div className="min-w-0 pr-3">
            <h3 className="truncate text-base font-bold text-slate-900">
              {title}
            </h3>
            {subtitle && (
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="truncate text-xs font-mono text-slate-500">
                  {subtitle}
                </span>
                <button
                  onClick={handleCopySubtitle}
                  className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
                  title="Copy ID to clipboard"
                  aria-label="Copy identifier"
                >
                  {copied ? (
                    <Check size={12} className="text-emerald-600" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c] transition"
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {children}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">
            ESC to close
          </span>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#88da1c] transition"
          >
            Close Panel
          </button>
        </div>
      </aside>
    </div>
  );
}
