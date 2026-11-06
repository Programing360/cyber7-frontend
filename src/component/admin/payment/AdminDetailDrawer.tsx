"use client";

import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";

interface AdminDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function AdminDetailDrawer({
  open,
  onClose,
  title,
  subtitle,
  children,
}: AdminDetailDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  // স্মুথ এন্টার ও এক্সিট ট্রানজিশন হ্যান্ডলিং
  useEffect(() => {
    if (open) {
      setMounted(true);
      // ছোট ডিলে দিয়ে ব্রাউজারকে ডমে এলিমেন্ট রেন্ডার করার পর ট্রানজিশন ট্রিগার করানো
      const timer = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
      // ট্রানজিশন শেষ হওয়া পর্যন্ত (300ms) অপেক্ষা করে ডম থেকে আনমাউন্ট করা
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Escape key প্রেস করলে ক্লোজ হওয়া এবং স্ক্রল লক
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop (Smooth Fade Transition) */}
      <div
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        {/* Drawer Panel (Smooth Slide-in Transition from Right) */}
        <div
          className={`w-screen max-w-md transform bg-white shadow-2xl transition-transform duration-300 ease-out ${
            visible ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div className="min-w-0 flex-1 pr-4">
                <h3 className="truncate text-base font-bold text-slate-900">
                  {title}
                </h3>
                {subtitle && (
                  <p className="mt-0.5 truncate text-xs text-slate-500 font-mono">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c] transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 overscroll-contain">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
