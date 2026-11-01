import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export interface StatCardData {
  title: string;
  value: string;
  change?: string;
  description?: string;
  icon: LucideIcon;
  trend?: "up" | "down";
}

interface StatCardProps {
  stat: StatCardData;
  isLoading?: boolean;
}

export default function StatCard({ stat, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <article className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="h-11 w-11 rounded-xl bg-slate-100" />
          <div className="h-6 w-14 rounded-lg bg-slate-100" />
        </div>

        <div className="mt-5 h-4 w-28 rounded bg-slate-100" />
        <div className="mt-2 h-8 w-20 rounded bg-slate-100" />
        <div className="mt-2 h-3 w-36 rounded bg-slate-100" />
      </article>
    );
  }

  const Icon = stat.icon;
  const isUp = stat.trend === "up";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-700">
          <Icon size={21} />
        </div>

        {stat.change && (
          <span
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
              isUp
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {isUp ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}

            {stat.change}
          </span>
        )}
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        {stat.title}
      </p>

      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {stat.value}
      </h2>

      {stat.description && (
        <p className="mt-2 text-xs text-slate-400">
          {stat.description}
        </p>
      )}
    </article>
  );
}