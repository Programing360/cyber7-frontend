"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  CreditCard,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LineChart,
  LogOut,
  Repeat,
  Settings,
  Shield,
  Users,
  X,
  UserCheck,
  MessageCircle,
} from "lucide-react";
import {
  adminService,
  type AdminSessionProfile,
} from "@/src/services/admin-service";

interface PlatformAdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string | null;
  requiredRole?: "SUPER_ADMIN" | "FINANCE_ADMIN";
}

const navItems: NavItem[] = [
  {
    name: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Workspaces",
    href: "/admin/workspaces",
    icon: Building2,
  },
  {
    name: "Platform Users",
    href: "/admin/users",
    icon: Users,
    requiredRole: "SUPER_ADMIN",
  },
  {
    name: "WhatsAPP INBOX",
    href: "/admin/inbox",
    icon: MessageCircle,
  },
  {
    name: "Subscriptions & Plans",
    href: "/admin/subscriptions",
    icon: Repeat,
  },
  {
    name: "Payments & Transfers",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    name: "Invoices",
    href: "/admin/invoices",
    icon: FileText,
  },
  {
    name: "Platform Analytics",
    href: "/admin/analytics",
    icon: LineChart,
  },
  // {
  //   name: "Audit Logs",
  //   href: "/admin/audit-logs",
  //   icon: Shield,
  //   requiredRole: "SUPER_ADMIN",
  // },
  {
    name: "Support Tickets",
    href: "/admin/support",
    icon: HelpCircle,
    badge: "Planned",
  },
  {
    name: "Platform Settings",
    href: "/admin/settings",
    icon: Settings,
    badge: "Planned",
  },
];

export default function PlatformAdminSidebar({
  open,
  onClose,
}: PlatformAdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<AdminSessionProfile | null>(null);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // লাইভ অ্যাডমিন প্রোফাইল লোড করা
  useEffect(() => {
    adminService
      .getAdminSession()
      .then((data) => setProfile(data))
      .catch(() => {
        // সেশন না থাকলে বা এরর হলে সাইলেন্টলি হ্যান্ডল করা
      });
  }, []);

  // Escape key listener & mobile body scroll locking
  useEffect(() => {
    if (!open && !confirmLogoutOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirmLogoutOpen) {
          setConfirmLogoutOpen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose, confirmLogoutOpen]);

  // লগআউট নিশ্চিতকরণ হ্যান্ডলার
  const executeLogout = async () => {
    try {
      setLoggingOut(true);
      await adminService.logout();
      setConfirmLogoutOpen(false);
      onClose();
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
      setConfirmLogoutOpen(false);
      router.push("/admin/login");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-[270px] flex-col bg-[#0f172a] text-slate-300 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
        aria-label="Platform Admin Navigation"
      >
        {/* Brand header */}
        <div className="flex h-[72px] items-center justify-between border-b border-slate-800 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#88da1c] font-black text-black shadow-md">
              <Shield size={20} className="text-black" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">
                VexChat
              </span>
              <span className="ml-1.5 rounded-md bg-[#88da1c]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#88da1c] uppercase tracking-wider">
                Admin
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-hidden focus:ring-2 focus:ring-[#88da1c] lg:hidden transition cursor-pointer"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Admin Profile Status Card */}
        <div className="mx-4 mt-4 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Control Panel
            </span>
            <span className="flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
          {profile?.user ? (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                <UserCheck size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-200">
                  {profile.user.name || profile.user.email}
                </p>
                <p className="text-[10px] font-medium text-[#88da1c]">
                  {profile.user.platformRole}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-xs text-slate-400 font-medium">
              Checking session authorization...
            </p>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 overflow-y-auto overscroll-contain px-4 py-4">
          <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Platform Modules
          </div>
          {navItems.map((item) => {
            if (
              item.requiredRole &&
              profile?.user?.platformRole !== item.requiredRole &&
              profile?.user?.platformRole !== "SUPER_ADMIN"
            ) {
              return null;
            }

            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href + "/"));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#88da1c] ${
                  isActive
                    ? "bg-[#88da1c] text-black font-semibold shadow-xs"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={
                      isActive
                        ? "text-black"
                        : "text-slate-400 group-hover:text-slate-200 transition-colors"
                    }
                  />
                  <span className={isActive ? "text-black" : ""}>
                    {item.name}
                  </span>
                </div>
                {item.badge && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                      isActive
                        ? "bg-black/15 text-black"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="border-t border-slate-800 p-4 space-y-2">
          <button
            type="button"
            onClick={() => setConfirmLogoutOpen(true)}
            disabled={loggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 focus:outline-hidden focus:ring-2 focus:ring-rose-500 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Logout Admin Session</span>
          </button>

          <Link
            href="/dashboard"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <span>Return to Customer App</span>
          </Link>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {confirmLogoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-2xl transition-all">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertTriangle size={22} />
              </div>
              <button
                type="button"
                onClick={() => !loggingOut && setConfirmLogoutOpen(false)}
                disabled={loggingOut}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4">
              <h3 className="text-base font-bold text-white tracking-tight">
                End Platform Session?
              </h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Are you sure you want to log out? Your secure platform
                administrator session cookies will be revoked immediately.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmLogoutOpen(false)}
                disabled={loggingOut}
                className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white focus:outline-hidden transition disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={executeLogout}
                disabled={loggingOut}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-500 focus:outline-hidden focus:ring-2 focus:ring-rose-500 transition disabled:opacity-50 cursor-pointer"
              >
                <LogOut size={14} />
                <span>{loggingOut ? "Removing..." : "Remove & Logout"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
