"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import VexChatLogo from "./VexChatLogo";
import { motion, AnimatePresence } from "framer-motion";
// Update this import path to match your file structure
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
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@/src/context/auth-context";

interface NavbarProps {
  onOpenDemoModal?: () => void;
  onOpenContactModal?: () => void;
}

export default function Navbar({
  onOpenDemoModal,
  onOpenContactModal,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Consume dynamic auth state from useAuth hook
  const { user, isLoading, isAuthenticated, logout } = useAuth();

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
            {/* <span className="hidden xl:inline-flex rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 border border-emerald-300/80">
              Official Meta Cloud API
            </span> */}
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-600">
            <a
              href="#features"
              className="px-3 py-1.5 rounded-full hover:text-emerald-700 hover:bg-slate-50/80 hover:shadow-lg transition-all"
            >
              Features
            </a>
            <a
              href="#inbox-demo"
              className="px-3 py-1.5 rounded-full hover:text-emerald-700 hover:bg-slate-50/80 hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <span>Live Inbox</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </a>
            <a
              href="#calling-api"
              className="px-3 py-1.5 rounded-full hover:text-emerald-700 hover:bg-slate-50/80 hover:shadow-lg transition-all"
            >
              Calling
            </a>
            <a
              href="#automation"
              className="px-3 py-1.5 rounded-full hover:text-emerald-700 hover:bg-slate-50/80 hover:shadow-lg transition-all"
            >
              Automation
            </a>
            <a
              href="#pricing"
              className="px-3 py-1.5 rounded-full hover:text-emerald-700 hover:bg-slate-50/80 hover:shadow-lg transition-all"
            >
              Pricing
            </a>
            <a
              href="#api-docs"
              className="px-3 py-1.5 rounded-full hover:text-emerald-700 hover:bg-slate-50/80 hover:shadow-lg transition-all"
            >
              API Docs
            </a>
          </nav>

          {/* Right Action Buttons (Dynamic Auth) */}
          <div className="flex items-center gap-2 shrink-0">
            {isLoading ? (
              <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-full" />
            ) : isAuthenticated ? (
              /* Authenticated User Menu Dropdown */
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-slate-50 hover:bg-slate-100 hover:shadow-lg transition text-slate-700 text-xs font-bold"
                >
                  <div className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {user?.name?.[0] || user?.email?.[0] || (
                      <User className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {user?.name || user?.email?.split("@")[0] || "Account"}
                  </span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-2xl py-2 z-50 text-slate-700 text-xs font-medium"
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <div className="font-bold text-slate-900 truncate">
                          {user?.name || "User"}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {user?.email}
                        </div>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 hover:shadow-lg transition font-semibold text-slate-800"
                      >
                        <LayoutDashboard className="h-3.5 w-3.5 text-emerald-600" />
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-red-50 hover:shadow-lg transition font-semibold text-red-600 text-left"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Unauthenticated State */
              <>
                <Link href="/login">
                  <button className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 rounded-full hover:bg-slate-50/80 hover:shadow-lg transition">
                    Sign In
                  </button>
                </Link>
                <Link href="/register">
                  <button className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 sm:px-4 py-2 text-xs font-bold shadow-md shadow-emerald-600/20 hover:shadow-xl hover:scale-[1.02] transition-all">
                    <span>Start Free Trial</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </Link>
              </>
            )}

            {/* Mobile & Tablet Menu Hamburger Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full text-slate-700 hover:bg-slate-50 hover:shadow-lg transition focus:outline-none"
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

      {/* Floating Mobile & Tablet Dropdown Card */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto mt-2 w-full max-w-5xl rounded-3xl bg-white/98 backdrop-blur-2xl shadow-2xl p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Navigation Menu
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-50 hover:shadow-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-2xl hover:bg-slate-50 hover:shadow-lg transition"
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
                className="flex items-center gap-2.5 p-3 rounded-2xl hover:bg-slate-50 hover:shadow-lg transition"
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
                className="flex items-center gap-2.5 p-3 rounded-2xl hover:bg-slate-50 hover:shadow-lg transition"
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
                className="flex items-center gap-2.5 p-3 rounded-2xl hover:bg-slate-50 hover:shadow-lg transition"
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
                className="flex items-center gap-2.5 p-3 rounded-2xl hover:bg-slate-50 hover:shadow-lg transition"
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
                className="flex items-center gap-2.5 p-3 rounded-2xl hover:bg-slate-50 hover:shadow-lg transition"
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
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full sm:flex-1 py-3 text-center rounded-2xl bg-slate-100 text-slate-800 font-bold hover:bg-slate-200 hover:shadow-lg transition text-xs"
                  >
                    Open Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full sm:flex-1 py-3 text-center rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100 hover:shadow-lg transition text-xs"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full sm:flex-1 py-3 text-center rounded-2xl bg-slate-50 text-slate-800 font-bold hover:bg-slate-100 hover:shadow-lg transition text-xs"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full sm:flex-1 py-3 text-center rounded-2xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 transition text-xs"
                  >
                    Start 14-Day Free Trial
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
