import type { ReactNode } from "react";
import type { BackendSupportStatus } from "../../types/admin";

interface AdminStatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: ReactNode;
  backendSupport?: BackendSupportStatus;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

export default function AdminStatCard({
  title,
  value,
  subtext,
  icon,
  backendSupport = "NOT_IMPLEMENTED",
  trend,
  isLoading = false,
}: AdminStatCardProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-3.5 w-24 rounded bg-slate-200" />
            <div className="h-7 w-20 rounded bg-slate-200" />
          </div>
          <div className="h-11 w-11 rounded-xl bg-slate-100" />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="h-3 w-28 rounded bg-slate-100" />
          <div className="h-4 w-16 rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  const renderBackendBadge = () => {
    switch (backendSupport) {
      case "IMPLEMENTED":
        return (
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200"
            title="Production live backend endpoint"
          >
            Live API
          </span>
        );
      case "PARTIAL":
        return (
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200"
            title="Partially implemented in backend"
          >
            Partial API
          </span>
        );
      case "NOT_IMPLEMENTED":
      default:
        return (
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200"
            title="Backend endpoint pending implementation; showing local aligned model data"
          >
            Demo Data
          </span>
        );
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          <div className="text-2xl font-black tracking-tight text-slate-900">
            {value}
          </div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-700 border border-slate-100 transition-colors group-hover:bg-[#88da1c]/15 group-hover:text-slate-950">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        {subtext && (
          <span className="text-xs font-medium text-slate-500 truncate max-w-[200px]">
            {subtext}
          </span>
        )}

        <div className="flex items-center gap-1.5 ml-auto">
          {trend && (
            <span
              className={`text-xs font-bold ${trend.isPositive ? "text-emerald-600" : "text-rose-600"
                }`}
            >
              {trend.value}
            </span>
          )}
          {renderBackendBadge()}
        </div>
      </div>
    </div>
  );
}
