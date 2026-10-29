"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  MoreVertical,
  Paperclip,
  Send,
  Smile,
  UserRound,
} from "lucide-react";
import { ChatMessage, Conversation } from "@/src/data/mock/inbox";



interface ChatWindowProps {
  conversation: Conversation;
  onSendMessage: (message: ChatMessage) => void;
  onBack?: () => void;
}

export default function ChatWindow({
  conversation,
  onSendMessage,
  onBack,
}: ChatWindowProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages]);

  function handleSend() {
    const text = message.trim();

    if (!text) return;

    const newMessage: ChatMessage = {
      id: `demo-${Date.now()}`,
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      direction: "outgoing",
      status: "sent",
    };

    onSendMessage(newMessage);
    setMessage("");
  }

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

          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${conversation.color}`}
          >
            {conversation.initials}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">
              {conversation.name}
            </p>

            <p className="mt-1 truncate text-xs text-slate-500">
              {conversation.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* <span className="hidden rounded-full bg-amber-50 px-2.5 py-1.5 text-[10px] font-semibold text-amber-700 sm:inline-flex">
            Demo Conversation
          </span> */}

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
          <div className="mb-6 flex justify-center">
            <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] text-slate-500 shadow-sm">
              Today · message history
            </span>
          </div>

          <div className="space-y-4">
            {conversation.messages.map((item) => {
              const outgoing = item.direction === "outgoing";

              return (
                <div
                  key={item.id}
                  className={`flex ${outgoing ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[75%] ${
                      outgoing
                        ? "rounded-br-md bg-green-600 text-white"
                        : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">
                      {item.text}
                    </p>

                    <div
                      className={`mt-2 flex items-center justify-end gap-1 text-[10px] ${
                        outgoing ? "text-green-100" : "text-slate-400"
                      }`}
                    >
                      <span>{item.time}</span>

                      {outgoing &&
                        (item.status === "read" ||
                        item.status === "delivered" ? (
                          <CheckCheck size={14} />
                        ) : (
                          <Check size={13} />
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-slate-200 bg-white p-3 sm:p-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-green-400">
            <button
              type="button"
              aria-label="Attachment (demo only)"
              title="Attachments are not implemented yet"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-200"
            >
              <Paperclip size={19} />
            </button>

            <textarea
              rows={1}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a demo message..."
              aria-label="Type a message"
              className="max-h-32 min-h-10 flex-1 resize-y bg-transparent px-1 py-2 text-sm outline-none placeholder:text-slate-400"
            />

            <button
              type="button"
              aria-label="Emoji (demo only)"
              title="Emoji picker is not implemented yet"
              className="hidden rounded-lg p-2 text-slate-400 hover:bg-slate-200 sm:block"
            >
              <Smile size={19} />
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={!message.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send demo message"
              title="Send demo message"
            >
              <Send size={17} />
            </button>
          </div>

          <p className="mt-2 text-center text-[10px] text-slate-400">
            Demo only · Messages are not sent to WhatsApp.
          </p>
        </div>
      </div>
    </section>
  );
}