import { DashboardStat } from "@/src/data/mock/dashboard";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";


interface StatCardProps {
  stat: DashboardStat;
}

export default function StatCard({ stat }: StatCardProps) {
  const Icon = stat.icon;
  const isUp = stat.trend === "up";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-700">
          <Icon size={21} />
        </div>

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
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        {stat.title}
      </p>

      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {stat.value}
      </h2>

      <p className="mt-2 text-xs text-slate-400">
        {stat.description}
      </p>
    </article>
  );
}