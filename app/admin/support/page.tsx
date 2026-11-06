"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  HelpCircle,
  Lock,
  MessageSquare,
  Plus,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import AdminFilters from "@/src/component/admin/admin-filters";
import AdminPagination from "@/src/component/admin/admin-pagination";
import AdminDetailDrawer from "@/src/component/admin/admin-detail-drawer";
import AdminUnimplementedModal from "@/src/component/admin/admin-unimplemented-modal";
import { adminService } from "@/src/services/admin-service";
import type { AdminSupportTicket } from "@/src/types/admin";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<AdminSupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selectedTicket, setSelectedTicket] =
    useState<AdminSupportTicket | null>(null);

  const [mutationModalOpen, setMutationModalOpen] = useState(false);
  const [mutationActionTitle, setMutationActionTitle] = useState("");
  const [missingEndpoint, setMissingEndpoint] = useState(
    "POST /api/admin/support/tickets",
  );

  const loadTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.listSupportTickets();
      setTickets(res.items);
    } catch {
      setError("Failed to load support tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleAction = (
    title: string,
    endpoint = "POST /api/admin/support/tickets",
  ) => {
    setMutationActionTitle(title);
    setMissingEndpoint(endpoint);
    setMutationModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearch("");
    setPriorityFilter("ALL");
    setPage(1);
  };

  // Filter and paginate locally since backend is mock
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      !search ||
      t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.workspaceName.toLowerCase().includes(search.toLowerCase()) ||
      t.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase());

    const matchesPriority =
      priorityFilter === "ALL" || t.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const totalPages = Math.ceil(filteredTickets.length / pageSize) || 1;
  const paginatedTickets = filteredTickets.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Support Ticket Management
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            Customer inquiries, technical escalations, and incident tracking
          </p>
        </div>

        <button
          onClick={() => handleAction("Create New Support Ticket")}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
        >
          <Plus size={14} />
          <span>New Ticket</span>
        </button>
      </div>

      {/* Backend Status Notice */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
        <div className="flex items-start gap-2.5">
          <HelpCircle size={16} className="text-slate-500 mt-0.5 shrink-0" />
          <div>
            <strong className="font-bold">Backend Feature Status: NO TICKETING SERVICE</strong>{" "}
            There are currently zero support/ticket models, routes, or controllers implemented in{" "}
            <code>cyber7-backend</code>. Displaying a live empty list with zero simulated demo records.
          </div>
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
            onClick={loadTickets}
            className="inline-flex items-center gap-1 font-bold underline hover:no-underline"
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
        searchPlaceholder="Search by ticket #, workspace, customer email, or subject..."
        dropdowns={[
          {
            name: "priority",
            label: "Priority",
            value: priorityFilter,
            options: [
              { label: "All Priorities", value: "ALL" },
              { label: "Urgent", value: "URGENT" },
              { label: "High", value: "HIGH" },
              { label: "Medium", value: "MEDIUM" },
            ],
            onChange: (val) => {
              setPriorityFilter(val);
              setPage(1);
            },
          },
        ]}
        onReset={handleResetFilters}
      />

      {/* Tickets Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Ticket #</th>
                <th className="px-6 py-3.5">Workspace & Customer</th>
                <th className="px-6 py-3.5">Subject</th>
                <th className="px-6 py-3.5">Priority</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Assigned To</th>
                <th className="px-6 py-3.5">Created</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#88da1c] border-t-transparent" />
                      <span>Loading support tickets...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-2 text-slate-500">
                      <HelpCircle size={32} className="text-slate-300" />
                      <span className="font-semibold text-slate-700">
                        No support tickets found
                      </span>
                      <p className="text-xs text-slate-400 text-center">
                        No tickets match your search query or selected priority filter.
                      </p>
                      {(search || priorityFilter !== "ALL") && (
                        <button
                          onClick={handleResetFilters}
                          className="mt-2 inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {t.ticketNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 truncate">
                        {t.workspaceName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {t.customerEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-slate-900">
                      {t.subject}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          t.priority === "HIGH" || t.priority === "URGENT"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 truncate">
                      {t.assignedAdmin || "Unassigned"}
                    </td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
                      >
                        Inspect
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
          totalItems={filteredTickets.length}
          pageSize={pageSize}
          onPageChange={setPage}
          source="LIVE_BACKEND"
        />
      </div>

      {/* Ticket Drawer */}
      <AdminDetailDrawer
        open={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        title={`Support Ticket: ${selectedTicket?.ticketNumber}`}
        subtitle={`Backend Status: NOT_IMPLEMENTED`}
      >
        {selectedTicket && (
          <div className="space-y-6 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Priority
                </span>
                <span className="font-bold text-rose-700">
                  {selectedTicket.priority}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Subject
                </span>
                <span className="font-semibold text-slate-900">
                  {selectedTicket.subject}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Customer Context
              </h4>
              <div className="text-sm font-semibold text-slate-900">
                {selectedTicket.workspaceName}
              </div>
              <div className="text-slate-600">
                Contact: {selectedTicket.customerName} ({selectedTicket.customerEmail})
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() =>
                  handleAction(
                    "Assign Ticket to Administrator",
                    "PATCH /api/admin/support/tickets/:ticketId/assign",
                  )
                }
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
              >
                Assign Admin
              </button>
              <button
                onClick={() =>
                  handleAction(
                    "Close Support Ticket",
                    "PATCH /api/admin/support/tickets/:ticketId/status",
                  )
                }
                className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
              >
                Resolve Ticket
              </button>
            </div>
          </div>
        )}
      </AdminDetailDrawer>

      <AdminUnimplementedModal
        open={mutationModalOpen}
        onClose={() => setMutationModalOpen(false)}
        actionTitle={mutationActionTitle}
        missingEndpoint={missingEndpoint}
        explanation="The support ticket system is not implemented in cyber7-backend. No ticket database models exist."
      />
    </div>
  );
}
