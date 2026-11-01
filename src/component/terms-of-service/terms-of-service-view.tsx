"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  FileText,
  Layers,
  UserCheck,
  ShieldCheck,
  Users,
  MessageCircle,
  Globe,
  AlertTriangle,
  CreditCard,
  Sparkles,
  Lock,
  KeyRound,
  Ban,
  Clock,
  Server,
  HelpCircle,
  Scale,
  Shield,
  FileEdit,
  Gavel,
  Mail,
  Search,
  Printer,
  Copy,
  Check,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

interface TermsSection {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  category: "overview" | "whatsapp" | "commercial" | "ip-privacy" | "legal";
  icon: React.ElementType;
}

const SECTIONS: TermsSection[] = [
  {
    id: "introduction",
    number: 1,
    title: "1. Introduction",
    shortTitle: "1. Introduction",
    category: "overview",
    icon: Building2,
  },
  {
    id: "acceptance-of-terms",
    number: 2,
    title: "2. Acceptance of Terms",
    shortTitle: "2. Acceptance of Terms",
    category: "overview",
    icon: CheckCircle2,
  },
  {
    id: "definitions",
    number: 3,
    title: "3. Definitions",
    shortTitle: "3. Definitions",
    category: "overview",
    icon: FileText,
  },
  {
    id: "description-of-services",
    number: 4,
    title: "4. Description of Services",
    shortTitle: "4. Description of Services",
    category: "overview",
    icon: Layers,
  },
  {
    id: "account-registration",
    number: 5,
    title: "5. Account Registration and Eligibility",
    shortTitle: "5. Registration & Eligibility",
    category: "overview",
    icon: UserCheck,
  },
  {
    id: "user-responsibilities",
    number: 6,
    title: "6. User Responsibilities",
    shortTitle: "6. User Responsibilities",
    category: "overview",
    icon: ShieldCheck,
  },
  {
    id: "workspace-and-team",
    number: 7,
    title: "7. Workspace and Team Management",
    shortTitle: "7. Workspaces & Teams",
    category: "overview",
    icon: Users,
  },
  {
    id: "whatsapp-api-integration",
    number: 8,
    title: "8. WhatsApp Business API Integration",
    shortTitle: "8. WhatsApp Cloud API",
    category: "whatsapp",
    icon: MessageCircle,
  },
  {
    id: "meta-third-party-services",
    number: 9,
    title: "9. Meta and Third-Party Services",
    shortTitle: "9. Meta & Third Parties",
    category: "whatsapp",
    icon: Globe,
  },
  {
    id: "messaging-policies",
    number: 10,
    title: "10. Messaging Policies and Compliance",
    shortTitle: "10. Messaging Policies",
    category: "whatsapp",
    icon: AlertTriangle,
  },
  {
    id: "subscription-fees-payments",
    number: 11,
    title: "11. Subscription, Fees and Payments",
    shortTitle: "11. Fees & Payments",
    category: "commercial",
    icon: CreditCard,
  },
  {
    id: "free-trials-availability",
    number: 12,
    title: "12. Free Trials and Service Availability",
    shortTitle: "12. Free Trials",
    category: "commercial",
    icon: Sparkles,
  },
  {
    id: "data-ownership-privacy",
    number: 13,
    title: "13. Data Ownership and Privacy",
    shortTitle: "13. Data Ownership & Privacy",
    category: "ip-privacy",
    icon: Lock,
  },
  {
    id: "intellectual-property",
    number: 14,
    title: "14. Intellectual Property Rights",
    shortTitle: "14. Intellectual Property",
    category: "ip-privacy",
    icon: KeyRound,
  },
  {
    id: "prohibited-activities",
    number: 15,
    title: "15. Prohibited Activities",
    shortTitle: "15. Prohibited Activities",
    category: "ip-privacy",
    icon: Ban,
  },
  {
    id: "suspension-termination",
    number: 16,
    title: "16. Account Suspension and Termination",
    shortTitle: "16. Suspension & Termination",
    category: "legal",
    icon: Clock,
  },
  {
    id: "service-availability-modifications",
    number: 17,
    title: "17. Service Availability and Modifications",
    shortTitle: "17. Availability & Changes",
    category: "legal",
    icon: Server,
  },
  {
    id: "disclaimer-of-warranties",
    number: 18,
    title: "18. Disclaimer of Warranties",
    shortTitle: "18. Warranty Disclaimer",
    category: "legal",
    icon: HelpCircle,
  },
  {
    id: "limitation-of-liability",
    number: 19,
    title: "19. Limitation of Liability",
    shortTitle: "19. Limitation of Liability",
    category: "legal",
    icon: Scale,
  },
  {
    id: "indemnification",
    number: 20,
    title: "20. Indemnification",
    shortTitle: "20. Indemnification",
    category: "legal",
    icon: Shield,
  },
  {
    id: "changes-to-terms",
    number: 21,
    title: "21. Changes to These Terms",
    shortTitle: "21. Changes to Terms",
    category: "legal",
    icon: FileEdit,
  },
  {
    id: "governing-law-disputes",
    number: 22,
    title: "22. Governing Law and Dispute Resolution",
    shortTitle: "22. Governing Law & Disputes",
    category: "legal",
    icon: Gavel,
  },
  {
    id: "contact-information",
    number: 23,
    title: "23. Contact Information",
    shortTitle: "23. Contact Information",
    category: "legal",
    icon: Mail,
  },
];

const CATEGORIES = [
  { id: "all", label: "All 23 Sections" },
  { id: "overview", label: "Overview & Account" },
  { id: "whatsapp", label: "WhatsApp & Meta Policies" },
  { id: "commercial", label: "Billing & Subscriptions" },
  { id: "ip-privacy", label: "Data & IP Rights" },
  { id: "legal", label: "Liability & Governance" },
] as const;

const FAQS = [
  {
    q: "Who owns my WhatsApp Business Account (WABA) and phone numbers?",
    a: "You retain 100% full legal and operational ownership of your Meta Business Manager, WhatsApp Business Account (WABA), registered phone numbers, message templates, and business profile. Cyber7 acts solely as an authorized business solution software provider facilitating message management through Meta's official WhatsApp Business Cloud API.",
  },
  {
    q: "Does Cyber7 charge for WhatsApp conversation fees levied by Meta?",
    a: "Meta charges per-conversation fees based on conversation category (Marketing, Utility, Authentication, and Service) and the recipient's country code. Depending on your configuration, conversation fees are either paid directly to Meta via your connected Meta payment method, or passed through transparently without markup under your enterprise billing agreement.",
  },
  {
    q: "What happens if Meta restricts or flags our WhatsApp Business Account?",
    a: "Meta enforces its WhatsApp Business Terms, Commerce Policies, and messaging quality tiers independently. If your phone number receives high user block or spam report rates, Meta may reduce your messaging tier or restrict outbound campaigns. Cyber7 provides template guidelines, delivery status reporting, and platform notifications, but cannot override Meta's unilateral enforcement decisions.",
  },
  {
    q: "Can we cancel our subscription at any time?",
    a: "Yes. Workspace Owners may cancel recurring subscriptions at any time via the Workspace Settings billing portal. Cancellation takes effect at the end of the current paid billing cycle, and you will maintain full access to your workspace until that billing period concludes. We do not provide prorated refunds for partial subscription terms.",
  },
  {
    q: "How does Cyber7 enforce WhatsApp opt-out compliance (e.g., STOP/UNSUBSCRIBE)?",
    a: "Under Meta policy and commercial messaging regulations, senders must honor opt-out requests immediately. When a recipient asks to stop receiving communications (such as replying STOP or UNSUBSCRIBE), the Customer is responsible for ensuring no further marketing broadcasts are sent to that contact. Cyber7 displays incoming messages in real-time in the shared inbox so your team can promptly respect contact preferences.",
  },
  {
    q: "How can we export our customer conversation history and data?",
    a: "Workspace Owners and Administrators can export contact records in standard CSV format directly from the Contacts dashboard. For full account archives upon account closure, customers may submit a data retrieval request to support within a 30-day post-termination period.",
  },
];

export default function TermsOfServiceView() {
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
                  Cyber7
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
              href="/privacy-policy"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <ShieldCheck size={13} className="text-lime-700" />
              <span className="hidden sm:inline">Privacy Policy</span>
              <span className="sm:hidden">Privacy</span>
            </Link>

            <Link
              href="mailto:legal@cyber7.io"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              <Mail size={13} />
              <span>Contact Legal</span>
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
            <Scale size={14} className="text-lime-700" />
            <span>Official Legal Terms â€¢ Master Services Agreement</span>
            <span className="h-1 w-1 rounded-full bg-lime-400" />
            <span>Last Updated: October 31, 2026</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Cyber7 Terms of Service
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            These Terms of Service govern your access to and use of the Cyber7
            WhatsApp Business communication platform, APIs, team workspaces,
            and related software services.
          </p>

          {/* Quick Notice Alert Box */}
          <div className="mt-8 rounded-2xl border border-lime-300/60 bg-gradient-to-r from-lime-50 via-white to-lime-50/60 p-4 text-left shadow-xs sm:p-5">
            <div className="flex items-start gap-3.5">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-lime-500 text-slate-950">
                <AlertCircle size={16} />
              </div>
              <div className="text-xs leading-relaxed text-slate-700">
                <span className="font-bold text-slate-900">
                  Important Notice for WhatsApp Business Senders:
                </span>{" "}
                Cyber7 integrates directly with Meta Platforms, Inc.&apos;s
                official WhatsApp Business Cloud API. Your use of Cyber7 is
                conditioned upon your ongoing compliance with Meta&apos;s
                WhatsApp Business Terms of Service, Commerce Policies, and
                opt-in consent requirements. Unsolicited mass messaging,
                purchased phone lists, and spam are strictly prohibited.
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights / Pillar Cards */}
        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-lime-100 text-lime-800">
              <MessageCircle size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Official Cloud API
            </h3>
            <p className="mt-1.5 text-xs leading-5 text-slate-600">
              Native integration with Meta&apos;s WhatsApp Business Cloud API
              with zero unofficial scrapers.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Consent & Compliance
            </h3>
            <p className="mt-1.5 text-xs leading-5 text-slate-600">
              Mandatory opt-in verification, 24h care window rules, and recipient
              opt-out compliance standards.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-800">
              <Lock size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Customer Data Ownership
            </h3>
            <p className="mt-1.5 text-xs leading-5 text-slate-600">
              You own your contacts, conversations, and business data. Cyber7
              never sells or monetizes your data.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Users size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Tenant & Team Control
            </h3>
            <p className="mt-1.5 text-xs leading-5 text-slate-600">
              Isolated workspace environments with role-based member controls
              and security protections.
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
              placeholder="Search terms (e.g., 'Meta', 'Refund', 'Liability', 'Spam', 'Termination')..."
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
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${selectedCategory === cat.id
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
                            const target = document.getElementById(sec.id);
                            if (target) {
                              target.scrollIntoView({ behavior: "smooth" });
                              setActiveSection(sec.id);
                            }
                          }}
                          className={`group flex items-center gap-2.5 rounded-xl px-3 py-2 font-medium transition ${isActive
                            ? "bg-lime-50 text-slate-950 font-semibold border-l-4 border-lime-500"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                        >
                          <Icon
                            size={14}
                            className={
                              isActive
                                ? "text-lime-600 shrink-0"
                                : "text-slate-400 shrink-0 group-hover:text-slate-600"
                            }
                          />
                          <span className="truncate">{sec.shortTitle}</span>
                        </a>
                      );
                    })
                  )}
                </nav>
              </div>

              {/* Legal Support Card */}
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-xs">
                <div className="flex items-center gap-2 text-lime-400">
                  <Scale size={18} />
                  <span className="text-xs font-bold uppercase tracking-wide">
                    Legal & Contract Inquiries
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  Need a custom Data Processing Agreement (DPA), enterprise SLA,
                  or compliance verification?
                </p>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-200">
                    <Mail size={13} className="text-lime-400" />
                    <span className="font-mono">legal@cyber7.io</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock size={13} className="text-lime-400" />
                    <span>Response within 1-2 business days</span>
                  </div>
                </div>
                <a
                  href="mailto:legal@cyber7.io?subject=Terms%20of%20Service%20Inquiry%20-%20Cyber7"
                  className="mt-4 block w-full rounded-xl bg-lime-400 py-2 text-center text-xs font-bold text-slate-950 transition hover:bg-lime-300"
                >
                  Email Legal Team
                </a>
              </div>
            </div>
          </aside>

          {/* Right Column: Complete Legal Terms Clauses */}
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
                    1. Introduction
                  </h2>
                  <p className="text-xs text-slate-500">
                    Entity: Cyber7 Technologies Inc. (&quot;Cyber7&quot;,
                    &quot;we&quot;, &quot;us&quot;, &quot;our&quot;)
                  </p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
                <p>
                  Welcome to Cyber7. Cyber7 provides an enterprise-grade
                  software-as-a-service (&quot;SaaS&quot;) platform designed to
                  unify WhatsApp Business customer communications, multi-agent
                  team collaboration, contact management, automated webhook
                  handling, message template authoring, and broadcast campaign
                  analytics.
                </p>
                <p>
                  These Terms of Service (&quot;Terms&quot;, &quot;Agreement&quot;)
                  constitute a legally binding contract between Cyber7
                  Technologies Inc. and the legal entity or individual
                  (&quot;Customer&quot;, &quot;User&quot;, &quot;You&quot;)
                  accessing or utilizing our services. If you are entering into
                  this Agreement on behalf of a corporation, partnership, or
                  other legal entity, you represent and warrant that you possess
                  full corporate and legal authority to bind that entity to
                  these Terms.
                </p>
                <p>
                  By registering for an account, accessing the Cyber7 web
                  application, integrating your Meta WhatsApp Business Account,
                  or utilizing any of our APIs, you acknowledge that you have
                  read, understood, and agreed to be bound by all terms,
                  conditions, policies, and notices contained herein.
                </p>
              </div>
            </article>

            {/* Section 2: Acceptance of Terms */}
            <article
              id="acceptance-of-terms"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    2. Acceptance of Terms
                  </h2>
                  <p className="text-xs text-slate-500">
                    Binding contractual execution &amp; operational consent
                  </p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
                <p>
                  Your acceptance of these Terms occurs upon the earliest of: (a)
                  clicking &quot;Sign Up&quot;, &quot;Create Account&quot;, or
                  similar confirmation buttons on our website or onboarding
                  portal; (b) executing a written or electronic Order Form or
                  Service Agreement referencing these Terms; or (c) initiating
                  use of any Cyber7 services, software, or APIs.
                </p>
                <p>
                  If you do not agree with any provision of these Terms, you
                  must immediately refrain from using the Cyber7 platform,
                  disconnect any connected Meta WhatsApp integrations, and close
                  your account. Continued use of the platform following the
                  effective date of any revised Terms constitutes full and
                  unconditional acceptance of those revisions.
                </p>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">
                    Supplementary Terms:
                  </span>{" "}
                  Your use of Cyber7 is also governed by our{" "}
                  <Link
                    href="/privacy-policy"
                    className="font-semibold text-lime-700 underline hover:text-lime-800"
                  >
                    Privacy Policy
                  </Link>{" "}
                  and any executed Data Processing Agreement (DPA), which are
                  expressly incorporated into and form an integral part of this
                  Agreement.
                </div>
              </div>
            </article>

            {/* Section 3: Definitions */}
            <article
              id="definitions"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-800">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    3. Definitions
                  </h2>
                  <p className="text-xs text-slate-500">
                    Standardized terminology used across the Cyber7 platform
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <span className="font-bold text-slate-900">
                    &quot;Authorized User&quot;:
                  </span>{" "}
                  An individual employee, contractor, or agent who is authorized
                  by the Customer to access and utilize the Cyber7 platform under
                  the Customer&apos;s account and workspace credentials.
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <span className="font-bold text-slate-900">
                    &quot;Customer Data&quot;:
                  </span>{" "}
                  All electronic messages, texts, media, contact details, phone
                  numbers, conversation histories, tags, and custom metadata
                  submitted, stored, or processed by Customer or Authorized
                  Users through the Platform.
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <span className="font-bold text-slate-900">
                    &quot;End User / Customer Contact&quot;:
                  </span>{" "}
                  Any third party or consumer who communicates with the Customer
                  or receives outbound WhatsApp messages from Customer&apos;s
                  registered WhatsApp Business numbers.
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <span className="font-bold text-slate-900">
                    &quot;Meta Cloud API&quot;:
                  </span>{" "}
                  The official WhatsApp Business Cloud API hosted and operated
                  by Meta Platforms, Inc., enabling programmatic sending and
                  receiving of messages over the WhatsApp network.
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <span className="font-bold text-slate-900">
                    &quot;Meta Terms&quot;:
                  </span>{" "}
                  Collectively, Meta&apos;s Commercial Terms, WhatsApp Business
                  Terms of Service, WhatsApp Commerce Policy, and WhatsApp
                  Business Messaging Policies, as updated by Meta from time to
                  time.
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <span className="font-bold text-slate-900">
                    &quot;WABA (WhatsApp Business Account)&quot;:
                  </span>{" "}
                  The official account entity provisioned within Meta Business
                  Manager that manages WhatsApp phone numbers, message templates,
                  and official business verification status.
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <span className="font-bold text-slate-900">
                    &quot;Workspace&quot;:
                  </span>{" "}
                  A logically isolated tenant environment within Cyber7 with its
                  own dedicated access tokens, team permissions, contact
                  databases, conversation threads, and audit logs.
                </div>
              </div>
            </article>

            {/* Section 4: Description of Services */}
            <article
              id="description-of-services"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                  <Layers size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    4. Description of Services
                  </h2>
                  <p className="text-xs text-slate-500">
                    Platform capabilities, software boundaries, and technical scope
                  </p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
                <p>
                  Cyber7 provides a multi-tenant business software platform that
                  enables businesses to orchestrate WhatsApp customer
                  conversations at scale. Core platform capabilities include:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-xs text-slate-700">
                  <li>
                    <strong className="text-slate-900">
                      Unified Multi-Agent Inbox:
                    </strong>{" "}
                    Real-time shared inbox allowing team members to assign,
                    filter, collaborate on, and respond to incoming WhatsApp
                    messages.
                  </li>
                  <li>
                    <strong className="text-slate-900">
                      WhatsApp Cloud API Connectivity:
                    </strong>{" "}
                    Server-to-server integration with Meta&apos;s Cloud API,
                    including encrypted token storage, automated status callbacks,
                    and delivery receipt ingestion.
                  </li>
                  <li>
                    <strong className="text-slate-900">
                      Contact &amp; Audience Management:
                    </strong>{" "}
                    Centralized contact registry, conversation history tracking,
                    and contact information management.
                  </li>
                  <li>
                    <strong className="text-slate-900">
                      Message Template Authoring &amp; Sync:
                    </strong>{" "}
                    Creation and management of WhatsApp Message Templates
                    submitted to Meta for approval, with localized parameter
                    mapping.
                  </li>
                  <li>
                    <strong className="text-slate-900">
                      Broadcast Messaging &amp; Campaigns:
                    </strong>{" "}
                    Targeted message broadcast orchestration utilizing
                    Meta-approved templates in compliance with messaging tier
                    limits.
                  </li>
                  <li>
                    <strong className="text-slate-900">
                      Analytics &amp; Operational Reporting:
                    </strong>{" "}
                    Aggregated analytics displaying message delivery rates, read
                    receipts, response latency, and team performance metrics.
                  </li>
                </ul>
                <p className="text-xs text-slate-500 italic">
                  Note: Cyber7 does not provide direct telecommunication
                  transmission lines or mobile carrier infrastructure. Message
                  transmission is executed directly by Meta Platforms, Inc.
                </p>
              </div>
            </article>

            {/* Section 5: Account Registration and Eligibility */}
            <article
              id="account-registration"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    5. Account Registration and Eligibility
                  </h2>
                  <p className="text-xs text-slate-500">
                    Eligibility qualifications, security controls, and credential safety
                  </p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
                <p>
                  To register for and maintain an active Cyber7 account, you must:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700">
                  <li>
                    Be a duly registered legal entity or an individual who has
                    reached the legal age of majority in your jurisdiction (at
                    least 18 years old).
                  </li>
                  <li>
                    Provide complete, true, accurate, and current business
                    registration information during onboarding.
                  </li>
                  <li>
                    Ensure that all Authorized Users assigned to your workspace
                    possess valid business email addresses. Generic, shared, or
                    group accounts (e.g., &quot;sales@&quot; shared by multiple
                    persons) are discouraged for security auditability.
                  </li>
                  <li>
                    Maintain the strict confidentiality of your account password,
                    authentication credentials, and API access tokens.
                  </li>
                </ul>
                <p>
                  You are solely and fully responsible for all acts, omissions,
                  and communications transmitted through your account credentials.
                  If you discover or suspect any unauthorized access, token
                  compromise, or breach of security, you must notify Cyber7
                  immediately at{" "}
                  <span className="font-mono text-lime-700">
                    security@cyber7.io
                  </span>
                  .
                </p>
              </div>
            </article>

            {/* Section 6: User Responsibilities */}
            <article
              id="user-responsibilities"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    6. User Responsibilities
                  </h2>
                  <p className="text-xs text-slate-500">
                    Statutory obligations, telecommunication rules, and lawful usage
                  </p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
                <p>
                  As a Cyber7 Customer, you represent, warrant, and covenant that:
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
                    <p className="font-bold text-slate-900 mb-1">
                      Legal Compliance
                    </p>
                    <p className="text-slate-600">
                      You will comply with all domestic and international
                      statutes governing electronic communications, commercial
                      messaging, data protection, and consumer privacy (including
                      TCPA, CAN-SPAM, GDPR, and CASL).
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
                    <p className="font-bold text-slate-900 mb-1">
                      Opt-In Consent
                    </p>
                    <p className="text-slate-600">
                      You will obtain express, verifiable, and voluntary opt-in
                      consent from every contact prior to sending any outbound
                      message, and respect all revocation requests immediately.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
                    <p className="font-bold text-slate-900 mb-1">
                      Truthful Identity
                    </p>
                    <p className="text-slate-600">
                      You will not impersonate any person, brand, or entity, nor
                      misrepresent your affiliation, organization name, or the
                      commercial nature of your messages.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
                    <p className="font-bold text-slate-900 mb-1">
                      Data Integrity
                    </p>
                    <p className="text-slate-600">
                      You maintain full legal rights and authorizations to collect,
                      store, and process all Customer Data uploaded or
                      synchronized to the Platform.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* Section 7: Workspace and Team Management */}
            <article
              id="workspace-and-team"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-800">
                  <Users size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    7. Workspace and Team Management
                  </h2>
                  <p className="text-xs text-slate-500">
                    Multi-tenant workspace isolation, administrative roles, and team hierarchy
                  </p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
                <p>
                  Cyber7 organizes customer operations into Workspaces. Each
                  Workspace acts as a logically isolated tenant with its own
                  credentials, customer databases, and configuration settings:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-xs text-slate-700">
                  <li>
                    <strong className="text-slate-900">Workspace Owner:</strong>{" "}
                    The primary account holder who creates the workspace
                    possesses comprehensive administrative authority, including
                    the ability to invite or remove team members, configure
                    WhatsApp API keys, alter subscription tiers, and terminate
                    the workspace.
                  </li>
                  <li>
                    <strong className="text-slate-900">
                      Administrators and Agents:
                    </strong>{" "}
                    Authorized Users assigned specific roles (e.g., Owner, Admin,
                    Agent) must operate strictly within their assigned
                    permissions. The Customer remains legally responsible for all
                    actions executed by invited users.
                  </li>
                  <li>
                    <strong className="text-slate-900">
                      Workspace Deletion &amp; Transfer:
                    </strong>{" "}
                    Ownership transfers require explicit authentication from the
                    current Workspace Owner or documented corporate legal
                    succession verified by Cyber7 support.
                  </li>
                </ul>
              </div>
            </article>

            {/* Section 8: WhatsApp Business API Integration */}
            <article
              id="whatsapp-api-integration"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-100 text-lime-800">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    8. WhatsApp Business API Integration
                  </h2>
                  <p className="text-xs text-slate-500">
                    Official Meta Cloud API technical architecture and delivery boundaries
                  </p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
                <p>
                  Cyber7 integrates natively with Meta&apos;s WhatsApp Business
                  Cloud API. To connect your WhatsApp Business Account:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-xs text-slate-700">
                  <li>
                    You must maintain a verified Meta Business Manager account,
                    a WhatsApp Business Account (WABA), and a valid Phone Number
                    ID registered with Meta.
                  </li>
                  <li>
                    You authorize Cyber7 to transmit and receive messages, media,
                    and status webhooks on your behalf via Meta&apos;s Cloud API.
                  </li>
                  <li>
                    All Meta API tokens and secrets entered into Cyber7 are
                    encrypted using industry-standard 256-bit AES encryption at
                    rest and are never exposed in client-side code.
                  </li>
                </ul>
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
                  <span className="font-bold">Technical Boundary Notice:</span>{" "}
                  Cyber7 cannot guarantee message delivery speeds, network latency,
                  or delivery rates. Message routing, telecommunication handshake,
                  and carrier delivery are handled entirely within Meta&apos;s
                  global infrastructure. Furthermore, Meta strictly limits
                  outbound messaging throughput based on your assigned messaging
                  tier (e.g., Tier 1: 1,000 unique recipients / 24 hours; Tier 2:
                  10,000; Tier 3: 100,000; Tier 4: unlimited).
                </div>
              </div>
            </article>

            {/* Section 9: Meta and Third-Party Services */}
            <article
              id="meta-third-party-services"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-800">
                  <Globe size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    9. Meta and Third-Party Services
                  </h2>
                  <p className="text-xs text-slate-500">
                    Independent relationship disclosure and Meta policy subordination
                  </p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
                <p>
                  <strong>Independent Software Vendor Status:</strong> Cyber7
                  Technologies Inc. is an independent software provider.
                  &quot;WhatsApp&quot; and &quot;Meta&quot; are registered
                  trademarks of Meta Platforms, Inc. Cyber7 is not owned by,
                  partnered with, or an agent of Meta Platforms, Inc., except as
                  an authorized software integration utilizing Meta&apos;s
                  public Cloud APIs.
                </p>
                <p>
                  <strong>Subordination to Meta Policies:</strong> Your right to
                  send WhatsApp messages is directly subordinate to your compliance
                  with Meta&apos;s policies, including:
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <a
                    href="https://www.whatsapp.com/legal/business-terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <span>WhatsApp Business Terms</span>
                    <ExternalLink size={12} />
                  </a>
                  <a
                    href="https://www.whatsapp.com/legal/commerce-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <span>WhatsApp Commerce Policy</span>
                    <ExternalLink size={12} />
                  </a>
                  <a
                    href="https://developers.facebook.com/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <span>Meta Developer Terms</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
                <p>
                  Cyber7 shall have no liability whatsoever for any actions taken
                  by Meta, including rejection of message templates, downgrading
                  of phone number quality ratings, suspension or banning of WABAs,
                  or API endpoint outages.
                </p>
              </div>
            </article>

            {/* Section 10: Messaging Policies and Compliance */}
            <article
              id="messaging-policies"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-800">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    10. Messaging Policies and Compliance
                  </h2>
                  <p className="text-xs text-slate-500">
                    24-hour customer care window, template approvals, and opt-out automation
                  </p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
                <p>
                  Customer agrees to strictly observe the core operational
                  messaging guidelines governing WhatsApp:
                </p>
                <div className="space-y-3 text-xs">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                    <span className="font-bold text-slate-900">
                      1. The 24-Hour Customer Care Window:
                    </span>{" "}
                    When an End User sends an inbound message to your business
                    number, a 24-hour &quot;customer care window&quot; opens.
                    During this window, Authorized Users may send free-form text
                    and media messages to resolve the user&apos;s inquiry.
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                    <span className="font-bold text-slate-900">
                      2. Pre-Approved Message Templates Outside 24h:
                    </span>{" "}
                    Outside the 24-hour window, businesses may ONLY send outbound
                    messages utilizing pre-approved Meta Message Templates
                    (categorized as Utility, Marketing, or Authentication).
                    Attempting to evade template approval through automated
                    spoofing constitutes an incurable material breach of these
                    Terms.
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                    <span className="font-bold text-slate-900">
                      3. Opt-Out Handling and Customer Compliance:
                    </span>{" "}
                    All promotional campaigns must provide a clear, accessible
                    way for recipients to opt out. Customer is solely responsible
                    for recording and honoring all opt-out requests (including
                    inbound keywords such as &quot;STOP&quot;, &quot;CANCEL&quot;,
                    or &quot;UNSUBSCRIBE&quot;) and ensuring that no further marketing
                    messages are sent to opted-out contacts, in strict accordance
                    with Meta policies and applicable telecommunications law.
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                    <span className="font-bold text-slate-900">
                      4. Prohibited Content Categories:
                    </span>{" "}
                    Messages relating to illegal drugs, weapons, adult products,
                    gambling, counterfeit goods, multi-level marketing, or
                    predatory lending are prohibited under Meta&apos;s Commerce
                    Policy.
                  </div>
                </div>
              </div>
            </article>

            {/* Section 11: Subscription, Fees and Payments */}
            <article
              id="subscription-fees-payments"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-800">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    11. Subscription, Fees and Payments
                  </h2>
                  <p className="text-xs text-slate-500">
                    Billing terms, subscription renewal, fee changes, and taxation
                  </p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
                <p>
                  <strong>Subscription Plans &amp; Billing Cycles:</strong>{" "}
                  Cyber7 offers subscription plans billed on a recurring monthly
                  or annual basis. Subscription fees cover access to the SaaS
                  platform, seat licenses, inbox tools, and storage according to
                  your selected tier.
                </p>
                <p>
                  <strong>Payment Processing:</strong> Payments are processed via
                  authorized third-party billing providers or invoicing mechanisms. You agree
                  to maintain valid, authorized credit card or billing details on
                  file. Subscriptions renew automatically at the conclusion of
                  each billing cycle unless cancelled prior to the renewal date.
                </p>
                <p>
                  <strong>WhatsApp Conversation Fees:</strong> Meta charges
                  per-conversation fees for WhatsApp Business Cloud API usage.
                  Depending on your enterprise configuration, these charges are
                  either settled directly with Meta via your Meta Business
                  Manager payment method, or passed through via Cyber7 invoicing
                  at Meta&apos;s published rates.
                </p>
                <p>
                  <strong>Non-Refundable Fees &amp; Taxes:</strong> Except as
                  expressly required by mandatory local consumer laws, all fees
                  paid to Cyber7 are strictly non-refundable. You are solely
                  responsible for all applicable value-added taxes (VAT), sales
                  taxes, goods and services taxes (GST), and duties assessed by
                  governmental authorities.
                </p>
              </div>
            </article>

            {/* Section 12: Free Trials and Service Availability */}
            <article
              id="free-trials-availability"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-100 text-lime-800">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    12. Free Trials and Service Availability
                  </h2>
                  <p className="text-xs text-slate-500">
                    Trial evaluation terms, feature caps, and transition to paid tiers
                  </p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
                <p>
                  Cyber7 may offer temporary free trials or evaluation tiers to
                  prospective customers. Free trials are provided solely for the
                  purpose of evaluating platform features and API connectivity.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700">
                  <li>
                    Free trials are limited to one per business organization
                    unless authorized in writing by Cyber7.
                  </li>
                  <li>
                    Cyber7 reserves the right to modify trial duration, impose
                    monthly active contact (MAC) caps, or restrict broadcast
                    volumes during trial periods.
                  </li>
                  <li>
                    Upon expiration of the trial period, your workspace will be
                    paused unless you upgrade to a paid subscription plan.
                    Unconverted trial workspaces may be permanently purged after
                    60 days of inactivity.
                  </li>
                  <li>
                    DURING ANY FREE TRIAL PERIOD, THE SERVICES ARE PROVIDED
                    STRICTLY &quot;AS-IS&quot; WITHOUT WARRANTIES, SLAS, OR
                    INDEMNIFICATION OF ANY KIND.
                  </li>
                </ul>
              </div>
            </article>

            {/* Section 13: Data Ownership and Privacy */}
            <article
              id="data-ownership-privacy"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-800">
                  <Lock size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    13. Data Ownership and Privacy
                  </h2>
                  <p className="text-xs text-slate-500">
                    Proprietary rights in customer data, processor duties, and GDPR/CCPA alignment
                  </p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
                <p>
                  <strong>Customer Ownership:</strong> As between Customer and
                  Cyber7, Customer retains all right, title, and interest
                  (including all intellectual property and proprietary rights) in
                  and to all Customer Data. Cyber7 claims no ownership interest
                  in your contacts, conversations, templates, or media assets.
                </p>
                <p>
                  <strong>Limited Processing License:</strong> Customer grants
                  Cyber7 a worldwide, limited, non-exclusive, royalty-free license
                  to host, copy, transmit, and display Customer Data strictly to
                  the extent necessary to operate, maintain, support, and provide
                  the Services under this Agreement.
                </p>
                <p>
                  <strong>Data Protection &amp; Processor Role:</strong> To the
                  extent Customer Data contains personal data subject to GDPR,
                  UK-GDPR, or CCPA, the parties agree that Customer is the Data
                  Controller and Cyber7 acts strictly as a Data Processor.
                  Cyber7 processes personal data strictly pursuant to the
                  Customer&apos;s documented instructions, as further set forth
                  in our{" "}
                  <Link
                    href="/privacy-policy"
                    className="font-semibold text-lime-700 underline hover:text-lime-800"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
                <p>
                  Cyber7 never sells, leases, or monetizes Customer Data or
                  customer contact lists to third-party data brokers or
                  advertisers.
                </p>
              </div>
            </article>

            {/* Section 14: Intellectual Property Rights */}
            <article
              id="intellectual-property"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-800">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    14. Intellectual Property Rights
                  </h2>
                  <p className="text-xs text-slate-500">
                    Software copyrights, patents, UI designs, and customer feedback license
                  </p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
                <p>
                  <strong>Cyber7 Intellectual Property:</strong> Cyber7
                  Technologies Inc. and its licensors retain all right, title, and
                  interest in and to the Cyber7 platform, software code, user
                  interfaces, APIs, algorithms, documentation, trademarks, logos,
                  and all enhancements, modifications, and derivative works
                  thereof.
                </p>
                <p>
                  <strong>Limited License Grant:</strong> Subject to your ongoing
                  compliance with these Terms and timely payment of subscription
                  fees, Cyber7 grants you a limited, revocable, non-exclusive,
                  non-transferable, non-sublicensable license to access and use
                  the Cyber7 platform during your subscription term solely for
                  your internal business operations.
                </p>
                <p>
                  <strong>Feedback:</strong> If you provide suggestions, feature
                  requests, bug reports, or feedback regarding the Platform, you
                  grant Cyber7 a perpetual, irrevocable, worldwide, royalty-free
                  license to use and incorporate such feedback into the platform
                  without any obligation of attribution or compensation.
                </p>
              </div>
            </article>

            {/* Section 15: Prohibited Activities */}
            <article
              id="prohibited-activities"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-800">
                  <Ban size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    15. Prohibited Activities
                  </h2>
                  <p className="text-xs text-slate-500">
                    Strict platform abuse boundaries, security prohibitions, and unacceptable use
                  </p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
                <p>
                  You agree that you will not, directly or indirectly, and will
                  not permit any Authorized User or third party to:
                </p>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs">
                  <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3">
                    <strong className="text-rose-950 block mb-1">
                      Spam &amp; Cold Outreach
                    </strong>
                    Transmit unsolicited bulk messages, spam, phishing lures, or
                    messages to purchased or scraped contact databases.
                  </div>

                  <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3">
                    <strong className="text-rose-950 block mb-1">
                      Reverse Engineering
                    </strong>
                    Decompile, reverse engineer, disassemble, or attempt to derive
                    the source code of Cyber7 or its proprietary APIs.
                  </div>

                  <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3">
                    <strong className="text-rose-950 block mb-1">
                      Security Interference
                    </strong>
                    Bypass tenant isolation boundaries, probe system
                    vulnerabilities, disable rate limiters, or inject malicious
                    code.
                  </div>

                  <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3">
                    <strong className="text-rose-950 block mb-1">
                      Reselling &amp; White-labeling
                    </strong>
                    Sublease, rent, resell, or distribute the platform to third
                    parties without an explicit written reseller agreement.
                  </div>

                  <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3">
                    <strong className="text-rose-950 block mb-1">
                      Malware &amp; Viruses
                    </strong>
                    Upload or transmit files containing trojans, worms, ransomware,
                    corrupted data, or spyware through chat channels.
                  </div>

                  <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3">
                    <strong className="text-rose-950 block mb-1">
                      Policy Circumvention
                    </strong>
                    Evade Meta WhatsApp template category restrictions or spoof
                    authentication headers to mask commercial broadcasts.
                  </div>
                </div>
              </div>
            </article>

            {/* Section 16: Account Suspension and Termination */}
            <article
              id="suspension-termination"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-800">
                  <Clock size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    16. Account Suspension and Termination
                  </h2>
                  <p className="text-xs text-slate-500">
                    Suspension triggers, termination protocols, and post-termination data grace period
                  </p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
                <p>
                  <strong>Suspension for Cause:</strong> Cyber7 reserves the right
                  to immediately suspend or restrict access to your workspace or
                  any Authorized User without prior notice if: (a) you fail to pay
                  applicable subscription fees when due; (b) you violate Section 10
                  (Messaging Policies) or Section 15 (Prohibited Activities); (c)
                  your WhatsApp quality rating drops to critical or Meta
                  restricts your WABA; or (d) Cyber7 reasonably believes your
                  account poses an immediate security, operational, or legal risk
                  to the platform or third parties.
                </p>
                <p>
                  <strong>Termination by Customer:</strong> You may cancel your
                  subscription at any time through the workspace settings.
                  Termination becomes effective at the end of the current prepaid
                  billing cycle.
                </p>
                <p>
                  <strong>Data Retrieval and Account Closure:</strong> Following
                  termination of your account for any reason other than egregious
                  security violations or legal mandate, Customer may export available
                  contact lists via standard CSV download prior to closure, or request
                  data export assistance from customer support within thirty (30)
                  days of termination. Following this period, Cyber7 reserves the right
                  to delete or anonymize Customer Data in accordance with operational
                  data retention practices.
                </p>
              </div>
            </article>

            {/* Section 17: Service Availability and Modifications */}
            <article
              id="service-availability-modifications"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
                  <Server size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    17. Service Availability and Modifications
                  </h2>
                  <p className="text-xs text-slate-500">
                    Uptime standards, scheduled maintenance, and feature enhancements
                  </p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
                <p>
                  <strong>Platform Availability:</strong> Cyber7 employs commercially
                  reasonable efforts to maintain the continuous availability,
                  reliability, and security of the SaaS platform. Cyber7 does not
                  provide a guaranteed uptime percentage or formal Service Level
                  Agreement (SLA) unless specifically agreed upon in an executed
                  enterprise order form. Service availability remains subject to
                  scheduled maintenance windows and third-party infrastructure (including
                  Meta WhatsApp Cloud API availability).
                </p>
                <p>
                  <strong>Scheduled Maintenance:</strong> We perform routine
                  maintenance, infrastructure upgrades, and database indexing
                  periodically. Whenever feasible, scheduled maintenance will be
                  announced in advance via in-app banners or email and executed
                  during off-peak hours.
                </p>
                <p>
                  <strong>Platform Updates:</strong> Cyber7 continuously improves
                  and enhances its services. We reserve the right to modify,
                  update, or deprecate features, user interfaces, and API
                  endpoints from time to time. For material deprecations of core
                  functionality, we will provide at least 30 days&apos; advance
                  notice.
                </p>
              </div>
            </article>

            {/* Section 18: Disclaimer of Warranties */}
            <article
              id="disclaimer-of-warranties"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    18. Disclaimer of Warranties
                  </h2>
                  <p className="text-xs text-slate-500">
                    Statutory warranty disclaimers and as-is performance standards
                  </p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
                <div className="rounded-xl border border-slate-300 bg-slate-50 p-4 font-mono text-[11px] uppercase tracking-wide text-slate-800 leading-relaxed">
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE CYBER7
                  PLATFORM, APIS, WORKSPACES, DOCUMENTATION, AND ALL RELATED
                  SERVICES ARE PROVIDED STRICTLY &quot;AS IS&quot; AND &quot;AS
                  AVAILABLE&quot;, WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS,
                  IMPLIED, STATUTORY, OR OTHERWISE.
                </div>
                <p>
                  CYBER7 EXPRESSLY DISCLAIMS ALL IMPLIED WARRANTIES, INCLUDING
                  WITHOUT LIMITATION ANY WARRANTIES OF MERCHANTABILITY, FITNESS
                  FOR A PARTICULAR PURPOSE, TITLE, QUIET ENJOYMENT, AND
                  NON-INFRINGEMENT.
                </p>
                <p>
                  WITHOUT LIMITING THE GENERALITY OF THE FOREGOING, CYBER7 DOES
                  NOT WARRANT THAT: (A) THE SERVICES WILL MEET YOUR SPECIFIC
                  COMMERCIAL REQUIREMENTS; (B) OPERATION WILL BE UNINTERRUPTED,
                  TIMELY, SECURE, OR ERROR-FREE; (C) ANY DEFECTS IN THE SOFTWARE
                  WILL BE CORRECTED; OR (D) MESSAGES TRANSMITTED THROUGH THE
                  WHATSAPP CLOUD API WILL BE DELIVERED WITHOUT DELAY OR CARRIER
                  BLOCKING.
                </p>
              </div>
            </article>

            {/* Section 19: Limitation of Liability */}
            <article
              id="limitation-of-liability"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-800">
                  <Scale size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    19. Limitation of Liability
                  </h2>
                  <p className="text-xs text-slate-500">
                    Consequential damage waivers and aggregate financial liability caps
                  </p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
                <p>
                  <strong>Consequential Damages Waiver:</strong> TO THE FULLEST
                  EXTENT PERMITTED BY LAW, IN NO EVENT SHALL EITHER PARTY, ITS
                  DIRECTORS, OFFICERS, EMPLOYEES, AFFILIATES, AGENTS, OR
                  SUPPLIERS BE LIABLE TO THE OTHER PARTY FOR ANY INDIRECT,
                  INCIDENTAL, SPECIAL, PUNITIVE, COVER, EXEMPLARY, OR
                  CONSEQUENTIAL DAMAGES (INCLUDING, WITHOUT LIMITATION, DAMAGES
                  FOR LOSS OF REVENUE, PROFITS, GOODWILL, USE, CONTENT, DATA, OR
                  BUSINESS INTERRUPTION), HOWEVER CAUSED, UNDER ANY THEORY OF
                  LIABILITY (INCLUDING CONTRACT, TORT, NEGLIGENCE, STRICT
                  LIABILITY, OR OTHERWISE), EVEN IF ADVISED OF THE POSSIBILITY OF
                  SUCH DAMAGES.
                </p>
                <p>
                  <strong>Aggregate Liability Cap:</strong> TO THE MAXIMUM EXTENT
                  PERMITTED BY LAW, THE TOTAL AGGREGATE LIABILITY OF CYBER7
                  ARISING OUT OF OR RELATING TO THIS AGREEMENT, WHETHER IN
                  CONTRACT, TORT (INCLUDING NEGLIGENCE), BREACH OF STATUTORY
                  DUTY, OR OTHERWISE, SHALL IN NO EVENT EXCEED THE TOTAL
                  SUBSCRIPTION FEES ACTUALLY PAID BY CUSTOMER TO CYBER7 UNDER
                  THIS AGREEMENT IN THE TWELVE (12) MONTH PERIOD PRECEDING THE
                  FIRST EVENT GIVING RISE TO LIABILITY (OR ONE HUNDRED U.S.
                  DOLLARS ($100) IF CUSTOMER IS ON A FREE TRIAL).
                </p>
              </div>
            </article>

            {/* Section 20: Indemnification */}
            <article
              id="indemnification"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <Shield size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    20. Indemnification
                  </h2>
                  <p className="text-xs text-slate-500">
                    Customer defense and hold-harmless commitments
                  </p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
                <p>
                  Customer agrees to defend, indemnify, and hold harmless Cyber7
                  Technologies Inc., its parent companies, subsidiaries,
                  officers, directors, employees, agents, and licensors from and
                  against any and all third-party claims, lawsuits, demands,
                  regulatory inquiries, damages, losses, liabilities, costs,
                  fines, and expenses (including reasonable attorneys&apos; fees
                  and litigation expenses) arising out of or related to:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700">
                  <li>
                    Customer Data, including any claim that Customer Data
                    infringes or misappropriates a third party&apos;s
                    intellectual property, privacy, or statutory rights.
                  </li>
                  <li>
                    Any violation by Customer or its Authorized Users of Section
                    6 (User Responsibilities), Section 9 (Meta Policies), Section
                    10 (Messaging Policies), or Section 15 (Prohibited
                    Activities).
                  </li>
                  <li>
                    Any transmission of unsolicited messages, lack of valid
                    opt-in consent, or statutory claims brought under TCPA,
                    CAN-SPAM, GDPR, or equivalent telecommunications legislation.
                  </li>
                  <li>
                    Any dispute between Customer and its End Users or Customer
                    Contacts.
                  </li>
                </ul>
              </div>
            </article>

            {/* Section 21: Changes to These Terms */}
            <article
              id="changes-to-terms"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-800">
                  <FileEdit size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    21. Changes to These Terms
                  </h2>
                  <p className="text-xs text-slate-500">
                    Amendment procedures, notification lead time, and right of rejection
                  </p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
                <p>
                  Cyber7 reserves the right to amend, update, or replace these
                  Terms at any time to reflect changes in legal requirements,
                  industry best practices, platform feature advancements, or Meta
                  developer policies.
                </p>
                <p>
                  When material amendments are made, Cyber7 will provide notice by
                  updating the &quot;Last Updated&quot; date at the top of this
                  document and, for substantive changes affecting your rights or
                  obligations, providing at least thirty (30) days&apos; advance
                  notice via email or a prominent notification within the Cyber7
                  dashboard.
                </p>
                <p>
                  Your continued use of Cyber7 following the effective date of the
                  updated Terms constitutes your agreement to be bound by the
                  amended agreement. If you do not agree with the updated Terms,
                  your sole and exclusive remedy is to terminate your account
                  before the effective date of the modifications.
                </p>
              </div>
            </article>

            {/* Section 22: Governing Law and Dispute Resolution */}
            <article
              id="governing-law-disputes"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
                  <Gavel size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    22. Governing Law and Dispute Resolution
                  </h2>
                  <p className="text-xs text-slate-500">
                    Jurisdiction, informal resolution period, binding arbitration, and class action waiver
                  </p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
                <p>
                  <strong>Governing Law:</strong> This Agreement and any dispute
                  or claim arising out of or in connection with it or its subject
                  matter or formation shall be governed by and construed in
                  accordance with the laws of the applicable commercial
                  jurisdiction agreed in your Order Form (or as designated by Cyber7 upon legal review), without giving effect
                  to any choice-of-law or conflict-of-law rules.
                </p>
                <p>
                  <strong>Informal Dispute Resolution:</strong> Prior to
                  initiating formal arbitration or legal proceedings, the
                  parties agree to make good-faith efforts to resolve any dispute
                  informally. The claiming party shall provide written notice to
                  the other party describing the nature and basis of the dispute.
                  The parties shall engage in discussions for a period of thirty
                  (30) business days from receipt of the notice.
                </p>
                <p>
                  <strong>Binding Arbitration:</strong> Any dispute, controversy,
                  or claim arising out of or relating to this contract, including
                  its formation or breach, that cannot be resolved informally
                  shall be settled by confidential binding arbitration administered
                  by an established commercial arbitration provider.
                </p>
                <p>
                  <strong>Class Action Waiver:</strong> YOU AND CYBER7 AGREE THAT
                  EACH PARTY MAY BRING CLAIMS AGAINST THE OTHER ONLY IN AN
                  INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN
                  ANY PURPORTED CLASS, COLLECTIVE, OR REPRESENTATIVE PROCEEDING.
                </p>
              </div>
            </article>

            {/* Section 23: Contact Information */}
            <article
              id="contact-information"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-100 text-lime-800">
                  <Mail size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    23. Contact Information
                  </h2>
                  <p className="text-xs text-slate-500">
                    Official channels for legal notices, contract questions, and compliance inquiries
                  </p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
                <p>
                  If you have questions, comments, or formal legal notices
                  regarding these Terms of Service, please contact our team
                  (official email channels subject to final domain confirmation):
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-bold text-slate-900 mb-1">
                      Legal Notices &amp; Contracts
                    </p>
                    <p className="text-slate-600">Cyber7 Technologies Inc.</p>
                    <p className="text-slate-600">Legal &amp; Regulatory Affairs</p>
                    <p className="mt-2 font-mono text-lime-700">
                      legal@cyber7.io
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-bold text-slate-900 mb-1">
                      Customer Support &amp; Billing
                    </p>
                    <p className="text-slate-600">Cyber7 Customer Success Team</p>
                    <p className="text-slate-600">Available Monday - Friday</p>
                    <p className="mt-2 font-mono text-lime-700">
                      support@cyber7.io
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* Frequently Asked Questions Section */}
            <section
              id="faqs"
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-100 text-lime-800">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-xs text-slate-500">
                    Quick clarifications on key contractual and WhatsApp integration topics
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {FAQS.map((faq, index) => {
                  const isOpen = expandedFaq === index;
                  return (
                    <div key={index} className="py-4 first:pt-0 last:pb-0">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedFaq(isOpen ? null : index)
                        }
                        className="flex w-full items-center justify-between text-left text-sm font-semibold text-slate-900 transition hover:text-lime-700"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          size={18}
                          className={`shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-lime-600" : ""
                            }`}
                        />
                      </button>
                      {isOpen && (
                        <p className="mt-3 text-xs leading-relaxed text-slate-600">
                          {faq.a}
                        </p>
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
                Cyber7 Platform
              </span>
              <span className="text-xs text-slate-400">
                Â© Cyber7 Technologies Inc. All rights reserved.
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
                href="/privacy-policy"
                className="transition hover:text-slate-900"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="font-semibold text-slate-900 underline"
              >
                Terms of Service
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

