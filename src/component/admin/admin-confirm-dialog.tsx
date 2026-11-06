"use client";

import { useEffect, type ReactNode } from "react";
import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";

interface AdminConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  variant?: "destructive" | "warning" | "primary";
  isLoading?: boolean;
  children?: ReactNode;
}

export default function AdminConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  variant,
  isLoading = false,
  children,
}: AdminConfirmDialogProps) {
  // Determine effective visual variant
  const effectiveVariant =
    variant || (isDestructive ? "destructive" : "primary");

  // Keyboard dismiss (Escape) & body scroll locking
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
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
  }, [open, onClose, isLoading]);

  if (!open) return null;

  const renderIcon = () => {
    switch (effectiveVariant) {
      case "destructive":
        return (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shrink-0 border border-rose-100">
            <AlertCircle size={22} />
          </div>
        );
      case "warning":
        return (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shrink-0 border border-amber-100">
            <AlertTriangle size={22} />
          </div>
        );
      case "primary":
      default:
        return (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shrink-0 border border-emerald-100">
            <Info size={22} />
          </div>
        );
    }
  };

  const getConfirmButtonClasses = () => {
    switch (effectiveVariant) {
      case "destructive":
        return "bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-400 focus:ring-rose-500";
      case "warning":
        return "bg-amber-600 text-white hover:bg-amber-700 disabled:bg-amber-400 focus:ring-amber-500";
      case "primary":
      default:
        return "bg-[#88da1c] text-slate-950 font-bold hover:bg-[#78c418] disabled:bg-slate-300 focus:ring-[#88da1c]";
    }
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={() => {
        if (!isLoading) onClose();
      }}
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          {renderIcon()}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4">
          <h3
            id="confirm-dialog-title"
            className="text-base font-bold text-slate-900"
          >
            {title}
          </h3>
          <p
            id="confirm-dialog-description"
            className="mt-1.5 text-xs leading-5 text-slate-600"
          >
            {description}
          </p>
          {children && <div className="mt-3.5">{children}</div>}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 focus:outline-hidden focus:ring-2 focus:ring-slate-300 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs focus:outline-hidden focus:ring-2 focus:ring-offset-2 transition-colors ${getConfirmButtonClasses()}`}
          >
            {isLoading && (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
