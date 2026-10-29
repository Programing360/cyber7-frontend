"use client";

import { useEffect, useState } from "react";
import { Eye, MessageCircle, X } from "lucide-react";

import {
  MessageTemplate,
  TemplateCategory,
  TemplateStatus,
} from "@/src/data/mock/templates";

interface TemplateFormProps {
  template?: MessageTemplate;
  onSave: (template: MessageTemplate) => void;
  onClose: () => void;
}

const categories: TemplateCategory[] = [
  "Marketing",
  "Utility",
  "Authentication",
];

const languages = ["English", "Bengali"];

function getVariables(body: string) {
  return Array.from(new Set(body.match(/\{\{\d+\}\}/g) ?? [])).sort((a, b) => {
    const first = Number(a.replace(/\D/g, ""));
    const second = Number(b.replace(/\D/g, ""));
    return first - second;
  });
}

export default function TemplateForm({
  template,
  onSave,
  onClose,
}: TemplateFormProps) {
  const [name, setName] = useState(template?.name ?? "");
  const [category, setCategory] = useState<TemplateCategory>(
    template?.category ?? "Marketing",
  );
  const [language, setLanguage] = useState(template?.language ?? "English");
  const [body, setBody] = useState(template?.body ?? "");
  const [footer, setFooter] = useState(template?.footer ?? "");
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState("");

  const variables = getVariables(body);

  useEffect(() => {
    if (!showPreview) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowPreview(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [showPreview]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!/^[a-z0-9_]+$/.test(name)) {
      setError(
        "Use lowercase letters, numbers and underscores in the template name.",
      );
      return;
    }

    if (name.length > 512) {
      setError("Template name is too long.");
      return;
    }

    if (!body.trim()) {
      setError("Message body is required.");
      return;
    }

    if (body.length > 1024) {
      setError("Message body must be 1024 characters or fewer.");
      return;
    }

    if (footer.length > 60) {
      setError("Footer must be 60 characters or fewer.");
      return;
    }

    const now = new Date().toISOString().slice(0, 10);

    const updatedTemplate: MessageTemplate = {
      id: template?.id ?? `template-${Date.now()}`,
      name,
      category,
      language,
      status:
        template?.status === "Approved"
          ? "Pending"
          : ((template?.status ?? "Draft") as TemplateStatus),
      body: body.trim(),
      footer: footer.trim(),
      variables,
      createdAt: template?.createdAt ?? now,
      updatedAt: now,
    };

    onSave(updatedTemplate);
  };

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100";

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="template-form-title"
          className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h2
                id="template-form-title"
                className="text-lg font-bold text-slate-900"
              >
                {template ? "Edit template" : "Create template"}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Create a reusable WhatsApp message template.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close template form"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={19} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Template name *
              </label>

              <input
                value={name}
                onChange={(event) => setName(event.target.value.toLowerCase())}
                placeholder="welcome_customer"
                className={inputClass}
              />

              <p className="mt-1.5 text-xs text-slate-400">
                Use lowercase letters, numbers and underscores.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as TemplateCategory)
                  }
                  className={inputClass}
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Language
                </label>

                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className={inputClass}
                >
                  {languages.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-slate-700">
                  Message body *
                </label>

                <span className="text-xs text-slate-400">
                  {body.length}/1024
                </span>
              </div>

              <textarea
                rows={6}
                maxLength={1024}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Hello {{1}}, welcome to our service!"
                className={inputClass}
              />

              <p className="mt-1.5 text-xs leading-5 text-slate-400">
                Use variables like {"{{1}}"} and {"{{2}}"} for dynamic values.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-slate-700">
                  Footer (optional)
                </label>

                <span className="text-xs text-slate-400">
                  {footer.length}/60
                </span>
              </div>

              <input
                value={footer}
                onChange={(event) => setFooter(event.target.value)}
                maxLength={60}
                placeholder="Thank you for choosing us."
                className={inputClass}
              />
            </div>

            {variables.length > 0 && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-900">
                  Dynamic variables
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {variables.map((variable) => (
                    <span
                      key={variable}
                      className="rounded-lg border border-blue-200 bg-white px-2.5 py-1.5 text-xs font-medium text-blue-700"
                    >
                      {variable}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs leading-5 text-amber-800">
                Demo mode: saving this template does not submit it to Meta for
                approval. Actual submission requires WhatsApp Cloud API
                integration.
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
                onClick={() => setShowPreview(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Eye size={16} />
                Preview
              </button>

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
                {template ? "Save changes" : "Create template"}
              </button>
            </div>
          </form>
        </section>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="template-preview-title"
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <MessageCircle size={18} className="text-green-600" />
                <h3
                  id="template-preview-title"
                  className="text-sm font-bold text-slate-900"
                >
                  Message preview
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowPreview(false)}
                aria-label="Close preview"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-[#e8f5e9] p-4">
              <div className="ml-auto max-w-[95%] rounded-xl rounded-tr-sm bg-white p-3 shadow-sm">
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">
                  {body.replace(/\{\{\d+\}\}/g, (variable) => {
                    const number = Number(variable.replace(/\D/g, ""));
                    return `Sample ${number}`;
                  })}
                </p>

                {footer.trim() && (
                  <p className="mt-2 border-t border-slate-100 pt-2 text-xs text-slate-500">
                    {footer}
                  </p>
                )}

                <p className="mt-2 text-right text-[10px] text-slate-400">
                  10:30 AM
                </p>
              </div>
            </div>

            <div className="p-4">
              <p className="text-xs leading-5 text-slate-500">
                This is a visual preview with sample variable values, not a real
                WhatsApp message.
              </p>

              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="mt-4 w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
              >
                Close preview
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
