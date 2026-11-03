"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    MessageSquare,
    ShieldCheck,
    Zap,
    ArrowRight,
    Play,
    Users,
    CheckCircle2,
    TrendingUp,
    Headphones,
    Lock,
    PhoneCall,
    Bot,
    Send,
    Sparkles,
    CheckCheck,
    CreditCard,
    RefreshCw,
} from "lucide-react";

interface HeroSectionProps {
    onOpenDemoModal: () => void;
    onExploreDemo: () => void;
}

type HeroTab = "chat" | "call" | "automation";

export default function HeroSection({ onOpenDemoModal, onExploreDemo }: HeroSectionProps) {
    const [activeTab, setActiveTab] = useState<HeroTab>("chat");
    const [heroMessages, setHeroMessages] = useState<
        Array<{ sender: "user" | "bot" | "agent"; text: string; time: string; status?: string }>
    >([
        {
            sender: "user",
            text: "Hi VexChat! Can we connect our 10 support agents and send automated templates via bKash?",
            time: "12:01 PM",
        },
        {
            sender: "bot",
            text: "Yes! VexChat connects official Meta Cloud API. Zero ban risk, multi-agent shared inbox, and instant bKash checkout enabled.",
            time: "12:01 PM",
            status: "read",
        },
    ]);
    const [isTyping, setIsTyping] = useState(false);

    const handleQuickAction = (actionText: string, replyText: string) => {
        const newMsg = {
            sender: "user" as const,
            text: actionText,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setHeroMessages((prev) => [...prev, newMsg]);
        setIsTyping(true);

        setTimeout(() => {
            setIsTyping(false);
            const botMsg = {
                sender: "agent" as const,
                text: replyText,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                status: "read",
            };
            setHeroMessages((prev) => [...prev, botMsg]);
        }, 1100);
    };

    return (
        <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28 overflow-hidden bg-gradient-to-b from-[#f2f7ef] via-[#f7f9f4] to-white">
            {/* Background Radial Dots & Ambient Glows */}
            <div className="absolute inset-0 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
            <div className="absolute top-1/4 -left-36 w-80 sm:w-96 h-80 sm:h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/3 -right-36 w-80 sm:w-96 h-80 sm:h-96 bg-green-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-4xl mx-auto">
                    {/* Official Partner Pill */}
                    <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 sm:px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm backdrop-blur-md mb-6"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        <span>Official Meta WhatsApp Cloud API Provider</span>
                        <span className="hidden sm:inline text-emerald-400">•</span>
                        <span className="hidden sm:inline text-emerald-700 font-medium">Zero Ban Guarantee</span>
                    </motion.div>

                    {/* Main Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.15] sm:leading-[1.12]"
                    >
                        Scale Your WhatsApp Business{" "}
                        <span className="text-emerald-600 relative inline-block">
                            Conversations
                            <svg
                                className="absolute -bottom-2 left-0 w-full text-emerald-400/60"
                                viewBox="0 0 250 12"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M3 9C60 3 190 3 247 9"
                                    stroke="currentColor"
                                    strokeWidth="5"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </span>{" "}
                        Effortlessly.
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mt-5 sm:mt-6 text-sm sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed px-2"
                    >
                        <strong>VexChat</strong> is the unified enterprise SaaS platform for multi-agent shared team inboxes,
                        browser WhatsApp voice calling, broadcast campaigns, AI customer support, and local bKash/Nagad billing.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4"
                    >
                        <button
                            onClick={onOpenDemoModal}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3.5 sm:px-8 sm:py-4 text-sm sm:text-base font-bold shadow-xl shadow-emerald-600/25 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200"
                        >
                            <span>Start Free 14-Day Trial</span>
                            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <button
                            onClick={onExploreDemo}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full border border-slate-300/90 bg-white hover:bg-slate-50 text-slate-800 px-6 py-3.5 sm:px-7 sm:py-4 text-sm sm:text-base font-bold shadow-sm hover:border-slate-400 hover:-translate-y-0.5 transition-all duration-200"
                        >
                            <Play className="h-4 w-4 text-emerald-600 fill-emerald-600" />
                            <span>Explore Live Inbox Demo</span>
                        </button>
                    </motion.div>

                    {/* Micro trust guarantees */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-semibold text-slate-500 px-2"
                    >
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span>No Credit Card Required</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span>Official Meta OAuth</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span>bKash & Nagad Auto Checkout</span>
                        </div>
                    </motion.div>
                </div>

                {/* ======================================================== */}
                {/* INTERACTIVE HERO PREVIEW APP SHOWCASE                     */}
                {/* ======================================================== */}
                <motion.div
                    initial={{ opacity: 0, y: 35 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.45 }}
                    className="mt-10 sm:mt-12 relative mx-auto max-w-5xl"
                >
                    {/* Floating Pill Switcher for Hero Modes - Horizontally Scrollable on Mobile */}
                    <div className="flex justify-center mb-4 px-2">
                        <div className="overflow-x-auto max-w-full pb-1 flex items-center p-1 rounded-full bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-xl text-xs font-bold text-slate-300">
                            <button
                                onClick={() => setActiveTab("chat")}
                                className={`whitespace-nowrap px-3 sm:px-4 py-2 rounded-full transition flex items-center gap-1.5 sm:gap-2 ${activeTab === "chat"
                                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                                        : "hover:text-white"
                                    }`}
                            >
                                <MessageSquare className="h-3.5 w-3.5" />
                                <span>Live Inbox Simulator</span>
                            </button>

                            <button
                                onClick={() => setActiveTab("call")}
                                className={`whitespace-nowrap px-3 sm:px-4 py-2 rounded-full transition flex items-center gap-1.5 sm:gap-2 ${activeTab === "call"
                                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                                        : "hover:text-white"
                                    }`}
                            >
                                <PhoneCall className="h-3.5 w-3.5" />
                                <span>Voice Calling (WebRTC)</span>
                            </button>

                            <button
                                onClick={() => setActiveTab("automation")}
                                className={`whitespace-nowrap px-3 sm:px-4 py-2 rounded-full transition flex items-center gap-1.5 sm:gap-2 ${activeTab === "automation"
                                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                                        : "hover:text-white"
                                    }`}
                            >
                                <Bot className="h-3.5 w-3.5" />
                                <span>AI Automation Flow</span>
                            </button>
                        </div>
                    </div>

                    {/* Device Showcase Frame */}
                    <div className="relative rounded-2xl sm:rounded-3xl p-1.5 sm:p-3 bg-gradient-to-b from-slate-200 via-slate-100 to-slate-200/50 shadow-2xl border border-slate-200">
                        <div className="rounded-xl sm:rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 text-white shadow-inner">
                            {/* Window Header */}
                            <div className="px-3 sm:px-5 py-2.5 sm:py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-rose-500" />
                                    <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-amber-500" />
                                    <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-emerald-500" />
                                    <span className="ml-2 sm:ml-3 text-[11px] sm:text-xs font-mono text-slate-400 truncate max-w-[160px] sm:max-w-none">
                                        https://app.vexchat.io/{activeTab}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 sm:px-2.5 py-0.5 rounded-full font-medium">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="hidden xs:inline">Meta API:</span> Connected
                                    </span>
                                </div>
                            </div>

                            {/* Dynamic Content based on Active Tab */}
                            <div className="min-h-[420px] sm:min-h-[460px] flex flex-col justify-between p-3.5 sm:p-6 bg-slate-900/95 relative">
                                {/* 1. CHAT SIMULATOR TAB */}
                                {activeTab === "chat" && (
                                    <div className="flex flex-col justify-between h-full space-y-3 sm:space-y-4">
                                        {/* Active Chat Header */}
                                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                                                    MH
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                                        <span className="text-xs sm:text-sm font-bold text-white truncate">
                                                            Mahmud Hasan (TechBD)
                                                        </span>
                                                        <span className="hidden sm:inline-block text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                                                            Verified WABA
                                                        </span>
                                                    </div>
                                                    <span className="text-[11px] text-slate-400 truncate block">
                                                        +880 1712-892341 • Sales (Agent Asad)
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="shrink-0">
                                                <span className="text-[10px] sm:text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-lg border border-slate-700">
                                                    24h Window: OPEN
                                                </span>
                                            </div>
                                        </div>

                                        {/* Messages Body */}
                                        <div className="space-y-3 py-2 overflow-y-auto max-h-[220px] sm:max-h-[260px] pr-1">
                                            {heroMessages.map((msg, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`flex ${msg.sender === "user" ? "justify-start" : "justify-end"}`}
                                                >
                                                    <div
                                                        className={`max-w-[85%] sm:max-w-md rounded-2xl p-3 sm:p-3.5 text-xs shadow-md ${msg.sender === "user"
                                                                ? "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700"
                                                                : "bg-emerald-600 text-white rounded-tr-none shadow-emerald-600/20"
                                                            }`}
                                                    >
                                                        <p className="leading-relaxed">{msg.text}</p>
                                                        <div
                                                            className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${msg.sender === "user" ? "text-slate-400" : "text-emerald-200"
                                                                }`}
                                                        >
                                                            <span>{msg.time}</span>
                                                            {msg.sender !== "user" && <CheckCheck className="h-3.5 w-3.5 inline text-cyan-200" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {isTyping && (
                                                <div className="flex justify-end">
                                                    <div className="bg-emerald-700 text-emerald-100 text-xs rounded-2xl rounded-tr-none p-2.5 sm:p-3 flex items-center gap-2">
                                                        <RefreshCw className="h-3 w-3 animate-spin" />
                                                        <span>VexChat agent is typing official template reply...</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Interactive Quick Prompts Trigger */}
                                        <div className="pt-3 border-t border-slate-800">
                                            <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                                                <Sparkles className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                                <span>Click an interactive prompt to test instant Meta response:</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleQuickAction(
                                                            "Send me the Enterprise Plan pricing & bKash payment details.",
                                                            "VexChat Enterprise Plan: ৳14,900/mo with unlimited WhatsApp numbers. Direct bKash merchant automated verification!"
                                                        )
                                                    }
                                                    className="px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white text-[11px] sm:text-xs transition border border-slate-700"
                                                >
                                                    👉 Request Enterprise Plan & bKash
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleQuickAction(
                                                            "Does VexChat support browser WhatsApp Voice Calling?",
                                                            "Yes! Official WebRTC calling is built directly in your browser. Agents receive and make WhatsApp calls with zero PBX."
                                                        )
                                                    }
                                                    className="px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white text-[11px] sm:text-xs transition border border-slate-700"
                                                >
                                                    👉 Test WhatsApp Calling Inquiry
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleQuickAction(
                                                            "How fast is webhook response for automated OTPs?",
                                                            "VexChat processes webhooks in under 45ms with Meta SHA-256 signatures for 99.99% delivery reliability."
                                                        )
                                                    }
                                                    className="px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white text-[11px] sm:text-xs transition border border-slate-700"
                                                >
                                                    👉 Test Webhook & OTP Speed
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 2. CALLING TAB */}
                                {activeTab === "call" && (
                                    <div className="py-4 sm:py-6 text-center space-y-4 sm:space-y-6">
                                        <div className="relative inline-block">
                                            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-emerald-600 flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-xl shadow-emerald-500/40 animate-pulse">
                                                MH
                                            </div>
                                            <span className="absolute -bottom-1 -right-1 h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-emerald-400 border-2 border-slate-900 flex items-center justify-center">
                                                <PhoneCall className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-950" />
                                            </span>
                                        </div>

                                        <div>
                                            <h4 className="text-lg sm:text-xl font-bold text-white">Mahmud Hasan (TechBD)</h4>
                                            <p className="text-xs text-emerald-400 font-mono mt-1">+880 1712-892341 • Connected (01:42)</p>
                                            <p className="text-[11px] text-slate-400 mt-1">Browser WebRTC Audio Stream • Encrypted via TLS</p>
                                        </div>

                                        {/* Animated Waveform */}
                                        <div className="max-w-[260px] sm:max-w-md mx-auto h-12 bg-slate-950/80 rounded-xl px-4 flex items-center justify-center gap-1 sm:gap-1.5 border border-slate-800">
                                            {[40, 75, 100, 35, 90, 65, 95, 40, 85, 70, 30, 85, 55, 90, 60, 35, 80, 50].map((h, i) => (
                                                <div
                                                    key={i}
                                                    className="w-1 sm:w-1.5 bg-emerald-500 rounded-full animate-pulse"
                                                    style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }}
                                                />
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-center">
                                            <button
                                                onClick={onExploreDemo}
                                                className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition"
                                            >
                                                Open Full VoIP Console
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* 3. AUTOMATION TAB */}
                                {activeTab === "automation" && (
                                    <div className="py-3 sm:py-4 space-y-4 sm:space-y-6">
                                        <div className="text-center">
                                            <span className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase tracking-wider">
                                                Real-Time Automation Triage (PDF Sec 12)
                                            </span>
                                            <h4 className="text-sm sm:text-base font-bold text-white mt-1">
                                                Trigger: Keyword "Order Status" → Dispatched in 0.8s
                                            </h4>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                                            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-800/80 border border-emerald-500/30 text-xs">
                                                <div className="text-emerald-400 font-bold mb-1">1. Inbound Event</div>
                                                <p className="text-slate-300">Customer asks: "Where is order #89201?"</p>
                                                <span className="text-[10px] text-slate-500 block mt-1.5">Trigger Matched</span>
                                            </div>

                                            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-800/80 border border-emerald-500/30 text-xs">
                                                <div className="text-emerald-400 font-bold mb-1">2. ERP API Query</div>
                                                <p className="text-slate-300">Fetches live courier tracking status via Webhook.</p>
                                                <span className="text-[10px] text-slate-500 block mt-1.5">Status: Out for Delivery</span>
                                            </div>

                                            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-800/80 border border-emerald-500/30 text-xs">
                                                <div className="text-emerald-400 font-bold mb-1">3. Meta Template Sent</div>
                                                <p className="text-slate-300">Interactive message with live courier GPS button sent.</p>
                                                <span className="text-[10px] text-emerald-400 font-bold block mt-1.5">✓✓ Read</span>
                                            </div>
                                        </div>

                                        <div className="text-center pt-2">
                                            <button
                                                onClick={onExploreDemo}
                                                className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition"
                                            >
                                                Explore Visual Flow Builder
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Floating Badges - Shown on Desktop only so tablet/mobile screens stay clean */}
                    <div className="hidden xl:block absolute -bottom-6 -left-8 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-pink-100 text-[#E2136E] flex items-center justify-center font-bold">
                                <CreditCard className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-slate-500">Local Merchant Billing</div>
                                <div className="text-sm font-extrabold text-slate-900">bKash & Nagad Auto-TRX</div>
                            </div>
                        </div>
                    </div>

                    <div className="hidden xl:block absolute -top-6 -right-6 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-slate-500">Official Cloud Provider</div>
                                <div className="text-sm font-extrabold text-slate-900">Zero QR Scraping Bans</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Global SaaS Metric Counters - Responsive Grid */}
                <div className="mt-16 sm:mt-20 pt-8 sm:pt-10 border-t border-slate-200/80 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
                    <div>
                        <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">10M+</div>
                        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">Messages Delivered Monthly</p>
                    </div>
                    <div>
                        <div className="text-2xl sm:text-4xl font-extrabold text-emerald-600 tracking-tight">99.99%</div>
                        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">Official Cloud API Uptime</p>
                    </div>
                    <div>
                        <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">&lt; 1.5s</div>
                        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">Average Webhook Latency</p>
                    </div>
                    <div>
                        <div className="text-2xl sm:text-4xl font-extrabold text-emerald-600 tracking-tight">0% Ban</div>
                        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">100% Meta Compliant</p>
                    </div>
                </div>
            </div>
        </section>
    );
}