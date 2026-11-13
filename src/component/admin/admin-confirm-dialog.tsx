"use client";

import { useEffect, useId, type ReactNode } from "react";
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
  variant?: "destructive" | "warning" | "primary" | "info" | "danger";
  isLoading?: boolean;
  loading?: boolean;
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
  loading = false,
  children,
}: AdminConfirmDialogProps) {
  const effectiveLoading = isLoading || loading;

  // Generate unique IDs for multiple dialog instances.
  const generatedId = useId().replace(/:/g, "");
  const titleId = `confirm-dialog-title-${generatedId}`;
  const descriptionId = `confirm-dialog-description-${generatedId}`;

  // Normalize visual variants.
  const normalizedVariant =
    variant === "info"
      ? "primary"
      : variant === "danger"
        ? "destructive"
        : variant;

  const effectiveVariant =
    normalizedVariant || (isDestructive ? "destructive" : "primary");

  // Escape key handling and body scroll locking.
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !effectiveLoading) {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose, effectiveLoading]);

  const renderIcon = () => {
    switch (effectiveVariant) {
      case "destructive":
        return (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-600">
            <AlertCircle size={22} />
          </div>
        );

      case "warning":
        return (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-600">
            <AlertTriangle size={22} />
          </div>
        );

      case "primary":
      default:
        return (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-700">
            <Info size={22} />
          </div>
        );
    }
  };

  const getConfirmButtonClasses = () => {
    switch (effectiveVariant) {
      case "destructive":
        return "bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-400 focus-visible:ring-rose-500";

      case "warning":
        return "bg-amber-600 text-white hover:bg-amber-700 disabled:bg-amber-400 focus-visible:ring-amber-500";

      case "primary":
      default:
        return "bg-[#88da1c] font-bold text-slate-950 hover:bg-[#78c418] disabled:bg-slate-300 focus-visible:ring-[#88da1c]";
    }
  };

  return (
    <div
      aria-hidden={!open}
      inert={!open}
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        transition-opacity duration-300 ease-out
        motion-reduce:transition-none
        ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }
      `}
      onClick={() => {
        if (!effectiveLoading) {
          onClose();
        }
      }}
    >
      {/* Backdrop */}
      <div
        className={`
          absolute inset-0 bg-slate-900/60 backdrop-blur-sm
          transition-opacity duration-300 ease-out
          motion-reduce:transition-none
          ${open ? "opacity-100" : "opacity-0"}
        `}
      />

      {/* Dialog */}
      <div
        role="alertdialog"
        aria-modal={open ? true : undefined}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={`
          relative z-10 w-full max-w-md
          max-h-[90vh] overflow-y-auto
          rounded-2xl border border-slate-200
          bg-white p-5 shadow-2xl sm:p-6
          transform-gpu
          transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          motion-reduce:transition-none
          ${
            open
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-4 scale-95 opacity-0"
          }
        `}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          {renderIcon()}

          <button
            type="button"
            onClick={onClose}
            disabled={effectiveLoading}
            className="
              rounded-lg p-1 text-slate-400
              transition-colors
              hover:bg-slate-100 hover:text-slate-700
              disabled:cursor-not-allowed disabled:opacity-50
              focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]
            "
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4">
          <h3 id={titleId} className="text-base font-bold text-slate-900">
            {title}
          </h3>

          <p
            id={descriptionId}
            className="mt-1.5 text-xs leading-5 text-slate-600"
          >
            {description}
          </p>

          {children && <div className="mt-3.5">{children}</div>}
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={effectiveLoading}
            className="
              rounded-xl border border-slate-200
              px-4 py-2 text-xs font-semibold text-slate-700
              transition-colors
              hover:bg-slate-50
              disabled:cursor-not-allowed disabled:opacity-50
              focus:outline-hidden focus:ring-2 focus:ring-slate-300
            "
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={effectiveLoading}
            className={`
              flex items-center gap-2 rounded-xl
              px-4 py-2 text-xs font-semibold shadow-xs
              transition-colors
              disabled:cursor-not-allowed disabled:opacity-70
              focus:outline-hidden focus:ring-2 focus:ring-offset-2
              ${getConfirmButtonClasses()}
            `}
          >
            {effectiveLoading && (
              <span
                className="
                  h-3 w-3 animate-spin rounded-full
                  border-2 border-current border-t-transparent
                "
              />
            )}

            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
