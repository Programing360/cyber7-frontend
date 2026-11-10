"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import PlatformAdminSidebar from "@/src/component/admin/platform-admin-sidebar";
import PlatformAdminHeader from "@/src/component/admin/platform-admin-header";
import { AdminToastContainer } from "@/src/component/admin/admin-toast";
import {
  adminService,
  type AdminSessionProfile,
} from "@/src/services/admin-service";

export default function PlatformAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AdminSessionProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // লগইন বা বুটস্ট্র্যাপ পেজে গার্ড চলবে না
  const isAuthPage =
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/admin/bootstrap");

  useEffect(() => {
    if (isAuthPage) {
      setLoading(false);
      return;
    }

    // console.log(session);

    let isMounted = true;

    // সরাসরি adminService ব্যবহার করে ব্রাউজার কুকি সহ কল করা হচ্ছে
    adminService
      .getAdminSession()
      .then((data) => {
        if (isMounted) {
          setSession(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          // console.log(err);
          const errorMsg =
            err instanceof Error ? err.message : "Not authenticated";
          console.warn(
            "[AdminAuthGuard] Not authenticated as platform admin, redirecting to login:",
            errorMsg,
          );
          router.replace("/admin/login");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [router, isAuthPage]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090d16]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#88da1c] border-t-transparent" />
          <span className="text-xs font-semibold text-slate-400">
            Verifying Platform Admin Session...
          </span>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <PlatformAdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col lg:pl-[270px]">
        <PlatformAdminHeader
          session={session}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
        <main
          className={`flex-1 ${
            pathname.startsWith("/admin/inbox")
              ? "p-2 sm:p-4 lg:p-5"
              : "p-6"
          }`}
        >
          {children}
        </main>
      </div>
      <AdminToastContainer />
    </div>
  );
}
