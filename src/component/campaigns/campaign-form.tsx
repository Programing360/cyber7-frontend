"use client";

import { useEffect, useState } from "react";
import { X, CalendarClock, Send, Pencil } from "lucide-react";

import { Campaign, CampaignStatus } from "@/src/data/mock/campaigns";

interface CampaignFormProps {
  campaign?: Campaign;
  onSave: (campaign: Campaign) => void;
  onClose: () => void;
}

const audiences = [
  "All Customers",
  "New Leads",
  "VIP Customers",
  "Recent Buyers",
  "New Customers",
];

const templates = [
  "monthly_special_offer",
  "new_product_announcement",
  "vip_customer_rewards",
  "customer_feedback",
  "weekend_promotion",
  "welcome_message",
];

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100";

function getRecipients(audience: string): number {
  switch (audience) {
    case "All Customers":
      return 1200;
    case "New Leads":
      return 450;
    case "VIP Customers":
      return 180;
    case "Recent Buyers":
      return 320;
    case "New Customers":
      return 150;
    default:
      return 0;
  }
}

export default function CampaignForm({
  campaign,
  onSave,
  onClose,
}: CampaignFormProps) {
  const [name, setName] = useState(campaign?.name ?? "");
  const [description, setDescription] = useState(campaign?.description ?? "");
  const [templateName, setTemplateName] = useState(
    campaign?.templateName ?? templates[0],
  );
  const [audience, setAudience] = useState(campaign?.audience ?? audiences[0]);
  const [scheduledAt, setScheduledAt] = useState(campaign?.scheduledAt ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter a campaign name.");
      return;
    }

    if (name.trim().length > 100) {
      setError("Campaign name must be 100 characters or fewer.");
      return;
    }

    if (!templateName) {
      setError("Please select a message template.");
      return;
    }

    if (!audience) {
      setError("Please select an audience.");
      return;
    }

    if (
      scheduledAt &&
      (!Number.isFinite(new Date(scheduledAt).getTime()) ||
        new Date(scheduledAt).getTime() <= Date.now())
    ) {
      setError("Please select a valid future schedule time.");
      return;
    }

    if (campaign && campaign.status !== "Draft") {
      setError("Only draft campaigns can be edited.");
      return;
    }

    const status: CampaignStatus = scheduledAt ? "Scheduled" : "Draft";

    const updatedCampaign: Campaign = {
      id: campaign?.id ?? `campaign-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      templateName,
      audience,
      recipients: getRecipients(audience),
      status,
      scheduledAt,
      // Preserve existing date metadata when editing.
      // New campaign timestamps should come from the backend.
      createdAt: campaign?.createdAt ?? "",
      sent: campaign?.sent ?? 0,
      delivered: campaign?.delivered ?? 0,
      read: campaign?.read ?? 0,
      failed: campaign?.failed ?? 0,
    };

    onSave(updatedCampaign);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="campaign-form-title"
        className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="campaign-form-title"
              className="text-lg font-bold text-slate-900"
            >
              {campaign ? "Edit Campaign" : "Create Campaign"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Configure a WhatsApp campaign for your audience.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close campaign form"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
          <div>
            <label
              htmlFor="campaign-name"
              className="text-sm font-medium text-slate-700"
            >
              Campaign name *
            </label>

            <input
              id="campaign-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. November Special Offer"
              maxLength={100}
              required
              className={inputClass}
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {name.length}/100
            </p>
          </div>

          <div>
            <label
              htmlFor="campaign-description"
              className="text-sm font-medium text-slate-700"
            >
              Description
            </label>

            <textarea
              id="campaign-description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is this campaign about?"
              maxLength={500}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="campaign-template"
              className="text-sm font-medium text-slate-700"
            >
              WhatsApp template *
            </label>

            <select
              id="campaign-template"
              value={templateName}
              onChange={(event) => setTemplateName(event.target.value)}
              required
              className={inputClass}
            >
              {templates.map((template) => (
                <option key={template} value={template}>
                  {template.replaceAll("_", " ")}
                </option>
              ))}
            </select>

            <p className="mt-1.5 text-xs text-slate-400">
              Demo templates. Production templates will load from the backend.
            </p>
          </div>

          <div>
            <label
              htmlFor="campaign-audience"
              className="text-sm font-medium text-slate-700"
            >
              Target audience *
            </label>

            <select
              id="campaign-audience"
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
              required
              className={inputClass}
            >
              {audiences.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-3">
              <span className="text-sm text-slate-500">
                Estimated recipients
              </span>

              <span className="text-sm font-bold text-slate-900">
                {getRecipients(audience).toLocaleString()}
              </span>
            </div>

            <p className="mt-1.5 text-xs text-slate-400">
              Illustrative demo counts, not live contact totals.
            </p>
          </div>

          <div>
            <label
              htmlFor="campaign-schedule"
              className="text-sm font-medium text-slate-700"
            >
              Schedule date and time
            </label>

            <div className="relative">
              <CalendarClock
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="campaign-schedule"
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                className={`${inputClass} pl-10`}
              />
            </div>

            <p className="mt-1.5 text-xs text-slate-400">
              Leave empty to save the campaign as a draft.
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs leading-5 text-amber-800">
              Demo mode: this form does not send messages or schedule background
              jobs. The backend must validate the schedule, audience, template
              approval and business permissions before a real campaign can be
              created.
            </p>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              {campaign ? <Pencil size={16} /> : <Send size={16} />}

              {campaign ? "Save Changes" : "Create Campaign"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
