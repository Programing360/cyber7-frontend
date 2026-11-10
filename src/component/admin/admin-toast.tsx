"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

const TOAST_EVENT = "vexchat_admin_toast";

export const adminToast = {
  success: (title: string, description?: string, duration = 4000) => {
    if (typeof window === "undefined") return;
    const toast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type: "success",
      title,
      description,
      duration,
    };
    window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: toast }));
  },
  error: (title: string, description?: string, duration = 5000) => {
    if (typeof window === "undefined") return;
    const toast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type: "error",
      title,
      description,
      duration,
    };
    window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: toast }));
  },
  info: (title: string, description?: string, duration = 4000) => {
    if (typeof window === "undefined") return;
    const toast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type: "info",
      title,
      description,
      duration,
    };
    window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: toast }));
  },
};

export function AdminToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToastMessage>;
      if (!customEvent.detail) return;

      const newToast = customEvent.detail;
      setToasts((prev) => [...prev, newToast]);

      const timeout = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, newToast.duration || 4000);

      return () => clearTimeout(timeout);
    };

    window.addEventListener(TOAST_EVENT, handleToast);
    return () => window.removeEventListener(TOAST_EVENT, handleToast);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-lg backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-5 ${
            t.type === "success"
              ? "border-emerald-200 bg-emerald-50/95 text-emerald-900 shadow-emerald-900/5"
              : t.type === "error"
                ? "border-rose-200 bg-rose-50/95 text-rose-900 shadow-rose-900/5"
                : "border-blue-200 bg-blue-50/95 text-blue-900 shadow-blue-900/5"
          }`}
        >
          {t.type === "success" && (
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0 text-emerald-600"
            />
          )}
          {t.type === "error" && (
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-600" />
          )}
          {t.type === "info" && (
            <Info size={18} className="mt-0.5 shrink-0 text-blue-600" />
          )}

          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-bold leading-tight">{t.title}</h5>
            {t.description && (
              <p className="mt-1 text-[11px] opacity-80 leading-snug break-words">
                {t.description}
              </p>
            )}
          </div>

          <button
            onClick={() => removeToast(t.id)}
            className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-black/5"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
