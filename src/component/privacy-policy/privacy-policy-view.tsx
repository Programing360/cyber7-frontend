"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  FileText,
  MessageCircle,
  CheckCircle2,
  Search,
  Printer,
  Copy,
  Check,
  ChevronDown,
  ArrowLeft,
  Mail,
  Building2,
  Server,
  Clock,
  Database,
  UserCheck,
  Globe,
  Trash2,
  HelpCircle,
  KeyRound,
  Layers,
  ArrowUpRight,
} from "lucide-react";

interface PolicySection {
  id: string;
  title: string;
  shortTitle: string;
  category: "overview" | "whatsapp" | "security" | "rights" | "legal";
  icon: React.ElementType;
}

const SECTIONS: PolicySection[] = [
  {
    id: "introduction",
    title: "1. Introduction & Overview",
    shortTitle: "Introduction",
    category: "overview",
    icon: Building2,
  },
  {
    id: "data-we-collect",
    title: "2. Information We Collect",
    shortTitle: "Data Collected",
    category: "overview",
    icon: Database,
  },
  {
    id: "whatsapp-cloud-api",
    title: "3. WhatsApp Business Cloud API & Meta Governance",
    shortTitle: "WhatsApp & Meta",
    category: "whatsapp",
    icon: MessageCircle,
  },
  {
    id: "legal-bases",
    title: "4. Legal Bases for Processing (GDPR)",
    shortTitle: "Legal Bases",
    category: "legal",
    icon: FileText,
  },
  {
    id: "security-storage",
    title: "5. Security, Infrastructure & International Transfers",
    shortTitle: "Security & Storage",
    category: "security",
    icon: Lock,
  },
  {
    id: "sub-processors",
    title: "6. Sub-processors & Third-Party Service Providers",
    shortTitle: "Sub-processors",
    category: "security",
    icon: Server,
  },
  {
    id: "retention-deletion",
    title: "7. Data Retention & Automatic Purging",
    shortTitle: "Retention & Purging",
    category: "security",
    icon: Clock,
  },
  {
    id: "privacy-rights",
    title: "8. Your Privacy Rights (GDPR & CCPA/CPRA)",
    shortTitle: "Your Privacy Rights",
    category: "rights",
    icon: UserCheck,
  },
  {
    id: "opt-out-management",
    title: "9. Consent & Automated WhatsApp Opt-Out",
    shortTitle: "Consent & Opt-Out",
    category: "whatsapp",
    icon: CheckCircle2,
  },
  {
    id: "data-deletion-instructions",
    title: "10. Meta App Review & User Data Deletion Instructions",
    shortTitle: "Meta Deletion Request",
    category: "rights",
    icon: Trash2,
  },
  {
    id: "cookies-tracking",
    title: "11. Cookies & Tracking Technologies",
    shortTitle: "Cookies Policy",
    category: "legal",
    icon: Layers,
  },
  {
    id: "contact-dpo",
    title: "12. Contact Us & Data Protection Officer (DPO)",
    shortTitle: "Contact & DPO",
    category: "legal",
    icon: Mail,
  },
];

const CATEGORIES = [
  { id: "all", label: "All Sections" },
  { id: "overview", label: "Overview & Scope" },
  { id: "whatsapp", label: "WhatsApp & Meta Cloud" },
  { id: "security", label: "Security & Sub-processors" },
  { id: "rights", label: "Privacy Rights & Deletion" },
  { id: "legal", label: "Compliance & Legal" },
] as const;

const FAQS = [
  {
    q: "Does VexChat sell or rent customer phone numbers or chat conversations?",
    a: "No. Absolutely never. VexChat does not monetize, sell, lease, or trade your contacts, phone numbers, or conversation content under any circumstances. You retain 100% ownership of your business data.",
  },
  {
    q: "How does VexChat comply with Meta's WhatsApp Business Platform Terms?",
    a: "VexChat connects directly to Meta's official WhatsApp Business Cloud API using verified tenant tokens, strict webhook validation (SHA-256 HMAC), and automated opt-out enforcement (STOP/CANCEL). We do not use unauthorized scraping, unofficial gateways, or non-compliant automation.",
  },
  {
    q: "Where is customer conversation data stored and encrypted?",
    a: "All data is hosted in high-security, ISO-27001 and SOC-2 compliant Tier-4 data centers with 256-bit AES encryption at rest and TLS 1.3 encryption in transit. Workspaces are strictly logically isolated with multi-tenant role-based access control.",
  },
  {
    q: "How can an end user or client request complete erasure of their WhatsApp data?",
    a: "End users can send a WhatsApp message with the keyword 'DELETE MY DATA' directly to your verified business number or submit a request to privacy@vexchat.io. We process complete deletion requests within 30 days pursuant to GDPR Article 17 and CCPA guidelines.",
  },
];

export default function PrivacyPolicyView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeSection, setActiveSection] = useState<string>("introduction");
  const [copiedLink, setCopiedLink] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Filter sections by search and category
  const filteredSections = useMemo(() => {
    return SECTIONS.filter((section) => {
      const matchesCategory =
        selectedCategory === "all" || section.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.shortTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-lime-200 selection:text-slate-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Back button */}
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Link>

            <div className="h-5 w-px bg-slate-200" />

            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-500 text-slate-950 shadow-sm shadow-lime-500/20">
                <MessageCircle size={20} className="stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight text-slate-900">
                  VexChat
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  WhatsApp Business
                </span>
              </div>
            </Link>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              title="Copy link to this document"
            >
              {copiedLink ? (
                <>
                  <Check size={14} className="text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              title="Print or Save as PDF"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            <Link
              href="/support"
              className="inline-flex items-center gap-1.5 rounded-lg border  px-3.5 py-2.5 text-xs font-semibold text-white transition"
            >
              <Mail size={13} />
              <span>Contact DPO</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white via-slate-50 to-[#f8fafc] px-4 py-12 sm:px-6 lg:px-8">
        {/* Decorative background glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-[700px] -translate-x-1/2 rounded-full bg-lime-300/20 blur-3xl" />

        <div className="mx-auto max-w-4xl text-center">
          {/* Breadcrumbs / Tag */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime-200 bg-lime-50/80 px-3 py-1 text-xs font-semibold text-lime-900">
            <ShieldCheck size={14} className="text-lime-700" />
            <span>Official Policy Document • Version 2.4</span>
            <span className="h-1 w-1 rounded-full bg-lime-400" />
            <span>Last Updated: October 24, 2026</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            VexChat Privacy Policy & WhatsApp Data Governance
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            This Privacy Policy describes how VexChat collects, uses, protects,
            and shares business and customer data in connection with the VexChat
            platform, services, and Meta&apos;s WhatsApp Business Cloud API.
          </p>

          {/* Compliance Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {[
              { label: "Meta Cloud API Compliant", icon: MessageCircle },
              { label: "GDPR (EU 2016/679)", icon: Globe },
              { label: "CCPA / CPRA Aligned", icon: ShieldCheck },
              { label: "256-bit AES & TLS 1.3", icon: Lock },
              { label: "Zero Data Brokerage", icon: CheckCircle2 },
            ].map((badge, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-xs"
              >
                <badge.icon size={13} className="text-lime-600" />
                {badge.label}
              </span>
            ))}
          </div>
        </div>

        {/* 4 Pillar Highlights */}
        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-lime-100 text-lime-800">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Zero Selling</h3>
            <p className="mt-1.5 text-xs leading-5 text-slate-600">
              We never sell, rent, or monetize your contact lists, messages, or
              customer numbers.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
              <MessageCircle size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Official Meta API
            </h3>
            <p className="mt-1.5 text-xs leading-5 text-slate-600">
              Direct enterprise connection with Meta Cloud API with strict
              webhook authorization.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-800">
              <Lock size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Tenant Isolation
            </h3>
            <p className="mt-1.5 text-xs leading-5 text-slate-600">
              Encrypted workspaces, isolated keys, and role-based permissions
              for every business.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <UserCheck size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Full Data Rights
            </h3>
            <p className="mt-1.5 text-xs leading-5 text-slate-600">
              Automated opt-outs, 1-click JSON export, and full deletion SLA
              under 30 days.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Search & Category Filter Toolbar */}
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
          {/* Search Box */}
          <div className="relative flex-1 md:max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clauses (e.g., 'Meta', 'Retention', 'Sub-processors', 'Cookies')..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-lime-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-lime-500/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                  selectedCategory === cat.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Sticky Table of Contents */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* ToC Nav */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Table of Contents
                  </h2>
                  <span className="text-[11px] font-semibold text-lime-700">
                    {filteredSections.length} sections
                  </span>
                </div>

                <nav className="max-h-[calc(100vh-280px)] space-y-1 overflow-y-auto pr-1 text-xs">
                  {filteredSections.length === 0 ? (
                    <p className="py-4 text-center text-xs text-slate-400">
                      No matching sections found.
                    </p>
                  ) : (
                    filteredSections.map((sec) => {
                      const Icon = sec.icon;
                      const isActive = activeSection === sec.id;
                      return (
                        <a
                          key={sec.id}
                          href={`#${sec.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            const el = document.getElementById(sec.id);
                            if (el) {
                              const y =
                                el.getBoundingClientRect().top +
                                window.scrollY -
                                90;
                              window.scrollTo({ top: y, behavior: "smooth" });
                              setActiveSection(sec.id);
                            }
                          }}
                          className={`group flex items-center gap-2.5 rounded-xl px-3 py-2 font-medium transition ${
                            isActive
                              ? "bg-lime-50 text-slate-950 font-semibold border-l-4 border-lime-500 shadow-2xs"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <Icon
                            size={14}
                            className={
                              isActive
                                ? "text-lime-600"
                                : "text-slate-400 group-hover:text-slate-600"
                            }
                          />
                          <span className="truncate">{sec.shortTitle}</span>
                        </a>
                      );
                    })
                  )}
                </nav>
              </div>

              {/* DPO Quick Contact Card */}
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-xs">
                <div className="flex items-center gap-2 text-lime-400">
                  <ShieldCheck size={18} />
                  <span className="text-xs font-bold uppercase tracking-wide">
                    Data Protection Officer
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  Have questions about GDPR compliance, data retention, or
                  submitting a Subject Access Request?
                </p>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-200">
                    <Mail size={13} className="text-lime-400" />
                    <span className="font-mono">dpo@vexchat.io</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock size={13} className="text-lime-400" />
                    <span>Response within 24-48 business hours</span>
                  </div>
                </div>
                <a
                  href="mailto:dpo@vexchat.io?subject=Privacy%20Inquiry%20-%20VexChat"
                  className="mt-4 block w-full rounded-xl bg-lime-400 py-2 text-center text-xs font-bold text-slate-950 transition hover:bg-lime-300"
                >
                  Email DPO Team
                </a>
              </div>
            </div>
          </aside>

          {/* Right Column: Complete Legal & Technical Clauses */}
          <main className="space-y-10 lg:col-span-8">
            {/* Section 1: Introduction */}
            <article
              id="introduction"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-100 text-lime-800">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    1. Introduction & Scope
                  </h2>
                  <p className="text-xs text-slate-500">
                    Entity: VexChat Technologies Inc. (&quot;VexChat&quot;,
                    &quot;we&quot;, &quot;us&quot;, &quot;our&quot;)
                  </p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
                <p>
                  VexChat provides a comprehensive B2B communications
                  infrastructure and unified workspace platform for WhatsApp
                  Business Cloud API messaging, contact management, team
                  collaboration, automated workflows, and message campaign
                  analytics.
                </p>
                <p>
                  This Privacy Policy applies to all users of our web
                  applications (accessible at <code>vexchat.io</code> and its
                  subdomains), APIs, integration gateways, and associated
                  services.
                </p>

                <div className="rounded-xl border border-lime-200 bg-lime-50/60 p-4">
                  <h4 className="flex items-center gap-2 text-xs font-bold text-lime-950">
                    <ShieldCheck size={16} className="text-lime-700" />
                    Roles Under Data Protection Laws (GDPR / UK GDPR)
                  </h4>
                  <ul className="mt-2 list-disc pl-5 text-xs text-lime-900 space-y-1">
                    <li>
                      <strong>VexChat as Data Controller:</strong> We act as the
                      Data Controller for the account information, billing
                      records, platform configuration settings, and analytical
                      usage data of our business customers.
                    </li>
                    <li>
                      <strong>VexChat as Data Processor:</strong> We act as a
                      Data Processor on behalf of our business customers
                      regarding the phone numbers, message contents, customer
                      names, tags, and contact metadata transmitted through the
                      WhatsApp Business Cloud API.
                    </li>
                  </ul>
                </div>
              </div>
            </article>

            {/* Section 2: Data We Collect */}
            <article
              id="data-we-collect"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
                  <Database size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    2. Information We Collect
                  </h2>
                  <p className="text-xs text-slate-500">
                    Categories of personal and business information processed
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm leading-relaxed text-slate-600">
                <p>
                  We collect information through three primary channels:
                  directly from you, automatically when you access the platform,
                  and via incoming webhooks from Meta&apos;s WhatsApp Business
                  Cloud API.
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      A. Business Account & Profile
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                      <li>• Full name and work email address</li>
                      <li>• Organization name and business vertical</li>
                      <li>• Billing address and tax identification</li>
                      <li>• Meta WhatsApp Business Account ID (WABA ID)</li>
                      <li>• Phone Number ID & verification tokens</li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      B. Customer Contacts & Audiences
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                      <li>
                        • End-customer international phone numbers (E.164)
                      </li>
                      <li>• Customer contact names, tags, and attributes</li>
                      <li>• Opt-in consent timestamps and source tracking</li>
                      <li>• Custom CRM fields imported by your organization</li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      C. WhatsApp Message Payloads
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                      <li>
                        • Inbound and outbound message text and interactive
                        replies
                      </li>
                      <li>• Pre-approved WhatsApp message templates</li>
                      <li>• Media attachments (images, PDFs, audio notes)</li>
                      <li>
                        • Message telemetry: sent, delivered, read, failed
                        timestamps
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      D. Audit Logs & System Telemetry
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                      <li>• IP addresses and geographic region</li>
                      <li>• Browser user agent and operating system</li>
                      <li>• Audit trails of team member actions</li>
                      <li>• Webhook delivery latency and error codes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </article>

            {/* Section 3: WhatsApp Cloud API & Meta Governance */}
            <article
              id="whatsapp-cloud-api"
              className="scroll-mt-24 rounded-2xl border border-emerald-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    3. WhatsApp Business Cloud API & Meta Data Governance
                  </h2>
                  <p className="text-xs text-slate-500">
                    Compliant integration with Meta Platforms Ireland Ltd.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm leading-relaxed text-slate-600">
                <p>
                  VexChat is integrated with Meta&apos;s official WhatsApp
                  Business Cloud API. By using our platform to interact with
                  WhatsApp users, both VexChat and your business agree to adhere
                  to the{" "}
                  <a
                    href="https://www.whatsapp.com/legal/business-terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-lime-700 underline hover:text-lime-800"
                  >
                    WhatsApp Business Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="https://www.whatsapp.com/legal/business-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-lime-700 underline hover:text-lime-800"
                  >
                    WhatsApp Business Policy
                  </a>
                  .
                </p>

                <div className="rounded-xl bg-slate-900 p-5 text-white">
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-lime-400">
                    <KeyRound size={16} />
                    WhatsApp Data Safeguards Enforced by VexChat
                  </h4>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs text-slate-300">
                    <div className="rounded-lg bg-slate-800/80 p-3">
                      <strong className="block text-white">
                        No Message Scraping:
                      </strong>
                      We never inspect personal WhatsApp communications or
                      unrelated individual accounts.
                    </div>
                    <div className="rounded-lg bg-slate-800/80 p-3">
                      <strong className="block text-white">
                        Webhook Validation:
                      </strong>
                      Every incoming payload is cryptographically validated
                      against your Meta App Secret via SHA-256 HMAC.
                    </div>
                    <div className="rounded-lg bg-slate-800/80 p-3">
                      <strong className="block text-white">
                        No AI Training on Private Chats:
                      </strong>
                      Customer conversation content is never used to train
                      public or third-party Large Language Models.
                    </div>
                    <div className="rounded-lg bg-slate-800/80 p-3">
                      <strong className="block text-white">
                        Opt-In Verification:
                      </strong>
                      Platform users are obligated to collect valid customer
                      opt-ins prior to sending outbound marketing campaigns.
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Section 4: Legal Bases for Processing */}
            <article
              id="legal-bases"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-800">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    4. Legal Bases for Processing (GDPR Article 6)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Lawful grounds under European & UK Data Protection Law
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm leading-relaxed text-slate-600">
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                    <thead className="bg-slate-50 font-semibold text-slate-900">
                      <tr>
                        <th className="px-4 py-3">Purpose of Processing</th>
                        <th className="px-4 py-3">Legal Basis (GDPR Art. 6)</th>
                        <th className="px-4 py-3">Data Categories</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          Provision of messaging inbox & campaign delivery
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          Performance of a Contract (Art. 6(1)(b))
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          Account data, message text, phone numbers
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          Subscription billing & financial invoices
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          Legal Obligation (Art. 6(1)(c)) & Contract
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          Billing name, tax ID, transaction logs
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          Preventing spam, abuse & security attacks
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          Legitimate Interests (Art. 6(1)(f))
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          IP address, audit trails, device telemetry
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          Customer consent management & unsubscribe
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          Consent (Art. 6(1)(a)) & Legal Obligation
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          Opt-in records, blacklist database
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </article>

            {/* Section 5: Security & Infrastructure */}
            <article
              id="security-storage"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                  <Lock size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    5. Security, Infrastructure & International Transfers
                  </h2>
                  <p className="text-xs text-slate-500">
                    Defensive architecture, encryption standards, and residency
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm leading-relaxed text-slate-600">
                <p>
                  VexChat implements industry-standard technical and
                  organizational security measures designed to protect your
                  information from unauthorized access, destruction, alteration,
                  or disclosure.
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Encryption in Transit
                    </span>
                    <p className="mt-1.5 text-xs text-slate-600">
                      All communications between clients, VexChat, and Meta Cloud
                      API are enforced using <strong>TLS 1.3</strong> with
                      strict HSTS.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Encryption at Rest
                    </span>
                    <p className="mt-1.5 text-xs text-slate-600">
                      Databases, message storage buckets, and backups utilize{" "}
                      <strong>AES-256 bit</strong> encryption with hardware key
                      management.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Tenant Isolation
                    </span>
                    <p className="mt-1.5 text-xs text-slate-600">
                      Strict workspace logical partitioning ensures no business
                      can ever access another workspace&apos;s data or tokens.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h4 className="text-xs font-bold text-slate-900">
                    International Cross-Border Data Transfers
                  </h4>
                  <p className="mt-1 text-xs text-slate-600">
                    Where personal data originating in the European Economic
                    Area (EEA) or UK is transferred to infrastructure in the
                    United States or elsewhere, VexChat relies on standard
                    contractual clauses (SCCs) approved by the European
                    Commission and equivalent UK International Data Transfer
                    Addendums.
                  </p>
                </div>
              </div>
            </article>

            {/* Section 6: Sub-processors */}
            <article
              id="sub-processors"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-800">
                  <Server size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    6. Sub-processors & Third-Party Service Providers
                  </h2>
                  <p className="text-xs text-slate-500">
                    Approved vendors used to provide the VexChat service
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm leading-relaxed text-slate-600">
                <p>
                  VexChat utilizes selected sub-processors to assist in
                  delivering cloud infrastructure, messaging routing, and
                  billing. All sub-processors enter into binding Data Processing
                  Agreements (DPAs):
                </p>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                    <thead className="bg-slate-50 font-semibold text-slate-900">
                      <tr>
                        <th className="px-4 py-3">Sub-processor</th>
                        <th className="px-4 py-3">Purpose</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Transfer Mechanism</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          Meta Platforms Ireland Ltd.
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          WhatsApp Business Cloud API messaging routing
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          Ireland / USA
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          Standard Contractual Clauses (SCCs)
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          Amazon Web Services (AWS)
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          Cloud infrastructure, database & media storage
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          Frankfurt (EU) / US-East
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          ISO 27001 / SOC 2 Type II
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          Stripe Inc.
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          Payment processing & billing administration
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          USA / Global
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          PCI-DSS Level 1 Compliant
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          Redis Labs
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          Real-time message queueing & rate limiting
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          Frankfurt (EU)
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          Encrypted in-memory storage
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </article>

            {/* Section 7: Retention & Deletion */}
            <article
              id="retention-deletion"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-800">
                  <Clock size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    7. Data Retention & Automatic Purging
                  </h2>
                  <p className="text-xs text-slate-500">
                    How long we keep data and how automated cleanup works
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm leading-relaxed text-slate-600">
                <p>
                  VexChat retains personal data only for as long as necessary to
                  fulfill the purposes for which it was collected, as specified
                  in your workspace retention settings or as required by
                  applicable law.
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        WhatsApp Messages & Media
                      </span>
                      <span className="rounded-md bg-lime-100 px-2 py-0.5 text-[10px] font-bold text-lime-800">
                        Default 90 Days
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">
                      Stored during the active subscription. Workspaces can
                      configure custom auto-purge policies (30, 60, 90, 180, or
                      365 days) from Workspace Settings.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        Contact Lists & Profiles
                      </span>
                      <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                        Duration of Account
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">
                      Retained until deleted by the workspace administrator or
                      upon complete termination of the business contract.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        Financial & Invoice Records
                      </span>
                      <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        7 Years
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">
                      Retained as required by corporate tax, financial audit,
                      and statutory accounting laws.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        Audit Logs & Telemetry
                      </span>
                      <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                        180 Days
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">
                      Security access logs and webhook delivery receipts are
                      automatically rotated and purged after 180 days.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* Section 8: Your Privacy Rights */}
            <article
              id="privacy-rights"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-100 text-lime-800">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    8. Your Privacy Rights (GDPR & CCPA/CPRA)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Your statutory entitlements regarding personal information
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm leading-relaxed text-slate-600">
                <p>
                  Depending on your jurisdiction, you have specific rights
                  concerning the personal information we maintain:
                </p>

                <div className="space-y-2.5">
                  {[
                    {
                      title: "Right to Access (GDPR Art. 15 / CCPA)",
                      desc: "You can request a complete copy of the personal data we hold about you in a structured, machine-readable format.",
                    },
                    {
                      title: "Right to Erasure ('Right to be Forgotten')",
                      desc: "You can request the permanent deletion of your personal records and WhatsApp conversation histories.",
                    },
                    {
                      title: "Right to Rectification (GDPR Art. 16)",
                      desc: "You can update inaccurate or incomplete contact profiles directly via our dashboard or by contacting us.",
                    },
                    {
                      title: "Right to Restrict Processing & Object",
                      desc: "You have the right to restrict or object to certain types of processing, including direct marketing campaigns.",
                    },
                    {
                      title: "Right to Data Portability (GDPR Art. 20)",
                      desc: "One-click export of your contact lists and message logs via standard JSON and CSV formats from your settings.",
                    },
                  ].map((right, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5"
                    >
                      <CheckCircle2
                        size={17}
                        className="mt-0.5 shrink-0 text-lime-600"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {right.title}
                        </h4>
                        <p className="mt-0.5 text-xs text-slate-600">
                          {right.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-lime-200 bg-lime-50/50 p-4">
                  <div>
                    <h5 className="text-xs font-bold text-lime-950">
                      Exercising Your Rights
                    </h5>
                    <p className="text-xs text-lime-900">
                      Submit an official request to our Data Protection Officer
                      at <code>dpo@vexchat.io</code>. We do not charge fees and
                      respond within 30 days.
                    </p>
                  </div>
                  <a
                    href="mailto:dpo@vexchat.io?subject=GDPR%20Data%20Subject%20Request"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                  >
                    <span>Submit Request</span>
                    <ArrowUpRight size={13} />
                  </a>
                </div>
              </div>
            </article>

            {/* Section 9: Consent & WhatsApp Opt-Out */}
            <article
              id="opt-out-management"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    9. Consent & Automated WhatsApp Opt-Out
                  </h2>
                  <p className="text-xs text-slate-500">
                    Automated opt-out keywords and spam prevention safeguards
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm leading-relaxed text-slate-600">
                <p>
                  Compliance with international telecommunications and WhatsApp
                  messaging policies requires explicit opt-in consent and
                  effortless opt-out mechanisms for end recipients.
                </p>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h4 className="text-xs font-bold text-slate-900">
                    Automated Inbound Keyword Detection
                  </h4>
                  <p className="mt-1 text-xs text-slate-600">
                    VexChat engines monitor incoming webhook events for
                    recognized opt-out phrases:
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {[
                      "STOP",
                      "UNSUBSCRIBE",
                      "CANCEL",
                      "END",
                      "QUIT",
                      "OPT OUT",
                      "PARAR",
                      "ARRÊT",
                    ].map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-md border border-slate-300 bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-800"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-600">
                    When detected, the recipient is instantly moved to the
                    workspace&apos;s <strong>Do-Not-Contact Blacklist</strong>,
                    immediately halting automated drip sequences and promotional
                    campaigns to that number.
                  </p>
                </div>
              </div>
            </article>

            {/* Section 10: Meta App Review & User Data Deletion Instructions */}
            <article
              id="data-deletion-instructions"
              className="scroll-mt-24 rounded-2xl border-2 border-lime-300 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-500 text-slate-950">
                  <Trash2 size={20} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-lime-100 px-2.5 py-0.5 text-[10px] font-bold text-lime-900">
                    Meta App Review & Compliance Requirement
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    10. User Data Deletion Request Instructions
                  </h2>
                </div>
              </div>

              <div className="space-y-4 text-sm leading-relaxed text-slate-600">
                <p>
                  Pursuant to Meta Platform Rules and developer guidelines for
                  the WhatsApp Business Cloud API, end users whose messages or
                  profiles have been processed via VexChat have the right to
                  request immediate and complete deletion of their information.
                </p>

                <div className="rounded-xl bg-slate-900 p-5 text-white">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-lime-400">
                    How to Request Immediate Data Deletion:
                  </h4>
                  <ol className="mt-3 list-decimal pl-5 space-y-2 text-xs text-slate-300">
                    <li>
                      <strong>Option A (Direct WhatsApp Message):</strong> Send
                      a WhatsApp message stating{" "}
                      <code className="rounded bg-slate-800 px-1 py-0.5 text-lime-300 font-mono">
                        DELETE MY DATA
                      </code>{" "}
                      directly to the verified WhatsApp Business number of the
                      company you communicated with. Our automated webhook will
                      mark your profile for purging.
                    </li>
                    <li>
                      <strong>Option B (Email Request):</strong> Email{" "}
                      <a
                        href="mailto:deletion@vexchat.io"
                        className="text-lime-400 underline font-mono"
                      >
                        deletion@vexchat.io
                      </a>{" "}
                      with the subject line{" "}
                      <span className="font-mono text-slate-200">
                        &quot;WhatsApp Data Deletion Request&quot;
                      </span>{" "}
                      and include your international phone number in E.164
                      format (e.g., +1234567890).
                    </li>
                    <li>
                      <strong>Option C (Facebook / Meta Settings):</strong> If
                      you logged in using Facebook Login or Meta credentials, go
                      to your Facebook profile &gt; Settings &amp; Privacy &gt;
                      Settings &gt; Apps and Websites &gt; VexChat &gt; click
                      &quot;Remove&quot; and check &quot;Delete data&quot;.
                    </li>
                  </ol>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                  <p className="font-semibold text-slate-900">
                    Data Deletion Callback Status:
                  </p>
                  <p className="mt-1">
                    Once received, your request will be assigned a unique
                    tracking confirmation code. All phone numbers, chat logs,
                    media files, and telemetry associated with your number will
                    be permanently scrubbed from our active databases and backup
                    rotation within 30 days.
                  </p>
                </div>
              </div>
            </article>

            {/* Section 11: Cookies & Tracking */}
            <article
              id="cookies-tracking"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-pink-800">
                  <Layers size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    11. Cookies & Tracking Technologies
                  </h2>
                  <p className="text-xs text-slate-500">
                    Session storage, security tokens, and operational cookies
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm leading-relaxed text-slate-600">
                <p>
                  VexChat uses cookies and similar browser storage technologies
                  strictly to ensure secure session authentication, prevent CSRF
                  attacks, and remember your workspace UI preferences.
                </p>

                <div className="space-y-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                    <span className="text-xs font-bold text-slate-900">
                      Essential Authentication Cookies (Required)
                    </span>
                    <p className="mt-0.5 text-xs text-slate-600">
                      Tokens used to maintain your logged-in session,
                      authenticate API calls, and protect against cross-site
                      request forgery. These cannot be disabled.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                    <span className="text-xs font-bold text-slate-900">
                      Functional & Preference Cookies (Optional)
                    </span>
                    <p className="mt-0.5 text-xs text-slate-600">
                      Stores user interface state, such as dark mode
                      preferences, table view density, and sidebar expansion
                      states.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* Section 12: Contact Us & DPO */}
            <article
              id="contact-dpo"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-100 text-lime-800">
                  <Mail size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    12. Contact Us & Data Protection Officer (DPO)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Official contact channels for privacy notices and regulatory
                    inquiries
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm leading-relaxed text-slate-600">
                <p>
                  If you have questions, comments, or requests regarding this
                  Privacy Policy or our data protection practices, please
                  contact our Data Protection Officer:
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Privacy & DPO Inquiries
                    </h4>
                    <p className="mt-2 text-xs text-slate-600">
                      <strong>Email:</strong>{" "}
                      <a
                        href="mailto:dpo@vexchat.io"
                        className="text-lime-700 underline font-mono"
                      >
                        dpo@vexchat.io
                      </a>
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      <strong>General Legal:</strong>{" "}
                      <a
                        href="mailto:legal@vexchat.io"
                        className="text-lime-700 underline font-mono"
                      >
                        legal@vexchat.io
                      </a>
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      <strong>Data Deletions:</strong>{" "}
                      <a
                        href="mailto:deletion@vexchat.io"
                        className="text-lime-700 underline font-mono"
                      >
                        deletion@vexchat.io
                      </a>
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      VexChat Corporate Headquarters
                    </h4>
                    <p className="mt-2 text-xs text-slate-600">
                      VexChat Technologies Inc.
                      <br />
                      Attn: Privacy & Data Protection Officer
                      <br />
                      548 Market St, Suite 7200
                      <br />
                      San Francisco, CA 94104, United States
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500">
                  EU & UK residents also have the right to lodge a complaint
                  with their local supervisory authority (such as the Irish Data
                  Protection Commission or the UK Information
                  Commissioner&apos;s Office - ICO).
                </div>
              </div>
            </article>

            {/* Interactive FAQ Section */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-100 text-lime-800">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                    Frequently Asked Questions
                  </h3>
                  <p className="text-xs text-slate-500">
                    Quick clarifications on WhatsApp data privacy & security
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {FAQS.map((faq, index) => {
                  const isOpen = expandedFaq === index;
                  return (
                    <div
                      key={index}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50 transition hover:border-slate-300"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFaq(isOpen ? null : index)}
                        className="flex w-full items-center justify-between p-4 text-left text-xs font-semibold text-slate-900"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          size={16}
                          className={`text-slate-400 transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-lime-600" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="border-t border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-600">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-500 text-slate-950">
                <MessageCircle size={18} className="stroke-[2.5]" />
              </div>
              <span className="text-sm font-bold tracking-tight text-slate-900">
                VexChat Platform
              </span>
              <span className="text-xs text-slate-400">
                © VexChat Technologies Inc. All rights reserved.
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs text-slate-500">
              <Link
                href="/dashboard"
                className="transition hover:text-slate-900"
              >
                Dashboard
              </Link>
              <Link
                href="/terms-of-service"
                className="transition hover:text-slate-900"
              >
                Terms of Service
              </Link>
              <Link
                href="/settings"
                className="transition hover:text-slate-900"
              >
                Settings
              </Link>
              <Link href="/support" className="transition hover:text-slate-900">
                Support Center
              </Link>
              <a
                href="https://www.whatsapp.com/legal/business-terms"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-slate-900"
              >
                WhatsApp Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
