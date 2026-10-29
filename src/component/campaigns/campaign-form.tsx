"use client";

import { useState } from "react";
import { X, CalendarClock } from "lucide-react";
import { Campaign, CampaignStatus } from "@/src/data/mock/campaigns";

interface CampaignFormProps {
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

export default function CampaignForm({ onSave, onClose }: CampaignFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [templateName, setTemplateName] = useState(templates[0]);
  const [audience, setAudience] = useState(audiences[0]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Please enter a campaign name.");
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

    if (scheduledAt && new Date(scheduledAt).getTime() <= Date.now()) {
      setError("Please select a future schedule time.");
      return;
    }

    const status: CampaignStatus = scheduledAt ? "Scheduled" : "Draft";

    const campaign: Campaign = {
      id: `campaign-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      templateName,
      audience,
      recipients:
        audience === "All Customers"
          ? 1200
          : audience === "VIP Customers"
            ? 180
            : audience === "New Leads"
              ? 450
              : audience === "Recent Buyers"
                ? 320
                : 150,
      status,
      scheduledAt,
      createdAt: new Date().toISOString().slice(0, 10),
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0,
    };

    onSave(campaign);
  }

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4">
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
              Create Campaign
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
            <label className="text-sm font-medium text-slate-700">
              Campaign name *
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. November Special Offer"
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is this campaign about?"
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              WhatsApp template *
            </label>
            <select
              value={templateName}
              onChange={(event) => setTemplateName(event.target.value)}
              className={inputClass}
            >
              {templates.map((template) => (
                <option key={template} value={template}>
                  {template.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Target audience *
            </label>
            <select
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
              className={inputClass}
            >
              {audiences.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <p className="mt-1.5 text-xs text-slate-400">
              Recipient counts are sample data for this demo.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Schedule date and time
            </label>

            <div className="relative">
              <CalendarClock
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
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
              Demo only: creating or scheduling a campaign will not send
              messages to WhatsApp. Actual sending requires a backend and
              configured Meta WhatsApp Cloud API.
            </p>
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
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              Create Campaign
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
