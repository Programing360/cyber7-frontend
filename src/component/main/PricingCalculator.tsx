"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Check,
    Zap,
    ShieldCheck,
    Calculator,
    ArrowRight,
    HelpCircle,
    Sparkles,
    CreditCard,
} from "lucide-react";

interface PricingCalculatorProps {
    onSelectPlan: (planName: string, price: string) => void;
}

export default function PricingCalculator({ onSelectPlan }: PricingCalculatorProps) {
    // Meta Calculator State
    const [marketingVolume, setMarketingVolume] = useState<number>(5000);
    const [utilityVolume, setUtilityVolume] = useState<number>(3000);
    const [serviceVolume, setServiceVolume] = useState<number>(2000);

    // Meta per-conversation approximate standard rate (BDT)
    const marketingRateBDT = 0.95;
    const utilityRateBDT = 0.40;
    const serviceRateBDT = 0.35;

    const estimatedMetaCostBDT = Math.round(
        marketingVolume * marketingRateBDT +
        utilityVolume * utilityRateBDT +
        Math.max(0, serviceVolume - 1000) * serviceRateBDT
    );

    const plans = [
        {
            name: "Starter",
            description: "Ideal for growing startups and local boutique stores.",
            priceBDT: 3000,
            popular: false,
            features: [
                "1 Connected WhatsApp Business Number",
                "Up to 3 Team Agents / Staff",
                "Official Meta Cloud API Onboarding",
                "Shared Team Inbox & Conversation History",
                "WhatsApp Template Management",
                "bKash & City Bank Card Checkout",
                "Customer Mini CRM & Contact Tags",
                "Standard Email Support",
            ],
            notIncluded: ["WhatsApp Voice Calling API", "Custom Webhooks & REST API"],
        },
        {
            name: "Business Pro",
            description: "Best for scaling companies needing team routing & campaigns.",
            priceBDT: 7400,
            popular: true,
            features: [
                "2 Connected WhatsApp Numbers",
                "Up to 10 Team Agents (Manager + Agent roles)",
                "Browser-Based WhatsApp Calling API (VoIP)",
                "Visual Workflow Automation (Keyword routing, auto-reply)",
                "Broadcast Campaigns with CSV Import & Analytics",
                "AI Support Troubleshooting Assistant",
                "Auto-Ticket Generation & CRM Pipeline",
                "Webhooks & REST API Access",
                "Priority Support & Setup Guidance",
            ],
            notIncluded: ["Dedicated Account Manager"],
        },
        {
            name: "Enterprise",
            description: "For high-volume brands requiring multi-number scalability.",
            priceBDT: 18600,
            popular: false,
            features: [
                "Unlimited WhatsApp Business Numbers",
                "Unlimited Agent Accounts & Custom Departments",
                "Advanced WebRTC Call Center Console",
                "Custom Workflow Triggers & Webhook Endpoints",
                "Large-Scale Broadcast with High Throughput (Tier 3/Unlimited)",
                "Database-Level Isolated Multi-Tenant Instance",
                "2FA Mandatory Enforcement & Complete Audit Logs",
                "Dedicated Technical Account Manager & SLA",
            ],
            notIncluded: [],
        },
    ];

    return (
        <section id="pricing" className="py-20 sm:py-24 bg-white relative scroll-mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Heading */}
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 mb-4">
                        <CreditCard className="h-4 w-4 text-emerald-600" />
                        <span>Transparent Subscription (Strictly Monthly BDT)</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                        Simple, Predictable Pricing. <br className="hidden sm:block" />
                        <span className="text-emerald-600">Zero Hidden Markup on Meta Rates.</span>
                    </h2>
                    <p className="mt-4 text-sm sm:text-lg text-slate-600">
                        Pay a flat SaaS fee for VexChat's team inbox and automation platform, with direct transparent Meta
                        conversation fees. All plans are billed strictly on a monthly basis in Bangladeshi Taka (BDT).
                    </p>

                    {/* Subscription Guarantee Badge */}
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700">
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                            Strictly Monthly Billing • Denominated in BDT (৳) • Manual Renewal Only
                        </span>
                    </div>
                </div>

                {/* Pricing Cards - 1 col on mobile & tablet, 3 cols on desktop (lg:) so cards never get squished! */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch mb-16 sm:mb-20 max-w-lg lg:max-w-none mx-auto">
                    {plans.map((plan) => {
                        const price = `৳${plan.priceBDT.toLocaleString()}`;

                        return (
                            <div
                                key={plan.name}
                                className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 relative ${plan.popular
                                        ? "bg-slate-900 text-white border-2 border-emerald-500 ring-4 ring-emerald-500/15 shadow-2xl"
                                        : "bg-white text-slate-900 border border-slate-200 hover:shadow-lg"
                                    }`}
                            >
                                <div>
                                    {/* Popular Badge placed in standard flow to ELIMINATE ANY OVERLAP */}
                                    {plan.popular ? (
                                        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-300 mb-4 shadow-sm">
                                            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                                            <span>Most Popular Choice</span>
                                        </div>
                                    ) : (
                                        <div className="h-7 mb-4 hidden sm:block" />
                                    )}

                                    <h3 className={`text-2xl font-bold ${plan.popular ? "text-white" : "text-slate-900"}`}>
                                        {plan.name}
                                    </h3>

                                    <p
                                        className={`text-xs leading-relaxed mt-2 mb-6 ${plan.popular ? "text-slate-300" : "text-slate-500"
                                            }`}
                                    >
                                        {plan.description}
                                    </p>

                                    <div className="mb-6 pb-6 border-b border-slate-200/20">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">{price}</span>
                                            <span className={`text-xs ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>
                                                /month
                                            </span>
                                        </div>
                                        <span
                                            className={`text-[11px] block mt-1 ${plan.popular ? "text-emerald-400 font-medium" : "text-emerald-700 font-medium"
                                                }`}
                                        >
                                            Billed monthly (Manual Renewal)
                                        </span>
                                    </div>

                                    {/* Features list */}
                                    <div className="space-y-3 text-xs mb-8">
                                        <span
                                            className={`font-semibold block ${plan.popular ? "text-emerald-400" : "text-slate-700"
                                                }`}
                                        >
                                            Included Platform Features:
                                        </span>
                                        {plan.features.map((feature, i) => (
                                            <div key={i} className="flex items-start gap-2.5">
                                                <Check
                                                    className={`h-4 w-4 shrink-0 mt-0.5 ${plan.popular ? "text-emerald-400" : "text-emerald-600"
                                                        }`}
                                                />
                                                <span className={plan.popular ? "text-slate-200" : "text-slate-600"}>
                                                    {feature}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => onSelectPlan(plan.name, price)}
                                    className={`w-full py-3.5 rounded-2xl font-bold text-xs tracking-wide transition flex items-center justify-center gap-2 ${plan.popular
                                            ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
                                            : "bg-slate-900 hover:bg-slate-800 text-white"
                                        }`}
                                >
                                    <span>Get Started with {plan.name}</span>
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Dedicated Meta Conversation Fee Estimator (PDF Sec 24) */}
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-10">
                    <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                                <Calculator className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                                    Meta Official WhatsApp Conversation Estimator
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Direct official pass-through pricing from Meta
                                </p>
                            </div>
                        </div>

                        <div className="text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-3 py-1.5 rounded-xl border border-emerald-300">
                            First 1,000 Service Chats Free Monthly
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2 sm:pt-4">
                        {/* Slider 1: Marketing */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center text-xs mb-2">
                                <span className="font-bold text-slate-800">Marketing Broadcasts</span>
                                <span className="font-bold text-emerald-600">{marketingVolume.toLocaleString()} msgs</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="50000"
                                step="500"
                                value={marketingVolume}
                                onChange={(e) => setMarketingVolume(Number(e.target.value))}
                                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                            />
                            <span className="text-[10px] text-slate-400 block mt-2">
                                Approx. ৳{marketingRateBDT} per conversation (Promotions)
                            </span>
                        </div>

                        {/* Slider 2: Utility */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center text-xs mb-2">
                                <span className="font-bold text-slate-800">Utility Alerts</span>
                                <span className="font-bold text-emerald-600">{utilityVolume.toLocaleString()} msgs</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="30000"
                                step="500"
                                value={utilityVolume}
                                onChange={(e) => setUtilityVolume(Number(e.target.value))}
                                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                            />
                            <span className="text-[10px] text-slate-400 block mt-2">
                                Approx. ৳{utilityRateBDT} per conversation (OTPs & Receipts)
                            </span>
                        </div>

                        {/* Slider 3: Customer Service */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center text-xs mb-2">
                                <span className="font-bold text-slate-800">Customer Support</span>
                                <span className="font-bold text-emerald-600">{serviceVolume.toLocaleString()} chats</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="20000"
                                step="500"
                                value={serviceVolume}
                                onChange={(e) => setServiceVolume(Number(e.target.value))}
                                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                            />
                            <span className="text-[10px] text-slate-400 block mt-2">
                                First 1,000 Free, then approx. ৳{serviceRateBDT} per 24h session
                            </span>
                        </div>
                    </div>

                    {/* Calculator Output summary */}
                    <div className="mt-6 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-xs text-slate-600">
                            Estimated Total Meta API Cost for{" "}
                            <strong>{(marketingVolume + utilityVolume + serviceVolume).toLocaleString()} interactions</strong>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <span className="text-xs text-slate-400">Estimated Charge:</span>
                            <span className="text-xl sm:text-2xl font-extrabold text-emerald-700">
                                ~ ৳{estimatedMetaCostBDT.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}