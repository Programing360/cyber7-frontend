"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import VexChatLogo from "./VexChatLogo";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  PhoneCall,
  Bot,
  CreditCard,
  FileCode,
  Sparkles,
} from "lucide-react";

interface NavbarProps {
  onOpenDemoModal: () => void;
  onOpenContactModal: () => void;
}

export default function Navbar({
  onOpenDemoModal,
  onOpenContactModal,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-3 sm:top-4 left-0 right-0 z-50 flex flex-col items-center px-3 sm:px-6 pointer-events-none">
      {/* Main Floating Pill Header */}
      <header
        className={`pointer-events-auto w-full max-w-6xl rounded-full transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl shadow-slate-900/5 py-2 px-4 sm:px-5"
            : "bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-md py-2.5 px-4 sm:px-6"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <VexChatLogo size="md" />
            <span className="hidden xl:inline-flex rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 border border-emerald-300/80">
              Official Meta Cloud API
            </span>
          </Link>

          {/* Desktop Navigation Links - Shown on Large Desktop (lg: 1024px+) only to prevent tablet cramping */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-600">
            <a
              href="#features"
              className="px-3 py-1.5 rounded-full hover:text-emerald-700 hover:bg-slate-100/90 transition-all"
            >
              Features
            </a>
            <a
              href="#inbox-demo"
              className="px-3 py-1.5 rounded-full hover:text-emerald-700 hover:bg-slate-100/90 transition-all flex items-center gap-1.5"
            >
              <span>Live Inbox</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </a>
            <a
              href="#calling-api"
              className="px-3 py-1.5 rounded-full hover:text-emerald-700 hover:bg-slate-100/90 transition-all"
            >
              Calling
            </a>
            <a
              href="#automation"
              className="px-3 py-1.5 rounded-full hover:text-emerald-700 hover:bg-slate-100/90 transition-all"
            >
              Automation
            </a>
            <a
              href="#pricing"
              className="px-3 py-1.5 rounded-full hover:text-emerald-700 hover:bg-slate-100/90 transition-all"
            >
              Pricing
            </a>
            <a
              href="#api-docs"
              className="px-3 py-1.5 rounded-full hover:text-emerald-700 hover:bg-slate-100/90 transition-all"
            >
              API Docs
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Link href={"/login"}>
              <button
                // onClick={onOpenContactModal}
                className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 rounded-full hover:bg-slate-100 transition"
              >
                Sign In
              </button>
            </Link>
            <Link href={"/register"}>
              <button
                // onClick={onOpenDemoModal}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 sm:px-4 py-2 text-xs font-bold shadow-md shadow-emerald-600/20 hover:shadow-lg hover:scale-[1.02] transition-all"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </Link>
            {/* Mobile & Tablet menu hamburger trigger (< lg:) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full text-slate-700 hover:bg-slate-100 transition focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* SEPARATE Floating Mobile & Tablet Dropdown Card (Fixes the ugly egg/oval clipping!) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto mt-2 w-full max-w-5xl rounded-3xl bg-white/98 backdrop-blur-2xl border border-slate-200/90 shadow-2xl p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              {/* <VexChatLogo size="sm" /> */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-2xl hover:bg-slate-50 transition"
              >
                <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">
                    Features & Bento
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Team inbox, templates, CRM
                  </div>
                </div>
              </a>

              <a
                href="#inbox-demo"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-2xl hover:bg-slate-50 transition"
              >
                <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Live Simulator</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                      Interactive
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Try live WhatsApp chat
                  </div>
                </div>
              </a>

              <a
                href="#calling-api"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-2xl hover:bg-slate-50 transition"
              >
                <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <PhoneCall className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">
                    Voice Calling Console
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Browser WebRTC VoIP
                  </div>
                </div>
              </a>

              <a
                href="#automation"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-2xl hover:bg-slate-50 transition"
              >
                <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">
                    Automation Engine
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Visual triggers & auto-reply
                  </div>
                </div>
              </a>

              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-2xl hover:bg-slate-50 transition"
              >
                <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">
                    Pricing & Meta Rates
                  </div>
                  <div className="text-[11px] text-slate-400">
                    bKash, Nagad, Cards & Crypto
                  </div>
                </div>
              </a>

              <a
                href="#api-docs"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-2xl hover:bg-slate-50 transition"
              >
                <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileCode className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">API & Webhooks</div>
                  <div className="text-[11px] text-slate-400">
                    cURL, TypeScript, Python
                  </div>
                </div>
              </a>
            </nav>

            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenContactModal();
                }}
                className="w-full sm:flex-1 py-3 text-center rounded-2xl border border-slate-200 text-slate-800 font-bold hover:bg-slate-50 transition text-xs"
              >
                Sign In to Dashboard
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDemoModal();
                }}
                className="w-full sm:flex-1 py-3 text-center rounded-2xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 transition text-xs"
              >
                Start 14-Day Free Trial
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
