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
import AdminUnimplementedModal from "@/src/component/admin/admin-unimplemented-modal";
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

  // Unimplemented modal for mutations / blocked legacy endpoints
  const [mutationModalOpen, setMutationModalOpen] = useState(false);
  const [mutationActionTitle, setMutationActionTitle] = useState("");
  const [missingEndpoint, setMissingEndpoint] = useState("");
  const [mutationExplanation, setMutationExplanation] = useState("");

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

  const handleCloseDrawer = () => {
    setSelectedPayment(null);
  };

  const handleApproveClick = (p: AdminPayment) => {
    setMutationActionTitle("Approve City Bank Transfer");
    setMissingEndpoint(
      "POST /api/admin/billing/bank-transfers/:paymentId/approve",
    );
    setMutationExplanation(
      "City Bank transfer approval is disabled in the Admin Portal. The legacy backend endpoint depends on customer JWT authentication; direct invocation from the Admin Portal is strictly blocked to maintain customer credential isolation until dedicated AdminSession authentication and TOTP step-up (Phase 02B.4/5) are implemented.",
    );
    setMutationModalOpen(true);
  };

  const handleRejectClick = (p: AdminPayment) => {
    setMutationActionTitle("Reject City Bank Transfer");
    setMissingEndpoint(
      "POST /api/admin/billing/bank-transfers/:paymentId/reject",
    );
    setMutationExplanation(
      "City Bank transfer rejection is disabled in the Admin Portal. The legacy backend endpoint depends on customer JWT authentication; direct invocation from the Admin Portal is strictly blocked to maintain customer credential isolation until dedicated AdminSession authentication and TOTP step-up (Phase 02B.4/5) are implemented.",
    );
    setMutationModalOpen(true);
  };

  const handleRefundClick = (p: AdminPayment) => {
    setMutationActionTitle("Refund Payment");
    setMissingEndpoint("POST /api/admin/billing/payments/:paymentId/refund");
    setMutationExplanation(
      "Payment refunds and reverse balance mutations are not implemented in cyber7-backend. Fake balance manipulations are disabled to preserve financial ledger accuracy.",
    );
    setMutationModalOpen(true);
  };

  const handleCustomAction = (
    actionName: string,
    endpoint: string,
    explanationText: string,
  ) => {
    setMutationActionTitle(actionName);
    setMissingEndpoint(endpoint);
    setMutationExplanation(explanationText);
    setMutationModalOpen(true);
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
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isPendingTransfer ? "bg-amber-50/20" : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {p.invoiceNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 truncate">
                          {p.workspaceName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {p.initiatedBy.email}
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
                  {drawerPayment.workspaceName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Initiated By</span>
                <span className="text-slate-800">
                  {drawerPayment.initiatedBy.name} (
                  {drawerPayment.initiatedBy.email})
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
                  onClick={() =>
                    handleCustomAction(
                      "Download Payment Receipt",
                      "GET /api/admin/billing/payments/:paymentId/receipt",
                      "Server-side receipt generation is not implemented in cyber7-backend.",
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-center font-semibold text-slate-700 hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c] cursor-pointer"
                >
                  Download Receipt
                </button>
                <button
                  onClick={() =>
                    handleCustomAction(
                      "View Payment Audit Trail",
                      "GET /api/admin/billing/payments/:paymentId/audit-trail",
                      "Payment audit trail query is not yet exposed via platform admin API.",
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-center font-semibold text-slate-700 hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c] cursor-pointer"
                >
                  Audit Trail
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminDetailDrawer>

      {/* Unimplemented / Blocked Mutation Modal */}
      <AdminUnimplementedModal
        open={mutationModalOpen}
        onClose={() => setMutationModalOpen(false)}
        actionTitle={mutationActionTitle}
        missingEndpoint={missingEndpoint}
        explanation={mutationExplanation}
      />
    </div>
  );
}
