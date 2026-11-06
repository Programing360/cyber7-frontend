"use client";

import React, { useState, useEffect } from "react";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Clock,
  ShieldCheck,
} from "lucide-react";

/**
 * WhatsAppCallSystem (UI Preview & Sandbox Component)
 *
 * NOTE: This is a standalone design sandbox component for UI demonstration.
 * Production real-time WhatsApp Calling is integrated in the Inbox page (`/inbox`)
 * using the authenticated `useWhatsAppCall` hook, real Socket.IO events, and
 * tenant-scoped backend CallLog persistence.
 */
export default function WhatsAppCallSystem() {
  // Call States: 'idle' | 'ringing' | 'active' | 'ended'
  const [callState, setCallState] = useState("idle");
  const [callType, setCallType] = useState("incoming"); // 'incoming' | 'outgoing'
  const [callerInfo] = useState({
    name: "Rahim Ahmed",
    phone: "+880 1712-345678",
    avatar: null,
  });

  // Call Controls
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  // Timer Effect for Active Call
  useEffect(() => {
    let timer;
    if (callState === "active") {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timer);
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [callState]);

  // Format Timer (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Simulate Triggering an Incoming Call (For Testing UI)
  const simulateIncomingCall = () => {
    setCallType("incoming");
    setCallState("ringing");
  };

  // Simulate Outgoing Call
  const startOutgoingCall = () => {
    setCallType("outgoing");
    setCallState("ringing");
    // After 3 seconds, simulate call answered
    setTimeout(() => {
      setCallState("active");
    }, 3000);
  };

  const acceptCall = () => {
    setCallState("active");
  };

  const endCall = () => {
    setCallState("ended");
    setTimeout(() => {
      setCallState("idle");
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-2xl">
      {/* Header / Test Controls */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold tracking-wider uppercase mb-1">
            UI Sandbox / Demo Preview Only
          </div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Phone className="text-emerald-500" /> WhatsApp Call Center (Preview)
          </h2>
          <p className="text-sm text-slate-400">
            Standalone UI Demo — Production calling is integrated in Inbox via real Socket.IO
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={simulateIncomingCall}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition shadow-lg shadow-emerald-900/30"
          >
            Simulate Incoming Call
          </button>
          <button
            onClick={startOutgoingCall}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-medium transition shadow-lg shadow-sky-900/30"
          >
            Start Outgoing Call
          </button>
        </div>
      </div>

      {/* Main Area / Call Screen Preview */}
      <div className="flex-1 flex items-center justify-center relative bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 overflow-hidden min-h-[450px]">
        {/* State 1: Idle State */}
        {callState === "idle" && (
          <div className="text-center space-y-3">
            <div className="w-20 h-20 bg-slate-800/80 rounded-full flex items-center justify-center mx-auto text-slate-500 border border-slate-700">
              <Phone size={36} />
            </div>
            <h3 className="text-lg font-semibold text-slate-300">
              No Active Calls
            </h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              Click above to test incoming or outgoing WhatsApp business calls
              via browser sandbox.
            </p>
          </div>
        )}

        {/* State 2: Ringing Modal / Screen */}
        {callState === "ringing" && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center z-50 animate-fadeIn">
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-emerald-500/20 rounded-full animate-ping"></div>
              <div className="w-28 h-28 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-full flex items-center justify-center text-3xl font-bold shadow-2xl relative z-10 border-4 border-slate-900">
                {callerInfo.name.charAt(0)}
              </div>
            </div>

            <div className="text-center space-y-1 mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20">
                <ShieldCheck size={14} /> End-to-end encrypted WhatsApp Call
              </span>
              <h3 className="text-2xl font-bold pt-2">{callerInfo.name}</h3>
              <p className="text-slate-400 font-mono">{callerInfo.phone}</p>
              <p className="text-sm text-emerald-400 font-medium animate-pulse pt-2">
                {callType === "incoming"
                  ? "Incoming WhatsApp Call..."
                  : "Calling..."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-6">
              {callType === "incoming" && (
                <button
                  onClick={acceptCall}
                  className="w-16 h-16 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/40 transition transform hover:scale-105"
                  title="Accept Call"
                >
                  <Phone size={28} />
                </button>
              )}
              <button
                onClick={endCall}
                className="w-16 h-16 bg-rose-600 hover:bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-600/40 transition transform hover:scale-105"
                title="Decline / End Call"
              >
                <PhoneOff size={28} />
              </button>
            </div>
          </div>
        )}

        {/* State 3: Active Call Screen */}
        {callState === "active" && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-between p-8 z-50">
            {/* Top Bar */}
            <div className="flex items-center justify-between w-full max-w-md">
              <span className="flex items-center gap-2 text-xs font-medium bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Connected
              </span>
              <div className="flex items-center gap-1.5 text-slate-300 font-mono text-sm bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                <Clock size={14} className="text-slate-400" />
                {formatTime(callDuration)}
              </div>
            </div>

            {/* Center Caller Profile */}
            <div className="text-center space-y-3 my-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center text-3xl font-bold shadow-2xl mx-auto border-2 border-emerald-500/30">
                {callerInfo.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold">{callerInfo.name}</h3>
                <p className="text-sm text-slate-400 font-mono">
                  {callerInfo.phone}
                </p>
              </div>
            </div>

            {/* Bottom Call Control Toolbar */}
            <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-2xl backdrop-blur-md">
              {/* Mute Button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-xl transition ${isMuted
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                  }`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
              </button>

              {/* Speaker Toggle */}
              <button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`p-4 rounded-xl transition ${!isSpeakerOn
                    ? "bg-slate-800 text-slate-400"
                    : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                  }`}
                title={isSpeakerOn ? "Speaker Off" : "Speaker On"}
              >
                {isSpeakerOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
              </button>

              {/* End Call Button */}
              <button
                onClick={endCall}
                className="px-6 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-rose-900/40 transition transform hover:scale-105"
              >
                <PhoneOff size={20} /> End Call
              </button>
            </div>
          </div>
        )}

        {/* State 4: Call Ended Notification */}
        {callState === "ended" && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-50">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-3 border border-rose-500/20">
              <PhoneOff size={28} />
            </div>
            <h3 className="text-lg font-semibold text-slate-200">Call Ended</h3>
            <p className="text-sm text-slate-500">
              Duration: {formatTime(callDuration)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
