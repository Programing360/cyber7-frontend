"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Download,
  Edit3,
  Loader2,
  Mail,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import DashboardLayout from "@/src/component/dashboard/dashboard-layout";
import { useWorkspace } from "@/src/context/workspace-context";
import { contactService } from "@/src/services/contact-service";
import { ApiClientError } from "@/src/lib/api-client";
import type { WhatsAppContactItem, CreateWhatsAppContactInput } from "@/src/types/api";

// ─── Inline Add/Edit Form ─────────────────────────────────────────────────────

interface ContactFormProps {
  contact?: WhatsAppContactItem;
  onSave: (input: CreateWhatsAppContactInput) => void;
  onClose: () => void;
  isSaving: boolean;
}

function ContactForm({ contact, onSave, onClose, isSaving }: ContactFormProps) {
  const [phone, setPhone] = useState(contact?.phoneNumber ?? "");
  const [name, setName] = useState(contact?.profileName ?? "");
  const [error, setError] = useState("");

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    if (!/^[+\d][\d\s()-]{4,19}$/.test(phone.trim())) {
      setError("Please enter a valid phone number (e.g. +8801XXXXXXXXX).");
      return;
    }

    setError("");
    onSave({
      phoneNumber: phone.trim(),
      profileName: name.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-form-title"
        className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="contact-form-title"
              className="text-lg font-bold text-slate-900"
            >
              {contact ? "Edit contact" : "Add new contact"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {contact
                ? "Update contact information."
                : "Add a WhatsApp contact to this workspace."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close form"
            disabled={isSaving}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Phone number *
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+8801XXXXXXXXX"
              className={inputClass}
              autoFocus
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Name (optional)
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contact display name"
              className={inputClass}
              disabled={isSaving}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              {isSaving && <Loader2 size={15} className="animate-spin" />}
              {contact ? "Save changes" : "Add contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Avatar colours ───────────────────────────────────────────────────────────

const avatarColors = [
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-pink-100 text-pink-700",
];

function getInitials(name?: string, phone?: string): string {
  if (name && name.trim()) {
    return name
      .trim()
      .split(" ")
      .map((p) => p[0] ?? "")
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  if (phone) {
    return phone.replace(/\D/g, "").slice(-2);
  }
  return "?";
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ContactsPage() {
  const { activeWorkspace } = useWorkspace();

  const [contacts, setContacts] = useState<WhatsAppContactItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<
    WhatsAppContactItem | undefined
  >();
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WhatsAppContactItem | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [notice, setNotice] = useState("");

  // ── Fetch contacts from backend ───────────────────────────────────────────

  const fetchContacts = useCallback(async () => {
    if (!activeWorkspace?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await contactService.listContacts({
        workspaceId: activeWorkspace.id,
        limit: 200,
      });
      setContacts(result.contacts);
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Failed to load contacts. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace?.id]);

  // Fetch on mount and whenever the active workspace changes
  useEffect(() => {
    setContacts([]);
    setSearch("");
    setError(null);
    fetchContacts();
  }, [fetchContacts]);

  // ── Filtered view ─────────────────────────────────────────────────────────

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return contacts;
    return contacts.filter((c) =>
      [c.profileName ?? "", c.phoneNumber, c.waId].some((v) =>
        v.toLowerCase().includes(query),
      ),
    );
  }, [contacts, search]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function openAddForm() {
    setEditingContact(undefined);
    setFormOpen(true);
  }

  function openEditForm(contact: WhatsAppContactItem) {
    setEditingContact(contact);
    setFormOpen(true);
  }

  async function handleSave(input: CreateWhatsAppContactInput) {
    if (!activeWorkspace?.id) return;

    const contactBeingEdited = editingContact;
    setIsSaving(true);
    try {
      const saved = contactBeingEdited
        ? await contactService.updateContact(
            activeWorkspace.id,
            contactBeingEdited._id,
            input,
          )
        : await contactService.createContact(activeWorkspace.id, input);

      // Upsert in local list
      setContacts((prev) => {
        const idx = prev.findIndex((c) => c._id === saved._id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });

      setNotice(
        contactBeingEdited
          ? "Contact updated successfully."
          : "Contact added successfully.",
      );
      setFormOpen(false);
      setEditingContact(undefined);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) {
        setNotice("Error: This contact no longer exists. The list has been refreshed.");
        setFormOpen(false);
        setEditingContact(undefined);
        await fetchContacts();
      } else {
        const message =
          err instanceof ApiClientError ? err.message : "Failed to save contact.";
        setNotice(`Error: ${message}`);
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!activeWorkspace?.id || !deleteTarget) return;

    const target = deleteTarget;
    setIsDeleting(true);
    try {
      await contactService.deleteContact(activeWorkspace.id, target._id);
      setContacts((prev) => prev.filter((c) => c._id !== target._id));
      setNotice("Contact deleted successfully.");
      setDeleteTarget(null);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) {
        setContacts((prev) => prev.filter((c) => c._id !== target._id));
        setNotice("Error: This contact no longer exists. The list has been refreshed.");
        setDeleteTarget(null);
        await fetchContacts();
      } else {
        const message =
          err instanceof ApiClientError
            ? err.message
            : "Failed to delete contact.";
        setNotice(`Error: ${message}`);
      }
    } finally {
      setIsDeleting(false);
    }
  }

  function exportContacts() {
    const headers = ["Name", "Phone", "WhatsApp ID", "Created"];
    const rows = filteredContacts.map((c) => [
      c.profileName ?? "",
      c.phoneNumber,
      c.waId,
      formatDate(c.createdAt),
    ]);

    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [headers, ...rows]
      .map((row) => row.map(escape).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cyber7-contacts.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (!activeWorkspace) {
    return (
      <DashboardLayout>
        <main className="min-h-full bg-[#f8fafc] p-4 sm:p-6 lg:p-8">
          <div className="mx-auto flex max-w-lg flex-col items-center justify-center py-24 text-center">
            <Users size={40} className="text-slate-300" />
            <h2 className="mt-4 text-lg font-semibold text-slate-700">
              No workspace selected
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Select a workspace to view contacts.
            </p>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <main className="min-h-full bg-[#f8fafc] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Page header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Users size={16} />
                <span>Workspace</span>
                <span>/</span>
                <span>Contacts</span>
              </div>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Contacts
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Manage your WhatsApp contacts and organize customer segments.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={fetchContacts}
                disabled={isLoading}
                title="Refresh contacts"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={isLoading ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={exportContacts}
                disabled={contacts.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <Download size={17} />
                Export CSV
              </button>

              <button
                type="button"
                onClick={openAddForm}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#88da1c] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
              >
                <Plus size={18} />
                Add Contact
              </button>
            </div>
          </div>

          {/* Notice */}
          {notice && (
            <div
              role="status"
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
                notice.startsWith("Error:")
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-green-200 bg-green-50 text-green-800"
              }`}
            >
              <span>{notice}</span>
              <button
                type="button"
                onClick={() => setNotice("")}
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-red-600"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">
                  Failed to load contacts
                </p>
                <p className="mt-1 text-xs text-red-700">{error}</p>
              </div>
              <button
                type="button"
                onClick={fetchContacts}
                className="shrink-0 text-xs font-semibold text-red-700 hover:text-red-900"
              >
                Retry
              </button>
            </div>
          )}

          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              {
                title: "Total Contacts",
                value: contacts.length,
                detail: "Synced from WhatsApp",
                icon: Users,
                iconClass: "bg-blue-50 text-blue-600",
              },
              {
                title: "With Names",
                value: contacts.filter((c) => c.profileName).length,
                detail: "Have a profile name",
                icon: UserCheck,
                iconClass: "bg-green-50 text-green-600",
              },
              {
                title: "Filtered",
                value: filteredContacts.length,
                detail: search ? `Matching "${search}"` : "Showing all",
                icon: UserPlus,
                iconClass: "bg-violet-50 text-violet-600",
              },
            ].map((stat) => {
              const Icon = stat.icon;

              return (
                <div key={stat.title} className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {stat.title}
                      </p>
                      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                        {stat.value}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        {stat.detail}
                      </p>
                    </div>

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconClass}`}
                    >
                      <Icon size={21} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contact table */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 shadow-lg p-4 sm:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    All Contacts
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {filteredContacts.length} contact
                    {filteredContacts.length === 1 ? "" : "s"} found
                  </p>
                </div>

                <div className="relative min-w-0 sm:min-w-[280px]">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or phone..."
                    aria-label="Search contacts"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </div>
            </div>

            {/* Loading skeleton */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 size={32} className="animate-spin" />
                <p className="mt-3 text-sm font-medium">Loading contacts…</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Contact
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        WhatsApp ID
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Added
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredContacts.map((contact, index) => (
                      <tr
                        key={contact._id}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                avatarColors[index % avatarColors.length]
                              }`}
                            >
                              {getInitials(contact.profileName, contact.phoneNumber)}
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900">
                                {contact.profileName || (
                                  <span className="italic text-slate-400">
                                    No name
                                  </span>
                                )}
                              </p>
                              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                <Mail size={12} />
                                {contact.phoneNumber}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {contact.waId || "—"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {formatDate(contact.createdAt)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEditForm(contact)}
                              aria-label={`Edit ${contact.profileName || contact.phoneNumber}`}
                              title="Edit contact"
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Edit3 size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteTarget(contact)}
                              aria-label={`Delete ${contact.profileName || contact.phoneNumber}`}
                              title="Delete contact"
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setNotice(
                                  "Additional actions coming soon.",
                                )
                              }
                              aria-label="More actions"
                              title="More actions"
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                            >
                              <MoreHorizontal size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredContacts.length === 0 && !isLoading && (
                      <tr>
                        <td colSpan={4} className="px-5 py-16 text-center">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <Search size={21} />
                          </div>
                          <p className="mt-3 font-semibold text-slate-800">
                            {contacts.length === 0
                              ? "No contacts yet"
                              : "No contacts found"}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {contacts.length === 0
                              ? "Contacts appear here when customers message your WhatsApp number, or you can add them manually."
                              : "Try a different search term."}
                          </p>
                          {search && (
                            <button
                              type="button"
                              onClick={() => setSearch("")}
                              className="mt-4 text-sm font-semibold text-green-700 hover:text-green-800"
                            >
                              Clear search
                            </button>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {filteredContacts.length} of {contacts.length} contacts
              </span>
              <span>
                Workspace: {activeWorkspace.name}
              </span>
            </div>
          </section>
        </div>
      </main>

      {formOpen && (
        <ContactForm
          contact={editingContact}
          onSave={handleSave}
          onClose={() => {
            if (!isSaving) {
              setFormOpen(false);
              setEditingContact(undefined);
            }
          }}
          isSaving={isSaving}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-contact-title"
            className="my-auto w-full max-w-md rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2
                  id="delete-contact-title"
                  className="text-lg font-bold text-slate-900"
                >
                  Delete contact
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  This action cannot be undone.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                aria-label="Close dialog"
                disabled={isDeleting}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              <p className="text-sm text-slate-600">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-900">
                  {deleteTarget.profileName || deleteTarget.phoneNumber}
                </span>
                ?
              </p>

              <div className="mt-5 flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {isDeleting && <Loader2 size={15} className="animate-spin" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
