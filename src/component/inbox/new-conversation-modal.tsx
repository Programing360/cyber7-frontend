"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Loader2,
  Phone,
  Plus,
  Search,
  User,
  Users,
  X,
} from "lucide-react";
import { contactService } from "@/src/services/contact-service";
import { conversationService } from "@/src/services/conversation-service";
import type {
  WhatsAppContactItem,
  WhatsAppConversationItem,
} from "@/src/types/api";

interface NewConversationModalProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
  onConversationCreated: (conversation: WhatsAppConversationItem) => void;
}

export default function NewConversationModal({
  workspaceId,
  isOpen,
  onClose,
  onConversationCreated,
}: NewConversationModalProps) {
  const [tab, setTab] = useState<"contacts" | "number">("contacts");

  // Contacts tab state
  const [contacts, setContacts] = useState<WhatsAppContactItem[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [contactSearch, setContactSearch] = useState("");

  // Number tab state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profileName, setProfileName] = useState("");

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch contacts when modal opens on contacts tab
  useEffect(() => {
    if (isOpen && workspaceId) {
      setError(null);
      setIsLoadingContacts(true);
      contactService
        .listContacts({ workspaceId, limit: 100 })
        .then((res) => {
          setContacts(res.contacts);
        })
        .catch(() => {
          setContacts([]);
        })
        .finally(() => {
          setIsLoadingContacts(false);
        });
    }
  }, [isOpen, workspaceId]);

  if (!isOpen) return null;

  const filteredContacts = contacts.filter((c) => {
    if (!contactSearch.trim()) return true;
    const term = contactSearch.toLowerCase();
    const name = (c.profileName || "").toLowerCase();
    const phone = c.phoneNumber || "";
    return name.includes(term) || phone.includes(term);
  });

  async function handleStartWithContact(contact: WhatsAppContactItem) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const conv = await conversationService.createConversation({
        workspaceId,
        contactId: contact._id,
      });
      onConversationCreated(conv);
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to start conversation. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStartWithNumber(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedPhone = phoneNumber.trim();
    if (!trimmedPhone) {
      setError("Please enter a WhatsApp phone number.");
      return;
    }

    if (!/^[+\d][\d\s()-]{5,20}$/.test(trimmedPhone)) {
      setError("Please enter a valid phone number (e.g. +8801XXXXXXXXX).");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const conv = await conversationService.createConversation({
        workspaceId,
        phoneNumber: trimmedPhone,
        profileName: profileName.trim() || undefined,
      });
      onConversationCreated(conv);
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to start conversation. Please verify the WhatsApp account is connected.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-conv-title"
        className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 id="new-conv-title" className="text-lg font-bold text-slate-900">
              New Conversation
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Start a WhatsApp chat with a contact or phone number.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            disabled={isSubmitting}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
          >
            <X size={19} />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-100 px-6 pt-3">
          <button
            type="button"
            onClick={() => {
              setTab("contacts");
              setError(null);
            }}
            className={`flex items-center gap-1.5 border-b-2 pb-2.5 text-xs font-semibold transition ${tab === "contacts"
                ? "border-green-600 text-green-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
          >
            <Users size={14} />
            <span>Select Contact</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab("number");
              setError(null);
            }}
            className={`ml-6 flex items-center gap-1.5 border-b-2 pb-2.5 text-xs font-semibold transition ${tab === "number"
                ? "border-green-600 text-green-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
          >
            <Phone size={14} />
            <span>Enter Phone Number</span>
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mx-6 mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
            <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-600" />
            <p className="flex-1">{error}</p>
          </div>
        )}

        {/* Tab 1: Existing Contacts */}
        {tab === "contacts" && (
          <div className="p-5 sm:p-6">
            <div className="mb-3 flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
              <Search size={16} className="text-slate-400" />
              <input
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                placeholder="Search contacts by name or phone..."
                className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="max-h-64 min-h-[160px] overflow-y-auto rounded-xl border border-slate-100">
              {isLoadingContacts ? (
                <div className="flex h-36 items-center justify-center text-slate-400">
                  <Loader2 size={24} className="animate-spin" />
                  <span className="ml-2 text-xs">Loading contacts…</span>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="flex h-36 flex-col items-center justify-center p-4 text-center text-slate-400">
                  <User size={28} className="text-slate-300" />
                  <p className="mt-2 text-xs font-medium text-slate-600">
                    {contacts.length === 0
                      ? "No contacts in this workspace yet."
                      : "No matching contacts found."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setTab("number")}
                    className="mt-2 text-xs font-semibold text-green-600 hover:underline"
                  >
                    Enter phone number directly →
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredContacts.map((contact) => (
                    <button
                      key={contact._id}
                      type="button"
                      onClick={() => handleStartWithContact(contact)}
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-between p-3 text-left transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {contact.profileName || "Unnamed Contact"}
                        </p>
                        <p className="text-xs text-slate-500">{contact.phoneNumber}</p>
                      </div>
                      <span className="ml-2 inline-flex items-center rounded-lg bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700">
                        Chat
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Direct Phone Number */}
        {tab === "number" && (
          <form onSubmit={handleStartWithNumber} className="space-y-4 p-5 sm:p-6">
            <div>
              <label className="text-xs font-semibold text-slate-700">
                WhatsApp Phone Number *
              </label>
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+8801XXXXXXXXX"
                autoFocus
                disabled={isSubmitting}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Enter phone with country code (e.g. +880 for Bangladesh, +1 for US).
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">
                Contact Name (optional)
              </label>
              <input
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Customer or contact name"
                disabled={isSubmitting}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !phoneNumber.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 size={13} className="animate-spin" />}
                <span>Start Chat</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

