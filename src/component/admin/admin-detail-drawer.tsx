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

  // Keyboard dismiss & body scroll locking
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  const handleCopySubtitle = async () => {
    if (!subtitle) return;

    const textToCopy = subtitle.includes(":")
      ? subtitle.split(":").slice(1).join(":").trim()
      : subtitle;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy identifier:", error);
    }
  };

  const drawerWidthClass = width === "wide" ? "sm:max-w-2xl" : "sm:max-w-lg";

  return (
    <div
      role="dialog"
      aria-modal={open ? "true" : undefined}
      aria-label={title}
      aria-hidden={!open}
      className={`fixed inset-0 z-50 overflow-hidden ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`
          fixed inset-0 bg-slate-900/50 backdrop-blur-[2px]
          transition-opacity duration-300 ease-in-out
          ${open ? "opacity-100" : "opacity-0"}
        `}
      />

      {/* Drawer */}
      <aside
        className={`
          fixed right-0 top-0 bottom-0 z-50
          flex w-full ${drawerWidthClass} flex-col
          border-l border-slate-200 bg-white shadow-2xl

          transform-gpu
          transition-transform duration-300 ease-out
          will-change-transform

          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/50 px-4 py-4 sm:px-6">
          <div className="min-w-0 flex-1 pr-2">
            <h3 className="truncate text-base font-bold text-slate-900">
              {title}
            </h3>

            {subtitle && (
              <div className="mt-1 flex min-w-0 items-center gap-1.5">
                <span className="truncate text-xs font-mono text-slate-500">
                  {subtitle}
                </span>

                <button
                  type="button"
                  onClick={handleCopySubtitle}
                  className="shrink-0 rounded p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                  title="Copy ID to clipboard"
                  aria-label="Copy identifier"
                >
                  {copied ? (
                    <Check size={13} className="text-emerald-600" />
                  ) : (
                    <Copy size={13} />
                  )}
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              shrink-0 rounded-xl border border-slate-200 p-2
              text-slate-400 transition
              hover:bg-slate-100 hover:text-slate-700
              focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]
            "
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain p-4 sm:p-6">
          {children}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 p-4">
          <span className="text-[11px] font-medium text-slate-400">
            ESC to close
          </span>

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-xl border border-slate-200 bg-white
              px-4 py-2 text-xs font-semibold text-slate-700
              shadow-xs transition
              hover:bg-slate-100
              focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]
            "
          >
            Close Panel
          </button>
        </div>
      </aside>
    </div>
  );
}
