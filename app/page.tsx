import Link from "next/link";
import { ArrowRight, MessageCircle, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
            <MessageCircle size={26} />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Cyber7
            </h1>
            <p className="text-sm text-slate-500">WhatsApp Business Platform</p>
          </div>
        </div>

        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
          <ShieldCheck size={16} />
          Frontend Demo Environment
        </div>

        <h2 className="max-w-xl text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Manage your business conversations in one place.
        </h2>

        <p className="mt-5 max-w-xl leading-7 text-slate-600">
          A unified workspace for customer conversations, contact management,
          messaging campaigns, team collaboration, and business analytics.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            Open Dashboard
            <ArrowRight size={18} />
          </Link>

          <span className="inline-flex items-center rounded-xl border border-slate-200 px-5 py-3 text-sm text-slate-600">
            Demo Mode
          </span>
        </div>

        <p className="mt-8 text-xs leading-5 text-slate-400">
          This initial environment uses frontend components. Real WhatsApp
          messaging and external integrations will be implemented separately.
        </p>
      </section>
    </main>
  );
}
