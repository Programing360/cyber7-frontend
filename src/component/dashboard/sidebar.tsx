"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Zap } from "lucide-react";
import { navigationGroups } from "@/src/lib/navigation";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-white/10 bg-[#111827] text-white transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/10 px-5">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 shadow-lg shadow-green-500/20">
              <MessageCircle size={23} className="text-white" />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">Cyber7</h1>
              <p className="text-[11px] text-slate-400">Business Messaging</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Workspace badge */}
        {/* <div className="mx-4 mt-5 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/15">
            <Zap size={18} className="text-green-400" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">Demo Workspace</p>
            <p className="mt-0.5 text-xs text-slate-400">Free Trial Plan</p>
          </div>

          <span className="h-2 w-2 rounded-full bg-green-400" />
        </div> */}

        {/* Navigation */}
        <nav className="custom-scrollbar flex-1 overflow-y-auto px-3 py-5">
          {navigationGroups.map((group) => (
            <div key={group.title} className="mb-6">
              <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.15em] text-slate-500">
                {group.title}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      pathname.startsWith(`${item.href}/`));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`group flex items-center gap-3 rounded-3xl px-3 py-2.5 text-[13px] font-medium transition-colors ${
                        isActive
                          ? "bg-[#88da1c] text-black  shadow-md shadow-green-950/20"
                          : "text-slate-400 hover:bg-white/20 hover:text-white"
                      }`}
                    >
                      <Icon
                        size={18}
                        
                        className={`shrink-0 ${isActive && "text-black "}`}
                      />

                      <span
                        className={`min-w-0 flex-1 ${
                          isActive ? "text-black font-semibold" : ""
                        }`}
                      >
                        {item.label}
                      </span>

                      {/* {item.badge && (
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-green-500/15 text-green-400"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )} */}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-white/10 p-4">
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-xs font-semibold text-white">
              Need more features?
            </p>

            <p className="mt-1 text-[11px] leading-5 text-slate-400">
              Upgrade your workspace to unlock more capabilities.
            </p>

            <button
              type="button"
              className="mt-3 w-full rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-900 transition hover:bg-green-50"
            >
              Explore Plans
            </button>
          </div>

          {/* <p className="mt-4 text-center text-[10px] text-slate-500">
            Cyber7 Demo · v0.1.0
          </p> */}
        </div>
      </aside>
    </>
  );
}
