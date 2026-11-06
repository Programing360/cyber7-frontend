"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Eye,
  FileText,
  Mail,
  Printer,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import AdminFilters from "@/src/component/admin/admin-filters";
import AdminPagination from "@/src/component/admin/admin-pagination";
import AdminStatusBadge from "@/src/component/admin/admin-status-badge";
import AdminDetailDrawer from "@/src/component/admin/admin-detail-drawer";
import AdminUnimplementedModal from "@/src/component/admin/admin-unimplemented-modal";
import { adminService } from "@/src/services/admin-service";
import type { AdminInvoice } from "@/src/types/admin";

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedInvoice, setSelectedInvoice] = useState<AdminInvoice | null>(
    null,
  );
  const [mutationModalOpen, setMutationModalOpen] = useState(false);
  const [modalActionTitle, setModalActionTitle] = useState("Export Official PDF");
  const [modalMissingEndpoint, setModalMissingEndpoint] = useState(
    "GET /api/admin/billing/invoices/:invoiceId/pdf",
  );
  const [modalExplanation, setModalExplanation] = useState(
    "Server-side PDF invoice rendering is not yet implemented in cyber7-backend. Only structured JSON invoice models are supported.",
  );

  const loadInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.listInvoices({
        search,
        page,
        limit: 10,
      });
      setInvoices(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setError("Failed to load invoice records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [search, page]);

  const handleAction = (title: string, endpoint: string, explanation: string) => {
    setModalActionTitle(title);
    setModalMissingEndpoint(endpoint);
    setModalExplanation(explanation);
    setMutationModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearch("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Invoice Management
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            View authoritative billing invoices and payment receipts in BDT
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
            onClick={loadInvoices}
            className="inline-flex items-center gap-1 font-bold underline hover:no-underline"
          >
            <RotateCcw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Filter */}
      <AdminFilters
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search by invoice number, workspace, or customer email..."
        onReset={handleResetFilters}
      />

      {/* Invoices Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Invoice #</th>
                <th className="px-6 py-3.5">Workspace</th>
                <th className="px-6 py-3.5">Billed Customer</th>
                <th className="px-6 py-3.5">Plan</th>
                <th className="px-6 py-3.5">Amount (BDT)</th>
                <th className="px-6 py-3.5">Method</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Date Paid</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#88da1c] border-t-transparent" />
                      <span>Loading invoices...</span>
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-2 text-slate-500">
                      <FileText size={32} className="text-slate-300" />
                      <span className="font-semibold text-slate-700">
                        No invoices found
                      </span>
                      <p className="text-xs text-slate-400 text-center">
                        No invoices match your search query.
                      </p>
                      {search && (
                        <button
                          onClick={handleResetFilters}
                          className="mt-2 inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Clear Search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 truncate">
                      {inv.issuedTo.workspaceName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="truncate">{inv.issuedTo.userName}</div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {inv.issuedTo.userEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <AdminStatusBadge status={inv.planCode} type="plan" />
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900 whitespace-nowrap">
                      ৳{inv.amount.toLocaleString()} BDT
                    </td>
                    <td className="px-6 py-4">
                      <AdminStatusBadge
                        status={inv.paymentMethod}
                        type="paymentMethod"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <AdminStatusBadge status={inv.status} type="invoice" />
                    </td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {inv.paidAt
                        ? new Date(inv.paidAt).toLocaleDateString()
                        : "Pending"}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
                      >
                        <Eye size={12} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
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

      {/* Invoice Drawer */}
      <AdminDetailDrawer
        open={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        title={`Invoice: ${selectedInvoice?.invoiceNumber}`}
        subtitle={`Payment ID: ${selectedInvoice?.paymentId}`}
      >
        {selectedInvoice && (
          <div className="space-y-6 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Invoice Status
                </span>
                <AdminStatusBadge
                  status={selectedInvoice.status}
                  type="invoice"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Total Charged
                </span>
                <span className="font-black text-slate-900 text-sm">
                  ৳{selectedInvoice.amount.toLocaleString()} BDT
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Covered Period
                </span>
                <span className="text-slate-800">
                  {new Date(
                    selectedInvoice.periodCoveredStart,
                  ).toLocaleDateString()}{" "}
                  —{" "}
                  {new Date(
                    selectedInvoice.periodCoveredEnd,
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Billed Entity
              </h4>
              <div className="text-sm font-semibold text-slate-900">
                {selectedInvoice.issuedTo.workspaceName}
              </div>
              <div className="text-slate-600">
                {selectedInvoice.issuedTo.userName} (
                {selectedInvoice.issuedTo.userEmail})
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() =>
                  handleAction(
                    "Export Official PDF",
                    "GET /api/admin/billing/invoices/:invoiceId/pdf",
                    "Server-side PDF invoice rendering is not yet implemented in cyber7-backend. Only structured JSON invoice models are supported.",
                  )
                }
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
              >
                <Printer size={14} />
                <span>Export Official PDF Receipt</span>
              </button>
              <button
                onClick={() =>
                  handleAction(
                    "Resend Invoice Notification",
                    "POST /api/admin/billing/invoices/:invoiceId/resend",
                    "Transactional email dispatch for invoices is managed by workspace billing webhooks and cannot be triggered manually from the admin portal.",
                  )
                }
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
              >
                <Mail size={14} />
                <span>Email Copy to Customer</span>
              </button>
            </div>
          </div>
        )}
      </AdminDetailDrawer>

      <AdminUnimplementedModal
        open={mutationModalOpen}
        onClose={() => setMutationModalOpen(false)}
        actionTitle={modalActionTitle}
        missingEndpoint={modalMissingEndpoint}
        explanation={modalExplanation}
      />
    </div>
  );
}
