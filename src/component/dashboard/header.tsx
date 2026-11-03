"use client";

import { useState } from "react";
import {
  Bell,
  Check,
  ChevronDown,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/src/context/auth-context";
import { useWorkspace } from "@/src/context/workspace-context";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const {
    workspaces,
    activeWorkspace,
    switchWorkspace,
    setCreateModalOpen,
  } = useWorkspace();

  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "A";
  const userName = user?.name || "Admin User";
  const userEmail = user?.email || "No email available";
  const userRole =
    user?.role === "OWNER"
      ? "Workspace Owner"
      : user?.role === "ADMIN"
        ? "Workspace Admin"
        : "Team Member";

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

        <div className="relative hidden items-center gap-2 text-sm text-slate-400 sm:flex">
          <span>Workspace</span>
          <span>/</span>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setWorkspaceMenuOpen(!workspaceMenuOpen);
                setProfileOpen(false);
                setNotificationsOpen(false);
              }}
              aria-expanded={workspaceMenuOpen}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 font-semibold text-slate-800 transition hover:bg-slate-100"
            >
              <span className="max-w-[140px] truncate md:max-w-[200px]">
                {activeWorkspace?.name || "VexChat"}
              </span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {workspaceMenuOpen && (
              <div className="absolute left-0 top-9 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                <div className="border-b border-slate-100 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Workspace
                  </p>
                </div>

                <div className="max-h-60 overflow-y-auto py-1">
                  {workspaces.map((ws) => {
                    const isSelected = ws.id === activeWorkspace?.id;
                    return (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={async () => {
                          setWorkspaceMenuOpen(false);
                          if (!isSelected) {
                            try {
                              await switchWorkspace(ws.id);
                            } catch (err) {
                              console.error(err);
                            }
                          }
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition ${
                          isSelected
                            ? "bg-green-50 font-semibold text-green-800"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="truncate">{ws.name}</p>
                          <span className="text-[10px] text-slate-400">
                            {ws.role}
                          </span>
                        </div>
                        {isSelected && (
                          <Check size={14} className="shrink-0 text-green-600" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setWorkspaceMenuOpen(false);
                      setCreateModalOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-50"
                  >
                    <Plus size={15} />
                    <span>Create Workspace</span>
                  </button>
                </div>
              </div>
            )}
          </div>
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
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:w-80">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Notifications</h3>
              </div>

              <div className="mt-4 flex flex-col items-center justify-center rounded-xl bg-slate-50 px-4 py-8 text-center">
                <Bell size={22} className="text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-700">
                  No notifications yet
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Workspace updates will appear here.
                </p>
              </div>
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
              {userInitial}
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-slate-800">{userName}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {userRole}
              </p>
            </div>

            <ChevronDown size={15} className="hidden text-slate-400 sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              <div className="border-b border-slate-100 px-3 py-3">
                <p className="text-sm font-semibold text-slate-900">
                  {userName}
                </p>
                <p className="mt-1 text-xs text-slate-500">{userEmail}</p>
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
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={17} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
