"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CreditCard,
  Eye,
  HelpCircle,
  Hourglass,
  Info,
  Lock,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import AdminFilters from "@/src/component/admin/admin-filters";
import AdminPagination from "@/src/component/admin/admin-pagination";
import AdminStatusBadge from "@/src/component/admin/admin-status-badge";
import AdminDetailDrawer from "@/src/component/admin/admin-detail-drawer";
import AdminConfirmDialog from "@/src/component/admin/admin-confirm-dialog";
import { adminToast } from "@/src/component/admin/admin-toast";
import { adminService } from "@/src/services/admin-service";
import type { AdminPayment } from "@/src/types/admin";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ড্রয়ার ট্রানজিশন স্মুথ রাখতে ক্যাশড পেমেন্ট অবজেক্ট
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(
    null,
  );
  const [drawerPayment, setDrawerPayment] = useState<AdminPayment | null>(null);

  // Action modal states for mutations
  const [activeAction, setActiveAction] = useState<
    "APPROVE" | "REJECT" | "REFUND" | null
  >(null);
  const [targetPayment, setTargetPayment] = useState<AdminPayment | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [stepUpToken, setStepUpToken] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.listPayments({
        search,
        status: statusFilter,
        method: methodFilter,
        page,
        limit: 10,
      });
      setPayments(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setError("Failed to load payment transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [search, statusFilter, methodFilter, page]);

  // যখন ড্রয়ার ওপেন হবে তখন ডাটা ক্যাশ হবে
  const handleOpenDrawer = (p: AdminPayment) => {
    setSelectedPayment(p);
    setDrawerPayment(p);
  };

  const getWorkspaceDisplayName = (
    p: AdminPayment | null | undefined,
  ): string => {
    if (!p) return "Unknown";
    if (p.workspaceName && p.workspaceName !== "Unknown") return p.workspaceName;
    if (typeof p.workspaceId === "object" && p.workspaceId !== null) {
      if ((p.workspaceId as any).name) return (p.workspaceId as any).name;
    }
    if (typeof p.workspaceId === "string" && p.workspaceId.trim()) {
      return `Workspace (${p.workspaceId.slice(-6)})`;
    }
    return p.workspaceName || "Unknown Workspace";
  };

  const getCustomerDisplayInfo = (
    p: AdminPayment | null | undefined,
  ): { name: string; email: string; phone?: string } => {
    if (!p) return { name: "Unknown", email: "Unknown" };
    const email =
      p.initiatedBy?.email && p.initiatedBy.email !== "Unknown"
        ? p.initiatedBy.email
        : p.customer?.email || "";
    const name =
      p.initiatedBy?.name && p.initiatedBy.name !== "Unknown"
        ? p.initiatedBy.name
        : p.customer?.name || (email ? email.split("@")[0] : "");
    const phone =
      p.initiatedBy?.phoneNumber ||
      p.customer?.phoneNumber ||
      "";

    return {
      name: name || "Unknown Customer",
      email: email || "No email available",
      phone: phone || undefined,
    };
  };

  const handleCloseDrawer = () => {
    setSelectedPayment(null);
  };

  const handleApproveClick = (p: AdminPayment) => {
    setTargetPayment(p);
    setAdminNotes("");
    setStepUpToken("");
    setActiveAction("APPROVE");
  };

  const handleConfirmApprove = async () => {
    if (!targetPayment) return;
    setActionLoading(true);
    try {
      await adminService.approveBankTransfer(targetPayment.id, {
        adminNotes: adminNotes.trim() || undefined,
        stepUpToken: stepUpToken.trim() || undefined,
      });
      adminToast.success(
        "Bank Transfer Approved",
        `Payment for ${getWorkspaceDisplayName(targetPayment)} of BDT ${targetPayment.amount.toLocaleString()} has been approved.`,
      );
      setActiveAction(null);
      setSelectedPayment(null);
      await loadPayments();
    } catch (err: any) {
      adminToast.error(
        "Approval Failed",
        err?.message || "Failed to approve bank transfer.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (p: AdminPayment) => {
    setTargetPayment(p);
    setRejectionReason("");
    setActiveAction("REJECT");
  };

  const handleConfirmReject = async () => {
    if (!targetPayment) return;
    if (!rejectionReason.trim()) {
      adminToast.error("Validation Error", "Rejection reason is required.");
      return;
    }
    setActionLoading(true);
    try {
      await adminService.rejectBankTransfer(targetPayment.id, {
        rejectionReason: rejectionReason.trim(),
      });
      adminToast.success(
        "Bank Transfer Rejected",
        `Payment for ${getWorkspaceDisplayName(targetPayment)} has been rejected.`,
      );
      setActiveAction(null);
      setSelectedPayment(null);
      await loadPayments();
    } catch (err: any) {
      adminToast.error(
        "Rejection Failed",
        err?.message || "Failed to reject bank transfer.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefundClick = (p: AdminPayment) => {
    setTargetPayment(p);
    setRefundReason("");
    setActiveAction("REFUND");
  };

  const handleConfirmRefund = async () => {
    if (!targetPayment) return;
    if (refundReason.trim().length < 3) {
      adminToast.error(
        "Validation Error",
        "Refund reason must be at least 3 characters.",
      );
      return;
    }
    setActionLoading(true);
    try {
      await adminService.refundPayment(targetPayment.id, {
        reason: refundReason.trim(),
      });
      adminToast.success(
        "Payment Refunded",
        `Payment ${targetPayment.invoiceNumber} (${getWorkspaceDisplayName(targetPayment)}) has been marked as refunded.`,
      );
      setActiveAction(null);
      setSelectedPayment(null);
      await loadPayments();
    } catch (err: any) {
      adminToast.error(
        "Refund Failed",
        err?.message || "Failed to refund payment.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadReceipt = async (p: AdminPayment) => {
    try {
      adminToast.info(
        "Preparing Receipt",
        "Generating and downloading PDF receipt...",
      );
      await adminService.downloadReceiptPdf(p.id, p.invoiceNumber);
      adminToast.success("Downloaded", "Receipt PDF downloaded successfully.");
    } catch (err: any) {
      adminToast.error(
        "Download Failed",
        err?.message || "Failed to download payment receipt.",
      );
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setMethodFilter("ALL");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Payment & Bank Transfer Management
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            Review manual City Bank transfers and monitor gateway payments in
            BDT
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
            Backend Status: LIVE_READONLY
          </span>
        </div>
      </div>

      {/* Error state alert */}
      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadPayments}
            className="inline-flex items-center gap-1 font-bold underline hover:no-underline cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Filters */}
      <AdminFilters
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search by invoice number, workspace, or payer email..."
        dropdowns={[
          {
            name: "status",
            label: "Payment Status",
            value: statusFilter,
            options: [
              { label: "All Statuses", value: "ALL" },
              { label: "Pending Verification", value: "PENDING_VERIFICATION" },
              { label: "Completed", value: "COMPLETED" },
              { label: "Failed", value: "FAILED" },
              { label: "Rejected", value: "REJECTED" },
            ],
            onChange: (val) => {
              setStatusFilter(val);
              setPage(1);
            },
          },
          {
            name: "method",
            label: "Method",
            value: methodFilter,
            options: [
              { label: "All Methods", value: "ALL" },
              { label: "City Bank Transfer", value: "CITY_BANK_TRANSFER" },
              { label: "bKash", value: "BKASH" },
              { label: "City Bank Card", value: "CITY_BANK_CARD" },
            ],
            onChange: (val) => {
              setMethodFilter(val);
              setPage(1);
            },
          },
        ]}
        onReset={handleResetFilters}
      />

      {/* Payments Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Invoice #</th>
                <th className="px-6 py-3.5">Workspace & Customer</th>
                <th className="px-6 py-3.5">Method</th>
                <th className="px-6 py-3.5">Plan</th>
                <th className="px-6 py-3.5">Amount (BDT)</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Created</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#88da1c] border-t-transparent" />
                      <span>Loading payments...</span>
                    </div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-2 text-slate-500">
                      <CreditCard size={32} className="text-slate-300" />
                      <span className="font-semibold text-slate-700">
                        No payment records found
                      </span>
                      <p className="text-xs text-slate-400 text-center">
                        No transactions match your search query or selected
                        filters.
                      </p>
                      {(search ||
                        statusFilter !== "ALL" ||
                        methodFilter !== "ALL") && (
                          <button
                            onClick={handleResetFilters}
                            className="mt-2 inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                          >
                            Clear Filters
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const isPendingTransfer =
                    p.status === "PENDING_VERIFICATION" &&
                    p.paymentMethod === "CITY_BANK_TRANSFER";

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 transition-colors ${isPendingTransfer ? "bg-amber-50/20" : ""
                        }`}
                    >
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {p.invoiceNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 truncate">
                          {getWorkspaceDisplayName(p)}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {(() => {
                            const c = getCustomerDisplayInfo(p);
                            return `${c.name} • ${c.email}${c.phone ? ` • ${c.phone}` : ""}`;
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <AdminStatusBadge
                          status={p.paymentMethod}
                          type="paymentMethod"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <AdminStatusBadge status={p.planCode} type="plan" />
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900 whitespace-nowrap">
                        ৳{p.amount.toLocaleString()} BDT
                      </td>
                      <td className="px-6 py-4">
                        <AdminStatusBadge status={p.status} type="payment" />
                      </td>
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDrawer(p)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c] cursor-pointer"
                          >
                            <Eye size={12} />
                            Details
                          </button>

                          {isPendingTransfer ? (
                            <>
                              <button
                                onClick={() => handleApproveClick(p)}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectClick(p)}
                                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400 cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleRefundClick(p)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-slate-300 cursor-pointer"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <AdminPagination
          page={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={10}
          onPageChange={setPage}
          source="LIVE_BACKEND"
        />
      </div>

      {/* Payment Inspect Drawer (Smooth Animated) */}
      <AdminDetailDrawer
        open={Boolean(selectedPayment)}
        onClose={handleCloseDrawer}
        title={`Payment: ${drawerPayment?.invoiceNumber || ""}`}
        subtitle={`Database ID: ${drawerPayment?.id || ""}`}
      >
        {drawerPayment && (
          <div className="space-y-6 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Payment Status
                </span>
                <AdminStatusBadge
                  status={drawerPayment.status}
                  type="payment"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Method
                </span>
                <AdminStatusBadge
                  status={drawerPayment.paymentMethod}
                  type="paymentMethod"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Authorized Amount
                </span>
                <span className="font-black text-slate-900 text-sm">
                  ৳{drawerPayment.amount.toLocaleString()} BDT
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Idempotency Key
                </span>
                <code className="font-mono text-[11px] text-slate-700">
                  {drawerPayment.idempotencyKey}
                </code>
              </div>
            </div>

            {/* City Bank Transfer Specific Metadata */}
            {drawerPayment.paymentMethod === "CITY_BANK_TRANSFER" &&
              drawerPayment.gatewayData?.bankTransfer && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 space-y-2.5">
                  <h4 className="font-bold text-indigo-950 uppercase tracking-wider text-[11px]">
                    City Bank Manual Deposit Slip
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Bank & Branch</span>
                    <span className="font-semibold text-slate-900">
                      {drawerPayment.gatewayData.bankTransfer.bankName} (
                      {drawerPayment.gatewayData.bankTransfer.branchName})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Depositor Account</span>
                    <span className="font-semibold text-slate-900">
                      {drawerPayment.gatewayData.bankTransfer.accountName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Bank Reference #</span>
                    <code className="font-mono font-bold text-indigo-900">
                      {drawerPayment.gatewayData.bankTransfer.referenceNumber}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Deposit Date</span>
                    <span className="text-slate-700">
                      {drawerPayment.gatewayData.bankTransfer.depositDate
                        ? new Date(
                          drawerPayment.gatewayData.bankTransfer.depositDate,
                        ).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              )}

            {/* Payer Information */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Workspace & Initiator
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Workspace</span>
                <span className="font-bold text-slate-900">
                  {getWorkspaceDisplayName(drawerPayment)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Initiated By</span>
                <span className="text-slate-800">
                  {(() => {
                    const c = getCustomerDisplayInfo(drawerPayment);
                    return `${c.name} (${c.email})${c.phone ? ` • ${c.phone}` : ""}`;
                  })()}
                </span>
              </div>
            </div>

            {/* Quick Actions in Drawer */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Payment Actions
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={drawerPayment.status !== "COMPLETED"}
                  onClick={() => handleDownloadReceipt(drawerPayment)}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-center font-semibold text-slate-700 hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Download Receipt
                </button>
                {drawerPayment.status === "COMPLETED" && (
                  <button
                    onClick={() => handleRefundClick(drawerPayment)}
                    className="rounded-xl border border-rose-200 bg-rose-50/50 p-2.5 text-center font-semibold text-rose-700 hover:bg-rose-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500 cursor-pointer"
                  >
                    Refund Payment
                  </button>
                )}
                {drawerPayment.status === "PENDING_VERIFICATION" && (
                  <>
                    <button
                      onClick={() => handleApproveClick(drawerPayment)}
                      className="rounded-xl bg-[#88da1c] p-2.5 text-center font-bold text-slate-950 hover:bg-[#78c418] cursor-pointer"
                    >
                      Approve Transfer
                    </button>
                    <button
                      onClick={() => handleRejectClick(drawerPayment)}
                      className="rounded-xl border border-rose-200 bg-white p-2.5 text-center font-semibold text-rose-700 hover:bg-rose-50 cursor-pointer"
                    >
                      Reject Transfer
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </AdminDetailDrawer>

      {/* Approve Bank Transfer Modal */}
      <AdminConfirmDialog
        open={activeAction === "APPROVE"}
        onClose={() => setActiveAction(null)}
        onConfirm={handleConfirmApprove}
        title="Approve Bank Transfer"
        description={`Are you sure you want to approve this deposit of BDT ${targetPayment?.amount.toLocaleString()} for workspace "${getWorkspaceDisplayName(targetPayment)}"? This will activate their subscription immediately.`}
        confirmText="Approve Deposit"
        isLoading={actionLoading}
        variant="primary"
      >
        <div className="space-y-3 mt-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700">
              Admin Verification Notes (Optional)
            </label>
            <input
              type="text"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g., Bank statement verified against slip"
              className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
            />
          </div>
          {(targetPayment?.amount || 0) >= 50000 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
              <label className="font-bold">
                High-Value Transfer Step-Up Token (Required for &gt;= 50,000
                BDT)
              </label>
              <input
                type="text"
                value={stepUpToken}
                onChange={(e) => setStepUpToken(e.target.value)}
                placeholder="Enter step-up TOTP authorization token"
                className="mt-1 w-full rounded-xl border border-amber-300 bg-white p-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>
          )}
        </div>
      </AdminConfirmDialog>

      {/* Reject Bank Transfer Modal */}
      <AdminConfirmDialog
        open={activeAction === "REJECT"}
        onClose={() => setActiveAction(null)}
        onConfirm={handleConfirmReject}
        title="Reject Bank Transfer"
        description={`Reject deposit of BDT ${targetPayment?.amount.toLocaleString()} for workspace "${getWorkspaceDisplayName(targetPayment)}". Please provide a clear explanation.`}
        confirmText="Reject Transfer"
        isLoading={actionLoading}
        variant="destructive"
      >
        <div className="mt-3 text-xs">
          <label className="font-semibold text-slate-700">
            Rejection Reason *
          </label>
          <textarea
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g., Deposit reference number not found in bank statement"
            className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </AdminConfirmDialog>

      {/* Refund Payment Modal */}
      <AdminConfirmDialog
        open={activeAction === "REFUND"}
        onClose={() => setActiveAction(null)}
        onConfirm={handleConfirmRefund}
        title="Refund Completed Payment"
        description={`Issue a refund for payment #${targetPayment?.invoiceNumber} (${getWorkspaceDisplayName(targetPayment)}) of BDT ${targetPayment?.amount.toLocaleString()}. This action updates the financial ledger.`}
        confirmText="Confirm Refund"
        isLoading={actionLoading}
        variant="destructive"
      >
        <div className="mt-3 text-xs">
          <label className="font-semibold text-slate-700">
            Refund Reason *
          </label>
          <textarea
            rows={3}
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            placeholder="Reason for issuing this refund"
            className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </AdminConfirmDialog>
    </div>
  );
}
