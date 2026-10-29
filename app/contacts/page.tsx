"use client";

import { useMemo, useState } from "react";
import {
  Contact as ContactIcon,
  Download,
  Edit3,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Users,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";

import DashboardLayout from "@/src/component/dashboard/dashboard-layout";

import { Contact, initialContacts } from "@/src/data/mock/contacts";
import ContactForm from "@/src/component/contacts/contact-form";

type StatusFilter = "All" | "Active" | "Inactive";

const avatarColors = [
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-pink-100 text-pink-700",
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [tagFilter, setTagFilter] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>();
  const [notice, setNotice] = useState("");

  const allTags = useMemo(
    () => [...new Set(contacts.flatMap((contact) => contact.tags))].sort(),
    [contacts],
  );

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return contacts.filter((contact) => {
      const matchesSearch =
        !query ||
        [
          contact.name,
          contact.phone,
          contact.email,
          contact.company,
          ...contact.tags,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All" || contact.status === statusFilter;

      const matchesTag =
        tagFilter === "All" || contact.tags.includes(tagFilter);

      return matchesSearch && matchesStatus && matchesTag;
    });
  }, [contacts, search, statusFilter, tagFilter]);

  const activeCount = contacts.filter(
    (contact) => contact.status === "Active",
  ).length;

  const newCount = contacts.filter((contact) =>
    contact.tags.includes("New"),
  ).length;

  function openAddForm() {
    setEditingContact(undefined);
    setFormOpen(true);
  }

  function openEditForm(contact: Contact) {
    setEditingContact(contact);
    setFormOpen(true);
  }

  function handleSave(contact: Contact) {
    const exists = contacts.some((item) => item.id === contact.id);

    if (exists) {
      setContacts((current) =>
        current.map((item) => (item.id === contact.id ? contact : item)),
      );
      setNotice("Contact updated successfully.");
    } else {
      setContacts((current) => [contact, ...current]);
      setNotice("Contact added successfully.");
    }

    setFormOpen(false);
    setEditingContact(undefined);
  }

  function handleDelete(contact: Contact) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${contact.name}?`,
    );

    if (!confirmed) return;

    setContacts((current) => current.filter((item) => item.id !== contact.id));

    setNotice("Contact deleted from this demo.");
  }

  function exportContacts() {
    const headers = [
      "Name",
      "Phone",
      "Email",
      "Company",
      "Tags",
      "Status",
      "Created At",
    ];

    const rows = filteredContacts.map((contact) => [
      contact.name,
      contact.phone,
      contact.email,
      contact.company,
      contact.tags.join("; "),
      contact.status,
      contact.createdAt,
    ]);

    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "cyber7-contacts-demo.csv";
    link.click();

    URL.revokeObjectURL(url);
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
                onClick={exportContacts}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Download size={17} />
                Export CSV
              </button>

              <button
                type="button"
                onClick={openAddForm}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
              >
                <Plus size={18} />
                Add Contact
              </button>
            </div>
          </div>

          {/* Demo notice */}
          {/* <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <ContactIcon size={18} className="mt-0.5 shrink-0 text-amber-700" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Demo workspace
              </p>
              <p className="mt-1 text-xs leading-5 text-amber-800">
                Contacts use sample data. Changes are kept in page state only
                and are not saved to MongoDB or synced with WhatsApp.
              </p>
            </div>
          </div> */}

          {/* Success notice */}
          {notice && (
            <div
              role="status"
              className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
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

          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              {
                title: "Total Contacts",
                value: contacts.length,
                detail: "Contacts in this demo",
                icon: Users,
                iconClass: "bg-blue-50 text-blue-600",
              },
              {
                title: "Active Contacts",
                value: activeCount,
                detail: "Marked as active",
                icon: UserCheck,
                iconClass: "bg-green-50 text-green-600",
              },
              {
                title: "New Contacts",
                value: newCount,
                detail: "Tagged as New",
                icon: UserPlus,
                iconClass: "bg-violet-50 text-violet-600",
              },
            ].map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-2xl bg-white p-5 shadow-sm"
                >
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

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative min-w-0 sm:min-w-[250px]">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search contacts..."
                      aria-label="Search contacts"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value as StatusFilter)
                    }
                    aria-label="Filter by status"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500"
                  >
                    <option value="All">All statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>

                  <select
                    value={tagFilter}
                    onChange={(event) => setTagFilter(event.target.value)}
                    aria-label="Filter by tag"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500"
                  >
                    <option value="All">All tags</option>
                    {allTags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Contact
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Company
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Tags
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Created
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredContacts.map((contact, index) => (
                    <tr
                      key={contact.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              avatarColors[index % avatarColors.length]
                            }`}
                          >
                            {contact.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900">
                              {contact.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {contact.phone}
                            </p>
                            {contact.email && (
                              <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                                <Mail size={12} />
                                {contact.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {contact.company || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex max-w-[200px] flex-wrap gap-1.5">
                          {contact.tags.length ? (
                            contact.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            contact.status === "Active"
                              ? "bg-green-50 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              contact.status === "Active"
                                ? "bg-green-500"
                                : "bg-slate-400"
                            }`}
                          />
                          {contact.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {contact.createdAt}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditForm(contact)}
                            aria-label={`Edit ${contact.name}`}
                            title="Edit contact"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(contact)}
                            aria-label={`Delete ${contact.name}`}
                            title="Delete contact"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setNotice(
                                `${contact.name}: additional actions are not configured in this demo.`,
                              )
                            }
                            aria-label={`More actions for ${contact.name}`}
                            title="More actions"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredContacts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <Search size={21} />
                        </div>
                        <p className="mt-3 font-semibold text-slate-800">
                          No contacts found
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Try another search term or change your filters.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSearch("");
                            setStatusFilter("All");
                            setTagFilter("All");
                          }}
                          className="mt-4 text-sm font-semibold text-green-700 hover:text-green-800"
                        >
                          Clear filters
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {filteredContacts.length} of {contacts.length} contacts
              </span>
              {/* <span>Demo data · Not connected to MongoDB</span> */}
            </div>
          </section>
        </div>
      </main>

      {formOpen && (
        <ContactForm
          contact={editingContact}
          onSave={handleSave}
          onClose={() => {
            setFormOpen(false);
            setEditingContact(undefined);
          }}
        />
      )}
    </DashboardLayout>
  );
}
