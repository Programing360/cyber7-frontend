"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCheck,
  Loader2,
  MessageCircle,
  MoreVertical,
  Paperclip,
  Send,
  Smile,
  X,
} from "lucide-react";
import type {
  WhatsAppConversationItem,
  WhatsAppConversationContact,
  WhatsAppMessageItem,
} from "@/src/types/api";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ChatWindowProps {
  conversation: WhatsAppConversationItem;
  messages: WhatsAppMessageItem[];
  isLoadingMessages: boolean;
  isSending: boolean;
  sendError: string | null;
  onSendMessage: (text: string) => Promise<void>;
  onDismissError: () => void;
  onBack?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function formatMessageTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function StatusIcon({ status }: { status: WhatsAppMessageItem["status"] }) {
  if (status === "READ" || status === "DELIVERED") {
    return <CheckCheck size={14} />;
  }
  if (status === "SENT") {
    return <Check size={13} />;
  }
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatWindow({
  conversation,
  messages,
  isLoadingMessages,
  isSending,
  sendError,
  onSendMessage,
  onDismissError,
  onBack,
}: ChatWindowProps) {
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const contact = getContact(conversation);
  const contactName = contact?.profileName || contact?.phoneNumber || "Unknown";
  const phone = contact?.phoneNumber ?? "";
  const initials = getInitials(contact?.profileName, phone);

  const isClosed = conversation.status === "CLOSED";
  const canSend = !isSending && !isClosed && text.trim().length > 0;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clear text on conversation switch to prevent cross-conversation message leakage
  useEffect(() => {
    setText("");
    onDismissError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation._id]);

  // ── Send handler ────────────────────────────────────────────────────────────

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || isSending || isClosed) return;

    try {
      await onSendMessage(trimmed);
      // Only clear the input after the backend confirms success
      setText("");
    } catch {
      // Text is preserved for retry — error is displayed by the parent
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // ── Composer placeholder and tooltips based on state ────────────────────────

  const composerPlaceholder = isClosed
    ? "Conversation is closed — reopen to send messages"
    : "Type a message… (Enter to send, Shift+Enter for new line)";

  return (
    <section className="flex h-full min-h-0 flex-col bg-[#f8fafc]">
      {/* Chat header */}
      <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to conversations"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <ArrowLeft size={19} />
            </button>
          )}

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
            {initials}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">
              {contactName}
            </p>
            <p className="mt-1 truncate text-xs text-slate-500">{phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Closed badge */}
          {isClosed && (
            <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500 sm:inline-flex">
              Closed
            </span>
          )}

          <button
            type="button"
            aria-label="More conversation options"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <MoreVertical size={19} />
          </button>
        </div>
      </header>

      {/* Message history */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-3xl">
          {isLoadingMessages ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" />
              <p className="mt-3 text-sm">Loading messages…</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <MessageCircle size={36} className="text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-600">
                No messages yet
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Messages will appear here when this contact sends a message.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex justify-center">
                <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] text-slate-500 shadow-sm">
                  Message history
                </span>
              </div>

              <div className="space-y-4">
                {messages.map((msg) => {
                  const outgoing = msg.direction === "OUTBOUND";

                  return (
                    <div
                      key={msg._id}
                      className={`flex ${outgoing ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[75%] ${
                          outgoing
                            ? "rounded-br-md bg-green-600 text-white"
                            : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
                        }`}
                      >
                        {msg.type === "TEXT" ? (
                          <p className="whitespace-pre-wrap break-words text-sm leading-6">
                            {msg.text || ""}
                          </p>
                        ) : (
                          <p className="whitespace-pre-wrap break-words text-sm italic leading-6 opacity-80">
                            [{msg.type.toLowerCase()} message]
                          </p>
                        )}

                        <div
                          className={`mt-2 flex items-center justify-end gap-1 text-[10px] ${
                            outgoing ? "text-green-100" : "text-slate-400"
                          }`}
                        >
                          <span>{formatMessageTime(msg.timestamp)}</span>
                          {outgoing && <StatusIcon status={msg.status} />}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Send error banner */}
      {sendError && (
        <div className="shrink-0 border-t border-red-100 bg-red-50 px-4 py-2">
          <div className="mx-auto flex max-w-3xl items-start gap-2">
            <AlertCircle
              size={15}
              className="mt-0.5 shrink-0 text-red-500"
            />
            <p className="flex-1 text-xs text-red-700">{sendError}</p>
            <button
              type="button"
              onClick={onDismissError}
              aria-label="Dismiss error"
              className="shrink-0 text-red-400 hover:text-red-600"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="shrink-0 border-t border-slate-200 bg-white p-3 sm:p-4">
        <div className="mx-auto max-w-3xl">
          <div
            className={`flex items-end gap-2 rounded-2xl border bg-slate-50 p-2 transition ${
              isClosed
                ? "border-slate-200 opacity-60"
                : "border-slate-200 focus-within:border-green-400"
            }`}
          >
            {/* Attachment button — not implemented yet */}
            <button
              type="button"
              aria-label="Attachment (not available yet)"
              title="Attachments are not supported in this version"
              disabled
              className="rounded-lg p-2 text-slate-300"
            >
              <Paperclip size={19} />
            </button>

            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isClosed || isSending}
              placeholder={composerPlaceholder}
              aria-label="Type a message"
              className="max-h-32 min-h-10 flex-1 resize-y bg-transparent px-1 py-2 text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:placeholder:text-slate-300"
            />

            {/* Emoji button — not implemented */}
            <button
              type="button"
              aria-label="Emoji picker (not available yet)"
              disabled
              className="hidden rounded-lg p-2 text-slate-300 sm:block"
            >
              <Smile size={19} />
            </button>

            {/* Send button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              aria-label="Send message"
              title={
                isClosed
                  ? "Conversation is closed"
                  : isSending
                    ? "Sending…"
                    : "Send message"
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSending ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Send size={17} />
              )}
            </button>
          </div>

          {isClosed ? (
            <p className="mt-2 text-center text-[10px] text-amber-600">
              This conversation is closed. Change the status to Open to send messages.
            </p>
          ) : (
            <p className="mt-2 text-center text-[10px] text-slate-400">
              Enter to send · Shift+Enter for new line · Free-form messages within 24 h of
              last customer reply
            </p>
          )}
        </div>
      </div>
    </section>
  );
}