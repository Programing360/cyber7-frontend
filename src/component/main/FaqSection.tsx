"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

const faqs: FaqItem[] = [
  {
    q: "Is there any risk of my WhatsApp number being banned by Meta?",
    a: "Absolutely zero risk. VexChat strictly operates through official Meta WhatsApp Cloud API via Meta OAuth authorization. Unofficial QR-code scrapers and web automations violate Meta terms and get numbers banned, but VexChat connects directly to Meta's verified enterprise servers.",
  },
  {
    q: "Do I need to keep my smartphone switched on and connected to Wi-Fi 24/7?",
    a: "No! Unlike WhatsApp Web or QR-based tools, official Cloud API runs 100% in the cloud. Even if your phone is switched off, out of battery, or without internet, your agents can continue receiving and replying to customer messages, calls, and automations without interruption.",
  },
  {
    q: "Can multiple team members chat with different customers simultaneously?",
    a: "Yes. VexChat provides a shared multi-agent team inbox. You can have dozens of staff members logged in simultaneously, assign chats by department (Sales, Support, Billing), add private internal notes, and track individual response performance.",
  },
  {
    q: "How does the WhatsApp Business Calling API work?",
    a: "VexChat integrates Meta's official WhatsApp Calling API using browser WebRTC technology. When eligible customers call your WhatsApp Business number, incoming calls ring directly inside the agent's web browser console. Agents can answer, talk with clear audio, log call notes, and automatically link the call to the customer's CRM profile.",
  },
  {
    q: "What payment methods are supported for Bangladesh and international clients?",
    a: "We natively support bKash and Nagad direct merchant checkouts with instant automated verification and invoice generation. For international clients, we support Visa, Mastercard, and Binance/Crypto payments where legally supported.",
  },
  {
    q: "How long does Meta take to approve WhatsApp Message Templates?",
    a: "Meta's AI review system approves most standard utility and marketing templates within 1 to 15 minutes. VexChat automatically synchronizes template approval statuses directly with your Meta Business Manager account.",
  },
  {
    q: "Can we integrate VexChat with our existing custom ERP or website?",
    a: "Yes! VexChat provides a clean REST API and idempotent Webhooks with SHA-256 signature verification. You can trigger automated order updates, OTPs, shipping alerts, and sync conversations back into your internal database.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 sm:py-24 bg-white relative scroll-mt-24 sm:scroll-mt-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 mb-4">
            <HelpCircle className="h-4 w-4 text-emerald-600" />
            <span>Got Questions? (PDF Sec 13 & 23)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-sm sm:text-lg text-slate-600">
            Everything you need to know about official WhatsApp Business Cloud API, multi-agent inboxes,
            compliance, and local billing.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/90 bg-[#f7f9f4]/40 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleIndex(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 sm:gap-4 font-bold text-slate-900 hover:text-emerald-700 transition"
                >
                  <span className="text-sm sm:text-base leading-snug">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-emerald-600" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}