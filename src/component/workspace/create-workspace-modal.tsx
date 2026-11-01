"use client";

import { useState } from "react";
import { Briefcase, Loader2, X } from "lucide-react";
import { useWorkspace } from "@/src/context/workspace-context";
import { ApiClientError } from "@/src/lib/api-client";

interface CreateWorkspaceModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateWorkspaceModal({
  open,
  onClose,
}: CreateWorkspaceModalProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { createWorkspace } = useWorkspace();

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
      onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Create Workspace
              </h2>
              <p className="text-xs text-slate-500">
                Set up a new workspace for your organization
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700"
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="workspace-name"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              Workspace Name
            </label>
            <input
              id="workspace-name"
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

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              {isLoading ? "Creating..." : "Create Workspace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
