"use client";

import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import type { DashboardRecentConversationItem } from "@/src/types/api";

interface RecentConversationsProps {
  conversations?: DashboardRecentConversationItem[];
  isLoading?: boolean;
}

export default function RecentConversations({
  conversations = [],
  isLoading = false,
}: RecentConversationsProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Recent Conversations
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest customer interactions
          </p>
        </div>

        <Link
          href="/inbox"
          className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-800"
        >
          View inbox
          <ArrowUpRight size={15} />
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-5 divide-y divide-slate-100">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex animate-pulse items-center gap-3 py-4 first:pt-0 last:pb-0">
              <div className="h-11 w-11 shrink-0 rounded-full bg-slate-100" />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between">
                  <div className="h-4 w-28 rounded bg-slate-100" />
                  <div className="h-3 w-12 rounded bg-slate-100" />
                </div>
                <div className="mt-2 h-3 w-44 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : conversations.length > 0 ? (
        <div className="mt-5 divide-y divide-slate-100">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href="/inbox"
              className="flex items-center gap-3 py-4 first:pt-0 last:pb-0 transition hover:bg-slate-50/60 rounded-xl px-2 -mx-2"
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
                    {conversation.time}
                  </span>
                </div>

                <p className="mt-1 truncate text-xs text-slate-500">
                  {conversation.message}
                </p>
              </div>

              {conversation.unread > 0 && (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-green-600 px-1 text-[10px] font-bold text-white">
                  {conversation.unread}
                </span>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
            <MessageCircle size={20} />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-800">
            No conversations yet
          </p>
          <p className="mt-1 max-w-xs text-xs text-slate-400">
            Incoming WhatsApp messages from your contacts will appear here automatically.
          </p>
        </div>
      )}

      <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 p-3">
        <MessageCircle size={16} className="text-slate-400 shrink-0" />

        <p className="text-xs text-slate-500">
          Live conversations strictly isolated to this workspace.
        </p>
      </div>
    </section>
  );
}
