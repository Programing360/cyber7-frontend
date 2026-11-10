"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Phone,
  PhoneCall,
  PhoneMissed,
  Search,
  RefreshCw,
  Loader2,
} from "lucide-react";
import type { CallLogItem } from "@/src/services/call-service";

export type { CallLogItem };

interface CallHistoryListProps {
  logs: CallLogItem[];
  isLoading?: boolean;
  onStartCall: (name: string, phone: string) => void;
  onRefresh?: () => void;
}

export default function CallHistoryList({
  logs,
  isLoading = false,
  onStartCall,
  onRefresh,
}: CallHistoryListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "MISSED">("ALL");

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        (log.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (log.phone || "").includes(search);
      const matchFilter = filter === "ALL" ? true : log.type === "MISSED";
      return matchSearch && matchFilter;
    });
  }, [logs, search, filter]);

  console.log(filteredLogs, logs);

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header & Search */}
      <div className="border-b border-[#f1f3f5] p-4 bg-slate-50/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <PhoneCall size={16} className="text-emerald-600" /> WhatsApp Call
            Logs
          </h3>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isLoading}
                title="Refresh call logs"
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
              >
                <RefreshCw
                  size={13}
                  className={isLoading ? "animate-spin" : ""}
                />
              </button>
            )}
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 border border-slate-200/60">
              {logs.length} calls
            </span>
          </div>
        </div>

        <div className="flex h-9 items-center gap-2 rounded-xl border border-[#f1f3f5] bg-white px-3 shadow-sm focus-within:border-emerald-500/50 transition">
          <Search size={14} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or number..."
            className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="mt-2.5 flex gap-1.5">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`rounded-lg px-3 py-1 text-[11px] font-medium transition ${
              filter === "ALL"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Calls
          </button>
          <button
            type="button"
            onClick={() => setFilter("MISSED")}
            className={`rounded-lg px-3 py-1 text-[11px] font-medium transition ${
              filter === "MISSED"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Missed Only
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#f1f3f5]">
        {isLoading && logs.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 size={24} className="animate-spin text-emerald-600" />
            <p className="text-xs">Loading call logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <PhoneMissed size={28} className="mx-auto text-slate-300 mb-2" />
            <p className="text-xs">No call logs found</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isMissed = log.type === "MISSED";
            const isIncoming = log.type === "INCOMING";

            return (
              <div
                key={log.id}
                className="flex items-center justify-between p-3.5 hover:bg-slate-50/80 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                      isMissed
                        ? "bg-rose-50 text-rose-600 border-rose-200/50"
                        : isIncoming
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200/50"
                          : "bg-blue-50 text-blue-600 border-blue-200/50"
                    }`}
                  >
                    {isMissed ? (
                      <PhoneMissed size={16} />
                    ) : isIncoming ? (
                      <ArrowDownLeft size={16} />
                    ) : (
                      <ArrowUpRight size={16} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`truncate text-xs font-semibold ${
                        isMissed ? "text-rose-700" : "text-slate-800"
                      }`}
                    >
                      {log.name || "Unknown Customer"}
                    </p>
                    <p className="truncate text-[11px] text-slate-400 font-mono">
                      {log.phone}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{log.timestamp}</span>
                      {log.duration && (
                        <>
                          <span>•</span>
                          <span className="font-mono font-medium text-slate-500">
                            {log.duration}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onStartCall(log.name, log.phone)}
                  title="Call Back"
                  className="rounded-xl border border-[#f1f3f5] bg-white p-2 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition shadow-sm active:scale-95"
                >
                  <Phone size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
