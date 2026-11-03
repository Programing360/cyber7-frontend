"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Workflow,
  Zap,
  Clock,
  Tag,
  UserPlus,
  Send,
  GitBranch,
  Bot,
  Play,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowDown,
  ArrowRight,
} from "lucide-react";

type PresetWorkflow = "keyword" | "after_hours" | "lead_assignment";

export default function AutomationVisualizer() {
  const [activeWorkflow, setActiveWorkflow] =
    useState<PresetWorkflow>("keyword");
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const runSimulation = () => {
    setIsSimulating(true);
    setActiveStep(1);

    setTimeout(() => setActiveStep(2), 600);
    setTimeout(() => setActiveStep(3), 1200);
    setTimeout(() => setActiveStep(4), 1800);
    setTimeout(() => {
      setIsSimulating(false);
      setActiveStep(4);
    }, 2400);
  };

  return (
    <section
      id="automation"
      className="py-20 sm:py-24 bg-white relative overflow-hidden scroll-mt-24 sm:scroll-mt-28"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 mb-4">
            <Workflow className="h-4 w-4 text-emerald-600" />
            <span>Workflow Automation Engine (PDF Sec 12)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Trigger-Based Automation <br className="hidden sm:block" />
            <span className="text-emerald-600">
              Without Breaching Meta Limits
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-lg text-slate-600">
            Design intelligent visual routing rules. Respond in seconds, route
            leads to the right team, and tag contacts automatically—100%
            compliant with WhatsApp 24-hour service policies.
          </p>
        </div>

        {/* Workflow Showcase Box */}
        <div className="rounded-3xl border border-slate-200 bg-slate-900 text-white shadow-2xl p-5 sm:p-8 lg:p-10">
          {/* Top Switcher Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 pb-5 sm:pb-6 border-b border-slate-800">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setActiveWorkflow("keyword");
                  setActiveStep(0);
                }}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeWorkflow === "keyword"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <Zap className="h-4 w-4" />
                <span>Keyword Routing</span>
              </button>

              <button
                onClick={() => {
                  setActiveWorkflow("after_hours");
                  setActiveStep(0);
                }}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeWorkflow === "after_hours"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>After Hours</span>
              </button>

              <button
                onClick={() => {
                  setActiveWorkflow("lead_assignment");
                  setActiveStep(0);
                }}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeWorkflow === "lead_assignment"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <UserPlus className="h-4 w-4" />
                <span>VIP Lead Triage</span>
              </button>
            </div>

            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>
                {isSimulating ? "Running Simulation..." : "Test Run Flow"}
              </span>
            </button>
          </div>

          {/* Visual Interactive Flowchart Nodes - 1 col on mobile, 2 cols on tablet, 4 cols on desktop */}
          <div className="py-8 sm:py-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
              {/* Node 1: Trigger */}
              <div
                className={`rounded-2xl p-5 border transition-all ${
                  activeStep >= 1
                    ? "bg-emerald-950/80 border-emerald-500 text-white ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/20"
                    : "bg-slate-800/80 border-slate-700 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-2">
                  <span className="uppercase tracking-wider">
                    Step 1: Trigger
                  </span>
                  <Zap className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-bold text-white">
                  {activeWorkflow === "keyword"
                    ? 'Message contains "Pricing"'
                    : activeWorkflow === "after_hours"
                      ? "Message after 10:00 PM"
                      : "Customer WhatsApp Opt-in"}
                </h4>
                <p className="mt-1 text-xs text-slate-400">
                  Webhook event received via Meta Cloud API
                </p>
              </div>

              {/* Node 2: Logic Condition */}
              <div
                className={`rounded-2xl p-5 border transition-all ${
                  activeStep >= 2
                    ? "bg-emerald-950/80 border-emerald-500 text-white ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/20"
                    : "bg-slate-800/80 border-slate-700 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-2">
                  <span className="uppercase tracking-wider">
                    Step 2: Condition
                  </span>
                  <GitBranch className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-bold text-white">
                  {activeWorkflow === "keyword"
                    ? "Check 24-hr session window"
                    : activeWorkflow === "after_hours"
                      ? "Check priority support tag"
                      : "Verify phone code (+880)"}
                </h4>
                <p className="mt-1 text-xs text-slate-400">
                  Evaluates in &lt; 40ms inside VexChat engine
                </p>
              </div>

              {/* Node 3: Immediate Auto-Action */}
              <div
                className={`rounded-2xl p-5 border transition-all ${
                  activeStep >= 3
                    ? "bg-emerald-950/80 border-emerald-500 text-white ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/20"
                    : "bg-slate-800/80 border-slate-700 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-2">
                  <span className="uppercase tracking-wider">
                    Step 3: Response
                  </span>
                  <Send className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-bold text-white">
                  {activeWorkflow === "keyword"
                    ? "Send Price & Plan Menu"
                    : activeWorkflow === "after_hours"
                      ? "Send Away Notice + SLA"
                      : "Send Welcome Template"}
                </h4>
                <p className="mt-1 text-xs text-slate-400">
                  Official Meta Interactive Message sent
                </p>
              </div>

              {/* Node 4: Team & CRM Action */}
              <div
                className={`rounded-2xl p-5 border transition-all ${
                  activeStep >= 4
                    ? "bg-emerald-950/80 border-emerald-500 text-white ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/20"
                    : "bg-slate-800/80 border-slate-700 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-2">
                  <span className="uppercase tracking-wider">
                    Step 4: Assignment
                  </span>
                  <Tag className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-bold text-white">
                  {activeWorkflow === "keyword"
                    ? "Assign to Sales Team"
                    : activeWorkflow === "after_hours"
                      ? "Auto-create Ticket #VC"
                      : "Tag contact #VIP-Lead"}
                </h4>
                <p className="mt-1 text-xs text-slate-400">
                  Agent notified on browser dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Workflow Bottom Guarantee */}
          <div className="pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                Strict compliance with WhatsApp Business Messaging Policy
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                AI Handover: Automatically disconnects bot when human agent
                types
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
