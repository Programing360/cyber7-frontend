"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Clock3,
  Loader2,
  Phone,
  Tag,
  UserRound,
  XCircle,
} from "lucide-react";
import type {
  ConversationStatus,
  WhatsAppConversationAssignee,
  WhatsAppConversationContact,
  WhatsAppConversationItem,
} from "@/src/types/api";

interface ContactPanelProps {
  conversation: WhatsAppConversationItem;
  onStatusChange: (
    conversationId: string,
    status: ConversationStatus,
  ) => Promise<void>;
}

function getContact(
  conv: WhatsAppConversationItem,
): WhatsAppConversationContact | null {
  if (conv.contactId && typeof conv.contactId === "object") {
    return conv.contactId as WhatsAppConversationContact;
  }
  return null;
}

function getAssignee(
  conv: WhatsAppConversationItem,
): WhatsAppConversationAssignee | null {
  if (conv.assignedTo && typeof conv.assignedTo === "object") {
    return conv.assignedTo as WhatsAppConversationAssignee;
  }
  return null;
}

function getInitials(name?: string, phone?: string): string {
  if (name && name.trim()) {
    return name
      .trim()
      .split(" ")
      .map((p) => p[0] ?? "")
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  if (phone) {
    return phone.replace(/\D/g, "").slice(-2) || "?";
  }
  return "?";
}

export default function ContactPanel({
  conversation,
  onStatusChange,
}: ContactPanelProps) {
  const [status, setStatus] = useState<ConversationStatus>(conversation.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);

  const contact = getContact(conversation);
  const assignee = getAssignee(conversation);
  const displayName = contact?.profileName || contact?.phoneNumber || "Unknown";
  const initials = getInitials(contact?.profileName, contact?.phoneNumber);

console.log(conversation);
  
  async function handleStatusChange(newStatus: ConversationStatus) {
    if (newStatus === status || isUpdating) return;

    setIsUpdating(true);
    try {
      await onStatusChange(conversation._id, newStatus);
      setStatus(newStatus);
    } catch {
      // revert optimistic update on failure — status stays as-is
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <aside className="h-full overflow-y-auto shadow-lg shadow-blue-200 border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-lg font-bold text-purple-700">
          {initials}
        </div>

        <h2 className="mt-3 text-base font-bold text-slate-900">
          {displayName}
        </h2>

        <p className="mt-1 text-xs font-semibold text-slate-500">
          WhatsApp Contact
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold ${
              status === "OPEN"
                ? "bg-green-50 text-green-700"
                : status === "PENDING"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-slate-100 text-slate-500"
            }`}
          >
            {status}
          </span>
          {contact?.isOptedOut && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold text-red-700">
              <XCircle size={11} /> Opted Out
            </span>
          )}
        </div>
      </div>

      <div className="border-b border-slate-200 p-4">
        <button
          type="button"
          onClick={() => setDetailsOpen(!detailsOpen)}
          className="flex w-full items-center justify-between text-sm font-semibold text-slate-800"
        >
          Contact Information
          {detailsOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
        </button>

        {detailsOpen && (
          <div className="mt-4 space-y-4">
            <div className="flex gap-3">
              <Phone size={17} className="shrink-0 text-slate-400" />

              <div className="min-w-0">
                <p className="text-[10px] text-slate-400">Phone number</p>
                <p className="mt-1 break-words text-xs font-medium text-slate-700">
                  {contact?.phoneNumber || "—"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Tag size={17} className="shrink-0 text-slate-400" />

              <div className="min-w-0">
                <p className="text-[10px] text-slate-400">WhatsApp ID</p>
                <p className="mt-1 break-words text-xs font-mono text-slate-700">
                  {contact?.waId || "—"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <UserRound size={17} className="shrink-0 text-slate-400" />

              <div className="min-w-0">
                <p className="text-[10px] text-slate-400">Assigned to</p>
                <p className="mt-1 text-xs font-medium text-slate-700">
                  {assignee
                    ? `${assignee.name} (${assignee.email})`
                    : "Unassigned"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Clock size={17} className="shrink-0 text-slate-400" />

              <div className="min-w-0">
                <p className="text-[10px] text-slate-400">
                  24-Hour Service Window
                </p>
                {conversation.isCustomerServiceWindowActive ? (
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-700">
                    <CheckCircle2
                      size={13}
                      className="shrink-0 text-emerald-600"
                    />
                    Active
                  </p>
                ) : (
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-700">
                    <AlertTriangle
                      size={13}
                      className="shrink-0 text-amber-600"
                    />
                    Expired (Template required)
                  </p>
                )}
                {conversation.customerServiceWindowExpiresAt && (
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {conversation.isCustomerServiceWindowActive
                      ? "Expires: "
                      : "Expired: "}
                    {new Date(
                      conversation.customerServiceWindowExpiresAt,
                    ).toLocaleTimeString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-b border-slate-200 p-4">
        <label
          htmlFor="conversation-status"
          className="flex items-center gap-2 text-sm font-semibold text-slate-800"
        >
          <Clock3 size={16} className="text-slate-400" />
          Conversation Status
        </label>

        <div className="relative mt-3">
          <select
            id="conversation-status"
            value={status}
            onChange={(e) =>
              handleStatusChange(e.target.value as ConversationStatus)
            }
            disabled={isUpdating}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-500 disabled:opacity-60"
          >
            <option value="OPEN">Open</option>
            <option value="PENDING">Pending</option>
            <option value="CLOSED">Closed</option>
          </select>

          {isUpdating && (
            <div className="pointer-events-none absolute inset-y-0 right-8 flex items-center">
              <Loader2 size={14} className="animate-spin text-slate-400" />
            </div>
          )}
        </div>

        <p className="mt-2 text-[10px] text-slate-400">
          Status changes are saved to the server immediately.
        </p>
      </div>
    </aside>
  );
}
