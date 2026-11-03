"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Loader2,
  MessageCircle,
  Plus,
  RefreshCw,
} from "lucide-react";

import DashboardLayout from "@/src/component/dashboard/dashboard-layout";
import ConversationList from "@/src/component/inbox/conversation-list";
import ChatWindow from "@/src/component/inbox/chat-window";
import ContactPanel from "@/src/component/inbox/contact-panel";
import NewConversationModal from "@/src/component/inbox/new-conversation-modal";

import { useWorkspace } from "@/src/context/workspace-context";
import { conversationService } from "@/src/services/conversation-service";
import { messageService } from "@/src/services/message-service";
import { ApiClientError } from "@/src/lib/api-client";
import type {
  ConversationStatus,
  WhatsAppConversationItem,
  WhatsAppMessageItem,
} from "@/src/types/api";

export default function InboxPage() {
  const { activeWorkspace } = useWorkspace();

  // ── Conversations ─────────────────────────────────────────────────────────

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

  // ── Messages ──────────────────────────────────────────────────────────────

  const [messages, setMessages] = useState<WhatsAppMessageItem[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  // ── Send message state ────────────────────────────────────────────────────

  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Track current workspace at the time of send to guard against stale responses
  const activeWorkspaceRef = useRef(activeWorkspace?.id);
  useEffect(() => {
    activeWorkspaceRef.current = activeWorkspace?.id;
  }, [activeWorkspace?.id]);

  // ── Derived state ─────────────────────────────────────────────────────────

  const selectedConversation =
    conversations.find(
      (c) => c._id === selectedId || (c as { id?: string }).id === selectedId,
    ) ?? null;

  // ── Fetch conversations ───────────────────────────────────────────────────

  const fetchConversations = useCallback(
    async (selectIdOnComplete?: string) => {
      if (!activeWorkspace?.id) return;

      setIsLoadingConversations(true);
      setConversationsError(null);

      try {
        const result = await conversationService.listConversations({
          workspaceId: activeWorkspace.id,
          limit: 50,
        });

        setConversations(result.conversations);

        if (selectIdOnComplete) {
          setSelectedId(selectIdOnComplete);
        } else if (result.conversations.length > 0) {
          setSelectedId((current) => {
            const exists = result.conversations.some(
              (c) => c._id === current || (c as { id?: string }).id === current,
            );
            return exists
              ? current
              : result.conversations[0]._id ||
              (result.conversations[0] as { id?: string }).id ||
              null;
          });
        }
      } catch (err) {
        const message =
          err instanceof ApiClientError
            ? err.message
            : "Failed to load conversations. Please try again.";
        setConversationsError(message);
      } finally {
        setIsLoadingConversations(false);
      }
    },
    [activeWorkspace?.id],
  );

  // Fetch on mount / workspace switch — clears all state including send state
  useEffect(() => {
    setConversations([]);
    setSelectedId(null);
    setMessages([]);
    setConversationsError(null);
    setMessagesError(null);
    setIsSending(false);
    setSendError(null);
    setIsNewModalOpen(false);
    fetchConversations();
  }, [activeWorkspace?.id, fetchConversations]);

  // ── Fetch messages when selected conversation changes ─────────────────────

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

  // ── Auto-refresh polling every 8s for live messaging ──────────────────────

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

  // ── Refresh all (conversations + active messages) ──────────────────────────

  const handleRefreshAll = useCallback(async () => {
    await Promise.all([
      fetchConversations(),
      selectedId ? fetchMessages() : Promise.resolve(),
    ]);
  }, [fetchConversations, fetchMessages, selectedId]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleSelectConversation(id: string) {
    setSelectedId(id);
    setMobileChatOpen(true);
    setSendError(null);
    setMessagesError(null);
  }

  function handleConversationCreated(conv: WhatsAppConversationItem) {
    const convId = conv._id || (conv as { id?: string }).id || "";
    setConversations((prev) => {
      const exists = prev.some(
        (c) => c._id === convId || (c as { id?: string }).id === convId,
      );
      if (exists) return prev;
      return [conv, ...prev];
    });
    setSelectedId(convId);
    setMobileChatOpen(true);
  }

  async function handleStatusChange(
    conversationId: string,
    status: ConversationStatus,
  ) {
    if (!activeWorkspace?.id) return;

    const updated = await conversationService.updateConversationStatus(
      activeWorkspace.id,
      conversationId,
      status,
    );

    setConversations((prev) =>
      prev.map((c) =>
        c._id === conversationId || (c as { id?: string }).id === conversationId
          ? { ...c, status: updated.status }
          : c,
      ),
    );
  }

  // ── Send message handler ──────────────────────────────────────────────────

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
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to send message. Please try again.";
      setSendError(errorMessage);
      throw err;
    } finally {
      setIsSending(false);
    }
  }

  // ── Send template message handler ──────────────────────────────────────────

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
            status: "OPEN",
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
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to send template message. Please try again.";
      setSendError(errorMessage);
      throw err;
    } finally {
      setIsSending(false);
    }
  }

  // ── No workspace state ────────────────────────────────────────────────────

  if (!activeWorkspace) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-[1800px]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                WhatsApp Inbox
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage customer conversations in one place.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center rounded-2xl bg-white p-24 shadow-lg">
            <div className="text-center">
              <MessageCircle size={40} className="mx-auto text-slate-300" />
              <p className="mt-4 text-sm font-semibold text-slate-600">
                No workspace selected
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Select a workspace to view your inbox.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              WhatsApp Inbox
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage customer conversations in one place.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600  px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-green-700"
            >
              <Plus size={15} />
              <span>New Conversation</span>
            </button>

            <button
              type="button"
              onClick={handleRefreshAll}
              disabled={isLoadingConversations || isLoadingMessages}
              title="Refresh conversations and messages"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 shadow-sm"
            >
              <RefreshCw
                size={14}
                className={
                  isLoadingConversations || isLoadingMessages
                    ? "animate-spin"
                    : ""
                }
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Error banner */}
        {conversationsError && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={17} className="mt-0.5 shrink-0 text-red-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900">
                Failed to load conversations
              </p>
              <p className="mt-1 text-xs text-red-700">{conversationsError}</p>
            </div>
            <button
              type="button"
              onClick={() => fetchConversations()}
              className="shrink-0 text-xs font-semibold text-red-700 hover:text-red-900"
            >
              Retry
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="grid h-[min(720px,calc(100vh-230px))] min-h-[480px] grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_270px]">
            {/* Conversation list */}
            <div
              className={`min-h-0 ${mobileChatOpen ? "hidden md:block" : "block"}`}
            >
              <ConversationList
                conversations={conversations}
                selectedId={selectedId}
                isLoading={isLoadingConversations}
                onSelect={handleSelectConversation}
                onNewConversation={() => setIsNewModalOpen(true)}
              />
            </div>

            {/* Chat window */}
            <div
              className={`min-h-0 ${mobileChatOpen ? "block" : "hidden md:block"}`}
            >
              {isLoadingConversations && conversations.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-400">
                  <div className="text-center">
                    <Loader2 size={32} className="mx-auto animate-spin" />
                    <p className="mt-3 text-sm">Loading conversations…</p>
                  </div>
                </div>
              ) : selectedConversation ? (
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
                  workspaceId={activeWorkspace.id}
                  onDismissError={() => setSendError(null)}
                  onBack={() => setMobileChatOpen(false)}
                />
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-slate-400">
                  <div className="max-w-sm text-center">
                    <MessageCircle
                      size={44}
                      className="mx-auto text-slate-300"
                    />
                    <p className="mt-4 text-base font-semibold text-slate-700">
                      {conversations.length === 0
                        ? "No conversations yet"
                        : "Select a conversation"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {conversations.length === 0
                        ? "Conversations appear when customers message your WhatsApp number, or you can start a chat directly."
                        : "Choose a conversation from the sidebar list to view and send messages."}
                    </p>
                    {conversations.length === 0 && (
                      <button
                        type="button"
                        onClick={() => setIsNewModalOpen(true)}
                        className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-green-700"
                      >
                        <Plus size={15} />
                        <span>Start New Conversation</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Contact / status panel */}
            <div className="hidden min-h-0 xl:block">
              {selectedConversation && (
                <ContactPanel
                  key={
                    selectedConversation._id ||
                    (selectedConversation as { id?: string }).id
                  }
                  conversation={selectedConversation}
                  onStatusChange={handleStatusChange}
                />
              )}
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-400">
          Workspace: {activeWorkspace.name} · Showing up to 50 most recent
          conversations.
        </p>
      </div>

      {/* New conversation dialog */}
      <NewConversationModal
        workspaceId={activeWorkspace.id}
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onConversationCreated={handleConversationCreated}
      />
    </DashboardLayout>
  );
}
