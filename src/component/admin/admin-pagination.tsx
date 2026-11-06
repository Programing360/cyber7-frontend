"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  source?: "LIVE_BACKEND" | "DEMO_PREVIEW";
  onPageSizeChange?: (newSize: number) => void;
  pageSizeOptions?: number[];
}

export default function AdminPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  source = "DEMO_PREVIEW",
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
}: AdminPaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  // Generate page numbers to display with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (safeTotalPages <= 7) {
      for (let i = 1; i <= safeTotalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");

      const startPage = Math.max(2, page - 1);
      const endPage = Math.min(safeTotalPages - 1, page + 1);

      for (let i = startPage; i <= endPage; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (page < safeTotalPages - 2) pages.push("...");
      if (!pages.includes(safeTotalPages)) pages.push(safeTotalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:px-6">
      {/* Left: Summary and source badge */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>
          Showing <strong className="text-slate-800">{start}</strong> to{" "}
          <strong className="text-slate-800">{end}</strong> of{" "}
          <strong className="text-slate-800">{totalItems}</strong> entries
        </span>
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            source === "LIVE_BACKEND"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-slate-100 text-slate-600 border border-slate-200"
          }`}
        >
          {source === "LIVE_BACKEND" ? "Live DB" : "Demo Data"}
        </span>

        {/* Optional Page Size Selector */}
        {onPageSizeChange && (
          <div className="ml-2 flex items-center gap-1.5 border-l border-slate-200 pl-3">
            <span className="text-[11px] text-slate-400">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 focus:border-[#88da1c] focus:outline-hidden"
              aria-label="Rows per page"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page navigation controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Numeric page buttons on tablet/desktop */}
        <div className="hidden sm:flex items-center gap-1 mx-1">
          {getPageNumbers().map((p, idx) =>
            p === "..." ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-1 text-xs text-slate-400"
              >
                ...
              </span>
            ) : (
              <button
                key={`page-${p}`}
                onClick={() => onPageChange(p)}
                aria-current={p === page ? "page" : undefined}
                className={`h-8 min-w-[32px] rounded-lg px-2 text-xs font-bold transition-colors ${
                  p === page
                    ? "bg-[#88da1c] text-slate-950 shadow-xs"
                    : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ),
          )}
        </div>

        {/* Compact page display on mobile */}
        <span className="px-2 text-xs font-medium text-slate-600 sm:hidden">
          {page} / {safeTotalPages}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= safeTotalPages || totalItems === 0}
          className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
