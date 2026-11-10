"use client";

import { useEffect, useState } from "react";
import {
  X,
  CalendarClock,
  Send,
  Pencil,
  Loader2,
  AlertCircle,
  Building2,
  BookOpen,
  Users,
  Check,
  Search,
} from "lucide-react";

import type {
  CampaignAudienceMode,
  CampaignItem,
  CreateCampaignPayload,
  UpdateCampaignPayload,
  WhatsAppAccountItem,
  WhatsAppContactItem,
  WhatsAppTemplateItem,
} from "@/src/types/api";
import { whatsappService } from "@/src/services/whatsapp-service";
import { templateService } from "@/src/services/template-service";
import { contactService } from "@/src/services/contact-service";
import { campaignService } from "@/src/services/campaign-service";

interface CampaignFormProps {
  workspaceId: string;
  campaign?: CampaignItem | null;
  onSave: (campaign: CampaignItem) => void;
  onClose: () => void;
}

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-slate-50 disabled:text-slate-400";

export default function CampaignForm({
  workspaceId,
  campaign,
  onSave,
  onClose,
}: CampaignFormProps) {
  const [name, setName] = useState(campaign?.name ?? "");
  const [description, setDescription] = useState(campaign?.description ?? "");
  const [whatsappAccountId, setWhatsappAccountId] = useState(
    campaign?.whatsappAccountId ?? "",
  );
  const [templateId, setTemplateId] = useState(campaign?.templateId ?? "");
  const [audienceMode, setAudienceMode] = useState<CampaignAudienceMode>(
    campaign?.audience?.mode ?? "ALL_CONTACTS",
  );
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>(
    campaign?.audience?.contactIds ?? [],
  );
  const [scheduledAt, setScheduledAt] = useState(
    campaign?.scheduledAt
      ? new Date(campaign.scheduledAt).toISOString().slice(0, 16)
      : "",
  );

  // Dynamic remote data
  const [accounts, setAccounts] = useState<WhatsAppAccountItem[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplateItem[]>([]);
  const [contacts, setContacts] = useState<WhatsAppContactItem[]>([]);
  const [totalContactsCount, setTotalContactsCount] = useState(0);
  const [contactSearch, setContactSearch] = useState("");

  const [isLoadingDependencies, setIsLoadingDependencies] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load WhatsApp accounts, approved templates, and contacts dynamically
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoadingDependencies(true);
      setError("");
      try {
        const [accs, tmplRes, cntRes] = await Promise.allSettled([
          whatsappService.getAccounts(workspaceId),
          templateService.getTemplates(workspaceId),
          contactService.listContacts({ workspaceId, limit: 100 }),
        ]);

        if (!isMounted) return;

        if (accs.status === "fulfilled") {
          setAccounts(accs.value);
          if (!whatsappAccountId && accs.value.length > 0) {
            const firstId = accs.value[0]._id || accs.value[0].id || "";
            setWhatsappAccountId(firstId);
          }
        }

        if (tmplRes.status === "fulfilled") {
          const list = tmplRes.value.templates ?? [];
          setTemplates(list);
          if (!templateId && list.length > 0) {
            const firstApproved =
              list.find((t) => t.status?.toUpperCase() === "APPROVED") ||
              list[0];
            setTemplateId(firstApproved._id || firstApproved.id || "");
          }
        }

        if (cntRes.status === "fulfilled") {
          setContacts(cntRes.value.contacts ?? []);
          setTotalContactsCount(
            cntRes.value.pagination?.total ?? cntRes.value.contacts?.length ?? 0,
          );
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load campaign requirements from server.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingDependencies(false);
        }
      }
    }

    if (workspaceId) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [workspaceId]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  function toggleContactSelection(id: string) {
    setSelectedContactIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  const filteredContacts = contacts.filter((c) => {
    if (!contactSearch.trim()) return true;
    const q = contactSearch.toLowerCase();
    return (
      c.phoneNumber?.toLowerCase().includes(q) ||
      c.profileName?.toLowerCase().includes(q)
    );
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please provide a campaign name.");
      return;
    }

    if (!whatsappAccountId) {
      setError("Please select a connected WhatsApp Business Account.");
      return;
    }

    if (!templateId) {
      setError("Please select a message template.");
      return;
    }

    if (audienceMode === "SELECTED_CONTACTS" && selectedContactIds.length === 0) {
      setError("Please select at least one contact for the audience.");
      return;
    }

    let isoScheduledDate: string | undefined = undefined;
    if (scheduledAt) {
      const scheduledTime = new Date(scheduledAt).getTime();
      if (isNaN(scheduledTime) || scheduledTime <= Date.now()) {
        setError("Please choose a valid schedule date in the future.");
        return;
      }
      isoScheduledDate = new Date(scheduledAt).toISOString();
    }

    setIsSubmitting(true);
    try {
      if (campaign) {
        // Update existing campaign
        const updatePayload: UpdateCampaignPayload = {
          name: name.trim(),
          description: description.trim(),
          whatsappAccountId,
          templateId,
          audience: {
            mode: audienceMode,
            contactIds:
              audienceMode === "SELECTED_CONTACTS"
                ? selectedContactIds
                : undefined,
          },
        };

        const res = await campaignService.updateCampaign(
          workspaceId,
          campaign.id,
          updatePayload,
        );

        let finalCampaign = res.campaign;

        if (isoScheduledDate) {
          const schedRes = await campaignService.scheduleCampaign(
            workspaceId,
            campaign.id,
            { scheduledAt: isoScheduledDate },
          );
          finalCampaign = schedRes.campaign;
        }

        onSave(finalCampaign);
      } else {
        // Create new campaign
        const createPayload: CreateCampaignPayload = {
          name: name.trim(),
          description: description.trim(),
          whatsappAccountId,
          templateId,
          audience: {
            mode: audienceMode,
            contactIds:
              audienceMode === "SELECTED_CONTACTS"
                ? selectedContactIds
                : undefined,
          },
        };

        const res = await campaignService.createCampaign(
          workspaceId,
          createPayload,
        );

        let finalCampaign = res.campaign;

        if (isoScheduledDate) {
          const schedRes = await campaignService.scheduleCampaign(
            workspaceId,
            finalCampaign.id,
            { scheduledAt: isoScheduledDate },
          );
          finalCampaign = schedRes.campaign;
        }

        onSave(finalCampaign);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save campaign. Please verify requirements and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="campaign-form-title"
        className="my-auto w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="campaign-form-title"
              className="text-lg font-bold text-slate-900"
            >
              {campaign ? "Edit Campaign" : "Create New Campaign"}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Configure a broadcast campaign via Meta WhatsApp Cloud API.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close campaign form"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        {/* Form Body */}
        {isLoadingDependencies ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <Loader2 size={32} className="animate-spin text-green-600" />
            <p className="text-sm font-medium text-slate-600">
              Loading WhatsApp accounts, templates and contacts...
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto space-y-4 p-5 sm:p-6"
          >
            {/* Campaign Name */}
            <div>
              <label
                htmlFor="campaign-name"
                className="text-sm font-semibold text-slate-700"
              >
                Campaign Name *
              </label>
              <input
                id="campaign-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g., Seasonal Flash Sale & Product Update"
                maxLength={100}
                required
                disabled={isSubmitting}
                className={inputClass}
              />
              <p className="mt-1 text-right text-xs text-slate-400">
                {name.length}/100
              </p>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="campaign-description"
                className="text-sm font-semibold text-slate-700"
              >
                Description
              </label>
              <textarea
                id="campaign-description"
                rows={2}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Brief internal note about this broadcast"
                maxLength={500}
                disabled={isSubmitting}
                className={inputClass}
              />
            </div>

            {/* WhatsApp Account Picker */}
            <div>
              <label
                htmlFor="whatsapp-account"
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-700"
              >
                <Building2 size={15} className="text-slate-400" />
                WhatsApp Business Account *
              </label>
              {accounts.length === 0 ? (
                <div className="mt-1.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  No active WhatsApp accounts found. Please connect your Meta
                  WhatsApp Business account first under Integrations.
                </div>
              ) : (
                <select
                  id="whatsapp-account"
                  value={whatsappAccountId}
                  onChange={(e) => setWhatsappAccountId(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className={inputClass}
                >
                  {accounts.map((acc) => {
                    const accId = acc._id || acc.id || "";
                    return (
                      <option key={accId} value={accId}>
                        {acc.businessName || "WhatsApp Account"} (
                        {acc.displayPhoneNumber || acc.phoneNumberId})
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {/* Template Picker */}
            <div>
              <label
                htmlFor="campaign-template"
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-700"
              >
                <BookOpen size={15} className="text-slate-400" />
                Message Template *
              </label>
              {templates.length === 0 ? (
                <div className="mt-1.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  No approved templates available. Please create or sync message
                  templates with Meta before launching campaigns.
                </div>
              ) : (
                <select
                  id="campaign-template"
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className={inputClass}
                >
                  {templates.map((tmpl) => (
                    <option
                      key={tmpl._id || tmpl.id}
                      value={tmpl._id || tmpl.id}
                    >
                      {tmpl.name} ({tmpl.language}) - {tmpl.status}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Audience Picker */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <Users size={15} className="text-slate-400" />
                Audience Mode *
              </label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAudienceMode("ALL_CONTACTS")}
                  className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${audienceMode === "ALL_CONTACTS"
                      ? "border-green-600 bg-green-50/50 ring-2 ring-green-100"
                      : "border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  <span className="text-sm font-bold text-slate-900">
                    All Contacts
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    Broadcasts to all {totalContactsCount} workspace contacts
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAudienceMode("SELECTED_CONTACTS")}
                  className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${audienceMode === "SELECTED_CONTACTS"
                      ? "border-green-600 bg-green-50/50 ring-2 ring-green-100"
                      : "border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  <span className="text-sm font-bold text-slate-900">
                    Selected Contacts
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    Choose specific recipients ({selectedContactIds.length} chosen)
                  </span>
                </button>
              </div>

              {/* Selected Contacts Sub-list */}
              {audienceMode === "SELECTED_CONTACTS" && (
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                  <div className="relative">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={contactSearch}
                      onChange={(e) => setContactSearch(e.target.value)}
                      placeholder="Search contacts..."
                      className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs outline-none focus:border-green-500"
                    />
                  </div>

                  <div className="max-h-36 overflow-y-auto space-y-1 divide-y divide-slate-100">
                    {filteredContacts.map((c) => {
                      const isChecked = selectedContactIds.includes(c._id);
                      return (
                        <div
                          key={c._id}
                          onClick={() => toggleContactSelection(c._id)}
                          className="flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer hover:bg-white text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-800">
                              {c.profileName || "Unknown"}
                            </span>
                            <span className="ml-2 text-slate-500">
                              {c.phoneNumber}
                            </span>
                          </div>
                          <div
                            className={`flex h-4 w-4 items-center justify-center rounded border ${isChecked
                                ? "border-green-600 bg-green-600 text-white"
                                : "border-slate-300"
                              }`}
                          >
                            {isChecked && <Check size={12} />}
                          </div>
                        </div>
                      );
                    })}
                    {filteredContacts.length === 0 && (
                      <p className="py-2 text-center text-xs text-slate-400">
                        No contacts found.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Schedule Option */}
            <div>
              <label
                htmlFor="campaign-schedule"
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-700"
              >
                <CalendarClock size={15} className="text-slate-400" />
                Schedule Execution (Optional)
              </label>

              <input
                id="campaign-schedule"
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                disabled={isSubmitting}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-400">
                Leave empty to keep as a DRAFT and launch manually when ready.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : campaign ? (
                  <>
                    <Pencil size={16} />
                    Update Campaign
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Create Campaign
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
