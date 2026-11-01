"use client";

import Link from "next/link";
import { ArrowUpRight, Megaphone } from "lucide-react";

interface RecentCampaignsProps {
  isLoading?: boolean;
}

export default function RecentCampaigns({
  isLoading = false,
}: RecentCampaignsProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Recent Campaigns
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your latest messaging campaigns
          </p>
        </div>

        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-800"
        >
          View all
          <ArrowUpRight size={15} />
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-5 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-slate-100 p-4">
              <div className="flex justify-between">
                <div className="h-4 w-36 rounded bg-slate-100" />
                <div className="h-4 w-16 rounded bg-slate-100" />
              </div>
              <div className="mt-4 h-2 rounded-full bg-slate-100" />
              <div className="mt-2 flex justify-between">
                <div className="h-3 w-16 rounded bg-slate-100" />
                <div className="h-3 w-20 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
            <Megaphone size={20} />
          </div>

          <p className="mt-3 text-sm font-semibold text-slate-800">
            Campaigns coming soon
          </p>

          <p className="mt-1 max-w-xs text-xs text-slate-400">
            Campaign management is not available yet. Your workspace campaigns
            will appear here once it is enabled.
          </p>

          <span className="mt-4 inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-400 shadow-sm">
            Not available yet
          </span>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400">
        No campaign data is displayed until campaign management is available.
      </p>
    </section>
  );
}
