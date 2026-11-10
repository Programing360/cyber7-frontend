"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCheck,
  FileText,
  Image as ImageIcon,
  Loader2,
  MessageCircle,
  MoreVertical,
  Paperclip,
  Phone,
  PhoneIncoming,
  PhoneMissed,
  PhoneOff,
  PhoneOutgoing,
  Send,
  Smile,
  Video,
  X,
} from "lucide-react";
import type {
  WhatsAppConversationItem,
  WhatsAppConversationContact,
  WhatsAppMessageItem,
  WhatsAppTemplateItem,
} from "@/src/types/api";
import { templateService } from "@/src/services/template-service";
import { messageService } from "@/src/services/message-service";
import { getStoredToken } from "@/src/lib/token-storage";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ChatWindowProps {
  conversation: WhatsAppConversationItem;
  messages: WhatsAppMessageItem[];
  isLoadingMessages: boolean;
  isSending: boolean;
  sendError: string | null;
  messagesError?: string | null;
  onRetryMessages?: () => void;
  onSendMessage: (text: string) => Promise<void>;
  onSendTemplateMessage?: (
    templateId: string,
    components?: unknown,
    language?: string,
  ) => Promise<void>;
  onSendMediaMessage?: (
    type: "IMAGE" | "VIDEO",
    fileBase64: string,
    filename: string,
    mimeType: string,
    caption?: string,
  ) => Promise<void>;
  onDismissError: () => void;
  onBack?: () => void;
  workspaceId?: string;
  /** Optional callback to initiate a WhatsApp call to this contact. */
  onStartCall?: (name: string, phone: string) => void;
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

// Media Message Bubble for authenticated streaming and responsive preview
function MediaMessageBubble({
  msg,
  workspaceId,
  outgoing,
  onPreviewImage,
}: {
  msg: WhatsAppMessageItem;
  workspaceId?: string;
  outgoing: boolean;
  onPreviewImage: (url: string) => void;
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const token = typeof window !== "undefined" ? getStoredToken() : null;
  const mediaSrc =
    msg.mediaId && workspaceId
      ? `/api/workspaces/${workspaceId}/whatsapp/media/${msg.mediaId}${
          token ? `?token=${encodeURIComponent(token)}` : ""
        }`
      : null;

  if (!mediaSrc || hasError) {
    return (
      <div className="space-y-2">
        <div
          className={`flex items-center gap-2 rounded-xl p-3 text-xs ${
            outgoing
              ? "bg-emerald-800/60 text-emerald-100"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {msg.type === "IMAGE" ? <ImageIcon size={18} /> : <Video size={18} />}
          <span>
            {msg.type === "IMAGE"
              ? "Image preview unavailable"
              : "Video preview unavailable"}
          </span>
        </div>
        {msg.text && (
          <p className="whitespace-pre-wrap break-words text-sm leading-6">
            {msg.text}
          </p>
        )}
      </div>
    );
  }

  if (msg.type === "IMAGE") {
    return (
      <div className="space-y-2">
        <div className="relative overflow-hidden rounded-xl bg-slate-900/10 min-w-[200px] min-h-[140px] max-w-sm">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100/50">
              <Loader2 size={22} className="animate-spin text-slate-500" />
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mediaSrc}
            alt={msg.text || "WhatsApp Image"}
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            onClick={() => onPreviewImage(mediaSrc)}
            className="cursor-pointer max-h-80 w-auto rounded-xl object-contain transition-transform hover:scale-[1.01]"
          />
        </div>
        {msg.text && (
          <p className="whitespace-pre-wrap break-words text-sm leading-6">
            {msg.text}
          </p>
        )}
      </div>
    );
  }

  // VIDEO
  return (
    <div className="space-y-2 max-w-sm">
      <div className="relative overflow-hidden rounded-xl bg-black">
        <video
          controls
          preload="metadata"
          className="max-h-80 w-full rounded-xl object-contain"
          onError={() => setHasError(true)}
        >
          <source src={mediaSrc} type={msg.mediaMimeType || "video/mp4"} />
          Your browser does not support the video tag.
        </video>
      </div>
      {msg.text && (
        <p className="whitespace-pre-wrap break-words text-sm leading-6">
          {msg.text}
        </p>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatWindow({
  conversation,
  messages,
  isLoadingMessages,
  isSending,
  sendError,
  messagesError,
  onRetryMessages,
  onSendMessage,
  onSendTemplateMessage,
  onSendMediaMessage,
  onDismissError,
  onBack,
  workspaceId,
  onStartCall,
}: ChatWindowProps) {
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Template Modal State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templates, setTemplates] = useState<WhatsAppTemplateItem[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<WhatsAppTemplateItem | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    {},
  );
  const [templateSendError, setTemplateSendError] = useState<string | null>(
    null,
  );
  const [isSendingTemplate, setIsSendingTemplate] = useState(false);

  // Media Upload & Fullscreen Preview State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [mediaCaption, setMediaCaption] = useState("");
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaUploadError, setMediaUploadError] = useState<string | null>(null);
  const [previewingImageUrl, setPreviewingImageUrl] = useState<string | null>(
    null,
  );

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";

    // 16 MB WhatsApp file size limit
    if (file.size > 16 * 1024 * 1024) {
      alert(
        "File size exceeds WhatsApp 16MB limit. Please select a smaller file.",
      );
      return;
    }

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      alert("Please select a supported image or video file.");
      return;
    }

    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setFilePreviewUrl(previewUrl);
    setMediaCaption("");
    setMediaUploadError(null);
  }

  function handleCancelMediaUpload() {
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    setSelectedFile(null);
    setFilePreviewUrl(null);
    setMediaCaption("");
    setMediaUploadError(null);
  }

  async function handleConfirmSendMedia() {
    if (!selectedFile || isUploadingMedia) return;

    setIsUploadingMedia(true);
    setMediaUploadError(null);

    try {
      const isVideo = selectedFile.type.startsWith("video/");
      const mediaType: "IMAGE" | "VIDEO" = isVideo ? "VIDEO" : "IMAGE";

      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const res = reader.result as string;
          const pureBase64 = res.includes(",") ? res.split(",")[1] : res;
          resolve(pureBase64);
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(selectedFile);
      });

      if (onSendMediaMessage) {
        await onSendMediaMessage(
          mediaType,
          base64Data,
          selectedFile.name,
          selectedFile.type,
          mediaCaption.trim() || undefined,
        );
      } else if (workspaceId && conversation._id) {
        await messageService.sendMediaMessage({
          workspaceId,
          conversationId: conversation._id,
          type: mediaType,
          fileBase64: base64Data,
          filename: selectedFile.name,
          mimeType: selectedFile.type,
          caption: mediaCaption.trim() || undefined,
        });
      }

      handleCancelMediaUpload();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to send media file.";
      setMediaUploadError(msg);
    } finally {
      setIsUploadingMedia(false);
    }
  }

  const contact = getContact(conversation);
  const contactName = contact?.profileName || contact?.phoneNumber || "Unknown";
  const phone = contact?.phoneNumber ?? "";
  const initials = getInitials(contact?.profileName, phone);

  const isClosed = conversation.status === "CLOSED";
  const isOptedOut = contact?.isOptedOut ?? false;

  const canSendFreeform =
    !isSending && !isClosed && !isOptedOut && text.trim().length > 0;

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
    const varCount =
      tmpl.variables?.length || (tmpl.body.match(/\{\{\d+\}\}/g) || []).length;
    const initialVars: Record<string, string> = {};
    for (let i = 1; i <= varCount; i++) {
      initialVars[String(i)] = "";
    }
    setVariableValues(initialVars);
  }

  // ── Send handler ────────────────────────────────────────────────────────────

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || isSending || isClosed || isOptedOut) return;

    try {
      await onSendMessage(trimmed);
      setText("");
    } catch {
      // Text preserved for retry
    }
  }

  async function handleSendTemplate() {
    if (!selectedTemplate || !onSendTemplateMessage || isSendingTemplate)
      return;

    setIsSendingTemplate(true);
    setTemplateSendError(null);

    try {
      const paramKeys = Object.keys(variableValues);
      const missingKeys = paramKeys.filter((k) => !variableValues[k]?.trim());

      if (missingKeys.length > 0) {
        setTemplateSendError(
          `Please provide a value for variable {{${missingKeys[0]}}}`,
        );
        setIsSendingTemplate(false);
        return;
      }

      const params = paramKeys.map((k) => ({
        type: "text",
        text: variableValues[k],
      }));

      const components =
        params.length > 0 ? [{ type: "body", parameters: params }] : undefined;

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

  // ── Composer placeholder based on state ─────────────────────────────────────

  const composerPlaceholder = isOptedOut
    ? "This contact has opted out — outbound messages are blocked"
    : isClosed
      ? "Conversation is closed — reopen to send messages"
      : "Type a message…";

  return (
    <section className="flex h-full min-h-0 flex-col bg-[#f8fafc]">
      {/* Chat header */}
      <header className="flex h-[76px] shrink-0 shadow-md items-center justify-between border-slate-200 bg-white px-4 sm:px-5">
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
              className="rounded-2xl shadow-md shadow-gray-400 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition"
              title="Send an approved WhatsApp template"
            >
              <FileText size={14} className="text-slate-500" />
              <span className="hidden md:inline">Templates</span>
            </button>
          )}

          {/* Call button — visible only when a phone number is available */}
          {onStartCall && phone && (
            <button
              type="button"
              aria-label={`Start WhatsApp call with ${contactName}`}
              title="Start WhatsApp call"
              onClick={() => onStartCall(contactName, phone)}
              className="rounded-lg p-2 text-slate-500 hover:bg-green-50 hover:text-green-600 transition-colors"
            >
              <Phone size={19} />
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
          {messagesError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-red-500">
              <AlertCircle size={32} className="text-red-400" />
              <p className="mt-3 text-sm font-semibold text-red-700">
                Failed to load messages
              </p>
              <p className="mt-1 text-xs text-red-500">{messagesError}</p>
              {onRetryMessages && (
                <button
                  type="button"
                  onClick={onRetryMessages}
                  className="mt-3 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200 transition"
                >
                  Retry
                </button>
              )}
            </div>
          ) : isLoadingMessages ? (
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
              <p className="mt-1 max-w-sm text-xs text-slate-400">
                Type a message below to start chatting with this contact.
              </p>
              {!isOptedOut && onSendTemplateMessage && (
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <FileText size={14} className="text-slate-500" />
                  <span>Send Template</span>
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-6 flex justify-center">
                <span className="rounded-lg shadow-lg shadow-blue-200 border-slate-200 bg-white px-3 py-1.5 text-[10px] text-slate-500">
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
                        className={`max-w-[85%] flex gap-4 rounded-2xl px-4 py-3 shadow-lg shadow-slate-700 sm:max-w-[75%] ${
                          outgoing
                            ? "rounded-br-md bg-green-900 text-white"
                            : "rounded-bl-md border-slate-200 bg-white text-slate-800"
                        }`}
                      >
                        {msg.type === "CALL" ? (
                          <div className="flex items-center gap-3 py-1">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                                msg.text?.toLowerCase().includes("missed") ||
                                msg.text?.toLowerCase().includes("declined") ||
                                msg.text?.toLowerCase().includes("unanswered")
                                  ? "bg-red-100 text-red-600"
                                  : outgoing
                                    ? "bg-emerald-800 text-white"
                                    : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {msg.text?.toLowerCase().includes("missed") ||
                              msg.text?.toLowerCase().includes("declined") ||
                              msg.text?.toLowerCase().includes("unanswered") ? (
                                outgoing ? (
                                  <PhoneOff size={18} />
                                ) : (
                                  <PhoneMissed size={18} />
                                )
                              ) : outgoing ? (
                                <PhoneOutgoing size={18} />
                              ) : (
                                <PhoneIncoming size={18} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold leading-tight">
                                {msg.text || "Voice call"}
                              </p>
                              <p
                                className={`mt-0.5 text-[11px] ${
                                  outgoing ? "text-green-100" : "text-slate-500"
                                }`}
                              >
                                {outgoing
                                  ? "Outgoing voice call"
                                  : "Incoming voice call"}
                              </p>
                            </div>
                          </div>
                        ) : msg.type === "IMAGE" || msg.type === "VIDEO" ? (
                          <MediaMessageBubble
                            msg={msg}
                            workspaceId={workspaceId}
                            outgoing={outgoing}
                            onPreviewImage={(url) => setPreviewingImageUrl(url)}
                          />
                        ) : msg.type === "TEMPLATE" ? (
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
            <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-500" />
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
                This contact has opted out of WhatsApp communications (STOP).
                All outgoing messages are blocked.
              </span>
            </div>
          )}

          <div
            className={`flex items-end gap-2 rounded-4xl shadow-md bg-slate-50 p-2 transition ${
              isClosed || isOptedOut
                ? "border-slate-200 opacity-60"
                : "border-slate-200 focus-within:border-green-400"
            }`}
          >
            {/* Hidden Media File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Attachment button for Image / Video sending */}
            <button
              type="button"
              aria-label="Send image or video"
              title="Attach image or video"
              onClick={() => fileInputRef.current?.click()}
              disabled={isClosed || isSending || isOptedOut}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-200/70 hover:text-slate-800 transition-colors disabled:cursor-not-allowed disabled:text-slate-300"
            >
              <Paperclip size={19} />
            </button>

            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isClosed || isSending || isOptedOut}
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
              This conversation is closed. Change the status to Open to send
              messages.
            </p>
          ) : isOptedOut ? (
            <p className="mt-2 text-center text-[10px] text-red-500 font-medium">
              Contact has opted out of WhatsApp messages.
            </p>
          ) : (
            <p className="mt-2 text-center text-[10px] text-slate-400">
              Enter to send · Shift+Enter for new line
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
                  <AlertCircle
                    size={15}
                    className="shrink-0 text-red-500 mt-0.5"
                  />
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
                  <p className="text-sm font-medium">
                    No approved templates found
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Sync or create approved templates in your WhatsApp account
                    settings.
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
                        const found = templates.find(
                          (t) => t._id === e.target.value,
                        );
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
                disabled={
                  !selectedTemplate || isSendingTemplate || isLoadingTemplates
                }
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

      {/* ── Media Upload Modal ──────────────────────────────────────── */}
      {selectedFile && filePreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 bg-slate-50">
              <div className="flex items-center gap-2">
                {selectedFile.type.startsWith("video/") ? (
                  <Video size={18} className="text-emerald-600" />
                ) : (
                  <ImageIcon size={18} className="text-emerald-600" />
                )}
                <h3 className="text-sm font-bold text-slate-800">
                  {selectedFile.type.startsWith("video/")
                    ? "Send Video"
                    : "Send Image"}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCancelMediaUpload}
                disabled={isUploadingMedia}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {mediaUploadError && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                  <AlertCircle
                    size={15}
                    className="shrink-0 text-red-500 mt-0.5"
                  />
                  <span>{mediaUploadError}</span>
                </div>
              )}

              <div className="flex justify-center rounded-xl bg-slate-950 p-2 max-h-72 overflow-hidden">
                {selectedFile.type.startsWith("video/") ? (
                  <video
                    src={filePreviewUrl}
                    controls
                    className="max-h-64 max-w-full rounded-lg object-contain"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={filePreviewUrl}
                    alt="Preview"
                    className="max-h-64 max-w-full rounded-lg object-contain"
                  />
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span className="truncate max-w-[260px] font-medium">
                  {selectedFile.name}
                </span>
                <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
              </div>

              <div>
                <input
                  type="text"
                  value={mediaCaption}
                  onChange={(e) => setMediaCaption(e.target.value)}
                  placeholder="Add a caption (optional)..."
                  disabled={isUploadingMedia}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-green-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
              <button
                type="button"
                onClick={handleCancelMediaUpload}
                disabled={isUploadingMedia}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSendMedia}
                disabled={isUploadingMedia}
                className="rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isUploadingMedia ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Uploading…</span>
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Fullscreen Image Preview Modal ───────────────────────────── */}
      {previewingImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs"
          onClick={() => setPreviewingImageUrl(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewingImageUrl(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/90 transition"
            >
              <X size={20} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewingImageUrl}
              alt="Full preview"
              className="max-h-[85vh] max-w-[85vw] object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}
