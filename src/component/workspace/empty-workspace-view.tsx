"use client";

import { useState } from "react";
import { Briefcase, Loader2, Plus, ShieldCheck } from "lucide-react";
import { useWorkspace } from "@/src/context/workspace-context";
import { ApiClientError } from "@/src/lib/api-client";

export default function EmptyWorkspaceView() {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { createWorkspace } = useWorkspace();

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
        setErrorMessage("An unexpected error occurred while creating workspace.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
            <Briefcase size={26} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Create Your Workspace
            </h1>
            <p className="text-xs text-slate-500">
              Cyber7 Multi-Tenant Environment
            </p>
          </div>
        </div>

        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
          <ShieldCheck size={15} />
          First-time Setup
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Welcome to Cyber7
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          To start managing your WhatsApp business communication, contacts, and team members, create your initial organization workspace.
        </p>

        {errorMessage && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs leading-5 text-red-700"
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleCreate} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="initial-workspace-name"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              Workspace Name
            </label>
            <input
              id="initial-workspace-name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corporation"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
            />
            <p className="mt-1.5 text-[11px] text-slate-400">
              Between 2 and 100 characters.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Creating workspace...</span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <span>Create Workspace & Continue</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
