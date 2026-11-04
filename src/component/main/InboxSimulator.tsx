"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  CheckCheck,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  UserCheck,
  Tag,
  Clock,
  Sparkles,
  FileText,
  MapPin,
  Lock,
  MessageCircle,
  HelpCircle,
  Check,
  AlertCircle,
  Layers,
  StickyNote,
  ChevronLeft,
} from "lucide-react";

interface Message {
  id: string;
  sender: "agent" | "customer" | "system";
  text: string;
  time: string;
  status?: "sent" | "delivered" | "read";
  isNote?: boolean;
  type?: "text" | "template" | "media";
  templateTitle?: string;
  templateButton?: string;
}

interface Chat {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  unread: number;
  lastMessage: string;
  time: string;
  status: "Hot Lead" | "Support Pending" | "Converted" | "VIP Client";
  department: "Sales" | "Support" | "Billing";
  agent: string;
  messages: Message[];
}

const initialChats: Chat[] = [
  {
    id: "1",
    name: "Mahmud Hasan (CEO, TechBD)",
    phone: "+880 1712-892341",
    avatar: "MH",
    unread: 1,
    lastMessage: "Can we integrate this with our custom ERP via Webhook?",
    time: "12:08 PM",
    status: "Hot Lead",
    department: "Sales",
    agent: "Asad (You)",
    messages: [
      {
        id: "m1",
        sender: "customer",
        text: "Hi VexChat team! We want to migrate from unofficial QR bot to official Meta Cloud API.",
        time: "12:01 PM",
      },
      {
        id: "m2",
        sender: "agent",
        text: "Hello Mr. Mahmud! Great decision. VexChat official Cloud API gives you zero ban risk, multi-agent access, and green tick verification.",
        time: "12:02 PM",
        status: "read",
      },
      {
        id: "m3",
        sender: "system",
        text: "Agent Asad assigned conversation to Sales Department.",
        time: "12:03 PM",
      },
      {
        id: "m4",
        sender: "agent",
        text: "Here is our official Meta Template pricing and on-boarding documentation.",
        time: "12:05 PM",
        type: "template",
        templateTitle: "VEXCHAT_ONBOARDING_V1",
        templateButton: "View Meta Docs",
        status: "read",
      },
      {
        id: "m5",
        sender: "customer",
        text: "Can we integrate this with our custom ERP via Webhook?",
        time: "12:08 PM",
      },
    ],
  },
  {
    id: "2",
    name: "Dr. Ayesha Siddika",
    phone: "+880 1819-554433",
    avatar: "AS",
    unread: 0,
    lastMessage: "Thank you! The automated appointment reminder works great.",
    time: "11:45 AM",
    status: "Converted",
    department: "Support",
    agent: "Farazi (Lead)",
    messages: [
      {
        id: "m21",
        sender: "customer",
        text: "Testing our clinic's automated WhatsApp reminder flow.",
        time: "11:40 AM",
      },
      {
        id: "m22",
        sender: "agent",
        text: "All 500 patient templates delivered with 99.8% read rate!",
        time: "11:42 AM",
        status: "read",
      },
      {
        id: "m23",
        sender: "customer",
        text: "Thank you! The automated appointment reminder works great.",
        time: "11:45 AM",
      },
    ],
  },
  {
    id: "3",
    name: "Rahim Logistics Ltd",
    phone: "+880 1914-778899",
    avatar: "RL",
    unread: 2,
    lastMessage: "Paid via bKash Merchant. Please verify transaction #TRX897.",
    time: "10:30 AM",
    status: "VIP Client",
    department: "Billing",
    agent: "Billing Desk",
    messages: [
      {
        id: "m31",
        sender: "customer",
        text: "Upgrading to VexChat Enterprise Plan with 10 Phone Numbers.",
        time: "10:25 AM",
      },
      {
        id: "m32",
        sender: "customer",
        text: "Paid via bKash Merchant. Please verify transaction #TRX897.",
        time: "10:30 AM",
      },
    ],
  },
];

export default function InboxSimulator() {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeChatId, setActiveChatId] = useState<string>("1");
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Responsive mobile view tab switcher ('list' | 'chat' | 'crm')
  const [mobileView, setMobileView] = useState<"list" | "chat" | "crm">("chat");

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setMobileView("chat");
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: "msg_" + Date.now(),
      sender: "agent",
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
      isNote: isInternalNote,
    };

    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === activeChat.id) {
          return {
            ...chat,
            lastMessage: isInternalNote ? `[Internal Note]: ${inputText}` : inputText,
            messages: [...chat.messages, newMessage],
          };
        }
        return chat;
      })
    );

    const sentText = inputText;
    setInputText("");

    // Simulate Delivery & Read update
    setTimeout(() => {
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === activeChat.id) {
            return {
              ...chat,
              messages: chat.messages.map((m) =>
                m.id === newMessage.id ? { ...m, status: "delivered" } : m
              ),
            };
          }
          return chat;
        })
      );
    }, 600);

    setTimeout(() => {
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === activeChat.id) {
            return {
              ...chat,
              messages: chat.messages.map((m) =>
                m.id === newMessage.id ? { ...m, status: "read" } : m
              ),
            };
          }
          return chat;
        })
      );
    }, 1200);

    // Simulate Automatic customer reply if not an internal note
    if (!isInternalNote) {
      setTimeout(() => {
        const autoReply: Message = {
          id: "reply_" + Date.now(),
          sender: "customer",
          text: `Got your update regarding "${sentText.slice(0, 30)}..."! System looks super fast on VexChat.`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setChats((prev) =>
          prev.map((chat) => {
            if (chat.id === activeChat.id) {
              return {
                ...chat,
                lastMessage: autoReply.text,
                messages: [...chat.messages, autoReply],
              };
            }
            return chat;
          })
        );
      }, 2500);
    }
  };

  const handleSendTemplate = (title: string, body: string, btnText: string) => {
    const templateMsg: Message = {
      id: "tpl_" + Date.now(),
      sender: "agent",
      text: body,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "template",
      templateTitle: title,
      templateButton: btnText,
      status: "read",
    };

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChat.id
          ? {
              ...c,
              lastMessage: `[Template]: ${title}`,
              messages: [...c.messages, templateMsg],
            }
          : c
      )
    );
    setShowTemplateModal(false);
  };

  return (
    <section id="inbox-demo" className="py-20 sm:py-24 bg-white relative overflow-hidden scroll-mt-24 sm:scroll-mt-28">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 mb-4">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span>Interactive Live Simulator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            WhatsApp Business Inbox – <span className="text-emerald-600">Core SaaS Engine</span>
          </h2>
          <p className="mt-4 text-sm sm:text-lg text-slate-600">
            Experience the official multi-agent shared inbox. Switch chats, send approved Meta templates, add
            private internal notes, and manage CRM leads in real time across mobile, tablet, and desktop.
          </p>
        </div>

        {/* Outer Application Frame */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-slate-900 shadow-2xl overflow-hidden">
          {/* Top Bar of the SaaS App */}
          <div className="bg-slate-950 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-[#52ba69] flex items-center justify-center text-slate-950 font-bold text-xs sm:text-sm">
                VC
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-white">VexChat Shared Workspace</span>
                  <span className="rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold px-1.5 py-0.2 border border-emerald-500/30">
                    Cloud API v20.0
                  </span>
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>WABA: +880 9638-VEXCHAT</span>
                  <span className="text-emerald-400">● 4 Agents Online</span>
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTemplateModal(true)}
                className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5 transition"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Templates</span>
              </button>
              <button
                onClick={() => setIsInternalNote(!isInternalNote)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                  isInternalNote
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <StickyNote className="h-3.5 w-3.5" />
                <span>{isInternalNote ? "Note ON" : "Add Note"}</span>
              </button>
            </div>
          </div>

          {/* Mobile / Tablet View Switcher Tab Bar (< lg: only) */}
          <div className="lg:hidden bg-slate-950/90 border-b border-slate-800 flex items-center justify-around text-xs font-bold text-slate-400 p-1">
            <button
              onClick={() => setMobileView("list")}
              className={`flex-1 py-2 text-center rounded-lg transition ${
                mobileView === "list" ? "bg-slate-800 text-white" : "hover:text-slate-200"
              }`}
            >
              💬 Chats ({chats.length})
            </button>
            <button
              onClick={() => setMobileView("chat")}
              className={`flex-1 py-2 text-center rounded-lg transition ${
                mobileView === "chat" ? "bg-emerald-600 text-white" : "hover:text-slate-200"
              }`}
            >
              📨 Message View
            </button>
            <button
              onClick={() => setMobileView("crm")}
              className={`flex-1 py-2 text-center rounded-lg transition ${
                mobileView === "crm" ? "bg-slate-800 text-white" : "hover:text-slate-200"
              }`}
            >
              👤 CRM Info
            </button>
          </div>

          {/* Main 3-Column Interface with Mobile Responsiveness */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px] bg-slate-900">
            {/* Column 1: Conversations List (col-span-4) */}
            <div
              className={`lg:col-span-4 border-r border-slate-800 flex flex-col bg-slate-950/40 ${
                mobileView !== "list" ? "hidden lg:flex" : "flex"
              }`}
            >
              {/* Search & Filter Header */}
              <div className="p-3.5 sm:p-4 border-b border-slate-800">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, phone or tag..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>Filtered: {chats.length} active chats</span>
                  <span className="text-emerald-400 font-semibold cursor-pointer hover:underline">
                    + New Chat
                  </span>
                </div>
              </div>

              {/* Chat Cards */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 max-h-[520px]">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleSelectChat(chat.id)}
                    className={`p-3.5 sm:p-4 cursor-pointer transition flex items-start gap-3 ${
                      activeChatId === chat.id
                        ? "bg-slate-800/90 border-l-4 border-emerald-500"
                        : "hover:bg-slate-900/60"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center font-bold text-xs text-white shadow">
                        {chat.avatar}
                      </div>
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-white truncate">{chat.name}</h4>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-1">{chat.time}</span>
                      </div>
                      <p className="text-xs text-slate-300 truncate">{chat.lastMessage}</p>

                      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            chat.status === "Hot Lead"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : chat.status === "Converted"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          }`}
                        >
                          {chat.status}
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                          {chat.department}
                        </span>
                        {chat.unread > 0 && (
                          <span className="ml-auto text-[10px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Active Chat Canvas (col-span-5) */}
            <div
              className={`lg:col-span-5 flex flex-col justify-between bg-slate-900 border-r border-slate-800 ${
                mobileView !== "chat" ? "hidden lg:flex" : "flex"
              }`}
            >
              {/* Chat Canvas Header */}
              <div className="p-3.5 sm:p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {/* Mobile Back Button to list */}
                  <button
                    onClick={() => setMobileView("list")}
                    className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Back to Chats"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <div className="h-9 w-9 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-xs text-white shrink-0">
                    {activeChat.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-bold text-white truncate">
                        {activeChat.name}
                      </span>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    </div>
                    <span className="text-[11px] text-slate-400 truncate block">
                      {activeChat.phone} • {activeChat.agent}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:inline-block text-[10px] sm:text-[11px] text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-md">
                    24h Window: OPEN
                  </span>
                  <button
                    onClick={() => setMobileView(mobileView === "crm" ? "chat" : "crm")}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
                    title="Toggle CRM"
                  >
                    <Layers className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 max-h-[420px] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
                {activeChat.messages.map((msg) => {
                  if (msg.sender === "system") {
                    return (
                      <div key={msg.id} className="flex justify-center my-2">
                        <span className="text-[10px] sm:text-[11px] font-medium bg-slate-800/80 text-slate-400 px-3 py-1 rounded-full border border-slate-700/60 text-center">
                          {msg.text} • {msg.time}
                        </span>
                      </div>
                    );
                  }

                  if (msg.isNote) {
                    return (
                      <div key={msg.id} className="flex justify-center my-2">
                        <div className="w-full max-w-md bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 text-amber-200 text-xs">
                          <div className="flex items-center gap-1.5 font-bold mb-1 text-amber-400 text-[11px]">
                            <Lock className="h-3 w-3" />
                            <span>Private Internal Note (Agents Only)</span>
                          </div>
                          <p>{msg.text}</p>
                          <span className="text-[10px] text-amber-400/70 block text-right mt-1">
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  const isAgent = msg.sender === "agent";

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isAgent ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-sm rounded-2xl p-3 sm:p-3.5 shadow-md ${
                          isAgent
                            ? "bg-emerald-600 text-white rounded-tr-none"
                            : "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700"
                        }`}
                      >
                        {msg.type === "template" && (
                          <div className="mb-2 pb-2 border-b border-emerald-500/40">
                            <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-wider bg-emerald-800 px-2 py-0.5 rounded text-emerald-200">
                              Meta Template: {msg.templateTitle}
                            </span>
                          </div>
                        )}

                        <p className="text-xs leading-relaxed">{msg.text}</p>

                        {msg.type === "template" && msg.templateButton && (
                          <div className="mt-3 pt-2 border-t border-emerald-500/40">
                            <button className="w-full py-1.5 rounded-lg bg-white text-emerald-800 font-bold text-xs flex items-center justify-center gap-1 shadow hover:bg-slate-100 transition">
                              <span>{msg.templateButton}</span>
                            </button>
                          </div>
                        )}

                        <div
                          className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${
                            isAgent ? "text-emerald-200" : "text-slate-400"
                          }`}
                        >
                          <span>{msg.time}</span>
                          {isAgent && (
                            <span>
                              {msg.status === "read" ? (
                                <CheckCheck className="h-3.5 w-3.5 text-cyan-200 inline" />
                              ) : (
                                <Check className="h-3.5 w-3.5 inline text-slate-300" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input Area */}
              <form
                onSubmit={handleSendMessage}
                className={`p-2.5 sm:p-3 border-t ${
                  isInternalNote
                    ? "bg-amber-950/30 border-amber-500/40"
                    : "bg-slate-950/80 border-slate-800"
                }`}
              >
                {isInternalNote && (
                  <div className="mb-2 text-[10px] sm:text-[11px] text-amber-300 flex items-center gap-1.5 px-2">
                    <Lock className="h-3 w-3" />
                    <span>Adding internal agent note (customer will not see this)</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(true)}
                    className="p-2 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition shrink-0"
                    title="Send Template"
                  >
                    <FileText className="h-4 w-4" />
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      isInternalNote
                        ? "Write internal note for team..."
                        : "Type message as agent (Press Enter)..."
                    }
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />

                  <button
                    type="submit"
                    className={`p-2.5 rounded-xl text-white font-bold transition flex items-center justify-center shrink-0 ${
                      isInternalNote
                        ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/30"
                        : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30"
                    } shadow-md`}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Column 3: Mini CRM & Customer Profile (col-span-3) */}
            <div
              className={`lg:col-span-3 flex-col bg-slate-950/60 p-4 sm:p-5 space-y-4 sm:space-y-5 text-slate-300 ${
                mobileView !== "crm" ? "hidden lg:flex" : "flex"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Customer Mini CRM
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
                  ID: VC-89021
                </span>
              </div>

              {/* Profile Card */}
              <div className="text-center py-1 sm:py-2">
                <div className="h-14 w-14 sm:h-16 sm:w-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-lg shadow-emerald-600/20">
                  {activeChat.avatar}
                </div>
                <h4 className="mt-2.5 text-sm font-bold text-white">{activeChat.name}</h4>
                <p className="text-xs text-slate-400">{activeChat.phone}</p>
                <span className="inline-block mt-2 text-[10px] sm:text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-0.5 rounded-full">
                  Verified Contact (Meta Synced)
                </span>
              </div>

              {/* Lead Stage Selector */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-slate-400">Lead Pipeline Stage</span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {["New Lead", "Contacted", "Hot Lead", "Converted"].map((stage) => (
                    <button
                      key={stage}
                      onClick={() =>
                        setChats((prev) =>
                          prev.map((c) =>
                            c.id === activeChat.id ? { ...c, status: stage as any } : c
                          )
                        )
                      }
                      className={`py-1.5 px-2 rounded-lg text-center font-medium border transition ${
                        activeChat.status === stage
                          ? "bg-emerald-600 text-white border-emerald-500 shadow"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
                      }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assigned Agent */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-medium text-slate-400">Assigned Agent</span>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-emerald-400" />
                    <span className="font-medium text-white">{activeChat.agent}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 underline cursor-pointer">Reassign</span>
                </div>
              </div>

              {/* Customer Custom Fields */}
              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="text-slate-200 font-medium">{activeChat.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Meta Billing Status:</span>
                  <span className="text-emerald-400 font-medium">Active (Paid)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Template Selector Modal */}
        <AnimatePresence>
          {showTemplateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Meta Approved WhatsApp Templates
                    </h3>
                    <p className="text-xs text-slate-400">Synced directly with VexChat Business Manager</p>
                  </div>
                  <button
                    onClick={() => setShowTemplateModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div
                    onClick={() =>
                      handleSendTemplate(
                        "DISCOUNT_PROMO_2026",
                        "Hello! Get 20% off on your VexChat WhatsApp subscription this month. Valid until Friday.",
                        "Claim 20% Discount"
                      )
                    }
                    className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-emerald-500/30 cursor-pointer transition"
                  >
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-emerald-400">DISCOUNT_PROMO_2026</span>
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-medium">
                        Approved (Marketing)
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      "Hello! Get 20% off on your VexChat WhatsApp subscription this month..."
                    </p>
                  </div>

                  <div
                    onClick={() =>
                      handleSendTemplate(
                        "PAYMENT_VERIFIED_ALERT",
                        "Your subscription payment has been received successfully via bKash. Receipt #VC-8890.",
                        "View Invoice PDF"
                      )
                    }
                    className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 cursor-pointer transition"
                  >
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-slate-200">PAYMENT_VERIFIED_ALERT</span>
                      <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded font-medium">
                        Approved (Utility)
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      "Your subscription payment has been received successfully via bKash..."
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setShowTemplateModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}