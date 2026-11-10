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
  CheckCircle2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/src/context/auth-context";
import { ApiClientError } from "@/src/lib/api-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { login } = useAuth();
  const router = useRouter();

  // console.log(user);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);
    try {
      const loggedInUser = await login({
        email: cleanEmail,
        password,
      });

      console.log("Authenticated User:", loggedInUser);
      console.log("Platform Role:", loggedInUser.platformRole);

      if (loggedInUser?.platformRole === "SUPER_ADMIN") {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "An unexpected error occurred during sign-in. Please try again.",
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
        <section className="relative hidden rounded-r-4xl shadow-lg shadow-gray-600 lg:col-span-5 lg:flex flex-col justify-between overflow-hidden bg-slate-900 p-12 text-white xl:col-span-6 ">
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
              {/* <Sparkles size={14} /> */}
              Enterprise WhatsApp Business API
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white xl:text-5xl xl:leading-tight">
              Scale your customer communication effortlessly.
            </h1>

            <p className="text-base text-slate-300 leading-relaxed">
              Connect with thousands of customers, automate marketing workflows,
              and manage team inboxes from a single unified workspace.
            </p>

            {/* Value Proposition List */}
            <ul className="space-y-3.5 pt-2 text-sm text-slate-200">
              {[
                "Multi-agent shared team inbox",
                "Official Meta WhatsApp API integration",
                "Broadcast campaigns & automated workflows",
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 size={16} />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* Testimonial Badge / Floating Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-full border-2 border-slate-900 bg-emerald-600 text-xs font-bold flex items-center justify-center text-white">
                    A
                  </div>
                  <div className="h-8 w-8 rounded-full border-2 border-slate-900 bg-blue-600 text-xs font-bold flex items-center justify-center text-white">
                    S
                  </div>
                  <div className="h-8 w-8 rounded-full border-2 border-slate-900 bg-indigo-600 text-xs font-bold flex items-center justify-center text-white">
                    M
                  </div>
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-white">
                    Trusted by 2,000+ businesses
                  </p>
                  <p className="text-slate-400">99.9% uptime guaranteed</p>
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
              <Link href="/terms" className="hover:text-slate-200 transition">
                Terms
              </Link>
            </div>
          </div>
        </section>

        {/* ================= RIGHT SIDE: Form Section ================= */}
        <section className="flex lg:col-span-7 xl:col-span-6 flex-col justify-between p-6 sm:p-12 lg:p-16 bg-[#ffffff] min-h-screen">
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
              className="ml-auto inline-flex items-center gap-2 rounded-xl shadow-lg shadow-slate-300 border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              aria-label="Back to home"
            >
              <ArrowLeft size={14} />
              Back to Home
            </Link>
          </div>

          {/* Main Form Container */}
          <div className="mx-auto w-full max-w-md my-auto py-8 shadow-2xl p-10 rounded-4xl shadow-[#1c2c52]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
              <ShieldCheck size={14} />
              Secure Enterprise Login
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Enter your credentials to access your VexChat dashboard workspace.
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
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-800"
                >
                  Work Email Address
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
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-800"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setErrorMessage(
                        "Password reset email has been sent if the account exists.",
                      )
                    }
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
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

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Remember me on this device
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in to Dashboard</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-8 text-center text-sm text-slate-600">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Create an account
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
