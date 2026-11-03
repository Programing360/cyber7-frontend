"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Send,
  ShieldCheck,
  RefreshCw,
  Terminal,
} from "lucide-react";

interface AiQA {
  question: string;
  category: "Troubleshooting" | "Setup" | "Compliance";
  answer: string;
  solutionSteps: string[];
}

const aiScenarios: AiQA[] = [
  {
    question: "Why is my WhatsApp message failing with Error Code 131026?",
    category: "Troubleshooting",
    answer:
      "Error 131026 occurs when the 24-hour customer service window has expired and you attempted to send a regular text message instead of an approved Meta Template message.",
    solutionSteps: [
      "Select an approved Meta Utility or Marketing template with button parameters.",
      "Verify the customer has given opt-in consent for template notifications.",
      "Once customer replies to the template, the free 24-hour session window will automatically reopen.",
    ],
  },
  {
    question:
      "How do I connect our official WhatsApp Business number via Meta OAuth?",
    category: "Setup",
    answer:
      "VexChat integrates with Meta's official Embedded Signup flow. You can connect your phone number in under 2 minutes without leaving the platform.",
    solutionSteps: [
      "Click 'Connect WhatsApp' on your VexChat Client Dashboard.",
      "Log in with your official Facebook Business Manager account.",
      "Select your Meta Business Account (WABA) and enter your official phone number.",
      "Enter the 6-digit SMS/Voice verification code from Meta. Webhooks auto-register immediately!",
    ],
  },
  {
    question: "Why did Meta reject our Promotional Campaign Template?",
    category: "Compliance",
    answer:
      "Meta rejects templates if the chosen category (Marketing vs Utility) does not match the wording, or if variables ({{1}}) are placed in the header without sample values.",
    solutionSteps: [
      "Ensure category is explicitly set to 'Marketing' for discount/sales offers.",
      "Provide sample placeholder values for every variable (e.g. {{1}} = 'John').",
      "Do not request sensitive banking PINs or unauthorized crypto transfers inside templates.",
    ],
  },
  {
    question:
      "How can I invite 5 support agents and assign them to the Billing Department?",
    category: "Setup",
    answer:
      "Admins and Managers can add unlimited team agents from the Team Management tab with granular permission controls.",
    solutionSteps: [
      "Go to Dashboard → Team & Agents → Click 'Add New Agent'.",
      "Enter agent email and select role ('Agent', 'Manager', or 'Admin').",
      "Assign to the 'Billing' department to automatically route payment-related chats.",
    ],
  },
];

export default function AiAssistantDemo() {
  const [selectedScenario, setSelectedScenario] = useState<AiQA>(
    aiScenarios[0],
  );
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const handleSelectScenario = (qa: AiQA) => {
    setIsTyping(true);
    setSelectedScenario(qa);
    setTimeout(() => {
      setIsTyping(false);
    }, 400);
  };

  return (
    <section className="py-20 sm:py-24 bg-[#f7f9f4] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 mb-4">
            <Bot className="h-4 w-4 text-emerald-600" />
            <span>AI Troubleshooting Assistant (PDF Sec 10)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Built-in AI Assistant for <br className="hidden sm:block" />
            <span className="text-emerald-600">
              Instant Meta API Troubleshooting
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-lg text-slate-600">
            Never get stuck on Meta Cloud API errors or token expirations.
            VexChat's AI diagnoses client issues, verifies webhooks, and ensures
            you always stay 100% compliant with Meta policies.
          </p>
        </div>

        {/* Interactive AI Shell */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column: Sample Queries Selector */}
          <div className="lg:col-span-5 space-y-2.5 sm:space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 px-1">
              Click a Common Client Question to Test AI:
            </h4>

            {aiScenarios.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectScenario(item)}
                className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border cursor-pointer transition-all ${
                  selectedScenario.question === item.question
                    ? "bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500/30"
                    : "bg-white/80 border-slate-200/90 hover:bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-full ${
                      item.category === "Troubleshooting"
                        ? "bg-amber-100 text-amber-800"
                        : item.category === "Setup"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {item.category}
                  </span>
                  <span className="text-slate-400">Meta API Diagnosed</span>
                </div>
                <h5 className="text-xs sm:text-sm font-bold text-slate-800">
                  {item.question}
                </h5>
              </div>
            ))}

            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-200/70 text-xs text-emerald-900 flex items-start gap-2.5 sm:gap-3 mt-4">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Meta Compliance Guarantee:</strong> Our AI will never
                advise or encourage bypasses, scrapers, or unofficial web
                sessions. Every recommendation follows official Meta WhatsApp
                developer policies.
              </p>
            </div>
          </div>

          {/* Right Column: AI Response Screen */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900 text-white p-5 sm:p-8 shadow-2xl relative overflow-hidden">
              {/* Top AI Bar */}
              <div className="flex items-center justify-between pb-4 sm:pb-5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20 shrink-0">
                    <Sparkles className="h-5 w-5 fill-current" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      VexChat AI Support Agent
                    </h4>
                    <span className="text-[11px] sm:text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      Ready to assist 24/7
                    </span>
                  </div>
                </div>

                <span className="text-[10px] sm:text-[11px] bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-1 rounded-lg">
                  Cloud API v20.0
                </span>
              </div>

              {/* Chat Canvas */}
              <div className="py-5 sm:py-6 space-y-4 sm:space-y-5 min-h-[260px] sm:min-h-[300px]">
                {/* Client Bubble */}
                <div className="flex justify-end">
                  <div className="bg-slate-800 text-slate-100 text-xs rounded-2xl rounded-tr-none p-3.5 sm:p-4 max-w-[90%] sm:max-w-lg border border-slate-700 shadow">
                    <div className="text-[10px] text-slate-400 mb-1 font-semibold">
                      Client Query
                    </div>
                    {selectedScenario.question}
                  </div>
                </div>

                {/* AI Bubble */}
                <div className="flex justify-start">
                  <div className="bg-slate-950/90 text-white text-xs rounded-2xl rounded-tl-none p-4 sm:p-5 max-w-[95%] sm:max-w-xl border border-emerald-500/30 shadow-lg space-y-3">
                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-emerald-400 font-mono pb-2 border-b border-slate-800">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Bot className="h-4 w-4 shrink-0" />
                        AI Diagnostic Analysis:
                      </span>
                      <span>Verified Resolution</span>
                    </div>

                    {isTyping ? (
                      <div className="flex items-center gap-2 py-4 text-emerald-400 text-xs">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>
                          Analyzing Meta API logs and error dictionaries...
                        </span>
                      </div>
                    ) : (
                      <>
                        <p className="text-slate-200 leading-relaxed">
                          {selectedScenario.answer}
                        </p>

                        <div className="pt-2">
                          <span className="text-emerald-400 font-bold block mb-2 text-[11px]">
                            Recommended Action Steps:
                          </span>
                          <ul className="space-y-1.5 sm:space-y-2">
                            {selectedScenario.solutionSteps.map((step, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-slate-300"
                              >
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Mock AI input */}
              <div className="pt-4 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value="Ask any question about Meta WhatsApp API or VexChat..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs text-slate-500 cursor-not-allowed truncate"
                />
                <button
                  onClick={() => handleSelectScenario(aiScenarios[1])}
                  className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition shrink-0"
                >
                  Ask AI
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
