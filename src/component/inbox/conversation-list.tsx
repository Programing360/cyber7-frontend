"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  MessageCircle,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import type {
  WhatsAppConversationItem,
  WhatsAppConversationContact,
} from "@/src/types/api";

interface ConversationListProps {
  conversations: WhatsAppConversationItem[];
  selectedId: string | null;
  isLoading: boolean;
  onSelect: (id: string) => void;
  onNewConversation?: () => void;
  onDeleteConversation?: (id: string) => Promise<void> | void;
}

type FilterType = "All" | "Unread" | "Open" | "Pending" | "Closed";

function getContact(
  conv: WhatsAppConversationItem,
): WhatsAppConversationContact | null {
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
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
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
  onDeleteConversation,
}: ConversationListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("All");

  // Delete modal state
  const [conversationToDelete, setConversationToDelete] =
    useState<WhatsAppConversationItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  function handleOpenDeleteModal(
    e: React.MouseEvent,
    conv: WhatsAppConversationItem,
  ) {
    e.stopPropagation(); // চ্যাট সিলেক্ট হওয়া আটকানোর জন্য
    setConversationToDelete(conv);
  }

  async function handleConfirmDelete() {
    if (!conversationToDelete || isDeleting) return;

    const id =
      conversationToDelete._id || (conversationToDelete as { id?: string }).id;

    if (!id) return;

    try {
      setIsDeleting(true);
      if (onDeleteConversation) {
        await onDeleteConversation(id);
      }
      setConversationToDelete(null);
    } catch (err: unknown) {
      alert(
        err instanceof Error ? err.message : "Failed to delete conversation",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <section className="flex h-full min-h-0 flex-col border-r border-slate-200 bg-white">
        {/* Header */}
        <div className="border-b border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Inbox</h2>
              <p className="mt-1 text-xs text-slate-500">
                {conversations.length} conversation
                {conversations.length === 1 ? "" : "s"}
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
            {(["All", "Open", "Pending", "Closed"] as FilterType[]).map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${filter === item
                      ? "bg-green-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  {item}
                </button>
              ),
            )}
          </div>
        </div>

        {/* List items */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex gap-3 border-b border-slate-100 p-4"
                >
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
              const name =
                contact?.profileName || contact?.phoneNumber || "Unknown";
              const phone = contact?.phoneNumber ?? "";
              const initials = getInitials(contact?.profileName, phone);
              const colorClass = avatarPalette[index % avatarPalette.length];
              const timeLabel = formatTime(
                conv.lastMessageAt ?? conv.updatedAt,
              );
              const lastMessage = conv.lastMessage;
              let lastText = lastMessage?.text ?? "";
              if (!lastText && lastMessage?.type) {
                if (lastMessage.type === "AUDIO") {
                  lastText = "🎤 Voice message";
                } else if (lastMessage.type === "voice_call") {
                  lastText = "📞 Voice call";
                } else if (lastMessage.type === "missed_call") {
                  lastText = "📞 Missed voice call";
                } else if (lastMessage.type === "IMAGE") {
                  lastText = "📷 Photo";
                } else if (lastMessage.type === "VIDEO") {
                  lastText = "🎥 Video";
                }
              }
              const convId = conv._id || (conv as { id?: string }).id || "";
              const isSelected =
                selectedId === conv._id ||
                selectedId === (conv as { id?: string }).id;

              return (
                <div
                  key={convId}
                  onClick={() => onSelect(convId)}
                  className={`group relative flex w-full cursor-pointer gap-3 border-b border-slate-100 p-4 text-left transition ${isSelected ? "bg-green-50/80" : "hover:bg-slate-50"
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
                      <span className="shrink-0 text-[10px] text-slate-400 group-hover:hidden">
                        {timeLabel}
                      </span>
                      {/* Delete icon — visible on hover and focus */}
                      {onDeleteConversation && (
                        <button
                          type="button"
                          title="Delete conversation"
                          onClick={(e) => handleOpenDeleteModal(e, conv)}
                          className="hidden shrink-0 rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 group-hover:block transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>

                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-slate-500">
                        {lastText || (
                          <span className="italic text-slate-400">
                            No messages yet
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span
                        className={`rounded-md px-2 py-1 text-[10px] font-medium ${conv.status === "OPEN"
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
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-slate-200 p-3">
          <p className="text-center text-[10px] text-slate-400">
            {conversations.length} conversation
            {conversations.length === 1 ? "" : "s"} loaded
          </p>
        </div>
      </section>

      {/* ── Confirmation Modal ────────────────────────────────────────── */}
      {conversationToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={() => !isDeleting && setConversationToDelete(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <AlertTriangle size={20} />
              </div>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setConversationToDelete(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-3">
              <h3 className="text-base font-bold text-slate-900">
                Delete Conversation?
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Are you sure you want to delete the conversation with{" "}
                <span className="font-semibold text-slate-800">
                  {getContact(conversationToDelete)?.profileName ||
                    getContact(conversationToDelete)?.phoneNumber ||
                    "this contact"}
                </span>
                ? All associated messages will be permanently removed.
              </p>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setConversationToDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
