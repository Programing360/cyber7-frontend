"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { recentCampaigns } from "@/src/data/mock/dashboard";


function getStatusStyle(status: string) {
  switch (status) {
    case "Completed":
      return "bg-green-50 text-green-700";

    case "In Progress":
      return "bg-blue-50 text-blue-700";

    case "Scheduled":
      return "bg-amber-50 text-amber-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function RecentCampaigns() {
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

      <div className="mt-5 space-y-4">
        {recentCampaigns.map((campaign) => {
          const progress =
            campaign.audience > 0
              ? Math.min(
                  100,
                  Math.round((campaign.sent / campaign.audience) * 100),
                )
              : 0;

          return (
            <div
              key={campaign.id}
              className="rounded-xl border border-slate-100 p-4"
            >
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    {campaign.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {campaign.sent.toLocaleString()} of{" "}
                    {campaign.audience.toLocaleString()} messages sent
                  </p>
                </div>

                <span
                  className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusStyle(
                    campaign.status,
                  )}`}
                >
                  {campaign.status}
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                <span>{progress}% sent</span>
                <span>{campaign.delivered.toLocaleString()} delivered</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Campaign metrics are illustrative, not live WhatsApp data.
      </p>
    </section>
  );
}
