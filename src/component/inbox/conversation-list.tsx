"use client";

import { useMemo, useState } from "react";
import { Search, MessageCircle } from "lucide-react";
import { Conversation } from "@/src/data/mock/inbox";


interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string;
  onSelect: (id: string) => void;
}

type FilterType = "All" | "Unread" | "Assigned";

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: ConversationListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("All");

  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      const matchesSearch =
        conversation.name.toLowerCase().includes(search.toLowerCase()) ||
        conversation.phone.includes(search) ||
        conversation.lastMessage.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" ||
        (filter === "Unread" && conversation.unread > 0) ||
        (filter === "Assigned" && conversation.assignedTo !== "Unassigned");

      return matchesSearch && matchesFilter;
    });
  }, [conversations, search, filter]);

  return (
    <section className="flex h-full min-h-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Inbox</h1>
            <p className="mt-1 text-xs text-slate-500">
              {conversations.length} demo conversations
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
            <MessageCircle size={20} />
          </div>
        </div>

        <div className="mt-4 flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
          <Search size={17} className="shrink-0 text-slate-400" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search conversations..."
            aria-label="Search conversations"
            className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="mt-3 flex gap-2">
          {(["All", "Unread", "Assigned"] as const).map((item) => (
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
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle size={28} className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-700">
              No conversations found
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Try another search or filter.
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => onSelect(conversation.id)}
              className={`flex w-full gap-3 border-b border-slate-100 p-4 text-left transition ${
                selectedId === conversation.id
                  ? "bg-green-50/80"
                  : "hover:bg-slate-50"
              }`}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold ${conversation.color}`}
              >
                {conversation.initials}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {conversation.name}
                  </p>

                  <span className="shrink-0 text-[10px] text-slate-400">
                    {conversation.lastMessageTime}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-slate-500">
                    {conversation.lastMessage}
                  </p>

                  {conversation.unread > 0 && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-green-600 px-1 text-[10px] font-bold text-white">
                      {conversation.unread}
                    </span>
                  )}
                </div>

                <div className="mt-2">
                  <span
                    className={`rounded-md px-2 py-1 text-[10px] font-medium ${
                      conversation.status === "Open"
                        ? "bg-green-50 text-green-700"
                        : conversation.status === "Pending"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {conversation.status}
                  </span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="border-t border-slate-200 p-3">
        <p className="text-center text-[10px] text-slate-400">
          Sample data · Not connected to WhatsApp
        </p>
      </div>
    </section>
  );
}
