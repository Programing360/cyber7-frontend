"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  Headphones,
  Radio,
  Play,
  RotateCcw,
} from "lucide-react";

export default function CallingFeature() {
  const [callState, setCallState] = useState<"idle" | "incoming" | "connected">("idle");
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [callNotes, setCallNotes] = useState<string>("Customer requested an API demo on staging server.");

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callState === "connected") {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [callState]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSimulateIncoming = () => {
    setCallState("incoming");
  };

  const handleAcceptCall = () => {
    setCallState("connected");
  };

  const handleEndCall = () => {
    setCallState("idle");
  };

  return (
    <section id="calling-api" className="py-20 sm:py-24 bg-slate-950 text-white relative overflow-hidden scroll-mt-24 sm:scroll-mt-28">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 mb-4">
            <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span>Next-Gen VoIP Integration (PDF Sec 35)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Official WhatsApp <span className="text-emerald-400">Business Calling API</span>
          </h2>
          <p className="mt-4 text-sm sm:text-lg text-slate-400 leading-relaxed">
            Receive and make voice calls directly inside your web browser. Seamlessly connect caller history,
            agent routing, call recording notes, and CRM profiles without hardware PBX.
          </p>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
          {/* Left Column: Interactive Call Center Widget */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-5 sm:p-8 shadow-2xl relative">
              {/* Top Bar of Call Center */}
              <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                    <Headphones className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">VexChat WebRTC Calling Console</h4>
                    <p className="text-[11px] sm:text-xs text-slate-400">Official Meta Voice Calling Gateway</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] sm:text-xs font-semibold text-emerald-400">SIP Trunk Ready</span>
                </div>
              </div>

              {/* Central Dynamic Call Area */}
              <div className="py-6 sm:py-8">
                {callState === "idle" && (
                  <div className="text-center py-4 sm:py-6">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 mx-auto rounded-2xl sm:rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mb-4">
                      <Phone className="h-8 w-8 sm:h-9 sm:w-9 text-slate-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white">Waiting for WhatsApp Calls...</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6 px-2">
                      Incoming voice calls from your verified WhatsApp Business phone number will route to
                      eligible browser agents automatically.
                    </p>
                    <button
                      onClick={handleSimulateIncoming}
                      className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5"
                    >
                      <PhoneIncoming className="h-4 w-4" />
                      <span>Simulate Incoming WhatsApp Call</span>
                    </button>
                  </div>
                )}

                {callState === "incoming" && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-4 bg-slate-950/60 rounded-2xl border border-emerald-500/40 p-4 sm:p-6"
                  >
                    <div className="relative inline-block mb-3">
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-emerald-600 flex items-center justify-center text-xl sm:text-2xl font-bold text-white shadow-xl shadow-emerald-500/30 animate-bounce">
                        MH
                      </div>
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-bold">
                        1
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-white">Mahmud Hasan (TechBD)</h4>
                    <p className="text-xs text-emerald-400 font-mono">+880 1712-892341 • WhatsApp Voice</p>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Routing to: <span className="text-slate-200 font-semibold">Sales Department (Agent Asad)</span>
                    </p>

                    <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                      <button
                        onClick={handleEndCall}
                        className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-600/30"
                      >
                        <PhoneOff className="h-4 w-4" />
                        <span>Decline Call</span>
                      </button>
                      <button
                        onClick={handleAcceptCall}
                        className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/40 animate-pulse"
                      >
                        <PhoneCall className="h-4 w-4" />
                        <span>Accept & Answer</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {callState === "connected" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-4 sm:space-y-6 bg-slate-950/80 rounded-2xl border border-emerald-500/30 p-4 sm:p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-emerald-600 flex items-center justify-center font-bold text-white text-base sm:text-lg shrink-0">
                          MH
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="text-xs sm:text-sm font-bold text-white">Mahmud Hasan</span>
                            <span className="text-[9px] sm:text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                              Live
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">+880 1712-892341 (Audio)</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg sm:text-xl font-mono font-bold text-emerald-400">
                          {formatTimer(callDuration)}
                        </div>
                        <span className="text-[10px] text-slate-400">Encrypted TLS</span>
                      </div>
                    </div>

                    {/* Animated Audio Visualizer Bars */}
                    <div className="h-10 sm:h-12 bg-slate-900 rounded-xl px-3 sm:px-4 flex items-center justify-center gap-1 sm:gap-1.5 border border-slate-800">
                      {[40, 70, 95, 30, 85, 60, 100, 45, 90, 75, 30, 80, 50, 90, 65, 35, 85, 55].map(
                        (h, i) => (
                          <div
                            key={i}
                            className="w-1 sm:w-1.5 bg-emerald-500 rounded-full animate-pulse"
                            style={{
                              height: `${h}%`,
                              animationDelay: `${i * 0.08}s`,
                              animationDuration: "0.8s",
                            }}
                          />
                        )
                      )}
                    </div>

                    {/* Live In-call Notes */}
                    <div>
                      <label className="text-[11px] sm:text-xs font-semibold text-slate-400 mb-1 block">
                        Live Call Summary (Synced to Customer CRM & Support Ticket):
                      </label>
                      <textarea
                        value={callNotes}
                        onChange={(e) => setCallNotes(e.target.value)}
                        rows={2}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 sm:p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Call Controls */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className={`p-2 sm:p-2.5 rounded-xl border transition ${
                            isMuted
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                              : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                          }`}
                        >
                          {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </button>
                        <button className="p-2 sm:p-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition">
                          <Volume2 className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        onClick={handleEndCall}
                        className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-600/30"
                      >
                        <PhoneOff className="h-4 w-4" />
                        <span>Hang Up</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Bottom Quick Status */}
              <div className="pt-3 sm:pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] sm:text-xs text-slate-400 gap-2">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Call Permission Webhook Verified</span>
                </div>
                <span>Routing: 9:00 AM - 10:00 PM</span>
              </div>
            </div>
          </div>

          {/* Right Column: Key Feature Highlights */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-emerald-500/30 transition">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <PhoneIncoming className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Browser-Based WebRTC Receiving</h4>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                      Zero hardware or PBX required. Agents receive incoming WhatsApp voice calls directly
                      inside the browser dashboard with crystal-clear audio quality.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-emerald-500/30 transition">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Call → CRM & Ticket Auto-Creation</h4>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                      Every call log, duration, agent assigned, and connected/missed status is automatically
                      recorded to the customer CRM profile and support ticketing module.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-emerald-500/30 transition">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Meta Calling Permission & Policy</h4>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                      Full support for user-initiated and eligible business-initiated WhatsApp calls,
                      permission handling, and country-specific pricing adherence.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-200 text-xs flex items-center gap-3">
              <ShieldCheck className="h-7 w-7 text-emerald-400 shrink-0" />
              <span>
                VexChat strictly implements official Meta Calling API endpoints. No unauthorized VoIP
                tunnels or unofficial bots.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}