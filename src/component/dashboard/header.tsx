"use client";

import { useState } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  UserRound,
} from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      {/* Left side */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="hidden items-center gap-2 text-sm text-slate-400 sm:flex">
          <span>Workspace</span>
          <span>/</span>
          <span className="font-semibold text-slate-800">Cyber7</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search */}
        <div className="hidden h-10 w-48 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 md:flex lg:w-64">
          <Search size={17} className="shrink-0 text-slate-400" />

          <input
            type="search"
            placeholder="Search anything..."
            aria-label="Search anything"
            className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />

          <kbd className="hidden rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400 lg:block">
            /
          </kbd>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50"
          >
            <Bell size={19} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:w-80">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Notifications</h3>

                <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                  2 new
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-sm font-medium text-slate-800">
                    Welcome to Cyber7
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Your demo workspace is ready to explore.
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-sm font-medium text-slate-800">
                    WhatsApp connection
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Connect your account when integration is implemented.
                  </p>
                </div>
              </div>

              <p className="mt-3 text-[11px] text-slate-400">
                Demo notifications
              </p>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200" />

        {/* Profile */}
        <div className="relative">
          <button
            type="button"
            aria-expanded={profileOpen}
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-sm font-bold text-green-700">
              A
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-slate-800">Admin User</p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Workspace Admin
              </p>
            </div>

            <ChevronDown size={15} className="hidden text-slate-400 sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              <div className="border-b border-slate-100 px-3 py-3">
                <p className="text-sm font-semibold text-slate-900">
                  Admin User
                </p>
                <p className="mt-1 text-xs text-slate-500">admin@cyber7.demo</p>
              </div>

              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                <UserRound size={17} />
                My Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  window.location.href = "/settings";
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Settings size={17} />
                Settings
              </button>

              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={17} />
                Sign out (Demo)
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
