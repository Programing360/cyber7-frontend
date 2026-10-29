"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { ChatMessage, initialConversations } from "@/src/data/mock/inbox";
import DashboardLayout from "@/src/component/dashboard/dashboard-layout";
import ConversationList from "@/src/component/inbox/conversation-list";
import ChatWindow from "@/src/component/inbox/chat-window";
import ContactPanel from "@/src/component/inbox/contact-panel";

export default function InboxPage() {
  const [conversations, setConversations] = useState(initialConversations);

  const [selectedId, setSelectedId] = useState(initialConversations[0].id);

  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const selectedConversation =
    conversations.find((item) => item.id === selectedId) ?? conversations[0];

  function handleSelectConversation(id: string) {
    setSelectedId(id);
    setMobileChatOpen(true);

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === id ? { ...conversation, unread: 0 } : conversation,
      ),
    );
  }

  function handleSendMessage(message: ChatMessage) {
    setConversations((current) =>
      current.map((conversation) => {
        if (conversation.id !== selectedId) {
          return conversation;
        }

        return {
          ...conversation,
          lastMessage: message.text,
          lastMessageTime: message.time,
          messages: [...conversation.messages, message],
        };
      }),
    );
  }

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

          {/* <span className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Demo Mode
          </span> */}
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="grid h-[min(720px,calc(100vh-230px))] min-h-[480px] grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_270px]">
            {/* Conversation list */}
            <div
              className={`min-h-0 ${
                mobileChatOpen ? "hidden md:block" : "block"
              }`}
            >
              <ConversationList
                conversations={conversations}
                selectedId={selectedId}
                onSelect={handleSelectConversation}
              />
            </div>

            {/* Chat */}
            <div
              className={`min-h-0 ${
                mobileChatOpen ? "block" : "hidden md:block"
              }`}
            >
              {selectedConversation ? (
                <ChatWindow
                  conversation={selectedConversation}
                  onSendMessage={handleSendMessage}
                  onBack={() => setMobileChatOpen(false)}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">
                  <div className="text-center">
                    <MessageCircle size={40} className="mx-auto" />
                    <p className="mt-3 text-sm">Select a conversation</p>
                  </div>
                </div>
              )}
            </div>

            {/* Contact details */}
            <div className="hidden min-h-0 xl:block">
              {selectedConversation && (
                <ContactPanel
                  key={selectedConversation.id}
                  conversation={selectedConversation}
                />
              )}
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-400">
          This inbox uses local data. Messages, read status and
          conversation updates are not synchronized with WhatsApp or a backend.
        </p>
      </div>
    </DashboardLayout>
  );
}
