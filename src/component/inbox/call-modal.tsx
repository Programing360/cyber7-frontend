"use client";

import React from "react";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  ShieldCheck,
  Volume2,
  VolumeX,
  AlertCircle,
  Users,
} from "lucide-react";

export interface ActiveCallData {
  callId?: string;
  name: string;
  phone: string;
  type: "incoming" | "outgoing";
}

interface CallModalProps {
  isOpen: boolean;
  call: ActiveCallData | null;
  callState?: "idle" | "ringing" | "assigned" | "connected" | "ended";
  duration?: number;
  isMuted?: boolean;
  isSpeaker?: boolean;
  notice?: string | null;
  error?: string | null;
  onAcceptCall?: () => void;
  onEndCall: () => void;
  onToggleMute?: () => void;
  onToggleSpeaker?: () => void;
}

export default function CallModal({
  isOpen,
  call,
  callState = "ringing",
  duration = 0,
  isMuted = false,
  isSpeaker = true,
  notice = null,
  error = null,
  onAcceptCall,
  onEndCall,
  onToggleMute,
  onToggleSpeaker,
}: CallModalProps) {
  if (!isOpen || !call || callState === "idle") return null;

  console.log(error, notice);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remaining.toString().padStart(2, "0")}`;
  };

  const isIncomingRinging = call.type === "incoming" && callState === "ringing";
  // "assigned" = agent claimed in DB; "connected" = real provider (not yet implemented).
  const isActiveCall = callState === "assigned" || callState === "connected";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-[#f1f3f5]/15 bg-slate-900/95 p-6 text-center shadow-2xl shadow-black/80">
        {/* Glow Effects */}
        <div className="pointer-events-none absolute -top-12 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl" />

        {/* Status Tag */}
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 text-[11px] font-medium text-emerald-400 shadow-sm">
          <ShieldCheck size={13} /> WhatsApp Cloud Calling
        </div>

        {/* Caller Avatar */}
        <div className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center">
          {callState === "ringing" && (
            <div className="absolute -inset-2 animate-ping rounded-full bg-emerald-500/20" />
          )}
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-800 text-2xl font-bold text-white shadow-xl ring-4 ring-slate-800 border border-white/20">
            {call.name ? call.name.slice(0, 2).toUpperCase() : "??"}
          </div>
        </div>

        {/* Name & Phone */}
        <h3 className="text-lg font-bold text-white tracking-tight">{call.name}</h3>
        <p className="mt-0.5 text-xs font-mono text-slate-400">{call.phone}</p>

        {/* Dynamic Notices / Feedback */}
        {notice && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-300">
            <Users size={14} className="shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {error && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Call Timer or Status */}
        {!notice && !error && (
          <div className="mt-4">
            {callState === "ringing" && (
              <p className="animate-pulse text-xs font-medium text-emerald-400">
                {call.type === "outgoing"
                  ? "Dialing via WhatsApp..."
                  : "Incoming WhatsApp Call..."}
              </p>
            )}
            {(callState === "assigned" || callState === "connected") && (
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/80 border border-white/10 px-3.5 py-1 text-xs font-mono text-emerald-300 shadow-inner">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                {callState === "assigned" ? "Assigned • " : ""}{formatTimer(duration)}
              </div>
            )}
            {callState === "ended" && (
              <p className="text-xs font-medium text-rose-400 animate-pulse">Call Ended</p>
            )}
          </div>
        )}

        {/* In-Call Controls */}
        <div className="mt-8 flex items-center justify-center gap-5">
          {isIncomingRinging ? (
            /* Incoming Call Actions: Accept or Decline */
            <>
              <button
                type="button"
                onClick={onEndCall}
                title="Decline Call"
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-950/60 transition hover:bg-rose-500 active:scale-95 border border-rose-400/30"
              >
                <PhoneOff size={24} />
              </button>
              <button
                type="button"
                onClick={onAcceptCall}
                title="Accept Call"
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-950/60 transition hover:bg-emerald-500 active:scale-95 border border-emerald-400/30 animate-bounce"
              >
                <Phone size={24} />
              </button>
            </>
          ) : (
            /* Active Call Controls: Mute, Hangup, Speaker */
            <>
              <button
                type="button"
                onClick={onToggleMute}
                disabled={!isActiveCall}
                title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                className={`flex h-12 w-12 items-center justify-center rounded-2xl transition disabled:opacity-40 border ${
                  isMuted
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                    : "bg-slate-800 text-slate-200 border-white/10 hover:bg-slate-700"
                }`}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              {/* End Call Button */}
              <button
                type="button"
                onClick={onEndCall}
                title="End Call"
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-950/60 transition hover:bg-rose-500 active:scale-95 border border-rose-400/30"
              >
                <PhoneOff size={24} />
              </button>

              <button
                type="button"
                onClick={onToggleSpeaker}
                disabled={!isActiveCall}
                title={isSpeaker ? "Mute Speaker" : "Enable Speaker"}
                className={`flex h-12 w-12 items-center justify-center rounded-2xl transition disabled:opacity-40 border ${
                  isSpeaker
                    ? "bg-sky-500/20 text-sky-400 border-sky-500/30"
                    : "bg-slate-800 text-slate-400 border-white/10 hover:bg-slate-700"
                }`}
              >
                {isSpeaker ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
