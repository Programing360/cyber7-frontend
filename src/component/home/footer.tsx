// "use client";

// import React from "react";
// import VexChatLogo from "./VexChatLogo";
// import { ShieldCheck, Mail, MapPin, Phone, Heart } from "lucide-react";

// interface FooterProps {
//   onOpenTerms: () => void;
//   onOpenPrivacy: () => void;
//   onOpenRefund: () => void;
//   onOpenContact: () => void;
// }

// export default function Footer({
//   onOpenTerms,
//   onOpenPrivacy,
//   onOpenRefund,
//   onOpenContact,
// }: FooterProps) {
//   return (
//     <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-14 sm:pt-16 pb-10 sm:pb-12 text-xs">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-slate-800">
//           {/* Brand Col */}
//           <div className="sm:col-span-2 space-y-4">
//             <VexChatLogo size="md" inverted={true} />

//             <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
//               The unified enterprise SaaS platform for official Meta WhatsApp Cloud API integration,
//               multi-agent team routing, browser voice calling, broadcast campaigns, and automated customer CRM.
//             </p>

//             <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-xl w-fit">
//               <ShieldCheck className="h-4 w-4 shrink-0" />
//               <span>Official Cloud API Architecture • Zero Ban Guarantee</span>
//             </div>
//           </div>

//           {/* Col 2: Platform Features */}
//           <div>
//             <h4 className="text-sm font-bold text-white mb-3 sm:mb-4">Core Platform</h4>
//             <ul className="space-y-2 sm:space-y-2.5">
//               <li>
//                 <a href="#inbox-demo" className="hover:text-emerald-400 transition">
//                   Multi-Agent Shared Inbox
//                 </a>
//               </li>
//               <li>
//                 <a href="#calling-api" className="hover:text-emerald-400 transition">
//                   WhatsApp Calling API (VoIP)
//                 </a>
//               </li>
//               <li>
//                 <a href="#automation" className="hover:text-emerald-400 transition">
//                   Workflow Visual Automation
//                 </a>
//               </li>
//               <li>
//                 <a href="#features" className="hover:text-emerald-400 transition">
//                   Template Management
//                 </a>
//               </li>
//               <li>
//                 <a href="#features" className="hover:text-emerald-400 transition">
//                   Mini CRM & Lead Pipeline
//                 </a>
//               </li>
//             </ul>
//           </div>

//           {/* Col 3: Developers & Billing */}
//           <div>
//             <h4 className="text-sm font-bold text-white mb-3 sm:mb-4">Developers & Billing</h4>
//             <ul className="space-y-2 sm:space-y-2.5">
//               <li>
//                 <a href="#api-docs" className="hover:text-emerald-400 transition">
//                   REST API Documentation
//                 </a>
//               </li>
//               <li>
//                 <a href="#api-docs" className="hover:text-emerald-400 transition">
//                   Meta Webhooks (Idempotent)
//                 </a>
//               </li>
//               <li>
//                 <a href="#pricing" className="hover:text-emerald-400 transition">
//                   Pricing & Meta Calculator
//                 </a>
//               </li>
//               <li>
//                 <span className="hover:text-emerald-400 transition cursor-pointer">
//                   bKash & Nagad Integration
//                 </span>
//               </li>
//               <li>
//                 <a href="#compliance" className="hover:text-emerald-400 transition">
//                   Multi-Tenant Security
//                 </a>
//               </li>
//             </ul>
//           </div>

//           {/* Col 4: Legal & Policies */}
//           <div>
//             <h4 className="text-sm font-bold text-white mb-3 sm:mb-4">Compliance & Policies</h4>
//             <ul className="space-y-2 sm:space-y-2.5">
//               <li>
//                 <button onClick={onOpenTerms} className="hover:text-emerald-400 transition text-left">
//                   Terms & Conditions
//                 </button>
//               </li>
//               <li>
//                 <button onClick={onOpenPrivacy} className="hover:text-emerald-400 transition text-left">
//                   Privacy Policy & Data Security
//                 </button>
//               </li>
//               <li>
//                 <button onClick={onOpenRefund} className="hover:text-emerald-400 transition text-left">
//                   Refund & Cancellation Policy
//                 </button>
//               </li>
//               <li>
//                 <button onClick={onOpenContact} className="hover:text-emerald-400 transition text-left">
//                   Support Ticket Portal
//                 </button>
//               </li>
//             </ul>
//           </div>
//         </div>

//         {/* Disclaimer / Meta Notice */}
//         <div className="py-5 sm:py-6 border-b border-slate-900 text-[11px] text-slate-500 leading-relaxed">
//           <p>
//             <strong>Meta Brand Disclaimer (PDF Sec 19 & 34):</strong> VexChat is an independent enterprise
//             software platform designed to operate seamlessly via official Meta WhatsApp Business Cloud API
//             endpoints. WhatsApp and Meta are registered trademarks of Meta Platforms, Inc. VexChat does not use
//             unofficial reverse-engineered protocols, browser scraping, or unauthorized QR bots.
//           </p>
//         </div>

//         {/* Bottom row */}
//         <div className="pt-5 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-center sm:text-left">
//           <p>© 2026 VexChat Platform. All rights reserved.</p>
//           <div className="flex items-center gap-3">
//             <span className="text-slate-400">Dhaka • Malaysia • Global Cloud</span>
//             <span>•</span>
//             <span className="text-emerald-400 font-semibold">Meta Cloud API v20.0 Ready</span>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }
