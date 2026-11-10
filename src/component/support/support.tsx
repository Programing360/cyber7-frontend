"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  HelpCircle,
  LifeBuoy,
  Loader2,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  Send,
  Ticket,
  User,
  X,
} from "lucide-react";

import DashboardLayout from "@/src/component/dashboard/dashboard-layout";
import { useWorkspace } from "@/src/context/workspace-context";
import { useAuth } from "@/src/context/auth-context";
import supportService from "@/src/services/support-service";
import type {
  SupportTicketItem,
  SupportTicketStats,
  SupportTicketStatus,
  SupportTicketPriority,
} from "@/src/types/api";

const BRAND = "#88da1c";

export const TICKET_CATEGORIES = [
  "Technical Issue",
  "WhatsApp Integration",
  "Account Setup",
  "Billing & Subscription",
  "Campaigns & Messaging",
  "Team Management",
  "General Inquiry",
  "Other",
] as const;

export const TICKET_PRIORITIES = [
  { label: "Low", value: "LOW" as const },
  { label: "Medium", value: "MEDIUM" as const },
  { label: "High", value: "HIGH" as const },
  { label: "Urgent", value: "URGENT" as const },
];

export const TICKET_STATUSES = [
  { label: "Open", value: "OPEN" as const },
  { label: "In Progress", value: "IN_PROGRESS" as const },
  { label: "Resolved", value: "RESOLVED" as const },
  { label: "Closed", value: "CLOSED" as const },
];

function formatDate(date?: string | null) {
  if (!date) return "N/A";
  try {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return date;
  }
}

function getPriorityLabel(priority?: SupportTicketPriority | string): string {
  const norm = String(priority || "").toUpperCase();
  switch (norm) {
    case "URGENT":
      return "Urgent";
    case "HIGH":
      return "High";
    case "MEDIUM":
      return "Medium";
    case "LOW":
      return "Low";
    default:
      return priority || "Medium";
  }
}

function getStatusLabel(status?: SupportTicketStatus | string): string {
  const norm = String(status || "").toUpperCase();
  switch (norm) {
    case "OPEN":
      return "Open";
    case "IN_PROGRESS":
      return "In Progress";
    case "RESOLVED":
      return "Resolved";
    case "CLOSED":
      return "Closed";
    default:
      return status || "Open";
  }
}

function getPriorityStyle(priority?: SupportTicketPriority | string) {
  const norm = String(priority || "").toUpperCase();
  switch (norm) {
    case "URGENT":
      return "bg-red-50 text-red-700 border border-red-200/60";
    case "HIGH":
      return "bg-orange-50 text-orange-700 border border-orange-200/60";
    case "MEDIUM":
      return "bg-amber-50 text-amber-700 border border-amber-200/60";
    case "LOW":
    default:
      return "bg-slate-100 text-slate-600 border border-slate-200/60";
  }
}

function getStatusStyle(status?: SupportTicketStatus | string) {
  const norm = String(status || "").toUpperCase();
  switch (norm) {
    case "OPEN":
      return "bg-lime-100 text-lime-800 border border-lime-200/60";
    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-700 border border-blue-200/60";
    case "RESOLVED":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200/60";
    case "CLOSED":
    default:
      return "bg-slate-100 text-slate-600 border border-slate-200/60";
  }
}

function getInitials(name?: string | null) {
  if (!name || !name.trim()) return "U";
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
}: {
  title: string;
  value: number;
  description: string;
  icon: typeof Ticket;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </div>
        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

export default function SupportPage() {
  const { activeWorkspace, isLoading: isWorkspaceLoading } = useWorkspace();
  const { user } = useAuth();

  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [stats, setStats] = useState<SupportTicketStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedTicketDetail, setSelectedTicketDetail] =
    useState<SupportTicketItem | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Form states for creating a ticket
  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState<string>("Technical Issue");
  const [newPriority, setNewPriority] = useState<SupportTicketPriority>("MEDIUM");
  const [newDescription, setNewDescription] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [reply, setReply] = useState("");

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
      window.setTimeout(() => setToast(null), 3500);
    },
    [],
  );

  // Prefill email when modal opens or user loads
  useEffect(() => {
    if (user?.email && !newEmail) {
      setNewEmail(user.email);
    }
  }, [user?.email, newEmail]);

  // Load tickets from backend API
  const fetchTickets = useCallback(
    async (isManualRefresh = false) => {
      if (!activeWorkspace?.id) return;
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const res = await supportService.listTickets({
          workspaceId: activeWorkspace.id,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          priority: priorityFilter !== "ALL" ? priorityFilter : undefined,
          search: search.trim() || undefined,
          page: 1,
          pageSize: 100,
        });

        setTickets(res.items || []);

        if (res.stats) {
          setStats(res.stats);
        } else {
          const items = res.items || [];
          setStats({
            total: items.length,
            open: items.filter((t) => t.status === "OPEN").length,
            inProgress: items.filter((t) => t.status === "IN_PROGRESS").length,
            resolved: items.filter(
              (t) => t.status === "RESOLVED" || t.status === "CLOSED",
            ).length,
          });
        }
      } catch (err: any) {
        console.warn("Notice: Live support tickets sync:", err);
        if (tickets.length === 0) {
          setError(
            err?.message ||
            "Unable to load support tickets. Please verify your connection.",
          );
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [activeWorkspace?.id, statusFilter, priorityFilter, search, tickets.length],
  );

  useEffect(() => {
    if (activeWorkspace?.id) {
      fetchTickets();
    } else if (!isWorkspaceLoading) {
      setIsLoading(false);
    }
  }, [fetchTickets, activeWorkspace?.id, isWorkspaceLoading]);

  // Client-side quick filter for instantaneous typing responsiveness
  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tickets.filter((ticketItem) => {
      const ticketIdStr = (
        ticketItem.ticketNumber ||
        ticketItem.id ||
        ticketItem._id ||
        ""
      ).toLowerCase();
      const subject = (ticketItem.subject || "").toLowerCase();
      const customer = (ticketItem.customerName || "").toLowerCase();
      const email = (ticketItem.customerEmail || "").toLowerCase();
      const category = (ticketItem.category || "").toLowerCase();

      const matchesSearch =
        !query ||
        ticketIdStr.includes(query) ||
        subject.includes(query) ||
        customer.includes(query) ||
        email.includes(query) ||
        category.includes(query);

      const matchesStatus =
        statusFilter === "ALL" || ticketItem.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" || ticketItem.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  // Find currently selected ticket
  const selectedTicket = useMemo(() => {
    if (!selectedTicketId) return null;
    if (
      selectedTicketDetail &&
      (selectedTicketDetail.ticketNumber === selectedTicketId ||
        selectedTicketDetail.id === selectedTicketId ||
        selectedTicketDetail._id === selectedTicketId)
    ) {
      return selectedTicketDetail;
    }
    return (
      tickets.find(
        (t) =>
          t.ticketNumber === selectedTicketId ||
          t.id === selectedTicketId ||
          t._id === selectedTicketId,
      ) || null
    );
  }, [selectedTicketId, selectedTicketDetail, tickets]);

  // Open ticket details and load full message conversation
  const handleOpenTicket = async (ticket: SupportTicketItem) => {
    const id = ticket.ticketNumber || ticket.id || ticket._id || "";
    setSelectedTicketId(id);
    setSelectedTicketDetail(ticket);

    if (activeWorkspace?.id && id) {
      setIsLoadingDetail(true);
      try {
        const fullDetail = await supportService.getTicket(
          activeWorkspace.id,
          id,
        );
        setSelectedTicketDetail(fullDetail);
        setTickets((prev) =>
          prev.map((t) =>
            t.ticketNumber === id || t.id === id || t._id === id
              ? fullDetail
              : t,
          ),
        );
      } catch (err) {
        console.warn("Could not fetch full ticket details, using cached:", err);
      } finally {
        setIsLoadingDetail(false);
      }
    }
  };

  // Update Status
  const handleUpdateStatus = async (newStatus: SupportTicketStatus) => {
    if (!selectedTicket || !activeWorkspace?.id) return;
    const ticketKey =
      selectedTicket.ticketNumber ||
      selectedTicket.id ||
      selectedTicket._id ||
      "";
    if (!ticketKey) return;

    setIsUpdatingStatus(true);
    try {
      const updated = await supportService.updateStatus(
        activeWorkspace.id,
        ticketKey,
        newStatus,
      );
      setSelectedTicketDetail(updated);
      setTickets((prev) =>
        prev.map((t) =>
          t.ticketNumber === ticketKey ||
            t.id === ticketKey ||
            t._id === ticketKey
            ? updated
            : t,
        ),
      );
      showToast(
        `Ticket status updated to ${getStatusLabel(newStatus)}.`,
        "success",
      );
      fetchTickets();
    } catch (err: any) {
      console.error("Failed to update status:", err);
      showToast(err?.message || "Failed to update ticket status.", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Update Priority
  const handleUpdatePriority = async (newPriority: SupportTicketPriority) => {
    if (!selectedTicket || !activeWorkspace?.id) return;
    const ticketKey =
      selectedTicket.ticketNumber ||
      selectedTicket.id ||
      selectedTicket._id ||
      "";
    if (!ticketKey) return;

    setIsUpdatingPriority(true);
    try {
      const updated = await supportService.updatePriority(
        activeWorkspace.id,
        ticketKey,
        newPriority,
      );
      setSelectedTicketDetail(updated);
      setTickets((prev) =>
        prev.map((t) =>
          t.ticketNumber === ticketKey ||
            t.id === ticketKey ||
            t._id === ticketKey
            ? updated
            : t,
        ),
      );
      showToast(
        `Ticket priority updated to ${getPriorityLabel(newPriority)}.`,
        "success",
      );
    } catch (err: any) {
      console.error("Failed to update priority:", err);
      showToast(err?.message || "Failed to update ticket priority.", "error");
    } finally {
      setIsUpdatingPriority(false);
    }
  };

  // Create new ticket
  const handleCreateTicket = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activeWorkspace?.id) {
      showToast("No active workspace selected.", "error");
      return;
    }

    if (!newSubject.trim() || !newDescription.trim()) {
      showToast("Please enter a subject and description.", "error");
      return;
    }

    setIsSubmittingTicket(true);
    try {
      const created = await supportService.createTicket({
        workspaceId: activeWorkspace.id,
        subject: newSubject.trim(),
        category: newCategory,
        priority: newPriority,
        description: newDescription.trim(),
        customerName:
          user?.name ||
          (newEmail ? newEmail.split("@")[0].replace(/[._-]/g, " ") : "Customer"),
        customerEmail: newEmail.trim() || user?.email || "",
      });

      setTickets((prev) => [created, ...prev]);
      const createdKey =
        created.ticketNumber || created.id || created._id || "";
      setSelectedTicketId(createdKey);
      setSelectedTicketDetail(created);
      setShowCreateModal(false);

      setNewSubject("");
      setNewCategory("Technical Issue");
      setNewPriority("MEDIUM");
      setNewDescription("");

      showToast("Support ticket created successfully.", "success");
      fetchTickets();
    } catch (err: any) {
      console.error("Failed to create ticket:", err);
      showToast(err?.message || "Failed to create support ticket.", "error");
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  // Send message reply
  const handleSendReply = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTicket || !reply.trim() || !activeWorkspace?.id) return;

    const ticketKey =
      selectedTicket.ticketNumber ||
      selectedTicket.id ||
      selectedTicket._id ||
      "";
    if (!ticketKey) return;

    setIsSendingReply(true);
    try {
      const updated = await supportService.addMessage(
        activeWorkspace.id,
        ticketKey,
        {
          content: reply.trim(),
        },
      );

      setSelectedTicketDetail(updated);
      setTickets((prev) =>
        prev.map((t) =>
          t.ticketNumber === ticketKey ||
            t.id === ticketKey ||
            t._id === ticketKey
            ? updated
            : t,
        ),
      );
      setReply("");
      showToast("Reply sent to support team.", "success");
      fetchTickets();
    } catch (err: any) {
      console.error("Failed to send reply:", err);
      showToast(err?.message || "Failed to send message reply.", "error");
    } finally {
      setIsSendingReply(false);
    }
  };

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-[#f7f9f4] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-7">
          {/* Header */}
          <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                <span>{activeWorkspace?.name || "Workspace"}</span>
                <span>/</span>
                <span className="font-medium text-slate-800">
                  Support Tickets
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Support Tickets
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Get real-time assistance and track resolutions for your WhatsApp
                workspace.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fetchTickets(true)}
                disabled={isRefreshing || isLoading}
                aria-label="Refresh tickets"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={isRefreshing ? "animate-spin text-[#65a31a]" : ""}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#88da1c] px-5 py-3 text-sm font-bold text-[#20320d] shadow-sm transition hover:bg-[#79c516]"
              >
                <Plus size={18} />
                Create Ticket
              </button>
            </div>
          </header>

          {/* Live Helpdesk Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-[#c5ed98] bg-[#effbdd] p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#88da1c]/30 text-[#29450c]">
                <LifeBuoy size={22} className="text-[#3b6312]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#29450c]">
                  {activeWorkspace?.name || "Workspace"} Helpdesk
                </p>
                <p className="text-xs text-[#49682a]">
                  All support requests, updates, and replies are synchronized
                  live with our platform engineers.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-1 sm:pl-0">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#88da1c] opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#75be15]" />
              </span>
              <span className="text-xs font-bold text-[#355c11]">
                Live Cloud Sync
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{error}</p>
                <button
                  type="button"
                  onClick={() => fetchTickets(true)}
                  className="mt-2 text-xs font-bold underline hover:text-red-900"
                >
                  Click here to retry
                </button>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Tickets"
              value={stats.total}
              description="All support requests"
              icon={Ticket}
              iconClass="bg-[#effbdd] text-[#477b12]"
            />

            <StatCard
              title="Open Tickets"
              value={stats.open}
              description="Waiting for agent response"
              icon={AlertCircle}
              iconClass="bg-amber-50 text-amber-700"
            />

            <StatCard
              title="In Progress"
              value={stats.inProgress}
              description="Being resolved by engineers"
              icon={Clock3}
              iconClass="bg-blue-50 text-blue-700"
            />

            <StatCard
              title="Resolved"
              value={stats.resolved}
              description="Successfully closed"
              icon={CheckCircle2}
              iconClass="bg-emerald-50 text-emerald-700"
            />
          </section>

          {/* Main Content Area */}
          {selectedTicket ? (
            /* Ticket Detail View */
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTicketId(null);
                      setSelectedTicketDetail(null);
                    }}
                    className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                  >
                    <ArrowLeft size={16} />
                    Back to all tickets
                  </button>

                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      {selectedTicket.ticketNumber ||
                        selectedTicket.id ||
                        selectedTicket._id}
                    </p>
                    {isLoadingDetail && (
                      <Loader2
                        size={13}
                        className="animate-spin text-slate-400"
                      />
                    )}
                  </div>

                  <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                    {selectedTicket.subject}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${getPriorityStyle(
                      selectedTicket.priority,
                    )}`}
                  >
                    {getPriorityLabel(selectedTicket.priority)} Priority
                  </span>

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${getStatusStyle(
                      selectedTicket.status,
                    )}`}
                  >
                    {getStatusLabel(selectedTicket.status)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px]">
                {/* Conversation Column */}
                <div className="min-w-0 border-b border-slate-200 lg:border-b-0 lg:border-r">
                  <div className="space-y-5 p-5 sm:p-6">
                    {/* Primary Ticket Description */}
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Initial Ticket Request
                      </p>
                      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {selectedTicket.messages?.[0]?.content ||
                          "No initial description provided."}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <MessageCircle size={17} className="text-[#5a941c]" />
                      <h3 className="font-bold text-slate-900">
                        Conversation Thread
                      </h3>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                        {selectedTicket.messages?.length || 0}
                      </span>
                    </div>

                    {/* Messages List */}
                    <div className="space-y-4">
                      {(!selectedTicket.messages ||
                        selectedTicket.messages.length === 0) && (
                          <p className="text-center py-6 text-sm text-slate-400">
                            No messages in this conversation yet.
                          </p>
                        )}

                      {selectedTicket.messages?.map((message, idx) => {
                        const isSupport =
                          message.senderRole === "PLATFORM_ADMIN";
                        const senderName =
                          message.senderName ||
                          (isSupport
                            ? "VexChat Support Team"
                            : selectedTicket.customerName || "Customer");

                        return (
                          <div
                            key={
                              message._id ||
                              message.id ||
                              `msg-${idx}-${message.createdAt}`
                            }
                            className={`flex gap-3 ${isSupport ? "flex-row-reverse" : ""
                              }`}
                          >
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm ${isSupport
                                  ? "bg-[#88da1c] text-[#20320d]"
                                  : "bg-slate-200 text-slate-700"
                                }`}
                            >
                              {getInitials(senderName)}
                            </div>

                            <div
                              className={`min-w-0 max-w-[85%] ${isSupport ? "text-right" : ""
                                }`}
                            >
                              <div className="mb-1 flex flex-wrap items-center gap-2">
                                <span
                                  className={`text-sm font-bold ${isSupport
                                      ? "ml-auto text-[#2e520d]"
                                      : "text-slate-800"
                                    }`}
                                >
                                  {senderName}
                                </span>

                                <span className="text-[11px] text-slate-400">
                                  {formatDate(message.createdAt)}
                                </span>
                              </div>

                              <div
                                className={`rounded-2xl px-4 py-3 text-left text-sm leading-6 shadow-xs ${isSupport
                                    ? "rounded-tr-sm bg-[#effbdd] text-[#29450c] border border-[#c5ed98]/50"
                                    : "rounded-tl-sm bg-slate-100 text-slate-800"
                                  }`}
                              >
                                {message.content}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reply Form */}
                  <form
                    onSubmit={handleSendReply}
                    className="border-t border-slate-200 bg-slate-50/70 p-5"
                  >
                    <label
                      htmlFor="ticket-reply"
                      className="mb-2 block text-sm font-bold text-slate-800"
                    >
                      Write a response
                    </label>

                    <textarea
                      id="ticket-reply"
                      value={reply}
                      onChange={(event) => setReply(event.target.value)}
                      placeholder="Type your response to the support team..."
                      rows={3}
                      disabled={isSendingReply}
                      className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#88da1c] focus:ring-2 focus:ring-[#88da1c]/20 disabled:bg-slate-100"
                    />

                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-slate-400">
                        {selectedTicket.status === "RESOLVED" ||
                          selectedTicket.status === "CLOSED"
                          ? "Replying will automatically reopen this ticket."
                          : "Our team will be notified immediately."}
                      </p>

                      <button
                        type="submit"
                        disabled={!reply.trim() || isSendingReply}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#88da1c] px-5 py-2.5 text-sm font-bold text-[#20320d] transition hover:bg-[#79c516] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSendingReply ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send size={15} />
                            Send Reply
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Sidebar Properties */}
                <aside className="space-y-6 p-5 sm:p-6 bg-slate-50/40">
                  <div>
                    <h3 className="mb-4 font-bold text-slate-900">
                      Ticket Controls
                    </h3>

                    <label className="mb-2 block text-xs font-semibold text-slate-500">
                      Status
                    </label>

                    <select
                      value={selectedTicket.status}
                      disabled={isUpdatingStatus}
                      onChange={(event) =>
                        handleUpdateStatus(
                          event.target.value as SupportTicketStatus,
                        )
                      }
                      className="mb-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-[#88da1c] disabled:opacity-50"
                    >
                      {TICKET_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>

                    <label className="mb-2 block text-xs font-semibold text-slate-500">
                      Priority
                    </label>

                    <select
                      value={selectedTicket.priority}
                      disabled={isUpdatingPriority}
                      onChange={(event) =>
                        handleUpdatePriority(
                          event.target.value as SupportTicketPriority,
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-[#88da1c] disabled:opacity-50"
                    >
                      {TICKET_PRIORITIES.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t border-slate-200 pt-5">
                    <h3 className="mb-4 font-bold text-slate-900">
                      Customer Information
                    </h3>

                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#effbdd] font-bold text-[#426d14]">
                        {getInitials(selectedTicket.customerName)}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {selectedTicket.customerName}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {selectedTicket.customerEmail || "No email provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-5">
                    <h3 className="mb-3 font-bold text-slate-900">
                      Ticket Information
                    </h3>

                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-400">Category</p>
                        <p className="mt-1 font-medium text-slate-700">
                          {selectedTicket.category || "Technical Issue"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">Created</p>
                        <p className="mt-1 font-medium text-slate-700">
                          {formatDate(selectedTicket.createdAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">Last updated</p>
                        <p className="mt-1 font-medium text-slate-700">
                          {formatDate(selectedTicket.updatedAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">Assigned Team</p>
                        <p className="mt-1 font-medium text-slate-700">
                          {selectedTicket.assignedAdmin?.name ||
                            "VexChat Customer Support"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedTicket.status !== "RESOLVED" &&
                    selectedTicket.status !== "CLOSED" ? (
                    <button
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={() => handleUpdateStatus("RESOLVED")}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#b8e98b] bg-[#effbdd] px-4 py-3 text-sm font-bold text-[#355c11] transition hover:bg-[#e3f8c9] disabled:opacity-50"
                    >
                      <Check size={16} />
                      Mark as Resolved
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={() => handleUpdateStatus("OPEN")}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      <RefreshCw size={15} />
                      Reopen Ticket
                    </button>
                  )}
                </aside>
              </div>
            </section>
          ) : (
            /* Tickets Table / List View */
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* Search and Filters Bar */}
              <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Workspace Tickets
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {filteredTickets.length} ticket
                    {filteredTickets.length === 1 ? "" : "s"} found
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative min-w-0 sm:w-64">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search tickets..."
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#88da1c] focus:ring-2 focus:ring-[#88da1c]/20"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    aria-label="Filter by status"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#88da1c]"
                  >
                    <option value="ALL">All statuses</option>
                    {TICKET_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={priorityFilter}
                    onChange={(event) => setPriorityFilter(event.target.value)}
                    aria-label="Filter by priority"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#88da1c]"
                  >
                    <option value="ALL">All priorities</option>
                    {TICKET_PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Loading Skeleton */}
              {isLoading && (
                <div className="p-8 text-center">
                  <Loader2
                    size={28}
                    className="mx-auto animate-spin text-[#88da1c]"
                  />
                  <p className="mt-3 text-sm font-semibold text-slate-600">
                    Loading support tickets...
                  </p>
                </div>
              )}

              {/* Tickets Table */}
              {!isLoading && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px] text-left">
                    <thead className="border-b border-slate-200 bg-[#f8faf5]">
                      <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <th className="px-5 py-4">Ticket</th>
                        <th className="px-5 py-4">Customer</th>
                        <th className="px-5 py-4">Priority</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4">Updated</th>
                        <th className="px-5 py-4 text-right">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredTickets.map((ticketItem) => {
                        const ticketId =
                          ticketItem.ticketNumber ||
                          ticketItem.id ||
                          ticketItem._id ||
                          "TKT";
                        return (
                          <tr
                            key={ticketId}
                            className="border-b border-slate-100 transition last:border-0 hover:bg-[#f9fcf4]"
                          >
                            <td className="max-w-[320px] px-5 py-4">
                              <button
                                type="button"
                                onClick={() => handleOpenTicket(ticketItem)}
                                className="text-left group"
                              >
                                <p className="text-xs font-semibold text-slate-400">
                                  {ticketId}
                                </p>
                                <p className="mt-1 truncate text-sm font-bold text-slate-800 transition group-hover:text-[#548b18]">
                                  {ticketItem.subject}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {ticketItem.category || "Technical Issue"}
                                </p>
                              </button>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#effbdd] text-xs font-bold text-[#426d14]">
                                  {getInitials(ticketItem.customerName)}
                                </div>

                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-800">
                                    {ticketItem.customerName}
                                  </p>
                                  <p className="mt-1 max-w-44 truncate text-xs text-slate-500">
                                    {ticketItem.customerEmail || "No email"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${getPriorityStyle(
                                  ticketItem.priority,
                                )}`}
                              >
                                {getPriorityLabel(ticketItem.priority)}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${getStatusStyle(
                                  ticketItem.status,
                                )}`}
                              >
                                {getStatusLabel(ticketItem.status)}
                              </span>
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                              {formatDate(ticketItem.updatedAt)}
                            </td>

                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleOpenTicket(ticketItem)}
                                className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:border-[#b8e98b] hover:bg-[#effbdd] hover:text-[#355c11]"
                              >
                                View Ticket
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Empty state: No search results */}
              {!isLoading && filteredTickets.length === 0 && tickets.length > 0 && (
                <div className="px-5 py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#effbdd] text-[#548b18]">
                    <Search size={24} />
                  </div>

                  <h3 className="mt-4 font-bold text-slate-900">
                    No matching tickets found
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Try adjusting your search query or reset your filters.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("ALL");
                      setPriorityFilter("ALL");
                    }}
                    className="mt-4 rounded-lg bg-[#effbdd] px-4 py-2 text-sm font-bold text-[#548b18] hover:bg-[#e4f8c6]"
                  >
                    Reset filters
                  </button>
                </div>
              )}

              {/* Empty state: No tickets in workspace yet */}
              {!isLoading && tickets.length === 0 && (
                <div className="px-5 py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#effbdd] text-[#548b18]">
                    <LifeBuoy size={24} />
                  </div>

                  <h3 className="mt-4 font-bold text-slate-900">
                    No support tickets yet
                  </h3>

                  <p className="mt-2 max-w-sm mx-auto text-sm text-slate-500">
                    Need help configuring WhatsApp, setting up campaigns, or
                    resolving issues? Create your first ticket now.
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#88da1c] px-5 py-2.5 text-sm font-bold text-[#20320d] shadow-sm transition hover:bg-[#79c516]"
                  >
                    <Plus size={17} />
                    Create Support Ticket
                  </button>
                </div>
              )}
            </section>
          )}

          <footer className="flex flex-col gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>VexChat Customer Support Center</p>
            <p>Live status & updates</p>
          </footer>
        </div>

        {/* Create Ticket Modal */}
        {showCreateModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-[2px]"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !isSubmittingTicket) {
                setShowCreateModal(false);
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-ticket-title"
              className="my-6 w-full max-w-xl rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-200 p-5 sm:p-6">
                <div>
                  <h2
                    id="create-ticket-title"
                    className="text-xl font-bold text-slate-900"
                  >
                    Create Support Ticket
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Describe your issue and our engineering team will respond
                    promptly.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isSubmittingTicket}
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                  aria-label="Close modal"
                >
                  <X size={19} />
                </button>
              </div>

              <form
                onSubmit={handleCreateTicket}
                className="space-y-5 p-5 sm:p-6"
              >
                <div>
                  <label
                    htmlFor="ticket-subject"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Subject <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="ticket-subject"
                    required
                    value={newSubject}
                    onChange={(event) => setNewSubject(event.target.value)}
                    placeholder="Brief summary of the issue (e.g. WhatsApp Webhook failing)"
                    maxLength={120}
                    disabled={isSubmittingTicket}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#88da1c] focus:ring-2 focus:ring-[#88da1c]/20 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="ticket-email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Contact Email <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="ticket-email"
                    type="email"
                    required
                    value={newEmail}
                    onChange={(event) => setNewEmail(event.target.value)}
                    placeholder="you@company.com"
                    disabled={isSubmittingTicket}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#88da1c] focus:ring-2 focus:ring-[#88da1c]/20 disabled:bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="ticket-category"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Category
                    </label>

                    <select
                      id="ticket-category"
                      value={newCategory}
                      onChange={(event) => setNewCategory(event.target.value)}
                      disabled={isSubmittingTicket}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#88da1c] disabled:bg-slate-50"
                    >
                      {TICKET_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="ticket-priority"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Priority
                    </label>

                    <select
                      id="ticket-priority"
                      value={newPriority}
                      onChange={(event) =>
                        setNewPriority(
                          event.target.value as SupportTicketPriority,
                        )
                      }
                      disabled={isSubmittingTicket}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#88da1c] disabled:bg-slate-50"
                    >
                      {TICKET_PRIORITIES.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="ticket-description"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>

                  <textarea
                    id="ticket-description"
                    required
                    rows={5}
                    maxLength={3000}
                    value={newDescription}
                    onChange={(event) => setNewDescription(event.target.value)}
                    placeholder="Provide details about what happened, steps to reproduce, or any error messages..."
                    disabled={isSubmittingTicket}
                    className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-[#88da1c] focus:ring-2 focus:ring-[#88da1c]/20 disabled:bg-slate-50"
                  />

                  <p className="mt-1 text-right text-xs text-slate-400">
                    {newDescription.length}/3000
                  </p>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={isSubmittingTicket}
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingTicket}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#88da1c] px-5 py-3 text-sm font-bold text-[#20320d] transition hover:bg-[#79c516] disabled:opacity-50"
                  >
                    {isSubmittingTicket ? (
                      <>
                        <Loader2 size={17} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Plus size={17} />
                        Submit Ticket
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div
            role="status"
            className="fixed bottom-5 right-5 z-[60] flex max-w-sm items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <div
              className={`mt-0.5 rounded-full p-1 ${toast.type === "success"
                  ? "bg-[#effbdd] text-[#426d14]"
                  : "bg-red-50 text-red-600"
                }`}
            >
              {toast.type === "success" ? (
                <Check size={15} />
              ) : (
                <AlertCircle size={15} />
              )}
            </div>

            <p className="flex-1 text-sm leading-5 text-slate-700">
              {toast.message}
            </p>

            <button
              type="button"
              onClick={() => setToast(null)}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}
