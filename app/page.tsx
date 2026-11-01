import Link from "next/link";
import { ArrowRight, MessageCircle, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
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

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Sign In
          </Link>
        </div>

        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
          <ShieldCheck size={16} />
          WhatsApp Business Platform
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

          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Sign In
          </Link>

          <span className="inline-flex items-center rounded-xl border border-slate-200 px-5 py-3 text-sm text-slate-600">
            Workspace Scoped
          </span>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400">
          <p className="leading-5">
            Workspace-scoped contacts, conversations, and WhatsApp account
            management in one platform.
          </p>

          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/privacy-policy"
              className="font-medium text-slate-600 underline hover:text-slate-900"
            >
              Privacy Policy
            </Link>
            <span>•</span>
            <Link
              href="/terms-of-service"
              className="font-medium text-slate-600 underline hover:text-slate-900"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
