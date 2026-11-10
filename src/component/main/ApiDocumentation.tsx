"use client";

import React, { useState } from "react";
import {
  Terminal,
  Copy,
  Check,
  Webhook,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

type CodeLang = "curl" | "typescript" | "python";

export default function ApiDocumentation() {
  const [activeLang, setActiveLang] = useState<CodeLang>("curl");
  const [copied, setCopied] = useState(false);

  const codeSnippets: Record<CodeLang, string> = {
    curl: `curl -X POST https://api.vexchat.io/v1/messages \\
  -H "Authorization: Bearer vc_live_sec_9938a1b72e" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+8801712345678",
    "type": "template",
    "template": {
      "name": "order_confirmation_v2",
      "language": { "code": "en_US" },
      "components": [
        {
          "type": "body",
          "parameters": [
            { "type": "text", "text": "Mahmud" },
            { "type": "text", "text": "ORD-9901" }
          ]
        }
      ]
    }
  }'`,
    typescript: `import { VexChatClient } from "@vexchat/sdk";

const vexchat = new VexChatClient({
  apiKey: process.env.VEXCHAT_API_KEY, // Bearer Token
  tenantId: "tenant_880_techbd"
});

// Send an approved Meta Cloud WhatsApp Template
const response = await vexchat.messages.sendTemplate({
  to: "+8801712345678",
  templateName: "order_confirmation_v2",
  parameters: {
    customerName: "Mahmud",
    orderId: "ORD-9901"
  }
});
`,
    python: `import requests

url = "https://api.vexchat.io/v1/messages"
headers = {
    "Authorization": "Bearer vc_live_sec_9938a1b72e",
    "Content-Type": "application/json"
}
payload = {
    "to": "+8801712345678",
    "type": "text",
    "text": {
        "body": "Hello Mahmud! Your VexChat account has been verified."
    }
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="api-docs"
      className="py-20 sm:py-24 bg-slate-950 text-white relative overflow-hidden scroll-mt-24 sm:scroll-mt-28"
    >
      {/* Background Dots */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 mb-4">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <span>Developer First Abstraction (PDF Sec 18 & 19)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Clean REST API &{" "}
            <span className="text-emerald-400">Real-Time Webhooks</span>
          </h2>
          <p className="mt-4 text-sm sm:text-lg text-slate-400">
            Easily integrate WhatsApp messaging into your custom CRM, ERP,
            e-commerce storefront, or billing system in minutes with official
            Meta Cloud API abstractions.
          </p>
        </div>

        {/* 2-Column Code & Webhook Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left: Code Snippets Console */}
          <div className="lg:col-span-7 rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden">
            {/* Top Bar */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              {/* Language Switchers */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {(["curl", "typescript", "python"] as CodeLang[]).map(
                  (lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveLang(lang)}
                      className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
                        activeLang === lang
                          ? "bg-emerald-600 text-white shadow"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      {lang === "curl"
                        ? "cURL"
                        : lang === "typescript"
                          ? "Node / TS"
                          : "Python"}
                    </button>
                  ),
                )}
              </div>

              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700 transition"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Body */}
            <div className="p-4 sm:p-6 font-mono text-xs overflow-x-auto text-emerald-300 bg-slate-950/80 leading-relaxed">
              <pre>{codeSnippets[activeLang]}</pre>
            </div>

            {/* Bottom Meta API Info */}
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
              <span>Rate Limits: 80 req/sec</span>
              <span className="text-emerald-400 font-semibold">
                HTTPS 200 OK
              </span>
            </div>
          </div>

          {/* Right: Webhook & Events Monitor */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-7 shadow-xl">
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <Webhook className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    Idempotent Webhooks (PDF Sec 17)
                  </h4>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-mono">
                  Listening...
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-3 sm:mb-4">
                Receive live events whenever customers reply, messages are
                delivered or read, or templates are approved by Meta:
              </p>

              {/* Sample Webhook JSON Payload */}
              <div className="rounded-xl sm:rounded-2xl bg-slate-950 p-3 sm:p-4 font-mono text-[10px] sm:text-[11px] text-slate-300 border border-slate-800 space-y-1 overflow-x-auto">
                <div className="text-emerald-400">{"{"}</div>
                <div className="pl-4">
                  <span className="text-slate-400">"event":</span>{" "}
                  <span className="text-amber-300">"message.received"</span>,
                </div>
                <div className="pl-4">
                  <span className="text-slate-400">"from":</span>{" "}
                  <span className="text-emerald-400">"+8801712892341"</span>,
                </div>
                <div className="pl-4">
                  <span className="text-slate-400">"customer_name":</span>{" "}
                  <span className="text-slate-200">"Mahmud Hasan"</span>,
                </div>
                <div className="pl-4">
                  <span className="text-slate-400">"signature_sha256":</span>{" "}
                  <span className="text-slate-500">"e98f029a1b..."</span>
                </div>
                <div className="text-emerald-400">{"}"}</div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-800">
                <span className="text-slate-400">Signature:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> 100% Authentic
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-200 flex items-center justify-between">
              <span>Looking for Postman collection and Swagger schemas?</span>
              <a
                href="#inbox-demo"
                className="text-white underline font-bold flex items-center gap-1 hover:text-emerald-300 shrink-0 ml-2"
              >
                <span>Docs</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
