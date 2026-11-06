"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  Mail,
  Shield,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

type LoginStep = "CREDENTIALS" | "OTP_CHALLENGE";

export default function PlatformAdminLoginPage() {
  const router = useRouter();

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  // Email OTP Flow States
  const [step, setStep] = useState<LoginStep>("CREDENTIALS");
  const [challengeToken, setChallengeToken] = useState("");

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  // ১. প্রাথমিক লগইন সাবমিট (ইমেইল + পাসওয়ার্ড)
  const handlePrimaryLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResendStatus(null);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Invalid administrator credentials");
      }

      // ইমেইল ওটিপি স্ক্রিনে রূপান্তর
      if (
        result.code === "EMAIL_OTP_REQUIRED" ||
        result.code === "MFA_CHALLENGE_REQUIRED" ||
        result.data?.challengeToken
      ) {
        setChallengeToken(result.data.challengeToken);
        setStep("OTP_CHALLENGE");
        return;
      }

      // সরাসরি লগইন সফল হলে (যদি 2FA বন্ধ থাকে)
      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  // ২. ইমেইলের ৬ ডিজিট OTP ভেরিফাই করে সেশন তৈরি
  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          challengeToken,
          otp: otp.trim(),
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(
          result.message || "Invalid or expired verification code",
        );
      }

      // সেশন সফল -> ড্যাশবোর্ডে প্রবেশ
      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // ৩. পুনরায় OTP পাঠানোর রিকোয়েস্ট
  const handleResendOtp = async () => {
    if (!challengeToken) return;
    setLoading(true);
    setError(null);
    setResendStatus(null);

    try {
      const res = await fetch("/api/admin/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ challengeToken }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to resend code");
      }

      setResendStatus("A new 6-digit code has been sent to your email.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b0f19] px-4 py-12 text-slate-200">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#88da1c] text-slate-950 shadow-lg shadow-[#88da1c]/20">
            <Shield size={28} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            VexChat Platform Admin
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Dedicated Platform Administration Gateway
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 flex items-start gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-200">
            <ShieldAlert size={16} className="text-rose-400 mt-0.5 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Resend Success Banner */}
        {resendStatus && (
          <div className="mb-6 flex items-start gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-200">
            <ShieldCheck
              size={16}
              className="text-emerald-400 mt-0.5 shrink-0"
            />
            <span className="font-medium">{resendStatus}</span>
          </div>
        )}

        {/* Auth Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md">
          {/* STEP 1: Email & Password */}
          {step === "CREDENTIALS" && (
            <form onSubmit={handlePrimaryLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@cyber7.io"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-10 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#88da1c] focus:outline-hidden focus:ring-1 focus:ring-[#88da1c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-10 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#88da1c] focus:outline-hidden focus:ring-1 focus:ring-[#88da1c]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#88da1c] py-2.5 text-xs font-bold text-slate-950 shadow-md transition hover:bg-[#78c418] disabled:opacity-50"
              >
                <span>
                  {loading ? "Verifying Credentials..." : "Authenticate"}
                </span>
                <ArrowRight size={14} />
              </button>
            </form>
          )}

          {/* STEP 2: Email OTP Input Screen */}
          {step === "OTP_CHALLENGE" && (
            <form onSubmit={handleOtpVerify} className="space-y-4">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-200">
                <div className="flex items-center gap-2 font-bold mb-1 text-emerald-300">
                  <Mail size={16} className="text-[#88da1c]" />
                  <span>Check Your Inbox</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-4">
                  A 6-digit one-time login code was sent to{" "}
                  <strong>{email}</strong>. Enter the code below to complete
                  sign-in.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] text-[#88da1c] focus:border-[#88da1c] focus:outline-hidden focus:ring-1 focus:ring-[#88da1c]"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#88da1c] py-2.5 text-xs font-bold text-slate-950 shadow-md transition hover:bg-[#78c418] disabled:opacity-50"
              >
                <span>
                  {loading ? "Verifying Code..." : "Verify & Access Console"}
                </span>
                <ArrowRight size={14} />
              </button>

              <div className="flex justify-between items-center pt-2 text-[11px]">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleResendOtp}
                  className="inline-flex items-center gap-1 text-[#88da1c] hover:underline disabled:opacity-50"
                >
                  <RotateCcw size={11} />
                  <span>Resend Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("CREDENTIALS");
                    setOtp("");
                    setError(null);
                    setResendStatus(null);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  Change Email
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 border-t border-slate-800/80 pt-4 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
            >
              <ArrowLeft size={12} />
              <span>Return to Customer Workspace</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
