"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Clock3,
  Mail,
  Phone,
  Tag,
  UserRound,
} from "lucide-react";
import { Conversation } from "@/src/data/mock/inbox";

interface ContactPanelProps {
  conversation: Conversation;
}

export default function ContactPanel({ conversation }: ContactPanelProps) {
  const [status, setStatus] = useState(conversation.status);
  const [detailsOpen, setDetailsOpen] = useState(true);

  return (
    <aside className="h-full overflow-y-auto border-l border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-6 text-center">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold ${conversation.color}`}
        >
          {conversation.initials}
        </div>

        <h2 className="mt-3 text-base font-bold text-slate-900">
          {conversation.name}
        </h2>

        <p className="mt-1 text-xs font-semibold text-slate-500">
          Customer profile{" "}
        </p>

        <span className="mt-3 inline-flex rounded-full bg-green-50 px-3 py-1 text-[10px] font-semibold text-green-700">
          Sample Contact
        </span>
      </div>

      <div className="border-b border-slate-200 p-4">
        <button
          type="button"
          onClick={() => setDetailsOpen(!detailsOpen)}
          className="flex w-full items-center justify-between text-sm font-semibold text-slate-800"
        >
          Contact Information
          {detailsOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
        </button>

        {detailsOpen && (
          <div className="mt-4 space-y-4">
            <div className="flex gap-3">
              <Phone size={17} className="shrink-0 text-slate-400" />

              <div className="min-w-0">
                <p className="text-[10px] text-slate-400">Phone number</p>
                <p className="mt-1 break-words text-xs font-medium text-slate-700">
                  {conversation.phone}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Mail size={17} className="shrink-0 text-slate-400" />

              <div className="min-w-0">
                <p className="text-[10px] text-slate-400">Email</p>
                <p className="mt-1 break-words text-xs font-medium text-slate-700">
                  Not provided
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <UserRound size={17} className="shrink-0 text-slate-400" />

              <div className="min-w-0">
                <p className="text-[10px] text-slate-400">Assigned to</p>
                <p className="mt-1 text-xs font-medium text-slate-700">
                  {conversation.assignedTo}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-b border-slate-200 p-4">
        <label
          htmlFor="conversation-status"
          className="flex items-center gap-2 text-sm font-semibold text-slate-800"
        >
          <Clock3 size={16} className="text-slate-400" />
          Conversation Status
        </label>

        <select
          id="conversation-status"
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as Conversation["status"])
          }
          className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-500"
        >
          <option value="Open">Open</option>
          <option value="Pending">Pending</option>
          <option value="Resolved">Resolved</option>
        </select>

        <p className="mt-2 text-[10px] text-slate-400">
          Local state only. Not saved to a server.
        </p>
      </div>

      <div className="p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Tag size={16} className="text-slate-400" />
          Contact Tags
        </h3>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-[10px] font-medium text-blue-700">
            Customer
          </span>

          <span className="rounded-lg bg-purple-50 px-2.5 py-1.5 text-[10px] font-medium text-purple-700">
            WhatsApp
          </span>
        </div>

        <p className="mt-3 text-[10px] text-slate-400">
          Sample tags for demonstration.
        </p>
      </div>
    </aside>
  );
}
