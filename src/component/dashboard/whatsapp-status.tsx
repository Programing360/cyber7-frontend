import Link from "next/link";
import { AlertCircle, ArrowRight, MessageCircle } from "lucide-react";

export default function WhatsAppStatus() {
  return (
    <section className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
          <MessageCircle size={24} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-slate-900">WhatsApp Business</h2>

          <p className="mt-1 text-sm text-slate-500">
            Connect your account to enable real messaging.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500" />

            <span className="text-xs font-semibold text-amber-700">
              Not configured
            </span>
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            Meta Developer App, credentials and webhook setup are still
            required.
          </p>

          <Link
            href="/integrations/whatsapp"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#88da1c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            Configure Integration
            <ArrowRight size={16} />
          </Link>
        </div>

        <AlertCircle size={18} className="shrink-0 text-amber-500" />
      </div>
    </section>
  );
}
