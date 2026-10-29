"use client";

import { useState } from "react";
import { Contact } from "@/src/data/mock/contacts";
import { X } from "lucide-react";

interface ContactFormProps {
  contact?: Contact;
  onSave: (contact: Contact) => void;
  onClose: () => void;
}

export default function ContactForm({
  contact,
  onSave,
  onClose,
}: ContactFormProps) {
  const [name, setName] = useState(contact?.name ?? "");
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [email, setEmail] = useState(contact?.email ?? "");
  const [company, setCompany] = useState(contact?.company ?? "");
  const [tags, setTags] = useState(contact?.tags.join(", ") ?? "");
  const [status, setStatus] = useState<Contact["status"]>(
    contact?.status ?? "Active",
  );
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !phone.trim()) {
      setError("Name and phone number are required.");
      return;
    }

    if (!/^[+\d][\d\s()-]{6,19}$/.test(phone.trim())) {
      setError("Please enter a valid phone number.");
      return;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    const updatedContact: Contact = {
      id: contact?.id ?? `contact-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      company: company.trim(),
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      status,
      createdAt: contact?.createdAt ?? new Date().toISOString().slice(0, 10),
    };

    onSave(updatedContact);
  }

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100";

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
              Contact information for your demo workspace
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close form"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Full name *
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter full name"
              className={inputClass}
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Phone number *
            </label>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+8801XXXXXXXXX"
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Company
            </label>
            <input
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="Company name"
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Tags</label>
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="Customer, VIP, Lead"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-400">
              Separate multiple tags with commas.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Status</label>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as Contact["status"])
              }
              className={inputClass}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
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
              className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
            >
              {contact ? "Save changes" : "Add contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
