"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Loader2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useWorkspace } from "@/src/context/workspace-context";
import { ApiClientError } from "@/src/lib/api-client";

export default function EmptyWorkspaceView() {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { createWorkspace } = useWorkspace();

  const trimmedLength = name.trim().length;
  const isTooShort = trimmedLength > 0 && trimmedLength < 2;
  const isTooLong = trimmedLength > 100;
  const isSubmitDisabled = isLoading || trimmedLength < 2 || isTooLong;

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 2) {
      setErrorMessage("Workspace name must be at least 2 characters.");
      return;
    }

    if (cleanName.length > 100) {
      setErrorMessage("Workspace name cannot exceed 100 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await createWorkspace(cleanName);
      setName("");
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(
          "An unexpected error occurred while creating workspace.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-140px)] w-full items-center justify-center overflow-hidden px-4 py-12">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 -z-10 h-80 w-80 rounded-full bg-emerald-500/10 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg rounded-2xl  border-slate-200/80 bg-white/90 p-8 shadow-lg shadow-slate-200 backdrop-blur-md ring-1 ring-slate-900/5 sm:p-10"
      >
        {/* Header section */}
        <div className="flex items-start justify-between  border-slate-100 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20">
              <Briefcase className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Create Workspace
              </h1>
              <p className="text-xs font-medium text-slate-500">
                VexChat Organization Setup
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50/80 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Step 1 of 1</span>
          </div>
        </div>

        {/* Content intro */}
        <div className="mt-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Welcome to your new hub</span>
          </div>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
            Name your workspace
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            This will be the shared space for your WhatsApp campaigns, unified
            inboxes, contact lists, and team operations.
          </p>
        </div>

        {/* Error notification */}
        <AnimatePresence mode="wait">
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              role="alert"
              className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs font-medium text-rose-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="leading-5">{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form controls */}
        <form onSubmit={handleCreate} className="mt-6 space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="initial-workspace-name"
                className="text-xs font-semibold uppercase tracking-wider text-slate-600"
              >
                Workspace Name
              </label>
              <span
                className={`text-[11px] font-medium transition-colors ${
                  isTooLong
                    ? "text-rose-600"
                    : isTooShort
                      ? "text-amber-600"
                      : "text-slate-400"
                }`}
              >
                {trimmedLength}/100
              </span>
            </div>

            <div className="relative">
              <input
                id="initial-workspace-name"
                type="text"
                required
                autoFocus
                disabled={isLoading}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="e.g. Acme Corp Operations"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-70"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Pick your company, agency, or team name. You can update this
              anytime.
            </p>
          </div>

          {/* Action button */}
          <motion.button
            whileHover={!isSubmitDisabled ? { scale: 1.01 } : {}}
            whileTap={!isSubmitDisabled ? { scale: 0.985 } : {}}
            type="submit"
            disabled={isSubmitDisabled}
            className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-slate-900/10 transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Creating workspace...</span>
              </>
            ) : (
              <>
                <span>Continue to Dashboard</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
