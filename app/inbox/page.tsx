"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeftRight,
  Building2,
  MessageCircle,
  PhoneCall,
  Plus,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { getStoredToken } from "@/src/lib/token-storage";

import DashboardLayout from "@/src/component/dashboard/dashboard-layout";
import ConversationList from "@/src/component/inbox/conversation-list";
import ChatWindow from "@/src/component/inbox/chat-window";
import ContactPanel from "@/src/component/inbox/contact-panel";
import NewConversationModal from "@/src/component/inbox/new-conversation-modal";
import CallModal from "@/src/component/inbox/call-modal";
import CallHistoryList from "@/src/component/inbox/call-history-list";

import { useWorkspace } from "@/src/context/workspace-context";
import { conversationService } from "@/src/services/conversation-service";
import { messageService } from "@/src/services/message-service";
import { callService, type CallLogItem } from "@/src/services/call-service";
import { useWhatsAppCall } from "@/src/hook/useWhatsAppCall";
import { ApiClientError } from "@/src/lib/api-client";
import type {
  WhatsAppConversationItem,
  WhatsAppMessageItem,
} from "@/src/types/api";
import { useRouter } from "next/navigation";

export default function InboxPage() {
  const { activeWorkspace } = useWorkspace();

  // Tab State: Messages vs Calls
  const [activeTab, setActiveTab] = useState<"MESSAGES" | "CALLS">("MESSAGES");

  // Dynamic Call Logs State
  const [callLogs, setCallLogs] = useState<CallLogItem[]>([]);
  const [isLoadingCallLogs, setIsLoadingCallLogs] = useState(false);

  // ── Dynamic WhatsApp Messages State ─────────────────────────────────────────
  const [conversations, setConversations] = useState<
    WhatsAppConversationItem[]
  >([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [conversationsError, setConversationsError] = useState<string | null>(
    null,
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedIdRef = useRef(selectedId);
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const [messages, setMessages] = useState<WhatsAppMessageItem[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const router = useRouter();

  const activeWorkspaceRef = useRef(activeWorkspace?.id);
  useEffect(() => {
    activeWorkspaceRef.current = activeWorkspace?.id;
  }, [activeWorkspace?.id]);

  const selectedConversation =
    conversations.find(
      (c) => c._id === selectedId || (c as { id?: string }).id === selectedId,
    ) ?? null;

  // ── Dynamic Fetch Call Logs from Backend ──────────────────────────────────
  const fetchCallLogs = useCallback(async () => {
    if (!activeWorkspace?.id) {
      setCallLogs([]);
      return;
    }
    setIsLoadingCallLogs(true);
    try {
      const logs = await callService.getCallLogs(activeWorkspace.id);
      // console.log(logs);
      setCallLogs(logs);
    } catch (err) {
      console.warn("Failed to fetch call logs:", err);
    } finally {
      setIsLoadingCallLogs(false);
    }
  }, [activeWorkspace]);

  // Load call logs on workspace change and when user views Calls tab
  useEffect(() => {
    fetchCallLogs();
  }, [fetchCallLogs, activeTab]);

  // ── Dynamic Real-Time WhatsApp WebRTC Calling Hook ─────────────────────────
  const whatsAppCall = useWhatsAppCall({
    workspaceId: activeWorkspace?.id,
    onCallEnded: () => {
      // [Fix 2] Automatically refresh call records and active chat stream when call terminates
      fetchCallLogs();
      fetchMessages(true);
      fetchConversations();
    },
  });
 
  const handleInitiateCall = (name: string, phone: string) => {
    whatsAppCall.startCall({ name, phone });
  };

  // ── Real-Time Socket.IO Message Synchronization ──────────────────────────
  useEffect(() => {
    if (!activeWorkspace?.id) return;

    const token = getStoredToken();
    if (!token) return;

    const serverUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (process.env.NEXT_PUBLIC_API_URL
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")
        : "http://localhost:5000");

    const socket: Socket = io(serverUrl, {
      auth: { accessToken: token, token },
      transports: ["polling", "websocket"],
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      socket.emit("join-workspace", activeWorkspace.id);
    });

    socket.on(
      "new-message",
      (raw: WhatsAppMessageItem | { message: WhatsAppMessageItem }) => {
        const incomingMsg = (raw as any)?.message || raw;
        if (!incomingMsg) return;

        // Update current chat message stream if this conversation is active
        if (
          incomingMsg.conversationId &&
          selectedIdRef.current === incomingMsg.conversationId
        ) {
          setMessages((prev) => {
            const exists = prev.some(
              (m) =>
                m._id === incomingMsg._id ||
                (m.waMessageId && m.waMessageId === incomingMsg.waMessageId),
            );
            if (exists) return prev;
            return [...prev, incomingMsg];
          });
        }

        // Update conversation list preview
        setConversations((prev) =>
          prev.map((c) => {
            const id = c._id || (c as { id?: string }).id;
            if (id !== incomingMsg.conversationId) return c;
            return {
              ...c,
              lastMessageAt: incomingMsg.timestamp || incomingMsg.createdAt,
              lastMessage: {
                _id: incomingMsg._id,
                text:
                  incomingMsg.text ||
                  (incomingMsg.type === "CALL"
                    ? "Voice call"
                    : incomingMsg.type === "IMAGE"
                      ? "Photo"
                      : incomingMsg.type === "VIDEO"
                        ? "Video"
                        : incomingMsg.type),
                type: incomingMsg.type,
                direction: incomingMsg.direction,
                status: incomingMsg.status,
                timestamp: incomingMsg.timestamp || incomingMsg.createdAt,
              },
            };
          }),
        );

        // If a CALL message arrived, also refresh call logs tab
        if (incomingMsg.type === "CALL") {
          fetchCallLogs();
        }
      },
    );

    return () => {
      socket.disconnect();
    };
  }, [activeWorkspace?.id, fetchCallLogs]);

  // ── Fetch Conversations ────────────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    if (!activeWorkspace?.id) {
      setConversations([]);
      return;
    }

    setIsLoadingConversations(true);
    setConversationsError(null);

    try {
      const result = await conversationService.listConversations({
        workspaceId: activeWorkspace.id,
        limit: 50,
      });

      setConversations(result.conversations);

      // Preserve existing selection if valid, otherwise select first
      if (result.conversations.length > 0) {
        setSelectedId((current) => {
          const stillExists = result.conversations.some(
            (c) => c._id === current || (c as { id?: string }).id === current,
          );
          return stillExists
            ? current
            : result.conversations[0]._id ||
                (result.conversations[0] as { id?: string }).id ||
                null;
        });
      } else {
        setSelectedId(null);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load conversations. Please try again.";
      setConversationsError(message);
      setConversations([]);
      setSelectedId(null);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [activeWorkspace]);

  // Reset state on workspace switch
  useEffect(() => {
    setSelectedId(null);
    setMessages([]);
    setMobileChatOpen(false);
    setConversationsError(null);
    setMessagesError(null);
    setSendError(null);
    setIsNewModalOpen(false);
    fetchConversations();
  }, [activeWorkspace?.id, fetchConversations]);

  // ── Fetch Messages ─────────────────────────────────────────────────────────
  const fetchMessages = useCallback(
    async (silent = false) => {
      if (!activeWorkspace?.id || !selectedId) {
        setMessages([]);
        return;
      }

      if (!silent) setIsLoadingMessages(true);
      setMessagesError(null);

      try {
        const result = await conversationService.listMessages({
          workspaceId: activeWorkspace.id,
          conversationId: selectedId,
          limit: 100,
        });
        setMessages(result.messages);
      } catch (err: unknown) {
        if (!silent) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to load messages for this conversation.";
          setMessagesError(message);
          setMessages([]);
        }
      } finally {
        if (!silent) setIsLoadingMessages(false);
      }
    },
    [activeWorkspace, selectedId],
  );

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Polling for real-time sync
  useEffect(() => {
    if (!activeWorkspace?.id || !selectedId) return;

    const interval = setInterval(() => {
      if (
        typeof document !== "undefined" &&
        document.visibilityState === "visible"
      ) {
        fetchMessages(true);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [activeWorkspace?.id, selectedId, fetchMessages]);

  const handleRefreshAll = useCallback(async () => {
    await Promise.all([
      fetchConversations(),
      selectedId ? fetchMessages() : Promise.resolve(),
      activeTab === "CALLS" ? fetchCallLogs() : Promise.resolve(),
    ]);
  }, [fetchConversations, fetchMessages, fetchCallLogs, selectedId, activeTab]);

  // ── Message Handlers ───────────────────────────────────────────────────────
  async function handleSendMessage(text: string) {
    if (!activeWorkspace?.id || !selectedId || isSending) return;

    const workspaceIdAtSend = activeWorkspace.id;
    const conversationIdAtSend = selectedId;

    setIsSending(true);
    setSendError(null);

    try {
      const saved = await messageService.sendTextMessage({
        workspaceId: workspaceIdAtSend,
        conversationId: conversationIdAtSend,
        text,
      });

      if (activeWorkspaceRef.current !== workspaceIdAtSend) {
        return;
      }

      setMessages((prev) => {
        const exists = prev.some(
          (m) =>
            m._id === saved._id ||
            (m.waMessageId && m.waMessageId === saved.waMessageId),
        );
        if (exists) return prev;

        const newMsg: WhatsAppMessageItem = {
          _id: saved._id,
          workspaceId: saved.workspaceId,
          conversationId: saved.conversationId,
          contactId: saved.contactId,
          whatsappAccountId: saved.whatsappAccountId,
          waMessageId: saved.waMessageId,
          direction: saved.direction,
          type: saved.type,
          status: saved.status,
          text: saved.text,
          senderId: saved.senderId,
          timestamp: saved.timestamp,
          createdAt: saved.timestamp,
          statusUpdatedAt: saved.statusUpdatedAt,
        };

        return [...prev, newMsg];
      });

      setConversations((prev) =>
        prev.map((c) => {
          const id = c._id || (c as { id?: string }).id;
          if (id !== conversationIdAtSend) return c;
          return {
            ...c,
            lastMessageAt: saved.timestamp,
            lastMessage: {
              _id: saved._id,
              text: saved.text,
              type: saved.type,
              direction: saved.direction,
              status: saved.status,
              timestamp: saved.timestamp,
            },
          };
        }),
      );
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        const errorBody = err.data as
          | { error?: { message?: string } }
          | undefined;
        setSendError(
          errorBody?.error?.message ||
            err.message ||
            "Failed to send message. Please try again.",
        );
      } else {
        const message =
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while sending.";
        setSendError(message);
      }
      throw err;
    } finally {
      setIsSending(false);
    }
  }

  async function handleSendTemplateMessage(
    templateId: string,
    components?: unknown,
    language?: string,
  ) {
    if (!activeWorkspace?.id || !selectedId || isSending) return;

    const workspaceIdAtSend = activeWorkspace.id;
    const conversationIdAtSend = selectedId;

    setIsSending(true);
    setSendError(null);

    try {
      const saved = await messageService.sendTemplateMessage({
        workspaceId: workspaceIdAtSend,
        conversationId: conversationIdAtSend,
        templateId,
        language,
        components,
      });

      if (activeWorkspaceRef.current !== workspaceIdAtSend) {
        return;
      }

      setMessages((prev) => {
        const exists = prev.some(
          (m) =>
            m._id === saved._id ||
            (m.waMessageId && m.waMessageId === saved.waMessageId),
        );
        if (exists) return prev;

        const newMsg: WhatsAppMessageItem = {
          _id: saved._id,
          workspaceId: saved.workspaceId,
          conversationId: saved.conversationId,
          contactId: saved.contactId,
          whatsappAccountId: saved.whatsappAccountId,
          waMessageId: saved.waMessageId,
          direction: saved.direction,
          type: saved.type,
          status: saved.status,
          text: saved.text,
          senderId: saved.senderId,
          timestamp: saved.timestamp,
          createdAt: saved.timestamp,
          statusUpdatedAt: saved.statusUpdatedAt,
        };

        return [...prev, newMsg];
      });

      setConversations((prev) =>
        prev.map((c) => {
          const id = c._id || (c as { id?: string }).id;
          if (id !== conversationIdAtSend) return c;
          return {
            ...c,
            lastMessageAt: saved.timestamp,
            lastMessage: {
              _id: saved._id,
              text: saved.text,
              type: saved.type,
              direction: saved.direction,
              status: saved.status,
              timestamp: saved.timestamp,
            },
          };
        }),
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to send template message.";
      setSendError(message);
    } finally {
      setIsSending(false);
    }
  }

  // ── [Fix 3] Outbound Media Message Handler ───────────────────────────────
  async function handleSendMediaMessage(
    type: "IMAGE" | "VIDEO",
    fileBase64: string,
    filename: string,
    mimeType: string,
    caption?: string,
  ) {
    if (!activeWorkspace?.id || !selectedId || isSending) return;

    const workspaceIdAtSend = activeWorkspace.id;
    const conversationIdAtSend = selectedId;

    setIsSending(true);
    setSendError(null);

    try {
      const saved = await messageService.sendMediaMessage({
        workspaceId: workspaceIdAtSend,
        conversationId: conversationIdAtSend,
        type,
        fileBase64,
        filename,
        mimeType,
        caption,
      });

      if (activeWorkspaceRef.current !== workspaceIdAtSend) {
        return;
      }

      setMessages((prev) => {
        const exists = prev.some((m) => m._id === saved._id);
        if (exists) return prev;
        return [...prev, saved];
      });

      setConversations((prev) =>
        prev.map((c) => {
          const id = c._id || (c as { id?: string }).id;
          if (id !== conversationIdAtSend) return c;
          return {
            ...c,
            lastMessageAt: saved.timestamp,
            lastMessage: {
              _id: saved._id,
              text: saved.text || (saved.type === "IMAGE" ? "Photo" : "Video"),
              type: saved.type,
              direction: saved.direction,
              status: saved.status,
              timestamp: saved.timestamp,
            },
          };
        }),
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to send media message.";
      setSendError(message);
      throw err;
    } finally {
      setIsSending(false);
    }
  }

  // ── No Active Workspace Guard ──────────────────────────────────────────────
  if (!activeWorkspace) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50/60 px-4 py-10 sm:px-6">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Top Accent */}
            <div className="h-1 w-full bg-gradient-to-r from-[#88da1c] via-lime-400 to-emerald-400" />

            <div className="relative px-6 py-10 text-center sm:px-10 sm:py-12">
              {/* Background Decoration */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#88da1c]/5 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-100/40 blur-3xl" />

              {/* Icon */}
              <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#88da1c]/20 bg-[#88da1c]/10 shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm">
                  <MessageCircle
                    size={28}
                    strokeWidth={1.8}
                    className="text-[#65a30d]"
                  />
                </div>

                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-amber-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
              </div>

              {/* Content */}
              <div className="relative">
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Workspace Required
                </span>

                <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  No Workspace Selected
                </h2>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
                  You're almost there! Select an existing workspace or create a
                  new one to access your WhatsApp inbox, manage conversations,
                  and handle voice calls.
                </p>
              </div>

              {/* Info Box */}
              <div className="relative mt-7 flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 text-left">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#65a30d] shadow-sm">
                  <Building2 size={17} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Your workspace, your team
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Workspaces keep your contacts, messages, team members, and
                    WhatsApp integrations organized in one place.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="relative mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => router.push("/dashboard/workspaces")}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#88da1c] px-5 py-3 text-sm font-bold text-slate-900 shadow-sm shadow-[#88da1c]/20 transition-all hover:bg-[#79c817] hover:shadow-md active:scale-[0.98]"
                >
                  <Plus size={17} />
                  Create Workspace
                </button>

                <button
                  onClick={() => router.push("/dashboard/workspaces")}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
                >
                  <ArrowLeftRight size={16} />
                  Switch Workspace
                </button>
              </div>

              {/* Footer */}
              <div className="relative mt-7 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck size={13} />
                Your workspace data stays private and secure.
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="inbox-container relative flex h-[calc(100vh-4rem)] supports-[height:100dvh]:h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-[#f8fafc] antialiased">
        {/* Top Control Bar */}
        {/* Sticky Inbox Header */}
        <div className="sticky top-0 z-30 shrink-0 border-b border-slate-200/80 bg-white/95 px-3 py-3 shadow-sm backdrop-blur-xl sm:px-5 lg:px-6">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Inbox Tabs */}
            <div className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-slate-100/80 p-1">
              {/* Messages */}
              <button
                type="button"
                onClick={() => setActiveTab("MESSAGES")}
                className={`relative inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                  activeTab === "MESSAGES"
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/70"
                    : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
                }`}
              >
                <MessageCircle
                  size={15}
                  className={
                    activeTab === "MESSAGES"
                      ? "text-[#65a30d]"
                      : "text-slate-400"
                  }
                />

                <span>Messages</span>

                {conversations.length > 0 && (
                  <span className="flex h-[19px] min-w-[19px] items-center justify-center rounded-md bg-[#88da1c]/15 px-1 text-[10px] font-bold text-[#4d7c0f]">
                    {conversations.length}
                  </span>
                )}
              </button>

              {/* Calls */}
              <button
                type="button"
                onClick={() => setActiveTab("CALLS")}
                className={`relative inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                  activeTab === "CALLS"
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/70"
                    : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
                }`}
              >
                <PhoneCall
                  size={15}
                  className={
                    activeTab === "CALLS" ? "text-[#65a30d]" : "text-slate-400"
                  }
                />

                <span>Calls</span>

                {callLogs.length > 0 && (
                  <span className="flex h-[19px] min-w-[19px] items-center justify-center rounded-md bg-[#88da1c]/15 px-1 text-[10px] font-bold text-[#4d7c0f]">
                    {callLogs.length}
                  </span>
                )}
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Refresh */}
              <button
                type="button"
                onClick={handleRefreshAll}
                disabled={
                  isLoadingConversations ||
                  isLoadingMessages ||
                  isLoadingCallLogs
                }
                title="Refresh Inbox"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:border-[#88da1c]/50 hover:bg-[#88da1c]/5 hover:text-slate-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={
                    isLoadingConversations ||
                    isLoadingMessages ||
                    isLoadingCallLogs
                      ? "animate-spin text-[#65a30d]"
                      : "text-slate-400"
                  }
                />

                <span className="hidden sm:inline">Refresh</span>
              </button>

              {/* New Chat */}
              {activeTab === "MESSAGES" && (
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(true)}
                  aria-label="New Chat"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#88da1c] text-xs font-bold text-slate-900 shadow-sm shadow-[#88da1c]/20 transition-all hover:bg-[#79c817] hover:shadow-md active:scale-95 sm:h-10 sm:w-auto sm:px-4"
                >
                  <Plus size={17} strokeWidth={2.5} />
                  <span className="hidden sm:inline">New Chat</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Workspace Ingress Frame */}
        <div className="min-h-0 flex-1 overflow-hidden p-2 sm:p-3 md:p-4 lg:p-5">
          <div className="grid h-full grid-cols-1 md:grid-cols-[290px_1fr] lg:grid-cols-[320px_1fr] xl:grid-cols-[320px_1fr_300px] 2xl:grid-cols-[340px_1fr_340px] rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/40 overflow-hidden ring-1 ring-slate-900/5">
            {/* Left Column: Conversations or Calls */}
            <div
              className={`min-h-0 border-r border-slate-200/80 bg-white flex flex-col ${
                mobileChatOpen ? "hidden md:flex" : "flex"
              }`}
            >
              {activeTab === "MESSAGES" ? (
                <ConversationList
                  conversations={conversations}
                  selectedId={selectedId}
                  isLoading={isLoadingConversations}
                  onSelect={(id) => {
                    setSelectedId(id);
                    setMobileChatOpen(true);
                  }}
                  onNewConversation={() => setIsNewModalOpen(true)}
                />
              ) : (
                <CallHistoryList
                  logs={callLogs}
                  isLoading={isLoadingCallLogs}
                  onStartCall={handleInitiateCall}
                  onRefresh={fetchCallLogs}
                />
              )}
            </div>

            {/* Main Window Column */}
            <div
              className={`min-h-0 bg-white flex flex-col ${
                mobileChatOpen ? "flex" : "hidden md:flex"
              }`}
            >
              {selectedConversation ? (
                <ChatWindow
                  conversation={selectedConversation}
                  messages={messages}
                  isLoadingMessages={isLoadingMessages}
                  isSending={isSending}
                  sendError={sendError}
                  messagesError={messagesError}
                  onRetryMessages={() => fetchMessages()}
                  onSendMessage={handleSendMessage}
                  onSendTemplateMessage={handleSendTemplateMessage}
                  onSendMediaMessage={handleSendMediaMessage}
                  workspaceId={activeWorkspace?.id}
                  onStartCall={handleInitiateCall}
                  onDismissError={() => setSendError(null)}
                  onBack={() => setMobileChatOpen(false)}
                />
              ) : (
                <div className="relative flex h-full flex-col items-center justify-center p-6 sm:p-8 text-center bg-gradient-to-b from-slate-50/60 via-white to-slate-50/40 overflow-hidden select-none">
                  {/* Ambient Background Glows */}
                  <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/8 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-teal-500/5 blur-3xl" />

                  <div className="relative z-10 max-w-sm flex flex-col items-center">
                    {/* Security & Feature Badge */}
                    <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50/70 px-3 py-1 text-[11px] font-semibold text-emerald-700 shadow-2xs backdrop-blur-xs">
                      <ShieldCheck
                        size={13}
                        className="text-emerald-600 shrink-0"
                      />
                      <span>End-to-End Encrypted VoIP & Chat</span>
                    </div>

                    {/* Icon Emblem */}
                    <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-50 to-teal-50/80 border border-emerald-100/80 shadow-md shadow-emerald-500/5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs border border-emerald-100 text-emerald-600">
                        <MessageCircle size={24} className="stroke-[2.2]" />
                      </div>
                    </div>

                    {/* Text Content */}
                    <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-800">
                      Select a conversation
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500 max-w-xs">
                      Choose a customer from the left list to review active chat
                      history or start high-fidelity WhatsApp VoIP voice
                      calling.
                    </p>

                    {/* Quick Action Trigger */}
                    {activeTab === "MESSAGES" && (
                      <button
                        type="button"
                        onClick={() => setIsNewModalOpen(true)}
                        className="mt-5 inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all active:scale-95 cursor-pointer"
                      >
                        <Plus
                          size={14}
                          className="text-emerald-600 stroke-[2.5]"
                        />
                        <span>Start a new conversation</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Contact Panel */}
            <div className="hidden min-h-0 xl:flex flex-col border-l border-slate-200/80 bg-slate-50/30 overflow-y-auto">
              {selectedConversation && (
                <ContactPanel
                  key={selectedConversation._id}
                  conversation={selectedConversation}
                  onStatusChange={async (id, status) => {
                    if (!activeWorkspace?.id) return;
                    await conversationService.updateConversationStatus(
                      activeWorkspace.id,
                      id,
                      status,
                    );
                    setConversations((prev) =>
                      prev.map((c) => (c._id === id ? { ...c, status } : c)),
                    );
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modern In-Call Dynamic Popup Window with Live WebRTC & Backend Persistence */}
      <CallModal
        isOpen={whatsAppCall.callState !== "idle"}
        call={
          whatsAppCall.activeContact
            ? {
                callId: whatsAppCall.activeContact.callId,
                name: whatsAppCall.activeContact.name,
                phone: whatsAppCall.activeContact.phone,
                type: whatsAppCall.callDirection,
              }
            : null
        }
        callState={whatsAppCall.callState}
        duration={whatsAppCall.duration}
        isMuted={whatsAppCall.isMuted}
        isSpeaker={whatsAppCall.isSpeakerOn}
        notice={whatsAppCall.callNotice}
        error={whatsAppCall.callError}
        onAcceptCall={whatsAppCall.acceptCall}
        onEndCall={whatsAppCall.endCall}
        onToggleMute={whatsAppCall.toggleMute}
        onToggleSpeaker={whatsAppCall.toggleSpeaker}
      />

      {/* New Conversation Modal */}
      {activeWorkspace && (
        <NewConversationModal
          workspaceId={activeWorkspace.id}
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          onConversationCreated={(conv) => {
            setConversations((prev) => [conv, ...prev]);
            setSelectedId(conv._id);
            setMobileChatOpen(true);
          }}
        />
      )}
    </DashboardLayout>
  );
}
