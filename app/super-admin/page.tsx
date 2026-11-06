"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useAuth } from "@/src/context/auth-context";

/**
 * Super Admin Route Containment (Phase 02A)
 *
 * Enforces a strict default-deny boundary:
 * 1. Does not trust client-supplied roles, query parameters, or localStorage overrides.
 * 2. In the current frontend authentication contract, verified platform-level authorization
 *    signals are not present. Access is therefore strictly denied by default for all users
 *    (including workspace OWNER, ADMIN, and AGENT).
 * 3. Immediately triggers a client-side redirect to `/dashboard`.
 * 4. Renders an explicit, secure Access Denied view to prevent rendering any mock platform data.
 */
export default function SuperAdminPage() {
  const router = useRouter();
  const { isLoading } = useAuth();

  useEffect(() => {
    // Default-deny: In the current contract, no verified platform-level authorization exists.
    // Immediately redirect caller to customer dashboard.
    if (!isLoading) {
      router.replace("/dashboard");
    }
  }, [isLoading, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7f9f4] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <ShieldAlert size={28} />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Access Restricted
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Platform administration is not accessible from the client dashboard.
          Workspace roles do not grant platform administrative privileges.
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-[#88da1c] px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-[#78c418]"
          >
            <ArrowLeft size={16} />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
