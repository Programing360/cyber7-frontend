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
  ShieldCheck,
  User,
  CheckCircle2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/src/context/auth-context";
import { ApiClientError } from "@/src/lib/api-client";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { register } = useAuth();
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName || cleanName.length < 2) {
      setErrorMessage("Full name must be at least 2 characters.");
      return;
    }

    if (cleanName.length > 100) {
      setErrorMessage("Full name cannot exceed 100 characters.");
      return;
    }

    if (!cleanEmail) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password.length > 72) {
      setErrorMessage("Password cannot exceed 72 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify and try again.");
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: cleanName,
        email: cleanEmail,
        password,
      });
      router.push("/dashboard");
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "An unexpected error occurred during account creation. Please try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen w-full bg-slate-50 font-sans text-slate-900">
      <div className="grid w-full grid-cols-1 lg:grid-cols-12">
        {/* ================= LEFT SIDE: Hero & Branding ================= */}
        <section className="relative hidden lg:col-span-5 lg:flex flex-col justify-between overflow-hidden bg-slate-900 p-12 text-white xl:col-span-6">
          {/* Background Decorative Gradients & Grid Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-emerald-600/30 blur-3xl" />
          {/* <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-green-500/20 blur-3xl" /> */}

          {/* Top Brand Header */}
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

          {/* Center Content & Feature Highlights */}
          <div className="relative z-10 my-auto max-w-lg space-y-8 py-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-300 backdrop-blur-sm">
              <Sparkles size={14} />
              Start Your Free 14-Day Trial
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white xl:text-5xl xl:leading-tight">
              Transform your customer support with WhatsApp.
            </h1>

            <p className="text-base text-slate-300 leading-relaxed">
              Join thousands of fast-growing businesses automating chats,
              managing leads, and scaling support with VexChat.
            </p>

            {/* Value Proposition List */}
            <ul className="space-y-3.5 pt-2 text-sm text-slate-200">
              {[
                "Instant setup with Meta WhatsApp Cloud API",
                "No credit card required to get started",
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

            {/* Testimonial / Security Card */}
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
                    End-to-end encrypted messaging infrastructure
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer Information */}
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
          {/* Top Bar Navigation */}
          <div className="flex items-center justify-between">
            {/* Mobile Brand View */}
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

          {/* Main Form Container with requested custom shadow styling */}
          <div className="mx-auto w-full max-w-md my-auto py-8 border rounded-4xl p-6 sm:p-8 bg-white shadow-2xl shadow-[#0f172b]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
              <ShieldCheck size={14} />
              Create Workspace Account
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Get started with VexChat
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Create your account to start managing your WhatsApp business
              communication.
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {/* Full Name Input */}
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
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-600/10"
                  />
                </div>
              </div>

              {/* Email Input */}
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

              {/* Password Input */}
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
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
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
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-70 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create account</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Login Link Prompt */}
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

          {/* Footer for Mobile / Small Screens */}
          <div className="block lg:hidden border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
            <p>© VexChat. All rights reserved.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
