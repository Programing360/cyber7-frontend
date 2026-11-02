"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  FileText,
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
  WhatsAppTemplateItem,
} from "@/src/types/api";
import { templateService } from "@/src/services/template-service";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ChatWindowProps {
  conversation: WhatsAppConversationItem;
  messages: WhatsAppMessageItem[];
  isLoadingMessages: boolean;
  isSending: boolean;
  sendError: string | null;
  onSendMessage: (text: string) => Promise<void>;
  onSendTemplateMessage?: (
    templateId: string,
    components?: unknown,
    language?: string,
  ) => Promise<void>;
  onDismissError: () => void;
  onBack?: () => void;
  workspaceId?: string;
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
  onSendTemplateMessage,
  onDismissError,
  onBack,
  workspaceId,
}: ChatWindowProps) {
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Template Modal State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templates, setTemplates] = useState<WhatsAppTemplateItem[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplateItem | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [templateSendError, setTemplateSendError] = useState<string | null>(null);
  const [isSendingTemplate, setIsSendingTemplate] = useState(false);

  const contact = getContact(conversation);
  const contactName = contact?.profileName || contact?.phoneNumber || "Unknown";
  const phone = contact?.phoneNumber ?? "";
  const initials = getInitials(contact?.profileName, phone);

  const isClosed = conversation.status === "CLOSED";
  const isOptedOut = contact?.isOptedOut ?? false;
  const isServiceWindowActive = conversation.isCustomerServiceWindowActive ?? false;

  const canSendFreeform = !isSending && !isClosed && !isOptedOut && isServiceWindowActive && text.trim().length > 0;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clear text on conversation switch to prevent cross-conversation message leakage
  useEffect(() => {
    setText("");
    onDismissError();
    setIsTemplateModalOpen(false);
    setSelectedTemplate(null);
    setVariableValues({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation._id]);

  // Load approved templates when modal opens
  useEffect(() => {
    if (isTemplateModalOpen && workspaceId) {
      setIsLoadingTemplates(true);
      setTemplateSendError(null);
      templateService
        .getTemplates(workspaceId, { status: "APPROVED", limit: 50 })
        .then((res) => {
          setTemplates(res.templates);
          if (res.templates.length > 0 && !selectedTemplate) {
            handleSelectTemplate(res.templates[0]);
          }
        })
        .catch(() => setTemplates([]))
        .finally(() => setIsLoadingTemplates(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTemplateModalOpen, workspaceId]);

  function handleSelectTemplate(tmpl: WhatsAppTemplateItem) {
    setSelectedTemplate(tmpl);
    setTemplateSendError(null);
    const varCount = tmpl.variables?.length || (tmpl.body.match(/\{\{\d+\}\}/g) || []).length;
    const initialVars: Record<string, string> = {};
    for (let i = 1; i <= varCount; i++) {
      initialVars[String(i)] = "";
    }
    setVariableValues(initialVars);
  }

  // ── Send handler ────────────────────────────────────────────────────────────

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || isSending || isClosed || isOptedOut || !isServiceWindowActive) return;

    try {
      await onSendMessage(trimmed);
      setText("");
    } catch {
      // Text preserved for retry
    }
  }

  async function handleSendTemplate() {
    if (!selectedTemplate || !onSendTemplateMessage || isSendingTemplate) return;

    setIsSendingTemplate(true);
    setTemplateSendError(null);

    try {
      const paramKeys = Object.keys(variableValues);
      const missingKeys = paramKeys.filter((k) => !variableValues[k]?.trim());

      if (missingKeys.length > 0) {
        setTemplateSendError(`Please provide a value for variable {{${missingKeys[0]}}}`);
        setIsSendingTemplate(false);
        return;
      }

      const params = paramKeys.map((k) => ({
        type: "text",
        text: variableValues[k],
      }));

      const components = params.length > 0 ? [{ type: "body", parameters: params }] : undefined;

      await onSendTemplateMessage(
        selectedTemplate._id,
        components,
        selectedTemplate.language,
      );

      setIsTemplateModalOpen(false);
      setSelectedTemplate(null);
      setVariableValues({});
    } catch (err: any) {
      setTemplateSendError(err.message || "Failed to send template message");
    } finally {
      setIsSendingTemplate(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // ── Composer placeholder and tooltips based on state ────────────────────────

  const composerPlaceholder = isOptedOut
    ? "This contact has opted out — outbound messages are blocked"
    : isClosed
      ? "Conversation is closed — reopen to send messages"
      : !isServiceWindowActive
        ? "24-hour service window expired — send an approved template"
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
          {/* Contact Opt-out badge */}
          {isOptedOut && (
            <span className="rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold text-red-700 border border-red-200">
              Opted Out (STOP)
            </span>
          )}

          {/* 24-hour service window badge */}
          {!isOptedOut && isServiceWindowActive && (
            <span
              className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 border border-emerald-200"
              title="24-hour customer service window is open. Free-form messaging available."
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              24h Window Active
            </span>
          )}

          {!isOptedOut && !isServiceWindowActive && (
            <span
              className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700 border border-amber-200"
              title="24-hour customer service window has expired. Only approved templates permitted."
            >
              <Clock size={11} className="text-amber-600" />
              24h Window Expired
            </span>
          )}

          {/* Closed badge */}
          {isClosed && (
            <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500 sm:inline-flex">
              Closed
            </span>
          )}

          {/* Send Template Button */}
          {onSendTemplateMessage && !isOptedOut && (
            <button
              type="button"
              onClick={() => setIsTemplateModalOpen(true)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition"
              title="Send an approved WhatsApp template"
            >
              <FileText size={14} className="text-slate-500" />
              <span className="hidden md:inline">Templates</span>
            </button>
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
                        {msg.type === "TEMPLATE" ? (
                          <div>
                            <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider opacity-90">
                              <FileText size={11} />
                              <span>Template message</span>
                            </div>
                            <p className="whitespace-pre-wrap break-words text-sm leading-6">
                              {msg.text || ""}
                            </p>
                          </div>
                        ) : msg.type === "TEXT" ? (
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
          {/* Opt-out notification */}
          {isOptedOut && (
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-800">
              <AlertCircle size={15} className="shrink-0 text-red-600" />
              <span>
                This contact has opted out of WhatsApp communications (STOP). All outgoing messages are blocked.
              </span>
            </div>
          )}

          {/* 24-hour window expired notification */}
          {!isOptedOut && !isClosed && !isServiceWindowActive && (
            <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
              <div className="flex items-center gap-2 min-w-0">
                <Clock size={15} className="shrink-0 text-amber-600" />
                <span className="truncate">
                  24-hour service window expired. Send an approved template message to re-engage.
                </span>
              </div>
              {onSendTemplateMessage && (
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(true)}
                  className="shrink-0 rounded-lg bg-green-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-green-700 transition"
                >
                  Send Template
                </button>
              )}
            </div>
          )}

          <div
            className={`flex items-end gap-2 rounded-2xl border bg-slate-50 p-2 transition ${
              isClosed || isOptedOut || !isServiceWindowActive
                ? "border-slate-200 opacity-60"
                : "border-slate-200 focus-within:border-green-400"
            }`}
          >
            {/* Attachment button */}
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
              disabled={isClosed || isSending || isOptedOut || !isServiceWindowActive}
              placeholder={composerPlaceholder}
              aria-label="Type a message"
              className="max-h-32 min-h-10 flex-1 resize-y bg-transparent px-1 py-2 text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:placeholder:text-slate-300"
            />

            {/* Emoji button */}
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
              disabled={!canSendFreeform}
              aria-label="Send message"
              title={
                isOptedOut
                  ? "Contact opted out"
                  : isClosed
                    ? "Conversation is closed"
                    : !isServiceWindowActive
                      ? "24-hour window expired"
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
          ) : isOptedOut ? (
            <p className="mt-2 text-center text-[10px] text-red-500 font-medium">
              Contact has opted out of WhatsApp messages.
            </p>
          ) : isServiceWindowActive ? (
            <p className="mt-2 text-center text-[10px] text-slate-400">
              Enter to send · Shift+Enter for new line · Free-form messages available within 24h of customer message
            </p>
          ) : (
            <p className="mt-2 text-center text-[10px] text-amber-600">
              Free-form replies disabled outside 24h window. Use the Templates button to send an approved template.
            </p>
          )}
        </div>
      </div>

      {/* ── Template Selection Modal ────────────────────────────────────────── */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-green-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Send WhatsApp Template
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
              {templateSendError && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                  <AlertCircle size={15} className="shrink-0 text-red-500 mt-0.5" />
                  <span>{templateSendError}</span>
                </div>
              )}

              {isLoadingTemplates ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <Loader2 size={24} className="animate-spin text-green-600" />
                  <p className="mt-2 text-xs">Loading approved templates…</p>
                </div>
              ) : templates.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  <p className="text-sm font-medium">No approved templates found</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Sync or create approved templates in your WhatsApp account settings.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Select Approved Template
                    </label>
                    <select
                      value={selectedTemplate?._id || ""}
                      onChange={(e) => {
                        const found = templates.find((t) => t._id === e.target.value);
                        if (found) handleSelectTemplate(found);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-green-500"
                    >
                      {templates.map((tmpl) => (
                        <option key={tmpl._id} value={tmpl._id}>
                          {tmpl.name} ({tmpl.language}) — {tmpl.category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedTemplate && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-700 mb-1">
                          Template Preview
                        </p>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-800">
                          {selectedTemplate.body}
                        </div>
                      </div>

                      {/* Variable inputs */}
                      {Object.keys(variableValues).length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <p className="text-xs font-semibold text-slate-700">
                            Template Variables
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {Object.keys(variableValues).map((key) => (
                              <div key={key}>
                                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                  Variable {"{{" + key + "}}"}
                                </label>
                                <input
                                  type="text"
                                  value={variableValues[key] || ""}
                                  onChange={(e) =>
                                    setVariableValues((prev) => ({
                                      ...prev,
                                      [key]: e.target.value,
                                    }))
                                  }
                                  placeholder={`Value for {{${key}}}`}
                                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-green-500"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendTemplate}
                disabled={!selectedTemplate || isSendingTemplate || isLoadingTemplates}
                className="rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-40 flex items-center gap-1.5"
              >
                {isSendingTemplate ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Sending…</span>
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    <span>Send Template</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
