"use client";

import { ChevronDown, Filter, Search, X } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdown {
  name: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (val: string) => void;
}

interface AdminFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  dropdowns?: FilterDropdown[];
  onReset?: () => void;
}

export default function AdminFilters({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search records...",
  dropdowns = [],
  onReset,
}: AdminFiltersProps) {
  const activeDropdownCount = dropdowns.filter(
    (d) => d.value !== "ALL" && d.value !== "",
  ).length;
  const hasActiveFilters = Boolean(searchValue) || activeDropdownCount > 0;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onSearchChange("");
          }}
          placeholder={searchPlaceholder}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-10 pr-9 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:border-[#88da1c] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]/20"
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter Dropdowns & Reset Action */}
      <div className="flex flex-wrap items-center gap-2">
        {dropdowns.map((dropdown) => (
          <div key={dropdown.name} className="relative flex items-center">
            <select
              value={dropdown.value}
              onChange={(e) => dropdown.onChange(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-3 pr-8 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100/70 focus:border-[#88da1c] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#88da1c]/20"
              aria-label={dropdown.label}
            >
              {dropdown.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {dropdown.label}: {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        ))}

        {/* Reset Filters Button */}
        {hasActiveFilters && onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#88da1c] transition-colors"
            title="Reset all active filters"
          >
            <X size={12} className="text-slate-400" />
            <span>Reset</span>
            {activeDropdownCount > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#88da1c] px-1 text-[9px] font-bold text-slate-950">
                {activeDropdownCount}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
