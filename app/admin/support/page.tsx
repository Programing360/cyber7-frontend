"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  HelpCircle,
  MessageSquare,
  Plus,
  RotateCcw,
  Send,
  UserCheck,
  RefreshCw,
  Flame,
  Check,
  Copy,
  Radio,
  LifeBuoy,
} from "lucide-react";
import AdminFilters from "@/src/component/admin/admin-filters";
import AdminPagination from "@/src/component/admin/admin-pagination";
import AdminDetailDrawer from "@/src/component/admin/admin-detail-drawer";
import AdminConfirmDialog from "@/src/component/admin/admin-confirm-dialog";
import { adminToast } from "@/src/component/admin/admin-toast";
import { adminService } from "@/src/services/admin-service";
import type {
  AdminSupportTicket,
  AdminSupportMessage,
} from "@/src/types/admin";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<AdminSupportTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Live Runtime Statistics
  const [stats, setStats] = useState<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    urgent?: number;
  }>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    urgent: 0,
  });

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedWsId, setCopiedWsId] = useState(false);

  const [selectedTicket, setSelectedTicket] =
    useState<AdminSupportTicket | null>(null);

  // Modal dialog states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  // Create ticket form inputs
  const [newWorkspaceId, setNewWorkspaceId] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newPriority, setNewPriority] = useState<
    "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  >("MEDIUM");
  const [newInitialMessage, setNewInitialMessage] = useState("");

  // Assign & Status inputs
  const [assignAdminId, setAssignAdminId] = useState("");
  const [targetStatus, setTargetStatus] = useState<
    "OPEN" | "IN_PROGRESS" | "WAITING_ON_CUSTOMER" | "RESOLVED" | "CLOSED"
  >("RESOLVED");

  // Reply message input in drawer
  const [replyContent, setReplyContent] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadTickets = useCallback(
    async (isSilent = false) => {
      if (!isSilent) {
        setLoading(true);
      }
      setIsRefreshing(true);
      setError(null);
      try {
        const res = await adminService.listSupportTickets({
          page,
          limit: pageSize,
          search,
          priority: priorityFilter,
          status: statusFilter,
        });
        setTickets(res?.items || []);
        setTotal(res?.total || 0);
        setTotalPages(res?.totalPages || 1);
        if (res?.stats) {
          setStats(res.stats);
        }
        setLastRefreshedAt(new Date());
      } catch (err: any) {
        console.error("[AdminSupport] Failed to load tickets:", err);
        setError(
          err?.message || "Failed to load support tickets. Please try again.",
        );
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [page, search, priorityFilter, statusFilter, pageSize],
  );

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // Live Auto-Refresh every 25 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Only refresh if document is currently focused/visible
      if (
        typeof document !== "undefined" &&
        document.visibilityState === "visible"
      ) {
        loadTickets(true);
      }
    }, 25000);

    return () => clearInterval(interval);
  }, [autoRefresh, loadTickets]);

  const handleResetFilters = () => {
    setSearch("");
    setPriorityFilter("ALL");
    setStatusFilter("ALL");
    setPage(1);
  };

  const handleOpenCreateTicket = () => {
    setNewWorkspaceId("");
    setNewCustomerName("");
    setNewCustomerEmail("");
    setNewSubject("");
    setNewPriority("MEDIUM");
    setNewInitialMessage("");
    setCreateModalOpen(true);
  };

  const handleConfirmCreateTicket = async () => {
    if (
      !newWorkspaceId.trim() ||
      !newCustomerName.trim() ||
      !newCustomerEmail.trim() ||
      !newSubject.trim()
    ) {
      adminToast.error(
        "Validation Error",
        "Workspace ID, customer name, email, and subject are required.",
      );
      return;
    }

    setActionLoading(true);
    try {
      const created = await adminService.createSupportTicket({
        workspaceId: newWorkspaceId.trim(),
        customerName: newCustomerName.trim(),
        customerEmail: newCustomerEmail.trim(),
        subject: newSubject.trim(),
        priority: newPriority,
        initialMessage: newInitialMessage.trim() || undefined,
      });
      adminToast.success(
        "Support Ticket Created",
        `Ticket #${created.ticketNumber} created successfully.`,
      );
      setCreateModalOpen(false);
      await loadTickets();
    } catch (err: any) {
      adminToast.error(
        "Failed to Create Ticket",
        err?.message || "Could not register support ticket.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenAssignModal = () => {
    if (!selectedTicket) return;
    setAssignAdminId(selectedTicket.assignedAdminId || "");
    setAssignModalOpen(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedTicket) return;
    setActionLoading(true);
    try {
      const updated = await adminService.assignSupportTicket(
        selectedTicket.id,
        {
          assignedAdminId: assignAdminId.trim() || undefined,
        },
      );
      adminToast.success(
        "Ticket Assigned",
        `Ticket #${selectedTicket.ticketNumber} assigned successfully.`,
      );
      setSelectedTicket((prev) => (prev ? { ...prev, ...updated } : null));
      setAssignModalOpen(false);
      await loadTickets();
    } catch (err: any) {
      adminToast.error(
        "Assignment Failed",
        err?.message || "Could not assign ticket.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenStatusModal = () => {
    if (!selectedTicket) return;
    setTargetStatus(
      selectedTicket.status === "RESOLVED" ? "CLOSED" : "RESOLVED",
    );
    setStatusModalOpen(true);
  };

  const handleConfirmStatus = async () => {
    if (!selectedTicket) return;
    setActionLoading(true);
    try {
      const updated = await adminService.updateSupportTicketStatus(
        selectedTicket.id,
        {
          status: targetStatus,
        },
      );
      adminToast.success(
        "Status Updated",
        `Ticket #${selectedTicket.ticketNumber} marked as ${targetStatus}.`,
      );
      setSelectedTicket((prev) => (prev ? { ...prev, ...updated } : null));
      setStatusModalOpen(false);
      await loadTickets();
    } catch (err: any) {
      adminToast.error(
        "Status Update Failed",
        err?.message || "Could not update ticket status.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyContent.trim()) return;
    setReplyLoading(true);
    try {
      const newMsg = await adminService.addSupportTicketMessage(
        selectedTicket.id,
        {
          content: replyContent.trim(),
        },
      );
      adminToast.success(
        "Reply Dispatched",
        "Support response recorded and sent.",
      );
      setReplyContent("");
      // Update local ticket message list
      setSelectedTicket((prev) => {
        if (!prev) return null;
        const existing = prev.messages || [];
        return {
          ...prev,
          messages: [...existing, newMsg],
        };
      });
      await loadTickets();
    } catch (err: any) {
      adminToast.error(
        "Reply Failed",
        err?.message || "Could not add ticket reply.",
      );
    } finally {
      setReplyLoading(false);
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "MEDIUM":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-sky-100 text-sky-800 border-sky-200";
      case "IN_PROGRESS":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "WAITING_ON_CUSTOMER":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "RESOLVED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "CLOSED":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Live Status Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Support Desk & Incidents
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Live Sync
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Customer inquiries, technical escalations, and incident tracking
            across workspaces
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 sm:flex">
            <Clock size={13} className="text-slate-400" />
            <span className="text-[11px] font-medium text-slate-500">
              Synced{" "}
              {lastRefreshedAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            title={
              autoRefresh
                ? "Auto-refresh is active (25s)"
                : "Auto-refresh is paused"
            }
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
              autoRefresh
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Radio
              size={13}
              className={
                autoRefresh
                  ? "animate-pulse text-emerald-600"
                  : "text-slate-400"
              }
            />
            <span>{autoRefresh ? "Auto-Sync ON" : "Auto-Sync OFF"}</span>
          </button>

          <button
            onClick={() => loadTickets(false)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={isRefreshing ? "animate-spin text-[#88da1c]" : ""}
            />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenCreateTicket}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
          >
            <Plus size={14} />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* 5 Real-Time Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <button
          onClick={() => {
            setStatusFilter("ALL");
            setPriorityFilter("ALL");
            setPage(1);
          }}
          className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all hover:shadow-xs ${
            statusFilter === "ALL" && priorityFilter === "ALL"
              ? "border-blue-400 bg-blue-50/70 ring-2 ring-blue-200"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Tickets
            </span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <LifeBuoy size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              {stats.total}
            </div>
            <p className="mt-0.5 text-[11px] text-slate-400">
              All recorded inquiries
            </p>
          </div>
        </button>

        <button
          onClick={() => {
            setStatusFilter("OPEN");
            setPriorityFilter("ALL");
            setPage(1);
          }}
          className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all hover:shadow-xs ${
            statusFilter === "OPEN"
              ? "border-amber-400 bg-amber-50/70 ring-2 ring-amber-200"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Open & Triage
            </span>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-900">
              {stats.open}
            </div>
            <p className="mt-0.5 text-[11px] text-amber-600">
              Needs immediate triage
            </p>
          </div>
        </button>

        <button
          onClick={() => {
            setStatusFilter("IN_PROGRESS");
            setPriorityFilter("ALL");
            setPage(1);
          }}
          className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all hover:shadow-xs ${
            statusFilter === "IN_PROGRESS"
              ? "border-indigo-400 bg-indigo-50/70 ring-2 ring-indigo-200"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
              In Progress
            </span>
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-indigo-900">
              {stats.inProgress}
            </div>
            <p className="mt-0.5 text-[11px] text-indigo-600">
              Active investigation
            </p>
          </div>
        </button>

        <button
          onClick={() => {
            setStatusFilter("RESOLVED");
            setPriorityFilter("ALL");
            setPage(1);
          }}
          className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all hover:shadow-xs ${
            statusFilter === "RESOLVED"
              ? "border-emerald-400 bg-emerald-50/70 ring-2 ring-emerald-200"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Resolved
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-900">
              {stats.resolved}
            </div>
            <p className="mt-0.5 text-[11px] text-emerald-600">
              Mitigated tickets
            </p>
          </div>
        </button>

        <button
          onClick={() => {
            setPriorityFilter("URGENT");
            setStatusFilter("ALL");
            setPage(1);
          }}
          className={`col-span-2 flex flex-col justify-between rounded-2xl border p-4 text-left transition-all hover:shadow-xs sm:col-span-1 ${
            priorityFilter === "URGENT" || priorityFilter === "HIGH"
              ? "border-rose-400 bg-rose-50/70 ring-2 ring-rose-200"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              Urgent SLA
            </span>
            <div className="rounded-xl bg-rose-50 p-2 text-rose-600">
              <Flame size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-900">
              {stats.urgent ?? 0}
            </div>
            <p className="mt-0.5 text-[11px] text-rose-600">
              High / critical SLA
            </p>
          </div>
        </button>
      </div>

      {/* Error state alert */}
      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadTickets(false)}
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
              { label: "Low", value: "LOW" },
            ],
            onChange: (val) => {
              setPriorityFilter(val);
              setPage(1);
            },
          },
          {
            name: "status",
            label: "Status",
            value: statusFilter,
            options: [
              { label: "All Statuses", value: "ALL" },
              { label: "Open", value: "OPEN" },
              { label: "In Progress", value: "IN_PROGRESS" },
              { label: "Waiting on Customer", value: "WAITING_ON_CUSTOMER" },
              { label: "Resolved", value: "RESOLVED" },
              { label: "Closed", value: "CLOSED" },
            ],
            onChange: (val) => {
              setStatusFilter(val);
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
                <tr key="loading-row">
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#88da1c] border-t-transparent" />
                      <span>Loading support tickets...</span>
                    </div>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-2 text-slate-500">
                      <HelpCircle size={32} className="text-slate-300" />
                      <span className="font-semibold text-slate-700">
                        No support tickets found
                      </span>
                      <p className="text-xs text-slate-400 text-center">
                        No tickets match your query or priority/status filters.
                      </p>
                      {(search ||
                        priorityFilter !== "ALL" ||
                        statusFilter !== "ALL") && (
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
                tickets.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {t.ticketNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 truncate">
                        {t.workspaceName || "Workspace"}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {t.customerName} ({t.customerEmail})
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-slate-900 font-semibold">
                      {t.subject}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getPriorityBadgeClass(
                          t.priority,
                        )}`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadgeClass(
                          t.status,
                        )}`}
                      >
                        {t.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 truncate">
                      {t.assignedAdmin || (
                        <span className="text-slate-400 italic">
                          Unassigned
                        </span>
                      )}
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
          totalItems={total}
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
        subtitle={`Status: ${selectedTicket?.status} | Priority: ${selectedTicket?.priority}`}
      >
        {selectedTicket && (
          <div className="space-y-6 text-xs">
            {/* Ticket Metadata */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Priority
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getPriorityBadgeClass(
                    selectedTicket.priority,
                  )}`}
                >
                  {selectedTicket.priority}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Current Status
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadgeClass(
                    selectedTicket.status,
                  )}`}
                >
                  {selectedTicket.status.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Assigned Agent
                </span>
                <span className="font-semibold text-slate-800">
                  {selectedTicket.assignedAdmin || "Unassigned"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Subject
                </span>
                <span className="font-semibold text-slate-900 text-right truncate max-w-[200px]">
                  {selectedTicket.subject}
                </span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-2.5">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Customer Context
              </h4>
              <div className="text-sm font-semibold text-slate-900">
                {selectedTicket.workspaceName || "Workspace"}
              </div>
              <div className="text-slate-600">
                Contact:{" "}
                <span className="font-semibold text-slate-800">
                  {selectedTicket.customerName}
                </span>{" "}
                ({selectedTicket.customerEmail})
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                <span>
                  Workspace ID:{" "}
                  <code className="font-mono font-bold text-slate-800">
                    {selectedTicket.workspaceId}
                  </code>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedTicket.workspaceId);
                    setCopiedWsId(true);
                    setTimeout(() => setCopiedWsId(false), 2000);
                    adminToast.success(
                      "Copied",
                      "Workspace ID copied to clipboard.",
                    );
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {copiedWsId ? (
                    <Check size={12} className="text-emerald-600" />
                  ) : (
                    <Copy size={12} />
                  )}
                  <span>{copiedWsId ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Message Thread */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <MessageSquare size={14} className="text-slate-500" />
                <span>Conversation Thread</span>
              </h4>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedTicket.messages &&
                selectedTicket.messages.length > 0 ? (
                  selectedTicket.messages.map((m, idx) => {
                    const isAgent =
                      m.senderRole === "AGENT" ||
                      m.senderRole === "PLATFORM_ADMIN";
                    return (
                      <div
                        key={idx}
                        className={`rounded-xl p-3 text-xs ${
                          isAgent
                            ? "bg-[#effbdd] border border-[#d2f39d] text-slate-900 ml-4"
                            : "bg-slate-100 border border-slate-200 text-slate-800 mr-4"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                          <span className="font-bold">
                            {m.senderName ||
                              (isAgent ? "Admin / Agent" : "Customer")}{" "}
                            ({m.senderRole})
                          </span>
                          <span>
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-slate-400">
                    No replies yet. Type a response below.
                  </div>
                )}
              </div>

              {/* Reply Box */}
              <div className="space-y-2 pt-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Type official response to customer..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-[#88da1c] focus:outline-hidden focus:ring-1 focus:ring-[#88da1c]"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSendReply}
                    disabled={replyLoading || !replyContent.trim()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#88da1c] px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-[#78c418] disabled:opacity-50 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
                  >
                    {replyLoading ? (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                    ) : (
                      <Send size={12} />
                    )}
                    <span>Send Reply</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                {selectedTicket.status === "OPEN" && (
                  <button
                    onClick={async () => {
                      setActionLoading(true);
                      try {
                        const updated =
                          await adminService.updateSupportTicketStatus(
                            selectedTicket.id,
                            {
                              status: "IN_PROGRESS",
                            },
                          );
                        adminToast.success(
                          "Updated",
                          "Ticket marked as In Progress.",
                        );
                        setSelectedTicket((prev) =>
                          prev ? { ...prev, ...updated } : null,
                        );
                        await loadTickets(true);
                      } catch (err: any) {
                        adminToast.error(
                          "Failed",
                          err?.message || "Could not update status.",
                        );
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                    disabled={actionLoading}
                    className="rounded-xl border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-800 hover:bg-indigo-100 disabled:opacity-50"
                  >
                    Start Investigation
                  </button>
                )}
                {selectedTicket.status !== "RESOLVED" &&
                  selectedTicket.status !== "CLOSED" && (
                    <button
                      onClick={async () => {
                        setActionLoading(true);
                        try {
                          const updated =
                            await adminService.updateSupportTicketStatus(
                              selectedTicket.id,
                              {
                                status: "RESOLVED",
                              },
                            );
                          adminToast.success(
                            "Resolved",
                            "Ticket marked as Resolved.",
                          );
                          setSelectedTicket((prev) =>
                            prev ? { ...prev, ...updated } : null,
                          );
                          await loadTickets(true);
                        } catch (err: any) {
                          adminToast.error(
                            "Failed",
                            err?.message || "Could not update status.",
                          );
                        } finally {
                          setActionLoading(false);
                        }
                      }}
                      disabled={actionLoading}
                      className="rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
                    >
                      Mark Resolved
                    </button>
                  )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAssignModal}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
                >
                  Assign Admin
                </button>
                <button
                  onClick={handleOpenStatusModal}
                  className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
                >
                  Status Details
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminDetailDrawer>

      {/* Create Ticket Modal */}
      <AdminConfirmDialog
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onConfirm={handleConfirmCreateTicket}
        title="Open Support Ticket"
        description="Manually create an administrative escalation or support ticket for a workspace."
        confirmText="Create Ticket"
        variant="info"
        loading={actionLoading}
      >
        <div className="space-y-3 pt-2 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Workspace ID *
            </label>
            <input
              type="text"
              value={newWorkspaceId}
              onChange={(e) => setNewWorkspaceId(e.target.value)}
              placeholder="e.g. 507f1f77bcf86cd799439011"
              className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono focus:border-[#88da1c] focus:outline-hidden focus:ring-1 focus:ring-[#88da1c]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                placeholder="Tanvir Ahmed"
                className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-[#88da1c] focus:outline-hidden focus:ring-1 focus:ring-[#88da1c]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Customer Email *
              </label>
              <input
                type="email"
                value={newCustomerEmail}
                onChange={(e) => setNewCustomerEmail(e.target.value)}
                placeholder="tanvir@company.com"
                className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-[#88da1c] focus:outline-hidden focus:ring-1 focus:ring-[#88da1c]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Subject *
              </label>
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="API Gateway connection timeout"
                className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-[#88da1c] focus:outline-hidden focus:ring-1 focus:ring-[#88da1c]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs focus:border-[#88da1c] focus:outline-hidden focus:ring-1 focus:ring-[#88da1c]"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Initial Message / Issue Description
            </label>
            <textarea
              value={newInitialMessage}
              onChange={(e) => setNewInitialMessage(e.target.value)}
              placeholder="Detailed description of the customer inquiry or system issue..."
              rows={3}
              className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-[#88da1c] focus:outline-hidden focus:ring-1 focus:ring-[#88da1c]"
            />
          </div>
        </div>
      </AdminConfirmDialog>

      {/* Assign Ticket Modal */}
      <AdminConfirmDialog
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onConfirm={handleConfirmAssign}
        title="Assign Ticket to Administrator"
        description={`Set or change the assigned handler for Ticket #${selectedTicket?.ticketNumber || ""}.`}
        confirmText="Confirm Assignment"
        variant="info"
        loading={actionLoading}
      >
        <div className="space-y-3 pt-2 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Admin User ID
            </label>
            <input
              type="text"
              value={assignAdminId}
              onChange={(e) => setAssignAdminId(e.target.value)}
              placeholder="e.g. 507f1f77bcf86cd799439011 (leave empty to unassign)"
              className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono focus:border-[#88da1c] focus:outline-hidden focus:ring-1 focus:ring-[#88da1c]"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Pass an active platform admin's user ID to delegate this
              escalation.
            </p>
          </div>
        </div>
      </AdminConfirmDialog>

      {/* Change Status Modal */}
      <AdminConfirmDialog
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onConfirm={handleConfirmStatus}
        title="Update Ticket Status"
        description={`Transition lifecycle state for Ticket #${selectedTicket?.ticketNumber || ""}.`}
        confirmText="Update Status"
        variant="warning"
        loading={actionLoading}
      >
        <div className="space-y-3 pt-2 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Target Status
            </label>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as any)}
              className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:border-[#88da1c] focus:outline-hidden focus:ring-1 focus:ring-[#88da1c]"
            >
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="WAITING_ON_CUSTOMER">WAITING_ON_CUSTOMER</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
        </div>
      </AdminConfirmDialog>
    </div>
  );
}
