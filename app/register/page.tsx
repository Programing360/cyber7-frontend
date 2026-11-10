"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  User,
  CheckCircle2,
  Sparkles,
  Loader2,
  KeyRound,
} from "lucide-react";
import { useAuth } from "@/src/context/auth-context";
import { ApiClientError } from "@/src/lib/api-client";

export default function RegisterPage() {
  const [step, setStep] = useState<"form" | "otp">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { setSession } = useAuth() as any; // auth context-এ সেশন আপডেট করার মেথড
  const router = useRouter();

  // ফোন নম্বর ভ্যালিডেশন রেজেক্স (বাংলাদেশি এবং ইন্টারন্যাশনাল ফরম্যাট)
  const phoneRegex = /^(?:\+8801|8801|01)[3-9]\d{8}$/;

  // ধাপ ১: ফরম সাবমিট এবং ব্যাকএন্ডে ওটিপি রিকোয়েস্ট পাঠানো
  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phoneNumber.trim();

    if (!cleanName || cleanName.length < 2) {
      setErrorMessage("Full name must be at least 2 characters.");
      return;
    }

    if (!cleanEmail) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!phoneRegex.test(cleanPhone)) {
      setErrorMessage(
        "Please enter a valid phone number (e.g., 017XXXXXXXX or +8801XXXXXXXXX).",
      );
      return;
    }

    if (!password || password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify and try again.");
      return;
    }

    setIsLoading(true);
    try {
      // ব্যাকএন্ডের নতুন রুট: /api/auth/register/request
      const res = await fetch("/api/auth/register/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          phoneNumber: cleanPhone,
          password,
        }),
      });

      const data = await res.json();
      console.log(data);

      if (!res.ok) {
        throw new Error(data.message || "Failed to send verification OTP.");
      }

      setSuccessMessage(
        data.message ||
          "A 6-digit verification code has been sent to your email.",
      );
      setStep("otp");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  // ওটিপি রিসেন্ড হ্যান্ডলার
  async function handleResendOtp() {
    if (!email.trim() || isLoading) return;
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/auth/register/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to resend verification OTP.");
      }

      setSuccessMessage(
        "A fresh verification code has been sent to your email.",
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Failed to resend code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  // ধাপ ২: ওটিপি যাচাই করে ড্যাশবোর্ডে প্রবেশ
  async function handleVerifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!otp || otp.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    try {
      // ব্যাকএন্ডের নতুন রুট: /api/auth/register/verify-otp
      const verifyRes = await fetch("/api/auth/register/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp }),
      });

      const result = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(result.message || "Invalid or expired OTP code.");
      }

      // টোকেন লোকালস্টোরেজ বা সেশনে সেট করা
      if (!result.data?.accessToken || !result.data?.user) {
        throw new Error("Invalid OTP verification response.");
      }

      setSession(result.data.user, result.data.accessToken);

      router.replace("/dashboard");
    } catch (error: unknown) {
      if (error instanceof ApiClientError || error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("OTP verification failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen w-full bg-slate-50 font-sans text-slate-900">
      <div className="grid w-full grid-cols-1 lg:grid-cols-12">
        {/* ================= LEFT SIDE: Hero & Branding ================= */}
        <section
          className="relative hidden lg:col-span-5 lg:flex flex-col justify-between overflow-hidden bg-slate-900 p-12 text-white xl:col-span-6
         rounded-r-4xl shadow-lg shadow-gray-600"
        >
          <div className="absolute inset-0 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-emerald-600/30 blur-3xl" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20">
              <MessageCircle size={24} className="fill-current" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">
                VexChat
              </span>
              <span className="ml-2 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                v2.0
              </span>
            </div>
          </div>

          <div className="relative z-10 my-auto max-w-lg space-y-8 py-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-300 backdrop-blur-sm">
              <Sparkles size={14} />
              Start Your Free 7-Day Trial
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white xl:text-5xl xl:leading-tight">
              Transform your customer support with WhatsApp.
            </h1>

            <p className="text-base text-slate-300 leading-relaxed">
              Join thousands of fast-growing businesses automating chats,
              managing leads, and scaling support with VexChat.
            </p>

            <ul className="space-y-3.5 pt-2 text-sm text-slate-200">
              {[
                "Instant setup with Meta WhatsApp Cloud API",
                "Email OTP Verification for high security",
                "7-Day unrestricted free trial on all features",
                "Full team collaboration & shared inbox access",
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 size={16} />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck size={22} />
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-white">
                    Bank-Grade Security
                  </p>
                  <p className="text-slate-400">
                    Encrypted authentication with verified credentials
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-slate-400">
            <p>© VexChat Inc. All rights reserved.</p>
            <div className="flex gap-4">
              <Link
                href="/privacy-policy"
                className="hover:text-slate-200 transition"
              >
                Privacy
              </Link>
              <Link
                href="/terms-of-service"
                className="hover:text-slate-200 transition"
              >
                Terms
              </Link>
            </div>
          </div>
        </section>

        {/* ================= RIGHT SIDE: Form Section ================= */}
        <section className="flex lg:col-span-7 xl:col-span-6 flex-col justify-between p-6 sm:p-12 lg:p-16 bg-white min-h-screen">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <MessageCircle size={22} />
              </div>
              <span className="text-lg font-bold text-slate-900">VexChat</span>
            </Link>

            <Link
              href="/"
              className="ml-auto inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              aria-label="Back to home"
            >
              <ArrowLeft size={14} />
              Back to Home
            </Link>
          </div>

          <div className="mx-auto w-full max-w-md my-auto py-8 rounded-4xl p-6 sm:p-8 bg-white shadow-2xl shadow-[#0f172b] mt-10 md:mt-0">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
              <ShieldCheck size={14} />
              {step === "form"
                ? "Create Workspace Account"
                : "Verify Email OTP"}
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {step === "form"
                ? "Get started with VexChat"
                : "Enter Verification Code"}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {step === "form"
                ? "Start your 7-day free trial. No credit card required."
                : `We have sent a 6-digit code to ${email}. Please enter it below.`}
            </p>

            {/* Error Message Box */}
            {errorMessage && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <div className="shrink-0 pt-0.5">⚠️</div>
                <div className="flex-1 leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {/* Success Message Box */}
            {successMessage && step === "otp" && (
              <div
                role="status"
                className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
              >
                <div className="shrink-0 pt-0.5">✅</div>
                <div className="flex-1 leading-relaxed">{successMessage}</div>
              </div>
            )}

            {/* STEP 1: Registration Form */}
            {step === "form" && (
              <form onSubmit={handleFormSubmit} className="mt-8 space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-slate-800"
                  >
                    Full name
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <User size={18} />
                    </div>
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="MD Limon"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-600/10"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-800"
                  >
                    Work email address
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Mail size={18} />
                    </div>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-600/10"
                    />
                  </div>
                </div>

                {/* Phone Number Field */}
                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-slate-800"
                  >
                    Phone number
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Phone size={18} />
                    </div>
                    <input
                      id="phoneNumber"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-600/10"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-800"
                  >
                    Password
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-600/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-slate-800"
                  >
                    Confirm password
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-600/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-70 mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Verification</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: OTP Verification Form */}
            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="mt-8 space-y-5">
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-slate-800"
                  >
                    6-Digit Verification Code
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <KeyRound size={18} />
                    </div>
                    <input
                      id="otp"
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="123456"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-10 pr-4 text-center tracking-widest text-lg font-bold text-slate-900 transition placeholder:text-slate-300 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-600/10"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2  rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Verifying & Setting up Trial...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Access Dashboard</span>
                      <CheckCircle2 size={18} />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("form")}
                    className="text-slate-500 hover:text-slate-800 underline transition"
                  >
                    ← Edit Information
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleResendOtp}
                    className="text-emerald-600 font-semibold hover:underline disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="block lg:hidden border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
            <p>© VexChat. All rights reserved.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
