"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    ShieldCheck,
    CheckCircle2,
    Lock,
    MessageCircle,
    Mail,
    User,
    Phone,
    Building,
    ArrowRight,
    Send,
} from "lucide-react";

interface ModalsProps {
    demoOpen: boolean;
    contactOpen: boolean;
    termsOpen: boolean;
    privacyOpen: boolean;
    refundOpen: boolean;
    selectedPlanInfo?: { name: string; price: string };
    onClose: () => void;
}

export default function Modals({
    demoOpen,
    contactOpen,
    termsOpen,
    privacyOpen,
    refundOpen,
    selectedPlanInfo,
    onClose,
}: ModalsProps) {
    // Demo signup form state
    const [demoSubmitted, setDemoSubmitted] = useState(false);
    const [companyName, setCompanyName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    // Contact / Ticket form state
    const [ticketSubmitted, setTicketSubmitted] = useState(false);
    const [subject, setSubject] = useState("");
    const [department, setDepartment] = useState("Sales");
    const [message, setMessage] = useState("");

    const handleDemoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setDemoSubmitted(true);
    };

    const handleTicketSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setTicketSubmitted(true);
    };

    const isAnyOpen = demoOpen || contactOpen || termsOpen || privacyOpen || refundOpen;
    if (!isAnyOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
                {/* DEMO / SIGNUP MODAL */}
                {demoOpen && (
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 max-w-lg w-full p-5 sm:p-8 shadow-2xl relative my-auto"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {!demoSubmitted ? (
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                        <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </span>
                                    <span className="text-[11px] sm:text-xs font-bold text-emerald-700 uppercase tracking-wider">
                                        {selectedPlanInfo ? `${selectedPlanInfo.name} Plan Trial` : "14-Day Free Access"}
                                    </span>
                                </div>

                                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                                    Start Your Official WhatsApp Cloud API Trial
                                </h3>
                                <p className="mt-1.5 sm:mt-2 text-xs text-slate-600">
                                    Connect your business WhatsApp number to VexChat in minutes. No credit card required. Full
                                    multi-agent inbox and automation access.
                                </p>

                                <form onSubmit={handleDemoSubmit} className="mt-5 sm:mt-6 space-y-3.5 sm:space-y-4 text-xs">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Company / Business Name</label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                            <input
                                                required
                                                type="text"
                                                value={companyName}
                                                onChange={(e) => setCompanyName(e.target.value)}
                                                placeholder="e.g. Dhaka Digital Ltd"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm sm:text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Business Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                            <input
                                                required
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="you@company.com"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm sm:text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">WhatsApp Business Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                            <input
                                                required
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="+880 1712-000000"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm sm:text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                                        <span>Instant Meta OAuth signup flow will launch after submission.</span>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                                    >
                                        <span>Create VexChat Workspace</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="text-center py-6 space-y-4">
                                <div className="h-14 w-14 sm:h-16 sm:w-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Workspace Ready!</h3>
                                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                                    We've initialized your tenant for <strong>{companyName || "your company"}</strong>. An
                                    activation link and Meta OAuth onboarding instructions have been sent to{" "}
                                    <strong>{email || "your email"}</strong>.
                                </p>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                                >
                                    Close & Open Dashboard
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* SUPPORT TICKET / CONTACT MODAL */}
                {contactOpen && (
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 max-w-lg w-full p-5 sm:p-8 shadow-2xl relative my-auto"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {!ticketSubmitted ? (
                            <div>
                                <span className="text-[11px] sm:text-xs font-bold text-emerald-700 uppercase tracking-wider">
                                    Support & Ticket Desk (PDF Sec 11)
                                </span>
                                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">Submit a Support Ticket</h3>
                                <p className="mt-1 text-xs text-slate-600">
                                    Our official technical engineers respond in &lt; 15 minutes.
                                </p>

                                <form onSubmit={handleTicketSubmit} className="mt-5 sm:mt-6 space-y-3.5 sm:space-y-4 text-xs">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Subject / Issue Summary</label>
                                        <input
                                            required
                                            type="text"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            placeholder="e.g. Webhook signature error or bKash invoice inquiry"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm sm:text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="font-bold text-slate-700 block mb-1">Department</label>
                                            <select
                                                value={department}
                                                onChange={(e) => setDepartment(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm sm:text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                                            >
                                                <option value="Sales">Sales & Demos</option>
                                                <option value="Technical">Technical & Meta API</option>
                                                <option value="Billing">bKash & Billing</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="font-bold text-slate-700 block mb-1">Priority</label>
                                            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm sm:text-xs text-slate-900 focus:outline-none focus:border-emerald-500">
                                                <option>Normal</option>
                                                <option>High</option>
                                                <option>Critical / API Outage</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Detailed Description</label>
                                        <textarea
                                            required
                                            rows={3}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Please describe your requirement or error in detail..."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm sm:text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition flex items-center justify-center gap-2"
                                    >
                                        <Send className="h-4 w-4" />
                                        <span>Create Ticket #VC</span>
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="text-center py-6 space-y-4">
                                <div className="h-14 w-14 sm:h-16 sm:w-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Ticket Created!</h3>
                                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                                    Assigned to: <strong>{department} Department (Asad Farazi)</strong>. Our agent will contact
                                    you directly via WhatsApp and email.
                                </p>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
                                >
                                    Done
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* LEGAL: TERMS / PRIVACY / REFUND MODAL */}
                {(termsOpen || privacyOpen || refundOpen) && (
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 max-w-2xl w-full p-5 sm:p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto my-auto"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="text-xs text-slate-700 space-y-4">
                            <h3 className="text-xl font-extrabold text-slate-900">
                                {termsOpen
                                    ? "Terms & Conditions"
                                    : privacyOpen
                                        ? "Privacy Policy & Meta Cloud Compliance"
                                        : "Refund & Cancellation Policy"}
                            </h3>
                            <p className="text-slate-500 text-[11px]">Last Updated: November 2026</p>

                            {termsOpen && (
                                <div className="space-y-3 leading-relaxed">
                                    <p>
                                        <strong>1. Platform Nature:</strong> VexChat provides software tools allowing authorized
                                        clients to access Meta's official WhatsApp Business Cloud API. Clients must agree to Meta's
                                        official Terms of Service and Business Messaging Policies.
                                    </p>
                                    <p>
                                        <strong>2. Prohibited Uses:</strong> Users may not send unsolicited spam, deceptive messages,
                                        or unapproved marketing blasts without user opt-in consent. VexChat prohibits any unofficial
                                        scrapers, unauthorized QR bot sessions, or restriction bypasses.
                                    </p>
                                    <p>
                                        <strong>3. Multi-Tenant Rights:</strong> All customer data is isolated at the database level.
                                        Accounts are subject to rate limiting and fair usage in accordance with their subscription tier.
                                    </p>
                                </div>
                            )}

                            {privacyOpen && (
                                <div className="space-y-3 leading-relaxed">
                                    <p>
                                        <strong>1. Data Encryption:</strong> All WhatsApp API tokens, credentials, and customer phone
                                        numbers are encrypted using industry-standard AES-256 encryption.
                                    </p>
                                    <p>
                                        <strong>2. Meta Data Handling:</strong> VexChat does not sell, lease, or distribute customer
                                        contact lists or message contents. Webhook event payloads are handled in real time and stored
                                        solely within the customer's isolated tenant database.
                                    </p>
                                </div>
                            )}

                            {refundOpen && (
                                <div className="space-y-3 leading-relaxed">
                                    <p>
                                        <strong>1. 14-Day Guarantee:</strong> New subscribers may request a full refund within 14 days
                                        of initial payment if our platform fails to deliver official Meta WhatsApp connectivity.
                                    </p>
                                    <p>
                                        <strong>2. Meta Direct Fees:</strong> Direct conversation fees charged by Meta Platforms, Inc.
                                        are consumption-based and non-refundable once delivered.
                                    </p>
                                    <p>
                                        <strong>3. bKash / Nagad Settlements:</strong> Approved refunds for local transactions are
                                        processed back to the original bKash or Nagad wallet within 3 to 5 business days.
                                    </p>
                                </div>
                            )}

                            <div className="pt-4 border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={onClose}
                                    className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
                                >
                                    I Understand
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </AnimatePresence>
    );
}