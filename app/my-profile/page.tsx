"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  Key,
  Lock,
  Smartphone,
  Laptop,
  Globe,
  Clock,
  Check,
  CheckCircle2,
  AlertCircle,
  Camera,
  Sparkles,
  Copy,
  ExternalLink,
  Save,
  RotateCcw,
  Bell,
  Building,
  ChevronRight,
  Eye,
  EyeOff,
  LogOut,
  QrCode,
  Activity,
  BadgeCheck,
  Briefcase,
  MapPin,
  Calendar,
  Palette,
  Layers,
  ArrowRight,
  CheckCheck,
  Info,
} from "lucide-react";

import DashboardLayout from "@/src/component/dashboard/dashboard-layout";
import { useAuth } from "@/src/context/auth-context";
import { useWorkspace } from "@/src/context/workspace-context";
import {
  profileService,
  type UpdateProfileInput,
  type UserProfileData,
} from "@/src/services/profile-service";

// ─── Cover Gradient Themes ──────────────────────────────────────────────────
interface BannerTheme {
  id: string;
  name: string;
  gradient: string;
  accent: string;
  previewClass: string;
}

const BANNER_THEMES: BannerTheme[] = [
  {
    id: "aurora",
    name: "Emerald Aurora",
    gradient: "from-emerald-600 via-teal-700 to-slate-900",
    accent: "#88da1c",
    previewClass: "bg-gradient-to-r from-emerald-600 to-slate-900",
  },
  {
    id: "midnight",
    name: "Midnight Graphite",
    gradient: "from-slate-900 via-zinc-800 to-neutral-950",
    accent: "#10b981",
    previewClass: "bg-gradient-to-r from-slate-900 to-zinc-800",
  },
  {
    id: "sunset",
    name: "Sunset Coral",
    gradient: "from-rose-600 via-orange-600 to-amber-900",
    accent: "#f97316",
    previewClass: "bg-gradient-to-r from-rose-600 to-amber-700",
  },
  {
    id: "cyber",
    name: "Cyber Lime",
    gradient: "from-lime-600 via-emerald-800 to-gray-950",
    accent: "#84cc16",
    previewClass: "bg-gradient-to-r from-lime-600 to-emerald-950",
  },
  {
    id: "indigo",
    name: "Deep Ocean",
    gradient: "from-indigo-700 via-blue-800 to-slate-950",
    accent: "#6366f1",
    previewClass: "bg-gradient-to-r from-indigo-700 to-slate-950",
  },
];

// ─── Status Presets ──────────────────────────────────────────────────────────
const STATUS_PRESETS = [
  { emoji: "🚀", text: "Focusing on automations" },
  { emoji: "💬", text: "Available for live chats" },
  { emoji: "📋", text: "Reviewing campaign templates" },
  { emoji: "☕", text: "On coffee break" },
  { emoji: "🎯", text: "In meeting with clients" },
];

// ─── Timezones ──────────────────────────────────────────────────────────────
const TIMEZONES = [
  { label: "Dhaka, Bangladesh (GMT+6)", value: "Asia/Dhaka", offset: 6 },
  { label: "Dubai, UAE (GMT+4)", value: "Asia/Dubai", offset: 4 },
  { label: "London, UK (GMT+0)", value: "Europe/London", offset: 0 },
  { label: "New York, USA (GMT-5)", value: "America/New_York", offset: -5 },
  { label: "Singapore (GMT+8)", value: "Asia/Singapore", offset: 8 },
  { label: "Tokyo, Japan (GMT+9)", value: "Asia/Tokyo", offset: 9 },
  { label: "Sydney, Australia (GMT+11)", value: "Australia/Sydney", offset: 11 },
];

type ProfileTab = "overview" | "security" | "notifications" | "workspaces";

export default function MyProfilePage() {
  const { user, refreshUser } = useAuth();
  const { workspaces, activeWorkspace, switchWorkspace } = useWorkspace();

  // Active tab state
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");

  // Notification toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info">("success");

  // Loading & saving states
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Dynamic user profile states
  const [displayName, setDisplayName] = useState("");
  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("Operations & Growth Lead");
  const [bio, setBio] = useState(
    "Managing customer communications and automated WhatsApp broadcast sequences for our high-volume retail campaigns."
  );
  const [phoneNumber, setPhoneNumber] = useState("+880 1712-345678");
  const [selectedTimezone, setSelectedTimezone] = useState("Asia/Dhaka");
  const [calculatedLocalTime, setCalculatedLocalTime] = useState<string>("Loading...");
  const [customStatus, setCustomStatus] = useState("Focusing on automations");
  const [customStatusEmoji, setCustomStatusEmoji] = useState("🚀");
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedBanner, setSelectedBanner] = useState("aurora");
  const [avatarImage, setAvatarImage] = useState<string | null>(null);

  // Security tab states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bannerPickerOpen, setBannerPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    whatsappInbound: true,
    campaignDeliveries: true,
    templateApprovals: true,
    weeklyDigest: false,
    securityAlerts: true,
    soundEffects: true,
  });

  // Simulated active sessions
  const [sessions, setSessions] = useState([
    {
      id: "sess_1",
      device: "Chrome on Windows 11",
      location: "Dhaka, Bangladesh",
      ip: "103.205.71.14",
      lastActive: "Active now",
      isCurrent: true,
      icon: Laptop,
    },
    {
      id: "sess_2",
      device: "VexChat App on iPhone 15 Pro",
      location: "Dhaka, Bangladesh",
      ip: "103.205.71.89",
      lastActive: "2 hours ago",
      isCurrent: false,
      icon: Smartphone,
    },
    {
      id: "sess_3",
      device: "Safari on macOS Sonoma",
      location: "Chittagong, Bangladesh",
      ip: "27.147.201.55",
      lastActive: "3 days ago",
      isCurrent: false,
      icon: Laptop,
    },
  ]);

  // Initial load dynamically from backend API with fallback
  useEffect(() => {
    let isMounted = true;

    async function loadDynamicProfile() {
      setIsLoadingProfile(true);
      try {
        const profile = await profileService.getProfile();
        if (profile && isMounted) {
          if (profile.name) setFullName(profile.name);
          if (profile.displayName) setDisplayName(profile.displayName);
          else if (profile.name) setDisplayName(profile.name.split(" ")[0]);
          if (profile.jobTitle) setJobTitle(profile.jobTitle);
          if (profile.bio) setBio(profile.bio);
          if (profile.phoneNumber) setPhoneNumber(profile.phoneNumber);
          if (profile.timezone) setSelectedTimezone(profile.timezone);
          if (profile.customStatus) setCustomStatus(profile.customStatus);
          if (profile.customStatusEmoji) setCustomStatusEmoji(profile.customStatusEmoji);
          if (typeof profile.isAvailable === "boolean") setIsAvailable(profile.isAvailable);
          if (profile.bannerTheme) setSelectedBanner(profile.bannerTheme);
          if (profile.avatarUrl) setAvatarImage(profile.avatarUrl);
          if (profile.notifications) {
            setNotifications({
              whatsappInbound: profile.notifications.whatsappInbound ?? true,
              campaignDeliveries: profile.notifications.campaignDeliveries ?? true,
              templateApprovals: profile.notifications.templateApprovals ?? true,
              weeklyDigest: profile.notifications.weeklyDigest ?? false,
              securityAlerts: profile.notifications.securityAlerts ?? true,
              soundEffects: profile.notifications.soundEffects ?? true,
            });
          }
          return;
        }
      } catch (err) {
        console.warn("Could not fetch remote profile, falling back to auth user:", err);
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }

      // Fallback to auth context
      if (user && isMounted) {
        setFullName(user.name || "Administrator");
        setDisplayName(user.name ? user.name.split(" ")[0] : "Admin");
      }
    }

    loadDynamicProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Compute local time dynamically on client
  useEffect(() => {
    try {
      setCalculatedLocalTime(
        new Date().toLocaleTimeString("en-US", {
          timeZone: selectedTimezone,
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch {
      setCalculatedLocalTime("12:00 PM");
    }
  }, [selectedTimezone]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const triggerToast = (msg: string, type: "success" | "info" = "success") => {
    setToastMessage(msg);
    setToastType(type);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    triggerToast(`Copied ${label} to clipboard!`, "info");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Avatar upload handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        triggerToast("Image is too large. Please select a photo under 3MB.", "info");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setAvatarImage(result);
        triggerToast("Profile photo loaded! Click Save to sync to your account.");
      };
      reader.readAsDataURL(file);
    }
  };

  // Dynamic Save Profile Handler
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const payload: UpdateProfileInput = {
        name: fullName.trim() || undefined,
        displayName: displayName.trim() || undefined,
        jobTitle: jobTitle.trim() || undefined,
        bio: bio.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        timezone: selectedTimezone,
        customStatus: customStatus.trim() || undefined,
        customStatusEmoji: customStatusEmoji.trim() || undefined,
        isAvailable,
        bannerTheme: selectedBanner,
        avatarUrl: avatarImage || undefined,
        notifications,
      };

      // 1. Send update to backend API
      const updated = await profileService.updateProfile(payload);

      // 2. Synchronize AuthContext so headers, avatars, and sidebar reflect updates immediately
      if (refreshUser) {
        await refreshUser();
      }

      // 3. Keep local backup
      try {
        localStorage.setItem(
          "vexchat_user_profile_prefs",
          JSON.stringify({
            ...payload,
            fullName: updated.name || fullName,
            displayName: updated.displayName || displayName,
          })
        );
      } catch {}

      triggerToast("Profile updated and saved to the database successfully!");
    } catch (err: unknown) {
      console.error("Failed to update profile:", err);
      const msg = err instanceof Error ? err.message : "Failed to save profile changes";
      triggerToast(msg, "info");
    } finally {
      setIsSaving(false);
    }
  };

  // Dynamic Password Update Handler
  const handleChangePassword = async () => {
    if (!currentPassword) {
      triggerToast("Please provide your current password", "info");
      return;
    }
    if (!passwordCriteria.match || passwordScore < 75) {
      triggerToast("Please fulfill all password complexity requirements", "info");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await profileService.changePassword({
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      triggerToast(res.message || "Password updated successfully!");
    } catch (err: unknown) {
      console.error("Failed to change password:", err);
      const msg = err instanceof Error ? err.message : "Failed to update password";
      triggerToast(msg, "info");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Revoke session handler
  const handleRevokeSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    triggerToast("Session was successfully terminated.", "info");
  };

  // Password validation checks
  const passwordCriteria = useMemo(() => {
    return {
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[^A-Za-z0-9]/.test(newPassword),
      match: newPassword.length > 0 && newPassword === confirmPassword,
    };
  }, [newPassword, confirmPassword]);

  const passwordScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.length) score += 25;
    if (passwordCriteria.uppercase) score += 25;
    if (passwordCriteria.number) score += 25;
    if (passwordCriteria.special) score += 25;
    return score;
  }, [passwordCriteria]);

  // Profile completion score
  const completionScore = useMemo(() => {
    let score = 30; // base (name, email)
    if (jobTitle.trim().length > 2) score += 15;
    if (bio.trim().length > 10) score += 15;
    if (phoneNumber.trim().length > 6) score += 15;
    if (mfaEnabled) score += 15;
    if (avatarImage) score += 10;
    return Math.min(100, score);
  }, [jobTitle, bio, phoneNumber, mfaEnabled, avatarImage]);

  const currentBanner = useMemo(() => {
    return (
      BANNER_THEMES.find((b) => b.id === selectedBanner) || BANNER_THEMES[0]
    );
  }, [selectedBanner]);

  const userInitial = useMemo(() => {
    if (fullName) return fullName.charAt(0).toUpperCase();
    if (user?.name) return user.name.charAt(0).toUpperCase();
    return "V";
  }, [fullName, user]);

  return (
    <DashboardLayout>
      <div className="relative mx-auto max-w-6xl space-y-6 pb-20 pt-2 text-slate-800 antialiased">
        {/* Floating Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="fixed right-6 top-20 z-50 flex items-center gap-3 rounded-2xl border border-white/80 bg-white/95 px-5 py-3.5 shadow-2xl backdrop-blur-md"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                  toastType === "success"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                {toastType === "success" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <Info size={18} />
                )}
              </div>
              <span className="text-xs font-semibold text-slate-800">
                {toastMessage}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Hero Cover Banner & Profile Head Card ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl border border-[#f1f3f5] bg-white shadow-xl"
        >
          {/* Banner Graphic Area */}
          <div
            className={`relative h-48 sm:h-60 w-full bg-gradient-to-r ${currentBanner.gradient} transition-all duration-700 ease-out`}
          >
            {/* Ambient glass shapes */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black/30" />
            <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
            <div className="absolute -bottom-10 right-20 h-48 w-48 rounded-full bg-black/10 blur-xl" />

            {/* Banner Theme Switcher Trigger */}
            <div className="absolute right-4 top-4 z-10">
              <button
                type="button"
                onClick={() => setBannerPickerOpen(!bannerPickerOpen)}
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-black/30 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-md transition hover:bg-black/50"
              >
                <Palette size={14} />
                <span>Customize Cover</span>
              </button>

              <AnimatePresence>
                {bannerPickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 8 }}
                    className="absolute right-0 top-11 z-30 w-56 rounded-2xl border border-[#f1f3f5] bg-white p-3 shadow-2xl"
                  >
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Select Theme
                    </p>
                    <div className="space-y-1.5">
                      {BANNER_THEMES.map((theme) => (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => {
                            setSelectedBanner(theme.id);
                            setBannerPickerOpen(false);
                            triggerToast(`Applied ${theme.name} theme! Click Save to keep.`);
                          }}
                          className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-1.5 text-left text-xs transition ${
                            selectedBanner === theme.id
                              ? "bg-slate-100 font-semibold text-slate-900"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span
                            className={`h-4 w-4 rounded-full shadow-sm ${theme.previewClass}`}
                          />
                          <span className="flex-1">{theme.name}</span>
                          {selectedBanner === theme.id && (
                            <Check size={14} className="text-emerald-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Profile Header Details Bar */}
          <div className="relative px-6 pb-6 pt-0 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              {/* Overlapping Avatar */}
              <div className="relative -mt-16 sm:-mt-20 flex items-end gap-5">
                <div className="group relative">
                  <div className="relative flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-slate-100 shadow-2xl ring-1 ring-slate-100">
                    {avatarImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarImage}
                        alt="Profile avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-700 text-3xl sm:text-4xl font-extrabold text-white">
                        {userInitial}
                      </div>
                    )}

                    {/* Camera Upload Overlay */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100"
                      title="Upload new profile photo"
                    >
                      <Camera size={22} />
                      <span className="mt-1 text-[10px] font-medium">Update</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>

                  {/* Presence indicator pulse */}
                  <span
                    className={`absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white shadow-md ${
                      isAvailable ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    title={isAvailable ? "Available" : "Away"}
                  >
                    {isAvailable && (
                      <span className="h-2 w-2 animate-ping rounded-full bg-white opacity-75" />
                    )}
                  </span>
                </div>

                {/* Name, Title, and Verification Badge */}
                <div className="mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                      {fullName || "VexChat Administrator"}
                    </h1>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 shadow-sm">
                      <BadgeCheck size={13} className="text-emerald-600" />
                      Verified Staff
                    </span>
                  </div>

                  <p className="mt-0.5 text-xs font-medium text-slate-500 sm:text-sm">
                    {jobTitle} •{" "}
                    <span className="text-slate-700 font-semibold">
                      {activeWorkspace?.name || "VexChat Workspace"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 sm:mb-2">
                <button
                  type="button"
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold shadow-md transition ${
                    isAvailable
                      ? "border-emerald-200/80 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100/70"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isAvailable ? "bg-emerald-500" : "bg-slate-400"
                    }`}
                  />
                  <span>{isAvailable ? "Available" : "Away"}</span>
                </button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-xl border border-white/20 bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xl transition hover:bg-black"
                >
                  {isSaving ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Save size={14} className="text-[#88da1c]" />
                  )}
                  <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                </motion.button>
              </div>
            </div>

            {/* Quick Status Pill Bar */}
            <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl border border-[#f1f3f5] bg-slate-50/80 p-2.5 text-xs text-slate-600 shadow-inner">
              <span className="flex items-center gap-1.5 font-medium text-slate-500 pl-1">
                <Sparkles size={13} className="text-amber-500" />
                Current Status:
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white bg-white px-2.5 py-1 font-semibold text-slate-800 shadow-sm">
                <span>{customStatusEmoji}</span>
                <span>{customStatus}</span>
              </span>

              <div className="flex-1" />

              <div className="flex items-center gap-1 overflow-x-auto">
                {STATUS_PRESETS.map((preset) => (
                  <button
                    key={preset.text}
                    type="button"
                    onClick={() => {
                      setCustomStatus(preset.text);
                      setCustomStatusEmoji(preset.emoji);
                      triggerToast(`Status set to: ${preset.text}`);
                    }}
                    className={`rounded-lg px-2 py-1 text-[11px] font-medium transition hover:bg-white hover:shadow-sm ${
                      customStatus === preset.text
                        ? "bg-white font-bold text-slate-900 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    {preset.emoji} {preset.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Metric Highlights Row ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-[#f1f3f5] bg-white p-4 shadow-lg transition hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Profile Health
              </span>
              <span className="text-xs font-bold text-emerald-600">
                {completionScore}%
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionScore}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-emerald-500"
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              {completionScore === 100
                ? "All essentials configured"
                : "Complete all sections for high security"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-[#f1f3f5] bg-white p-4 shadow-lg transition hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Account Role
              </span>
              <Shield size={14} className="text-emerald-600" />
            </div>
            <p className="mt-1 text-base sm:text-lg font-bold text-slate-900">
              {user?.role || "OWNER"}
            </p>
            <p className="text-[11px] text-slate-500">Full administrative access</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-[#f1f3f5] bg-white p-4 shadow-lg transition hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Workspaces
              </span>
              <Building size={14} className="text-blue-600" />
            </div>
            <p className="mt-1 text-base sm:text-lg font-bold text-slate-900">
              {workspaces.length} Connected
            </p>
            <p className="text-[11px] text-slate-500">
              Active: {activeWorkspace?.name || "Primary"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border border-[#f1f3f5] bg-white p-4 shadow-lg transition hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                MFA Protection
              </span>
              <Key size={14} className="text-indigo-600" />
            </div>
            <p className="mt-1 text-base sm:text-lg font-bold text-slate-900">
              {mfaEnabled ? "TOTP Active" : "Disabled"}
            </p>
            <p className="text-[11px] text-slate-500">
              {mfaEnabled ? "Hardware / Auth app" : "Recommended to enable"}
            </p>
          </motion.div>
        </div>

        {/* ─── Tabs Navigation Bar ───────────────────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-[#f1f3f5] bg-white p-1.5 shadow-lg">
          {(
            [
              { id: "overview", label: "General & Identity", icon: User },
              { id: "security", label: "Security & Sessions", icon: Shield },
              { id: "notifications", label: "Notifications & Alerts", icon: Bell },
              { id: "workspaces", label: "Workspaces & Teams", icon: Building },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                  isCurrent
                    ? "text-slate-900"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {isCurrent && (
                  <motion.div
                    layoutId="activeProfileTabIndicator"
                    className="absolute inset-0 rounded-xl bg-slate-100 shadow-inner"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon
                    size={15}
                    className={isCurrent ? "text-slate-900" : "text-slate-400"}
                  />
                  <span>{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* ─── Tab Content Panels ────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {/* TAB 1: GENERAL & IDENTITY */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Personal Details Card */}
              <div className="rounded-3xl border border-[#f1f3f5] bg-white p-6 sm:p-8 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Personal Information
                    </h2>
                    <p className="text-xs text-slate-500">
                      How your teammates, clients, and system logs recognize you
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                    User ID: {user?.id ? `${user.id.slice(0, 10)}...` : "admin_usr"}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Full Legal Name
                    </label>
                    <div className="mt-1.5 relative">
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full rounded-xl border border-[#eef1f6] bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 shadow-sm focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                      />
                      <User
                        size={15}
                        className="absolute right-3.5 top-3 text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Display / Chat Name
                    </label>
                    <div className="mt-1.5 relative">
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="John"
                        className="w-full rounded-xl border border-[#eef1f6] bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 shadow-sm focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                      />
                      <Sparkles
                        size={15}
                        className="absolute right-3.5 top-3 text-slate-400"
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Shown on shared inbox messages and customer notifications.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Work Email Address
                    </label>
                    <div className="mt-1.5 relative">
                      <input
                        type="email"
                        value={user?.email || "admin@vexchat.app"}
                        disabled
                        className="w-full rounded-xl border border-[#eef1f6] bg-slate-100/70 px-3.5 py-2.5 text-xs text-slate-500 shadow-inner cursor-not-allowed"
                      />
                      <Mail
                        size={15}
                        className="absolute right-3.5 top-3 text-slate-400"
                      />
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                      <CheckCircle2 size={12} />
                      Primary verified identity (contact workspace owner to update).
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      WhatsApp / Phone Number
                    </label>
                    <div className="mt-1.5 relative">
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+880 1712-345678"
                        className="w-full rounded-xl border border-[#eef1f6] bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 shadow-sm focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                      />
                      <Phone
                        size={15}
                        className="absolute right-3.5 top-3 text-slate-400"
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Used for emergency system escalations and 2FA recovery.
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Role / Position Title
                    </label>
                    <div className="mt-1.5 relative">
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g. Head of Customer Success"
                        className="w-full rounded-xl border border-[#eef1f6] bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 shadow-sm focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                      />
                      <Briefcase
                        size={15}
                        className="absolute right-3.5 top-3 text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Bio & Operational Scope
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Share a short note about your operational responsibilities..."
                      className="mt-1.5 w-full rounded-xl border border-[#eef1f6] bg-slate-50/50 p-3 text-xs text-slate-800 shadow-sm focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Regional & Timezone Preferences */}
              <div className="rounded-3xl border border-[#f1f3f5] bg-white p-6 sm:p-8 shadow-xl">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-base font-bold text-slate-900">
                    Regional & Time Configuration
                  </h2>
                  <p className="text-xs text-slate-500">
                    Ensures automated broadcast schedules and analytics align with your local working hours
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Primary Timezone
                    </label>
                    <div className="mt-1.5 relative">
                      <select
                        value={selectedTimezone}
                        onChange={(e) => setSelectedTimezone(e.target.value)}
                        className="w-full rounded-xl border border-[#eef1f6] bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 shadow-sm focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                      >
                        {TIMEZONES.map((tz) => (
                          <option key={tz.value} value={tz.value}>
                            {tz.label}
                          </option>
                        ))}
                      </select>
                      <Globe
                        size={15}
                        className="absolute right-3.5 top-3 text-slate-400 pointer-events-none"
                      />
                    </div>
                    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Clock size={12} className="text-slate-400" />
                      Calculated Local Time:{" "}
                      <span className="font-semibold text-slate-700">
                        {calculatedLocalTime}
                      </span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Language & Formats
                    </label>
                    <div className="mt-1.5 relative">
                      <select
                        defaultValue="en"
                        className="w-full rounded-xl border border-[#eef1f6] bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 shadow-sm focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                      >
                        <option value="en">English (US / International)</option>
                        <option value="bn">বাংলা (Bengali)</option>
                        <option value="ar">العربية (Arabic)</option>
                      </select>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Affects date formatting on campaign reporting cards.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: SECURITY & SESSIONS */}
          {activeTab === "security" && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Password Management */}
              <div className="rounded-3xl border border-[#f1f3f5] bg-white p-6 sm:p-8 shadow-xl">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-base font-bold text-slate-900">
                    Change Password
                  </h2>
                  <p className="text-xs text-slate-500">
                    Protect your administrative credentials with a high-entropy passphrase
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Current Password
                    </label>
                    <div className="mt-1.5 relative max-w-md">
                      <input
                        type={showCurrentPass ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your existing password"
                        className="w-full rounded-xl border border-[#eef1f6] bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 shadow-sm focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      New Secure Password
                    </label>
                    <div className="mt-1.5 relative">
                      <input
                        type={showNewPass ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        className="w-full rounded-xl border border-[#eef1f6] bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 shadow-sm focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Live Password Strength Meter */}
                    {newPassword.length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[10px] font-semibold">
                          <span className="text-slate-500">Password Strength</span>
                          <span
                            className={
                              passwordScore >= 75
                                ? "text-emerald-600"
                                : passwordScore >= 50
                                ? "text-amber-600"
                                : "text-rose-600"
                            }
                          >
                            {passwordScore >= 100
                              ? "Very Strong"
                              : passwordScore >= 75
                              ? "Strong"
                              : passwordScore >= 50
                              ? "Medium"
                              : "Weak"}
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full transition-all duration-300 ${
                              passwordScore >= 75
                                ? "bg-emerald-500"
                                : passwordScore >= 50
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${passwordScore}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Confirm New Password
                    </label>
                    <div className="mt-1.5 relative">
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full rounded-xl border border-[#eef1f6] bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 shadow-sm focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                      />
                      {confirmPassword.length > 0 && (
                        <div className="absolute right-3.5 top-2.5">
                          {passwordCriteria.match ? (
                            <CheckCircle2 size={16} className="text-emerald-600" />
                          ) : (
                            <AlertCircle size={16} className="text-rose-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Criteria Checklist */}
                  <div className="sm:col-span-2 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Complexity Requirements
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <span
                        className={`flex items-center gap-1.5 ${
                          passwordCriteria.length
                            ? "text-emerald-700 font-medium"
                            : "text-slate-400"
                        }`}
                      >
                        <Check size={13} /> 8+ Characters
                      </span>
                      <span
                        className={`flex items-center gap-1.5 ${
                          passwordCriteria.uppercase
                            ? "text-emerald-700 font-medium"
                            : "text-slate-400"
                        }`}
                      >
                        <Check size={13} /> Uppercase letter (A-Z)
                      </span>
                      <span
                        className={`flex items-center gap-1.5 ${
                          passwordCriteria.number
                            ? "text-emerald-700 font-medium"
                            : "text-slate-400"
                        }`}
                      >
                        <Check size={13} /> Numeric character (0-9)
                      </span>
                      <span
                        className={`flex items-center gap-1.5 ${
                          passwordCriteria.special
                            ? "text-emerald-700 font-medium"
                            : "text-slate-400"
                        }`}
                      >
                        <Check size={13} /> Special symbol (!@#$%^&*)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={isUpdatingPassword}
                    className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-black"
                  >
                    {isUpdatingPassword ? (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Lock size={14} className="text-[#88da1c]" />
                    )}
                    <span>{isUpdatingPassword ? "Updating..." : "Update Password"}</span>
                  </button>
                </div>
              </div>

              {/* Two-Factor Authentication (TOTP) */}
              <div className="rounded-3xl border border-[#f1f3f5] bg-white p-6 sm:p-8 shadow-xl">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-md">
                      <QrCode size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Two-Factor Authentication (TOTP)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Require a 6-digit verification code from Google Authenticator or 1Password
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMfaEnabled(!mfaEnabled);
                      triggerToast(
                        mfaEnabled
                          ? "2FA has been disabled"
                          : "2FA enrollment activated!"
                      );
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      mfaEnabled ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                        mfaEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={18} className="mt-0.5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        Zero-Trust Security Standard
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Platform admin sessions strictly mandate RFC 6238 TOTP authentication to prevent unauthorized token replays or credential leaks.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Sessions Tracker */}
              <div className="rounded-3xl border border-[#f1f3f5] bg-white p-6 sm:p-8 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Active Device Sessions
                    </h2>
                    <p className="text-xs text-slate-500">
                      Browsers and devices currently authorized to access your VexChat account
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSessions((prev) => prev.filter((s) => s.isCurrent));
                      triggerToast("All remote sessions revoked.");
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100"
                  >
                    <LogOut size={13} />
                    <span>Revoke Other Sessions</span>
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  {sessions.map((session) => {
                    const Icon = session.icon;
                    return (
                      <div
                        key={session.id}
                        className={`flex items-center justify-between rounded-2xl border p-4 transition ${
                          session.isCurrent
                            ? "border-emerald-200/80 bg-emerald-50/30 shadow-md"
                            : "border-slate-100 bg-slate-50/60 shadow-sm hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm">
                            <Icon size={18} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-slate-900">
                                {session.device}
                              </p>
                              {session.isCurrent && (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                  This Device
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-[11px] text-slate-500">
                              {session.location} • IP: {session.ip} •{" "}
                              <span className="font-medium text-slate-600">
                                {session.lastActive}
                              </span>
                            </p>
                          </div>
                        </div>

                        {!session.isCurrent && (
                          <button
                            type="button"
                            onClick={() => handleRevokeSession(session.id)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                            title="Revoke session"
                          >
                            <LogOut size={15} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: NOTIFICATIONS & PREFERENCES */}
          {activeTab === "notifications" && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="rounded-3xl border border-[#f1f3f5] bg-white p-6 sm:p-8 shadow-xl">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-base font-bold text-slate-900">
                    Operational Alerts & Notifications
                  </h2>
                  <p className="text-xs text-slate-500">
                    Customize which system activities trigger sound pings, email dispatches, and dashboard banners
                  </p>
                </div>

                <div className="mt-6 divide-y divide-slate-100">
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Inbound WhatsApp Customer Inquiries
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Notify instantly when a customer responds to an active support conversation
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setNotifications((p) => ({
                          ...p,
                          whatsappInbound: !p.whatsappInbound,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.whatsappInbound
                          ? "bg-emerald-500"
                          : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                          notifications.whatsappInbound
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Campaign Broadcast Delivery Reports
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Receive a completion summary when automated bulk WhatsApp broadcasts finish sending
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setNotifications((p) => ({
                          ...p,
                          campaignDeliveries: !p.campaignDeliveries,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.campaignDeliveries
                          ? "bg-emerald-500"
                          : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                          notifications.campaignDeliveries
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Meta WhatsApp Template Approvals
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Alert immediately when Meta Cloud API approves or flags a new WhatsApp template
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setNotifications((p) => ({
                          ...p,
                          templateApprovals: !p.templateApprovals,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.templateApprovals
                          ? "bg-emerald-500"
                          : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                          notifications.templateApprovals
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Weekly Analytics Digest Email
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Send a high-level summary of total conversations, messages, and agent response times every Monday
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setNotifications((p) => ({
                          ...p,
                          weeklyDigest: !p.weeklyDigest,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.weeklyDigest
                          ? "bg-emerald-500"
                          : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                          notifications.weeklyDigest
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Critical Security Alerts
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Alert when a new IP, device, or abnormal login attempt is detected on your account
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setNotifications((p) => ({
                          ...p,
                          securityAlerts: !p.securityAlerts,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.securityAlerts
                          ? "bg-emerald-500"
                          : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                          notifications.securityAlerts
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: WORKSPACES & TEAMS */}
          {activeTab === "workspaces" && (
            <motion.div
              key="workspaces"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="rounded-3xl border border-[#f1f3f5] bg-white p-6 sm:p-8 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Workspace Memberships
                    </h2>
                    <p className="text-xs text-slate-500">
                      Workspaces where you have active staff or administrative access
                    </p>
                  </div>
                  <Link href="/settings">
                    <button
                      type="button"
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
                    >
                      <span>Manage Workspaces</span>
                      <ChevronRight size={14} />
                    </button>
                  </Link>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {workspaces.map((ws) => {
                    const isSelected = ws.id === activeWorkspace?.id;
                    return (
                      <div
                        key={ws.id}
                        className={`relative rounded-2xl border p-5 transition ${
                          isSelected
                            ? "border-emerald-300 bg-emerald-50/20 shadow-md ring-1 ring-emerald-200"
                            : "border-slate-100 bg-white shadow-sm hover:border-slate-200 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 font-bold text-slate-700 shadow-sm">
                              {ws.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {ws.name}
                              </p>
                              <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                Role: {ws.role || "OWNER"}
                              </span>
                            </div>
                          </div>

                          {isSelected ? (
                            <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                              <Check size={12} /> Active
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={async () => {
                                await switchWorkspace(ws.id);
                                triggerToast(`Switched active workspace to ${ws.name}`);
                              }}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                            >
                              Switch
                            </button>
                          )}
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(ws.id, "Workspace ID")}
                            className="flex items-center gap-1 hover:text-slate-600"
                          >
                            <Copy size={11} /> ID: {ws.id.slice(0, 12)}...
                          </button>
                          <span>Joined {ws.joinedAt ? new Date(ws.joinedAt).toLocaleDateString() : "Active Member"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Floating Persistent Bottom Action Bar ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="sticky bottom-6 z-20 flex items-center justify-between rounded-2xl border border-white/80 bg-white/95 p-4 shadow-2xl backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-sm">
              <CheckCheck size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                Ready to sync your profile with VexChat?
              </p>
              <p className="text-[11px] text-slate-500">
                Updates are saved directly to the database and sync across your workspace in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (user) {
                  setFullName(user.name || "Administrator");
                  setDisplayName(user.name ? user.name.split(" ")[0] : "Admin");
                }
                triggerToast("Preferences restored to defaults.", "info");
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 shadow-sm"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-xl transition hover:bg-black"
            >
              {isSaving ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save size={14} className="text-[#88da1c]" />
              )}
              <span>{isSaving ? "Saving to Database..." : "Save Profile"}</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
