"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Check,
  ChevronDown,
  Compass,
  LogOut,
  Menu,
  MessageSquare,
  Megaphone,
  Phone,
  Plus,
  Search,
  Settings,
  Sparkles,
  Ticket,
  UserRound,
  Bot,
  Loader2,
  X,
  ExternalLink,
  CheckCheck,
} from "lucide-react";

import { useAuth } from "@/src/context/auth-context";
import { useWorkspace } from "@/src/context/workspace-context";
import {
  headerService,
  type HeaderSearchResponseData,
  type HeaderSearchResultItem,
  type HeaderNotificationItem,
} from "@/src/services/header-service";

interface HeaderProps {
  onMenuClick: () => void;
}

function formatRelativeTime(isoString: string): string {
  try {
    const diff = Math.floor(
      (Date.now() - new Date(isoString).getTime()) / 1000,
    );
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return "Recently";
  }
}

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { workspaces, activeWorkspace, switchWorkspace, setCreateModalOpen } =
    useWorkspace();

  // Menu states
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] =
    useState<HeaderSearchResponseData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Notification states
  const [notifications, setNotifications] = useState<HeaderNotificationItem[]>(
    [],
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const notificationsContainerRef = useRef<HTMLDivElement>(null);

  const userInitial = user?.name
    ? user.name.trim().charAt(0).toUpperCase()
    : "A";
  const userName = user?.name || "Admin User";
  const userEmail = user?.email || "No email available";
  const userRole =
    user?.role === "OWNER"
      ? "Workspace Owner"
      : user?.role === "ADMIN"
        ? "Workspace Admin"
        : "Team Member";

  // =========================================================================
  // Keyboard Shortcut Handler (/ to search, Escape to close)
  // =========================================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchDropdownOpen(true);
      }
      if (e.key === "Escape") {
        setSearchDropdownOpen(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
        setWorkspaceMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // =========================================================================
  // Outside Click Handler
  // =========================================================================
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchDropdownOpen(false);
      }
      if (
        notificationsContainerRef.current &&
        !notificationsContainerRef.current.contains(e.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =========================================================================
  // Debounced Runtime Workspace Search
  // =========================================================================
  useEffect(() => {
    if (!searchQuery.trim() || !activeWorkspace?.id) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const data = await headerService.searchWorkspace(
          activeWorkspace.id,
          searchQuery,
        );
        setSearchResults(data);
      } catch (err) {
        console.error("[Header Search Error]:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, activeWorkspace?.id]);

  // =========================================================================
  // Runtime Notifications Fetcher
  // =========================================================================
  const loadNotifications = useCallback(async () => {
    if (!activeWorkspace?.id) return;
    try {
      setIsNotificationsLoading(true);
      const data = await headerService.getNotifications(activeWorkspace.id);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error("[Header Notifications Error]:", err);
    } finally {
      setIsNotificationsLoading(false);
    }
  }, [activeWorkspace?.id]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleSelectSearchResult = (url: string) => {
    setSearchDropdownOpen(false);
    setSearchQuery("");
    router.push(url);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const hasSearchResults = searchResults && searchResults.totalCount > 0;

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      {/* Left side: Mobile menu & Workspace switcher */}
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
                setSearchDropdownOpen(false);
              }}
              aria-expanded={workspaceMenuOpen}
              className="flex items-center z-50 gap-1.5 rounded-lg px-2 py-1 font-semibold text-slate-800 transition hover:bg-slate-100"
            >
              <span className="max-w-[140px] truncate md:max-w-[200px] z-50">
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
                          <Check
                            size={14}
                            className="shrink-0 text-green-600"
                          />
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

      {/* Right side: Search, Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* ================= Search Bar ================= */}
        <div ref={searchContainerRef} className="relative">
          <div className="flex h-10 w-44 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 sm:w-56 md:w-64 lg:w-80">
            {isSearching ? (
              <Loader2
                size={16}
                className="shrink-0 animate-spin text-emerald-600"
              />
            ) : (
              <Search size={16} className="shrink-0 text-slate-400" />
            )}

            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchDropdownOpen(true);
              }}
              onFocus={() => setSearchDropdownOpen(true)}
              placeholder="Search anything..."
              aria-label="Search anything"
              className="w-full min-w-0 bg-transparent text-xs outline-none placeholder:text-slate-400 sm:text-sm"
            />

            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            ) : (
              <kbd className="hidden rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400 lg:block">
                /
              </kbd>
            )}
          </div>

          {/* Search Dropdown / Palette */}
          {searchDropdownOpen && (
            <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl transition sm:w-96 md:w-[440px] max-h-[460px] overflow-y-auto">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
                  <Loader2
                    size={22}
                    className="animate-spin text-emerald-600"
                  />
                  <p className="mt-2 text-xs font-medium">
                    Searching workspace data...
                  </p>
                </div>
              ) : searchQuery.trim() && hasSearchResults ? (
                <div className="space-y-3">
                  {/* Quick Navigation Matches */}
                  {searchResults.navigation.length > 0 && (
                    <div>
                      <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Pages & Navigation
                      </p>
                      <div className="mt-1 space-y-0.5">
                        {searchResults.navigation.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelectSearchResult(item.url)}
                            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-xs transition hover:bg-slate-50"
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                              <Compass size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-800 truncate">
                                {item.title}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {item.subtitle}
                              </p>
                            </div>
                            <ExternalLink
                              size={12}
                              className="shrink-0 text-slate-300"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contacts Matches */}
                  {searchResults.contacts.length > 0 && (
                    <div>
                      <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Contacts & Leads
                      </p>
                      <div className="mt-1 space-y-0.5">
                        {searchResults.contacts.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleSelectSearchResult(c.url)}
                            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-xs transition hover:bg-slate-50"
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                              <UserRound size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-800 truncate">
                                {c.title}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {c.subtitle}
                              </p>
                            </div>
                            <span className="rounded bg-blue-100/60 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                              Chat
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Campaigns Matches */}
                  {searchResults.campaigns.length > 0 && (
                    <div>
                      <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Campaigns
                      </p>
                      <div className="mt-1 space-y-0.5">
                        {searchResults.campaigns.map((cmp) => (
                          <button
                            key={cmp.id}
                            type="button"
                            onClick={() => handleSelectSearchResult(cmp.url)}
                            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-xs transition hover:bg-slate-50"
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                              <Megaphone size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-800 truncate">
                                {cmp.title}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {cmp.subtitle}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Automations Matches */}
                  {searchResults.automations.length > 0 && (
                    <div>
                      <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Automations
                      </p>
                      <div className="mt-1 space-y-0.5">
                        {searchResults.automations.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => handleSelectSearchResult(a.url)}
                            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-xs transition hover:bg-slate-50"
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                              <Bot size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-800 truncate">
                                {a.title}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {a.subtitle}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Support Ticket Matches */}
                  {searchResults.tickets.length > 0 && (
                    <div>
                      <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Support Tickets
                      </p>
                      <div className="mt-1 space-y-0.5">
                        {searchResults.tickets.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => handleSelectSearchResult(t.url)}
                            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-xs transition hover:bg-slate-50"
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                              <Ticket size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-800 truncate">
                                {t.title}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {t.subtitle}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Calls Matches */}
                  {searchResults.calls.length > 0 && (
                    <div>
                      <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Voice Calls
                      </p>
                      <div className="mt-1 space-y-0.5">
                        {searchResults.calls.map((cl) => (
                          <button
                            key={cl.id}
                            type="button"
                            onClick={() => handleSelectSearchResult(cl.url)}
                            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-xs transition hover:bg-slate-50"
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                              <Phone size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-800 truncate">
                                {cl.title}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {cl.subtitle}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : searchQuery.trim() ? (
                <div className="py-8 text-center">
                  <Search size={24} className="mx-auto text-slate-300" />
                  <p className="mt-2 text-xs font-semibold text-slate-700">
                    No results for &ldquo;{searchQuery}&rdquo;
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Try searching contacts, campaigns, automations, or page
                    names.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Quick Navigation
                  </p>
                  <div className="mt-1 grid grid-cols-2 gap-1">
                    {[
                      {
                        title: "Live Chat",
                        url: "/inbox",
                        icon: MessageSquare,
                      },
                      { title: "Contacts", url: "/contacts", icon: UserRound },
                      {
                        title: "Campaigns",
                        url: "/campaigns",
                        icon: Megaphone,
                      },
                      { title: "Automations", url: "/automations", icon: Bot },
                      { title: "Voice Dialer", url: "/inbox", icon: Phone },
                      { title: "Settings", url: "/settings", icon: Settings },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.url}
                          type="button"
                          onClick={() => handleSelectSearchResult(item.url)}
                          className="flex items-center gap-2 rounded-lg p-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          <Icon size={14} className="text-emerald-600" />
                          <span>{item.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================= Notifications ================= */}
        <div ref={notificationsContainerRef} className="relative">
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
              setSearchDropdownOpen(false);
              if (!notificationsOpen) {
                loadNotifications();
              }
            }}
            className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl  border-slate-200 bg-white p-4 shadow-2xl transition sm:w-80 md:w-96">
              <div className="flex justify-between w-full border-b border-slate-100 pb-3">
                <div className=" gap-2">
                  <h3 className="font-semibold text-slate-900">
                    Workspace Notifications
                  </h3>
                </div>
                <div>
                  {unreadCount > 0 && (
                    <span className="rounded-full w-full bg-rose-100 px-3 py-0.5 text-[10px] font-bold text-rose-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
              </div>

              <div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllNotificationsRead}
                    className=" w-full gap-1 font-medium text-[#88da1c] hover:text-emerald-700"
                  >
                    {/* <CheckCheck size={13} /> */}
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {isNotificationsLoading && notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                  <Loader2
                    size={20}
                    className="animate-spin text-emerald-600"
                  />
                  <p className="mt-2 text-xs">Loading updates...</p>
                </div>
              ) : notifications.length > 0 ? (
                <div className="mt-3 max-h-80 divide-y divide-slate-100 overflow-y-auto">
                  {notifications.map((item) => {
                    const isMessage = item.category === "message";
                    const isCall = item.category === "call";
                    const isCampaign = item.category === "campaign";
                    const isSupport = item.category === "support";

                    return (
                      <Link
                        key={item.id}
                        href={item.url}
                        onClick={() => setNotificationsOpen(false)}
                        className={`flex items-start hover:bg-slate-200 gap-3 py-2.5 px-2.5 transition rounded-2xl ${
                          !item.read ? "bg-slate-50/70" : ""
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs ${
                            isMessage
                              ? "bg-emerald-100 text-emerald-700"
                              : isCall
                                ? "bg-blue-100 text-blue-700"
                                : isCampaign
                                  ? "bg-purple-100 text-purple-700"
                                  : isSupport
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-indigo-100 text-indigo-700"
                          }`}
                        >
                          {isMessage ? (
                            <MessageSquare size={14} />
                          ) : isCall ? (
                            <Phone size={14} />
                          ) : isCampaign ? (
                            <Megaphone size={14} />
                          ) : isSupport ? (
                            <Ticket size={14} />
                          ) : (
                            <Sparkles size={14} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-semibold text-slate-800 truncate">
                              {item.title}
                            </p>
                            <span className="shrink-0 text-[10px] text-slate-400">
                              {formatRelativeTime(item.timestamp)}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2">
                            {item.description}
                          </p>
                        </div>

                        {!item.read && (
                          <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 flex flex-col items-center justify-center rounded-xl bg-slate-50 px-4 py-8 text-center">
                  <Bell size={22} className="text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-700">
                    No notifications yet
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Workspace updates, incoming chats, and alerts will appear
                    here in real-time.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200" />

        {/* ================= Profile Menu ================= */}
        <div className="relative">
          <button
            type="button"
            aria-expanded={profileOpen}
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
              setSearchDropdownOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-sm font-bold text-green-700">
              {userInitial}
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-slate-800">{userName}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">{userRole}</p>
            </div>

            <ChevronDown size={15} className="hidden text-slate-400 sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              <div className="border-b border-slate-100 px-3 py-3">
                <p className="text-sm font-semibold text-slate-900">
                  {userName}
                </p>
                <p className="mt-1 text-xs text-slate-500 truncate">
                  {userEmail}
                </p>
              </div>

              <Link href={"/my-profile"}>
                <button
                  type="button"
                  onClick={() => setProfileOpen(false)}
                  className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <UserRound size={17} />
                  My Profile
                </button>
              </Link>
              {user?.role === "ADMIN" && (
                <Link href="/admin">
                  <button
                    type="button"
                    onClick={() => setProfileOpen(false)}
                    className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <UserRound size={17} />
                    Admin Dashboard
                  </button>
                </Link>
              )}

              <Link href={"/settings"}>
                <button
                  type="button"
                  onClick={() => setProfileOpen(false)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <Settings size={17} />
                  Settings
                </button>
              </Link>

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
