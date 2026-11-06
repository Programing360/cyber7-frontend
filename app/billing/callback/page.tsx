"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import DashboardLayout from "@/src/component/dashboard/dashboard-layout";
import { useWorkspace } from "@/src/context/workspace-context";
import { billingService } from "@/src/services/billing-service";
import type { PaymentItem } from "@/src/types/billing";

const MAX_POLL_ATTEMPTS = 5;
const POLL_INTERVAL_MS = 2000;

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const { activeWorkspace, isLoading: isWorkspaceLoading } = useWorkspace();

  // Capture public reference keys from initial URL (status query parameter is strictly ignored)
  const initialPaymentId = useRef(searchParams.get("paymentId") || "").current;
  const initialInvoiceNumber = useRef(searchParams.get("invoiceNumber") || "").current;

  const [isVerifying, setIsVerifying] = useState(true);
  const [pollAttempt, setPollAttempt] = useState(0);
  const [verifiedPayment, setVerifiedPayment] = useState<PaymentItem | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [finalStatus, setFinalStatus] = useState<
    "VERIFIED_SUCCESS" | "VERIFIED_FAILED" | "PENDING_VERIFICATION" | "INVALID"
  >("PENDING_VERIFICATION");

  // 1. Immediately sanitize browser URL on load: remove all query parameters from address bar & history
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  // 2. Authoritative payment status polling via authenticated read-only endpoint
  const checkStatus = useCallback(async () => {
    if (isWorkspaceLoading) return;

    if (!activeWorkspace) {
      setIsVerifying(false);
      setErrorMessage("Please ensure you are signed in to your workspace.");
      return;
    }

    // Role check: Only Owner and Admin can access billing data
    const isOwnerOrAdmin =
      activeWorkspace.role === "OWNER" || activeWorkspace.role === "ADMIN";
    if (!isOwnerOrAdmin) {
      setIsVerifying(false);
      setFinalStatus("PENDING_VERIFICATION");
      setErrorMessage(
        "Payment verification requires workspace Owner or Admin authorization.",
      );
      return;
    }

    setIsVerifying(true);
    setErrorMessage("");

    let stopped = false;

    for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt++) {
      setPollAttempt(attempt);

      try {
        // Read-only overview fetch contains authoritative recent payments
        const overview = await billingService.getOverview(activeWorkspace.id);

        const matchedPayment = overview.recentPayments.find(
          (p) =>
            (initialPaymentId && p._id === initialPaymentId) ||
            (initialInvoiceNumber && p.invoiceNumber === initialInvoiceNumber),
        );

        if (matchedPayment) {
          setVerifiedPayment(matchedPayment);

          if (matchedPayment.status === "COMPLETED") {
            setFinalStatus("VERIFIED_SUCCESS");
            stopped = true;
            break;
          } else if (matchedPayment.status === "FAILED") {
            setFinalStatus("VERIFIED_FAILED");
            setErrorMessage(
              matchedPayment.failureReason ||
                "Payment was rejected or expired by gateway.",
            );
            stopped = true;
            break;
          } else if (matchedPayment.status === "CANCELLED") {
            setFinalStatus("VERIFIED_FAILED");
            setErrorMessage("Transaction was cancelled on the gateway.");
            stopped = true;
            break;
          } else {
            // INITIATED or PENDING_VERIFICATION: continue polling
            setFinalStatus("PENDING_VERIFICATION");
          }
        } else {
          // Payment record not yet visible in recent list: remain in pending state
          setFinalStatus("PENDING_VERIFICATION");
        }
      } catch (err: unknown) {
        // On network error or 404, strictly remain in pending state; never declare failure
        setFinalStatus("PENDING_VERIFICATION");
        setErrorMessage(
          "Reconciliation with payment gateway is in progress. Please check again shortly.",
        );
      }

      if (attempt < MAX_POLL_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }
    }

    if (!stopped) {
      setIsVerifying(false);
      setFinalStatus("PENDING_VERIFICATION");
      setErrorMessage(
        "Gateway verification is taking longer than usual. Your subscription will be unlocked automatically once settlement confirms.",
      );
    } else {
      setIsVerifying(false);
    }
  }, [activeWorkspace, isWorkspaceLoading, initialPaymentId, initialInvoiceNumber]);

  useEffect(() => {
    if (!isWorkspaceLoading && activeWorkspace) {
      checkStatus();
    }
  }, [activeWorkspace, isWorkspaceLoading, checkStatus]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        {isVerifying ? (
          <div className="space-y-5 py-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Loader2 size={36} className="animate-spin" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Verifying Payment with Server...
              </h2>
              <p className="mt-2 text-sm text-slate-500 max-w-xs mx-auto">
                Authoritative verification in progress (attempt {pollAttempt} of{" "}
                {MAX_POLL_ATTEMPTS}).
              </p>
            </div>
          </div>
        ) : finalStatus === "VERIFIED_SUCCESS" ? (
          <div className="space-y-6 py-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={38} />
            </div>

            <div className="space-y-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                AUTHORITATIVE VERIFICATION PASSED
              </span>
              <h2 className="text-2xl font-bold text-slate-900">
                Payment Confirmed!
              </h2>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                Your subscription has been successfully activated and all workspace
                features are unlocked.
              </p>
            </div>

            {/* Receipt Summary */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Number:</span>
                <span className="font-mono font-bold text-slate-800">
                  {verifiedPayment?.invoiceNumber || initialInvoiceNumber || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Plan Code:</span>
                <span className="font-semibold text-slate-800">
                  {verifiedPayment?.planName || "Plan Subscription"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-slate-900">
                  {verifiedPayment ? `৳ ${verifiedPayment.amount.toLocaleString()} BDT` : "—"}
                </span>
              </div>
              {verifiedPayment?.gatewayData?.trxID && (
                <div className="flex justify-between border-t border-slate-200/60 pt-2">
                  <span className="text-slate-500">Gateway TRX ID:</span>
                  <span className="font-mono text-emerald-800 font-semibold">
                    {verifiedPayment.gatewayData.trxID}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/billing"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                Billing Overview
              </Link>
              <Link
                href="/inbox"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#88da1c] px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-[#7bc819] transition"
              >
                Go to Inbox
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : finalStatus === "PENDING_VERIFICATION" ? (
          <div className="space-y-6 py-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Clock size={36} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">
                Payment Verification in Progress
              </h2>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                We received your return from checkout. Our server is awaiting authoritative
                confirmation from the gateway.
              </p>
            </div>

            {errorMessage && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800 text-left">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={checkStatus}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <RefreshCw size={15} />
                Check Status Again
              </button>
              <Link
                href="/billing"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                Go to Billing
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-700">
              <XCircle size={38} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">
                Payment Incomplete
              </h2>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                {errorMessage ||
                  "The checkout session was not completed successfully or was cancelled."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 text-left space-y-1">
              <p className="font-semibold text-slate-800">No Subscription Debited</p>
              <p>
                Your card or wallet was not charged, or if a temporary hold occurred, it
                will be automatically released by the payment provider. You may try again at any time.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/billing"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                Try Again
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="min-h-[80vh] flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-emerald-600" />
          </div>
        }
      >
        <PaymentCallbackContent />
      </Suspense>
    </DashboardLayout>
  );
}

