"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Plus, Search } from "lucide-react";
import type { WhatsAppConversationItem, WhatsAppConversationContact } from "@/src/types/api";

interface ConversationListProps {
  conversations: WhatsAppConversationItem[];
  selectedId: string | null;
  isLoading: boolean;
  onSelect: (id: string) => void;
  onNewConversation?: () => void;
}

type FilterType = "All" | "Unread" | "Open" | "Pending" | "Closed";

function getContact(conv: WhatsAppConversationItem): WhatsAppConversationContact | null {
  if (conv.contactId && typeof conv.contactId === "object") {
    return conv.contactId as WhatsAppConversationContact;
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

function formatTime(iso?: string): string {
  if (!iso) return "";
  try {
    const date = new Date(iso);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

const avatarPalette = [
  "bg-purple-100 text-purple-700",
  "bg-blue-100 text-blue-700",
  "bg-pink-100 text-pink-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-indigo-100 text-indigo-700",
];

export default function ConversationList({
  conversations,
  selectedId,
  isLoading,
  onSelect,
  onNewConversation,
}: ConversationListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("All");

  const filtered = useMemo(() => {
    return conversations.filter((conv) => {
      const contact = getContact(conv);
      const name = contact?.profileName ?? contact?.phoneNumber ?? "";
      const phone = contact?.phoneNumber ?? "";
      const lastText = conv.lastMessage?.text ?? "";

      const matchesSearch =
        !search.trim() ||
        name.toLowerCase().includes(search.toLowerCase()) ||
        phone.includes(search) ||
        lastText.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" ||
        (filter === "Open" && conv.status === "OPEN") ||
        (filter === "Pending" && conv.status === "PENDING") ||
        (filter === "Closed" && conv.status === "CLOSED");

      return matchesSearch && matchesFilter;
    });
  }, [conversations, search, filter]);

  return (
    <section className="flex h-full min-h-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Inbox</h2>
            <p className="mt-1 text-xs text-slate-500">
              {conversations.length} conversation{conversations.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onNewConversation && (
              <button
                type="button"
                onClick={onNewConversation}
                title="Start new conversation"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-green-600 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-green-700"
              >
                <Plus size={15} />
                <span>New</span>
              </button>
            )}
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-700">
              <MessageCircle size={18} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
          <Search size={17} className="shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            aria-label="Search conversations"
            className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {(["All", "Open", "Pending", "Closed"] as FilterType[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                filter === item
                  ? "bg-green-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 border-b border-slate-100 p-4">
                <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle size={28} className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-700">
              No conversations found
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {conversations.length === 0
                ? "Conversations appear here when customers message your WhatsApp number, or when you start a new conversation."
                : "Try another search or filter."}
            </p>
            {conversations.length === 0 && onNewConversation && (
              <button
                type="button"
                onClick={onNewConversation}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-green-700"
              >
                <Plus size={14} />
                <span>Start New Conversation</span>
              </button>
            )}
          </div>
        ) : (
          filtered.map((conv, index) => {
            const contact = getContact(conv);
            const name = contact?.profileName || contact?.phoneNumber || "Unknown";
            const phone = contact?.phoneNumber ?? "";
            const initials = getInitials(contact?.profileName, phone);
            const colorClass = avatarPalette[index % avatarPalette.length];
            const timeLabel = formatTime(conv.lastMessageAt ?? conv.updatedAt);
            const lastText = conv.lastMessage?.text ?? "";
            const convId = conv._id || (conv as { id?: string }).id || "";
            const isSelected = selectedId === conv._id || selectedId === (conv as { id?: string }).id;

            return (
              <button
                key={convId}
                type="button"
                onClick={() => onSelect(convId)}
                className={`flex w-full gap-3 border-b border-slate-100 p-4 text-left transition ${
                  isSelected ? "bg-green-50/80" : "hover:bg-slate-50"
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold ${colorClass}`}
                >
                  {initials}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {name}
                    </p>
                    <span className="shrink-0 text-[10px] text-slate-400">
                      {timeLabel}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="truncate text-xs text-slate-500">
                      {lastText || (
                        <span className="italic text-slate-400">No messages yet</span>
                      )}
                    </p>
                  </div>

                  <div className="mt-2">
                    <span
                      className={`rounded-md px-2 py-1 text-[10px] font-medium ${
                        conv.status === "OPEN"
                          ? "bg-green-50 text-green-700"
                          : conv.status === "PENDING"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {conv.status}
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="border-t border-slate-200 p-3">
        <p className="text-center text-[10px] text-slate-400">
          {conversations.length} conversation{conversations.length === 1 ? "" : "s"} loaded
        </p>
      </div>
    </section>
  );
}
