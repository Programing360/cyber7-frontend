"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  LogOut,
  Menu,
  ShieldAlert,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import AdminConfirmDialog from "./admin-confirm-dialog";
import { adminToast } from "./admin-toast";
import {
  adminService,
  type AdminSessionProfile,
} from "@/src/services/admin-service";

interface PlatformAdminHeaderProps {
  session?: AdminSessionProfile | null;
  onOpenSidebar: () => void;
}

export default function PlatformAdminHeader({
  session,
  onOpenSidebar,
}: PlatformAdminHeaderProps) {
  const router = useRouter();

  // Profile Dialog State
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  // Logout Flow & Modal States
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleNotificationClick = () => {
    adminToast.info(
      "Platform Notifications",
      "All services and payment webhooks are currently operational with zero critical alerts.",
    );
  };

  const handleProfileClick = () => {
    setProfileDialogOpen(true);
  };

  // আসল লগআউট এক্সিকিউশন ফাংশন
  const executeLogout = async () => {
    try {
      setLoggingOut(true);
      await adminService.logout();
      setConfirmLogoutOpen(false);
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("[PlatformAdminHeader] Logout error:", err);
      setConfirmLogoutOpen(false);
      router.push("/admin/login");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xs sm:px-6 lg:px-8 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c] lg:hidden transition"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight sm:text-lg">
              Platform Administration
            </h1>
            <p className="hidden text-xs text-slate-500 sm:block">
              VexChat Multi-Tenant SaaS Management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {session ? (
            <div className="hidden items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-900 md:flex shadow-xs">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>{session.user.platformRole}</span>
              <span className="text-[11px] font-normal text-emerald-700">
                ({session.user.email})
              </span>
            </div>
          ) : (
            <div className="hidden items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900 md:flex shadow-xs">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span>LOCAL ADMIN PREVIEW — NOT AUTHENTICATED</span>
            </div>
          )}

          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={handleNotificationClick}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c] transition"
              title="System Notifications"
              aria-label="System notifications"
            >
              <Bell size={18} />
            </button>
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#88da1c]" />
          </div>

          {/* Administrator profile */}
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-3 border-l border-slate-200 pl-3 text-left focus:outline-hidden focus:ring-2 focus:ring-[#88da1c] rounded-xl p-1 hover:bg-slate-50 sm:pl-4 transition-colors"
            title="Administrator Profile"
            aria-label="Administrator profile"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-bold shadow-xs shrink-0">
              <User size={18} />
            </div>
            <div className="hidden text-left sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">
                  {session ? session.user.name || "Admin" : "Preview Console"}
                </span>
                {session ? (
                  <ShieldCheck size={14} className="text-emerald-600" />
                ) : (
                  <ShieldAlert size={14} className="text-amber-600" />
                )}
              </div>
              <span className="text-[11px] font-medium text-slate-500">
                {session
                  ? session.user.platformRole
                  : "Unauthenticated Session"}
              </span>
            </div>
          </button>

          {/* Logout Button (Clicking opens confirmation modal) */}
          {session && (
            <button
              onClick={() => setConfirmLogoutOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 focus:outline-hidden focus:ring-2 focus:ring-rose-500 transition cursor-pointer"
              title="Logout Administrator"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {confirmLogoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                <AlertTriangle size={22} />
              </div>
              <button
                onClick={() => !loggingOut && setConfirmLogoutOpen(false)}
                disabled={loggingOut}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4">
              <h3 className="text-base font-bold text-slate-900">
                End Platform Session?
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Are you sure you want to log out? Your secure platform
                administrator session cookies will be revoked immediately.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmLogoutOpen(false)}
                disabled={loggingOut}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-hidden transition disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={executeLogout}
                disabled={loggingOut}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 focus:outline-hidden focus:ring-2 focus:ring-rose-500 transition disabled:opacity-50 cursor-pointer"
              >
                <LogOut size={14} />
                <span>{loggingOut ? "Removing..." : "Remove & Logout"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Profile Dialog */}
      <AdminConfirmDialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        onConfirm={() => setProfileDialogOpen(false)}
        title="Administrator Session Profile"
        description="Active administrative credentials and authentication security details."
        confirmText="Done"
        variant="info"
      >
        <div className="space-y-3 pt-2 text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Email</span>
              <span className="font-semibold text-slate-900">{session?.user.email || "admin@cyber7.io"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Platform Role</span>
              <span className="font-bold text-emerald-700">{session?.user.platformRole || "SUPER_ADMIN"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold uppercase text-[10px]">TOTP MFA</span>
              <span className="font-semibold text-slate-800">
                {session?.mfa.configured ? "Enforced & Active" : "Disabled"}
              </span>
            </div>
            {session?.session?.id && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Session ID</span>
                <span className="font-mono text-[10px] text-slate-600 truncate max-w-[200px]">{session.session.id}</span>
              </div>
            )}
          </div>
        </div>
      </AdminConfirmDialog>
    </>
  );
}
