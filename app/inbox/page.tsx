"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, PhoneCall, Plus, RefreshCw } from "lucide-react";

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
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const [messages, setMessages] = useState<WhatsAppMessageItem[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

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
      setCallLogs(logs);
    } catch (err) {
      console.warn("Failed to fetch call logs:", err);
    } finally {
      setIsLoadingCallLogs(false);
    }
  }, [activeWorkspace?.id]);

  // Load call logs on workspace change and when user views Calls tab
  useEffect(() => {
    fetchCallLogs();
  }, [fetchCallLogs, activeTab]);

  // ── Dynamic Real-Time WhatsApp WebRTC Calling Hook ─────────────────────────
  const whatsAppCall = useWhatsAppCall({
    workspaceId: activeWorkspace?.id,
    onCallEnded: () => {
      // Automatically refresh call records from backend when call terminates
      fetchCallLogs();
    },
  });

  const handleInitiateCall = (name: string, phone: string) => {
    whatsAppCall.startCall({ name, phone });
  };

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
  }, [activeWorkspace?.id]);

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
    [activeWorkspace?.id, selectedId],
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

  // ── No Active Workspace Guard ──────────────────────────────────────────────
  if (!activeWorkspace) {
    return (
      <DashboardLayout>
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm max-w-sm">
            <p className="text-sm font-semibold text-slate-800">
              No workspace selected
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Please create or switch to a workspace to access live messaging
              and WhatsApp VoIP calling.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-50">
        {/* Top Control Bar */}
        <div className="border-b border-[#f1f3f5] bg-white px-4 py-2.5 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            {/* Tabs: Messages vs Calls */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200/60 shadow-inner">
              <button
                type="button"
                onClick={() => setActiveTab("MESSAGES")}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${activeTab === "MESSAGES"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <MessageCircle size={15} className="text-emerald-600" />
                <span>Messages</span>
                {conversations.length > 0 && (
                  <span className="rounded-full bg-slate-200/80 px-2 py-0.2 text-[10px] font-bold text-slate-700">
                    {conversations.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("CALLS")}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${activeTab === "CALLS"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <PhoneCall size={15} className="text-emerald-600" />
                <span>Calls</span>
                {callLogs.length > 0 && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] font-bold text-emerald-800">
                    {callLogs.length}
                  </span>
                )}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefreshAll}
                disabled={isLoadingConversations || isLoadingMessages || isLoadingCallLogs}
                title="Refresh Inbox & Call Logs"
                className="flex items-center gap-1.5 rounded-xl border border-[#f1f3f5] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={
                    isLoadingConversations || isLoadingMessages || isLoadingCallLogs
                      ? "animate-spin text-emerald-600"
                      : "text-slate-500"
                  }
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              {activeTab === "MESSAGES" && (
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition active:scale-95 border border-emerald-400/20"
                >
                  <Plus size={14} />
                  <span>New Chat</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Workspace Ingress Frame */}
        <div className="flex-1 min-h-0 p-3 sm:p-4">
          <div className="grid h-full grid-cols-1 md:grid-cols-[330px_1fr] xl:grid-cols-[330px_1fr_300px] rounded-2xl border border-[#f1f3f5] bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
            {/* Left Column: Conversations or Calls */}
            <div
              className={`min-h-0 border-r border-[#f1f3f5] ${mobileChatOpen ? "hidden md:block" : "block"
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
              className={`min-h-0 ${mobileChatOpen ? "block" : "hidden md:block"
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
                  workspaceId={activeWorkspace?.id}
                  onStartCall={handleInitiateCall}
                  onDismissError={() => setSendError(null)}
                  onBack={() => setMobileChatOpen(false)}
                />
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-slate-400 bg-slate-50/30">
                  <div className="max-w-sm text-center">
                    <MessageCircle
                      size={44}
                      className="mx-auto text-slate-300 mb-3"
                    />
                    <p className="text-base font-semibold text-slate-700">
                      Select a conversation
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Choose a customer from the left list to begin messaging or
                      start a real-time WhatsApp VoIP audio call.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Contact Panel */}
            <div className="hidden min-h-0 xl:block border-l border-[#f1f3f5]">
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
