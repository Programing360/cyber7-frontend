"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  LifeBuoy,
  MessageCircle,
  Plus,
  Search,
  Send,
  Ticket,
  X,
} from "lucide-react";

import DashboardLayout from "@/src/component/dashboard/dashboard-layout";

import {
  supportTickets as initialTickets,
  ticketCategories,
  ticketPriorities,
  ticketStatuses,
  type SupportTicket,
  type TicketPriority,
  type TicketStatus,
} from "@/src/data/mock/support";

const BRAND = "#88da1c";

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getPriorityStyle(priority: TicketPriority) {
  switch (priority) {
    case "Urgent":
      return "bg-red-50 text-red-700";
    case "High":
      return "bg-orange-50 text-orange-700";
    case "Medium":
      return "bg-amber-50 text-amber-700";
    case "Low":
      return "bg-slate-100 text-slate-600";
  }
}

function getStatusStyle(status: TicketStatus) {
  switch (status) {
    case "Open":
      return "bg-lime-100 text-lime-800";
    case "In Progress":
      return "bg-blue-50 text-blue-700";
    case "Resolved":
      return "bg-emerald-50 text-emerald-700";
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {" "}
      <div className="flex items-start justify-between gap-3">
        {" "}
        <div>
          {" "}
          <p className="text-sm font-medium text-slate-500">{title}</p>{" "}
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}{" "}
          </p>{" "}
          <p className="mt-2 text-xs text-slate-500">{description}</p>{" "}
        </div>
        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | TicketStatus>("All");
  const [priorityFilter, setPriorityFilter] = useState<"All" | TicketPriority>(
    "All",
  );

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState("");

  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState("Technical Issue");
  const [newPriority, setNewPriority] = useState<TicketPriority>("Medium");
  const [newDescription, setNewDescription] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [reply, setReply] = useState("");

  const selectedTicket = tickets.find(
    (ticketItem) => ticketItem.id === selectedTicketId,
  );

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tickets.filter((ticketItem) => {
      const matchesSearch =
        !query ||
        ticketItem.id.toLowerCase().includes(query) ||
        ticketItem.subject.toLowerCase().includes(query) ||
        ticketItem.customer.toLowerCase().includes(query) ||
        ticketItem.email.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || ticketItem.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || ticketItem.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  const stats = {
    total: tickets.length,
    open: tickets.filter((ticketItem) => ticketItem.status === "Open").length,
    inProgress: tickets.filter(
      (ticketItem) => ticketItem.status === "In Progress",
    ).length,
    resolved: tickets.filter((ticketItem) => ticketItem.status === "Resolved")
      .length,
  };

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  }

  function updateTicketStatus(ticketId: string, status: TicketStatus) {
    setTickets((currentTickets) =>
      currentTickets.map((ticketItem) =>
        ticketItem.id === ticketId
          ? {
              ...ticketItem,
              status,
              updatedAt: new Date().toISOString(),
            }
          : ticketItem,
      ),
    );

    showToast(
      `Ticket status updated to ${status}. Demo changes are temporary.`,
    );
  }

  function updateTicketPriority(ticketId: string, priority: TicketPriority) {
    setTickets((currentTickets) =>
      currentTickets.map((ticketItem) =>
        ticketItem.id === ticketId
          ? {
              ...ticketItem,
              priority,
              updatedAt: new Date().toISOString(),
            }
          : ticketItem,
      ),
    );

    showToast("Ticket priority updated. Demo changes are temporary.");
  }

  function handleCreateTicket(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newSubject.trim() || !newDescription.trim() || !newEmail.trim()) {
      showToast("Please complete all required fields.");
      return;
    }

    const newTicket: SupportTicket = {
      id: `TKT-${Date.now().toString().slice(-6)}`,
      subject: newSubject.trim(),
      customer: newEmail.split("@")[0].replace(/[._-]/g, " "),
      email: newEmail.trim(),
      category: newCategory,
      priority: newPriority,
      status: "Open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: newDescription.trim(),
      messages: [
        {
          id: `MSG-${Date.now()}`,
          sender: "Current User",
          role: "customer",
          message: newDescription.trim(),
          createdAt: new Date().toISOString(),
        },
      ],
    };

    setTickets((currentTickets) => [newTicket, ...currentTickets]);
    setSelectedTicketId(newTicket.id);
    setShowCreateModal(false);

    setNewSubject("");
    setNewCategory("Technical Issue");
    setNewPriority("Medium");
    setNewDescription("");
    setNewEmail("");

    showToast("Demo support ticket created successfully.");
  }

  function handleSendReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedTicket || !reply.trim()) return;

    const newMessage = {
      id: `MSG-${Date.now()}`,
      sender: "Cyber7 Support",
      role: "support" as const,
      message: reply.trim(),
      createdAt: new Date().toISOString(),
    };

    setTickets((currentTickets) =>
      currentTickets.map((ticketItem) =>
        ticketItem.id === selectedTicket.id
          ? {
              ...ticketItem,
              messages: [...ticketItem.messages, newMessage],
              updatedAt: new Date().toISOString(),
            }
          : ticketItem,
      ),
    );

    setReply("");
    showToast("Demo reply added to the conversation.");
  }

  return (
    <DashboardLayout>
      {" "}
      <main className="min-h-screen bg-[#f7f9f4] px-4 py-6 sm:px-6 lg:px-8">
        {" "}
        <div className="mx-auto max-w-7xl space-y-7">
          {/* Header */}{" "}
          <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            {" "}
            <div>
              {" "}
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                {" "}
                <span>Workspace</span> <span>/</span>{" "}
                <span className="font-medium text-slate-800">
                  Support Tickets{" "}
                </span>{" "}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Support Tickets
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Manage customer requests and keep every conversation organized.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#88da1c] px-5 py-3 text-sm font-bold text-[#20320d] shadow-sm transition hover:bg-[#79c516]"
            >
              <Plus size={18} />
              Create Ticket
            </button>
          </header>
          {/* Demo notice */}
          <div className="flex gap-3 rounded-2xl border border-[#c5ed98] bg-[#effbdd] p-4">
            <LifeBuoy size={20} className="mt-0.5 shrink-0 text-[#426d14]" />
            <div>
              <p className="text-sm font-bold text-[#29450c]">
                Support workspace demo
              </p>
              <p className="mt-1 text-sm leading-6 text-[#49682a]">
                Tickets, status changes, and replies are stored in temporary
                React state. Refreshing the page restores the original sample
                data.
              </p>
            </div>
          </div>
          {/* Stats */}
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
              description="Waiting for attention"
              icon={AlertCircle}
              iconClass="bg-amber-50 text-amber-700"
            />

            <StatCard
              title="In Progress"
              value={stats.inProgress}
              description="Currently being handled"
              icon={Clock3}
              iconClass="bg-blue-50 text-blue-700"
            />

            <StatCard
              title="Resolved"
              value={stats.resolved}
              description="Successfully resolved"
              icon={CheckCircle2}
              iconClass="bg-emerald-50 text-emerald-700"
            />
          </section>
          {/* Ticket list / details */}
          {selectedTicket ? (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
                <div>
                  <button
                    type="button"
                    onClick={() => setSelectedTicketId(null)}
                    className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                  >
                    <ArrowLeft size={16} />
                    Back to tickets
                  </button>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {selectedTicket.id}
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    {selectedTicket.subject}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${getPriorityStyle(
                      selectedTicket.priority,
                    )}`}
                  >
                    {selectedTicket.priority} Priority
                  </span>

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${getStatusStyle(
                      selectedTicket.status,
                    )}`}
                  >
                    {selectedTicket.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px]">
                {/* Conversation */}
                <div className="min-w-0 border-b border-slate-200 lg:border-b-0 lg:border-r">
                  <div className="space-y-5 p-5 sm:p-6">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                        Ticket description
                      </p>
                      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {selectedTicket.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <MessageCircle size={17} className="text-[#5a941c]" />
                      <h3 className="font-bold text-slate-900">Conversation</h3>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        {selectedTicket.messages.length}
                      </span>
                    </div>

                    {selectedTicket.messages.map((message) => {
                      const isSupport = message.role === "support";

                      return (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            isSupport ? "flex-row-reverse" : ""
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              isSupport
                                ? "bg-[#88da1c] text-[#20320d]"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {getInitials(message.sender)}
                          </div>

                          <div
                            className={`min-w-0 max-w-[85%] ${
                              isSupport ? "text-right" : ""
                            }`}
                          >
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              {!isSupport && (
                                <span className="text-sm font-bold text-slate-800">
                                  {message.sender}
                                </span>
                              )}

                              {isSupport && (
                                <span className="ml-auto text-sm font-bold text-slate-800">
                                  {message.sender}
                                </span>
                              )}

                              <span className="text-[11px] text-slate-400">
                                {formatDate(message.createdAt)}
                              </span>
                            </div>

                            <div
                              className={`rounded-2xl px-4 py-3 text-left text-sm leading-6 ${
                                isSupport
                                  ? "rounded-tr-sm bg-[#effbdd] text-[#29450c]"
                                  : "rounded-tl-sm bg-slate-100 text-slate-700"
                              }`}
                            >
                              {message.message}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <form
                    onSubmit={handleSendReply}
                    className="border-t border-slate-200 bg-slate-50/70 p-5"
                  >
                    <label
                      htmlFor="ticket-reply"
                      className="mb-2 block text-sm font-bold text-slate-800"
                    >
                      Write a reply
                    </label>

                    <textarea
                      id="ticket-reply"
                      value={reply}
                      onChange={(event) => setReply(event.target.value)}
                      placeholder="Type your response..."
                      rows={3}
                      className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#88da1c] focus:ring-2 focus:ring-[#88da1c]/20"
                    />

                    <div className="mt-3 flex justify-end">
                      <button
                        type="submit"
                        disabled={!reply.trim()}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#88da1c] px-4 py-2.5 text-sm font-bold text-[#20320d] transition hover:bg-[#79c516] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Send size={15} />
                        Add Reply
                      </button>
                    </div>
                  </form>
                </div>

                {/* Ticket properties */}
                <aside className="space-y-6 p-5 sm:p-6">
                  <div>
                    <h3 className="mb-4 font-bold text-slate-900">
                      Ticket Properties
                    </h3>

                    <label className="mb-2 block text-xs font-semibold text-slate-500">
                      Status
                    </label>

                    <select
                      value={selectedTicket.status}
                      onChange={(event) =>
                        updateTicketStatus(
                          selectedTicket.id,
                          event.target.value as TicketStatus,
                        )
                      }
                      className="mb-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-[#88da1c]"
                    >
                      {ticketStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    <label className="mb-2 block text-xs font-semibold text-slate-500">
                      Priority
                    </label>

                    <select
                      value={selectedTicket.priority}
                      onChange={(event) =>
                        updateTicketPriority(
                          selectedTicket.id,
                          event.target.value as TicketPriority,
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-[#88da1c]"
                    >
                      {ticketPriorities.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t border-slate-200 pt-5">
                    <h3 className="mb-4 font-bold text-slate-900">
                      Customer Details
                    </h3>

                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#effbdd] font-bold text-[#426d14]">
                        {getInitials(selectedTicket.customer)}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {selectedTicket.customer}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {selectedTicket.email}
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
                          {selectedTicket.category}
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
                    </div>
                  </div>

                  {selectedTicket.status !== "Resolved" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateTicketStatus(selectedTicket.id, "Resolved")
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#b8e98b] bg-[#effbdd] px-4 py-3 text-sm font-bold text-[#355c11] transition hover:bg-[#e3f8c9]"
                    >
                      <Check size={16} />
                      Mark as Resolved
                    </button>
                  )}
                </aside>
              </div>
            </section>
          ) : (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* Search and filters */}
              <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    All Tickets
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
                    onChange={(event) =>
                      setStatusFilter(
                        event.target.value as "All" | TicketStatus,
                      )
                    }
                    aria-label="Filter by status"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#88da1c]"
                  >
                    <option value="All">All statuses</option>
                    {ticketStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <select
                    value={priorityFilter}
                    onChange={(event) =>
                      setPriorityFilter(
                        event.target.value as "All" | TicketPriority,
                      )
                    }
                    aria-label="Filter by priority"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#88da1c]"
                  >
                    <option value="All">All priorities</option>
                    {ticketPriorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ticket table */}
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
                    {filteredTickets.map((ticketItem) => (
                      <tr
                        key={ticketItem.id}
                        className="border-b border-slate-100 transition last:border-0 hover:bg-[#f9fcf4]"
                      >
                        <td className="max-w-[300px] px-5 py-4">
                          <button
                            type="button"
                            onClick={() => setSelectedTicketId(ticketItem.id)}
                            className="text-left"
                          >
                            <p className="text-xs font-semibold text-slate-400">
                              {ticketItem.id}
                            </p>
                            <p className="mt-1 truncate text-sm font-bold text-slate-800 transition hover:text-[#548b18]">
                              {ticketItem.subject}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {ticketItem.category}
                            </p>
                          </button>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#effbdd] text-xs font-bold text-[#426d14]">
                              {getInitials(ticketItem.customer)}
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800">
                                {ticketItem.customer}
                              </p>
                              <p className="mt-1 max-w-44 truncate text-xs text-slate-500">
                                {ticketItem.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1.5 text-xs font-bold ${getPriorityStyle(
                              ticketItem.priority,
                            )}`}
                          >
                            {ticketItem.priority}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-bold ${getStatusStyle(
                              ticketItem.status,
                            )}`}
                          >
                            {ticketItem.status}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                          {formatDate(ticketItem.updatedAt)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedTicketId(ticketItem.id)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-[#b8e98b] hover:bg-[#effbdd] hover:text-[#355c11]"
                          >
                            View Ticket
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredTickets.length === 0 && (
                <div className="px-5 py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#effbdd] text-[#548b18]">
                    <Search size={24} />
                  </div>

                  <h3 className="mt-4 font-bold text-slate-900">
                    No tickets found
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Try a different search term or update your filters.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("All");
                      setPriorityFilter("All");
                    }}
                    className="mt-4 rounded-lg px-4 py-2 text-sm font-bold text-[#548b18] hover:bg-[#effbdd]"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </section>
          )}
          <footer className="flex flex-col gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>Cyber7 Support Center</p>
            {/* <p>
              Primary brand color:{" "}
              <span className="font-semibold text-slate-600">#88da1c</span>
            </p> */}
          </footer>
        </div>
        {/* Create Ticket Modal */}
        {showCreateModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-[2px]"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
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
                    Describe the issue so the support team can help.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
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
                    placeholder="Briefly describe your issue"
                    maxLength={120}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#88da1c] focus:ring-2 focus:ring-[#88da1c]/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="ticket-email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email address <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="ticket-email"
                    type="email"
                    required
                    value={newEmail}
                    onChange={(event) => setNewEmail(event.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#88da1c] focus:ring-2 focus:ring-[#88da1c]/20"
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
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#88da1c]"
                    >
                      {ticketCategories.map((category) => (
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
                        setNewPriority(event.target.value as TicketPriority)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#88da1c]"
                    >
                      {ticketPriorities.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
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
                    placeholder="Explain what happened and what you need help with..."
                    className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-[#88da1c] focus:ring-2 focus:ring-[#88da1c]/20"
                  />

                  <p className="mt-1 text-right text-xs text-slate-400">
                    {newDescription.length}/3000
                  </p>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#88da1c] px-5 py-3 text-sm font-bold text-[#20320d] transition hover:bg-[#79c516]"
                  >
                    <Plus size={17} />
                    Create Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Toast notification */}
        {toast && (
          <div
            role="status"
            className="fixed bottom-5 right-5 z-[60] flex max-w-sm items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xl"
          >
            <div className="mt-0.5 rounded-full bg-[#effbdd] p-1">
              <Check size={15} className="text-[#426d14]" />
            </div>

            <p className="flex-1 text-sm leading-5 text-slate-700">{toast}</p>

            <button
              type="button"
              onClick={() => setToast("")}
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
