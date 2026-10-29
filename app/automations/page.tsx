"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  GitBranch,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Power,
  Search,
  Settings2,
  Sparkles,
  Tag,
  Trash2,
  Users,
  X,
  Zap,
} from "lucide-react";

import DashboardLayout from "@/src/component/dashboard/dashboard-layout";

import {
  Automation,
  AutomationAction,
  AutomationStatus,
  AutomationTrigger,
  initialAutomations,
} from "@/src/data/mock/automations";

const triggers: AutomationTrigger[] = [
  "Incoming Message",
  "Keyword Match",
  "New Contact",
  "No Reply",
  "Order Received",
];

const actions: AutomationAction[] = [
  "Send Message",
  "Assign Agent",
  "Add Tag",
  "Notify Team",
  "Send Template",
];

const triggerDescriptions: Record<AutomationTrigger, string> = {
  "Incoming Message": "Runs when a customer sends a message.",
  "Keyword Match": "Runs when a message contains a matching keyword.",
  "New Contact": "Runs when a new contact is created.",
  "No Reply": "Runs when a conversation remains unanswered.",
  "Order Received": "Runs when a new order is received.",
};

const actionIcons: Record<AutomationAction, typeof MessageSquare> = {
  "Send Message": MessageSquare,
  "Assign Agent": Users,
  "Add Tag": Tag,
  "Notify Team": Activity,
  "Send Template": Sparkles,
};

const emptyForm = {
  name: "",
  description: "",
  trigger: "Incoming Message" as AutomationTrigger,
  condition: "",
  action: "Send Message" as AutomationAction,
  actionValue: "",
};

type AutomationForm = typeof emptyForm;

export default function AutomationsPage() {
  const [automations, setAutomations] =
    useState<Automation[]>(initialAutomations);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | AutomationStatus>(
    "All",
  );

  const [showBuilder, setShowBuilder] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState<AutomationForm>(emptyForm);

  const filteredAutomations = useMemo(() => {
    const query = search.toLowerCase().trim();

    return automations.filter((automation) => {
      const matchesSearch =
        automation.name.toLowerCase().includes(query) ||
        automation.description.toLowerCase().includes(query) ||
        automation.trigger.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || automation.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [automations, search, statusFilter]);

  const activeCount = automations.filter(
    (automation) => automation.status === "Active",
  ).length;

  const totalExecutions = automations.reduce(
    (total, automation) => total + automation.executions,
    0,
  );

  const updateForm = <K extends keyof AutomationForm>(
    key: K,
    value: AutomationForm[K],
  ) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowBuilder(true);
    setMenuId(null);
  };

  const openEdit = (automation: Automation) => {
    setEditingId(automation.id);

    setForm({
      name: automation.name,
      description: automation.description,
      trigger: automation.trigger,
      condition: automation.condition,
      action: automation.action,
      actionValue: automation.actionValue,
    });

    setShowBuilder(true);
    setMenuId(null);
  };

  const closeBuilder = () => {
    setShowBuilder(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      setNotice("Please enter an automation name.");
      return;
    }

    if (!form.actionValue.trim()) {
      setNotice("Please enter an action value.");
      return;
    }

    if (!form.condition.trim()) {
      setNotice("Please enter a condition.");
      return;
    }

    if (editingId) {
      setAutomations((previous) =>
        previous.map((automation) =>
          automation.id === editingId
            ? {
                ...automation,
                ...form,
              }
            : automation,
        ),
      );

      setNotice("Automation updated in this demo.");
    } else {
      const newAutomation: Automation = {
        id: `auto-${Date.now()}`,
        ...form,
        status: "Inactive",
        executions: 0,
        lastExecuted: "Never",
        createdAt: new Date().toISOString().slice(0, 10),
      };

      setAutomations((previous) => [newAutomation, ...previous]);
      setNotice("Automation created in this demo.");
    }

    closeBuilder();
  };

  const toggleStatus = (id: string) => {
    setAutomations((previous) =>
      previous.map((automation) =>
        automation.id === id
          ? {
              ...automation,
              status: automation.status === "Active" ? "Inactive" : "Active",
            }
          : automation,
      ),
    );

    setNotice("Demo status updated. No real automation was triggered.");
    setMenuId(null);
  };

  const duplicateAutomation = (automation: Automation) => {
    const copy: Automation = {
      ...automation,
      id: `auto-${Date.now()}`,
      name: `${automation.name} (Copy)`,
      status: "Inactive",
      executions: 0,
      lastExecuted: "Never",
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setAutomations((previous) => [copy, ...previous]);
    setMenuId(null);
    setNotice("Automation duplicated in this demo.");
  };

  const deleteAutomation = (id: string) => {
    setAutomations((previous) =>
      previous.filter((automation) => automation.id !== id),
    );

    setMenuId(null);
    setNotice("Automation removed from this demo.");
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-7">
          {/* Page heading */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
                {/* <Zap size={16} /> */}
                Workflow automation
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Automations
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Automate repetitive customer conversations and build smarter
                WhatsApp workflows.
              </p>
            </div>

            <button
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <Plus size={18} />
              Create automation
            </button>
          </div>

          {/* Demo notice */}
          {/* <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
              <Settings2 size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold text-amber-900">Demo mode</p>
              <p className="mt-1 text-sm leading-5 text-amber-800">
                Changes are stored in the current page state only. Triggers and
                actions are visual configurations and are not connected to a
                backend or WhatsApp API.
              </p>
            </div>
          </div> */}

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total automations"
              value={automations.length.toString()}
              detail="All configured workflows"
              icon={<GitBranch size={20} />}
            />

            <StatCard
              label="Active automations"
              value={activeCount.toString()}
              detail="Enabled in demo state"
              icon={<Power size={20} />}
            />

            <StatCard
              label="Total executions"
              value={totalExecutions.toLocaleString()}
              detail="Sample historical data"
              icon={<Activity size={20} />}
            />

            <StatCard
              label="Automation health"
              value="Demo"
              detail="Live monitoring not connected"
              icon={<Bot size={20} />}
            />
          </div>

          {/* Automation list */}
          <section className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Your workflows
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Manage your automated customer journeys.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search automations..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:w-64"
                  />
                </div>

                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(
                        event.target.value as "All" | AutomationStatus,
                      )
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-9 text-sm outline-none focus:border-emerald-500 sm:w-40"
                  >
                    <option value="All">All statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            </div>

            {filteredAutomations.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                  <GitBranch size={24} />
                </div>

                <h3 className="mt-4 font-semibold text-slate-900">
                  No automations found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Try a different search or create a new automation.
                </p>

                <button
                  onClick={openCreate}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <Plus size={16} />
                  Create automation
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredAutomations.map((automation) => {
                  const ActionIcon = actionIcons[automation.action];

                  return (
                    <div
                      key={automation.id}
                      className="p-5 transition hover:bg-slate-50/70"
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
                        {/* Name and description */}
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                              automation.status === "Active"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <Zap size={21} />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-slate-900">
                                {automation.name}
                              </h3>

                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  automation.status === "Active"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {automation.status}
                              </span>
                            </div>

                            <p className="mt-1 max-w-xl text-sm leading-5 text-slate-500">
                              {automation.description}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                              <span className="inline-flex items-center gap-1.5">
                                <Clock3 size={13} />
                                Last run: {automation.lastExecuted}
                              </span>

                              <span>
                                {automation.executions.toLocaleString()} sample
                                runs
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Workflow preview */}
                        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 xl:max-w-[430px]">
                          <WorkflowNode
                            label="TRIGGER"
                            value={automation.trigger}
                            icon={<Zap size={15} />}
                          />

                          <ArrowRight
                            size={15}
                            className="shrink-0 text-slate-400"
                          />

                          <WorkflowNode
                            label="CONDITION"
                            value={automation.condition}
                            icon={<GitBranch size={15} />}
                          />

                          <ArrowRight
                            size={15}
                            className="shrink-0 text-slate-400"
                          />

                          <WorkflowNode
                            label="ACTION"
                            value={automation.action}
                            icon={<ActionIcon size={15} />}
                          />
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between gap-4 xl:justify-end">
                          <button
                            onClick={() => toggleStatus(automation.id)}
                            aria-label={`Turn ${automation.name} ${
                              automation.status === "Active" ? "off" : "on"
                            }`}
                            className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                              automation.status === "Active"
                                ? "bg-emerald-600"
                                : "bg-slate-300"
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                                automation.status === "Active"
                                  ? "left-[22px]"
                                  : "left-0.5"
                              }`}
                            />
                          </button>

                          <div className="relative">
                            <button
                              onClick={() =>
                                setMenuId(
                                  menuId === automation.id
                                    ? null
                                    : automation.id,
                                )
                              }
                              aria-label="Automation actions"
                              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            >
                              <MoreHorizontal size={20} />
                            </button>

                            {menuId === automation.id && (
                              <div className="absolute right-0 top-10 z-20 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                                <button
                                  onClick={() => openEdit(automation)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  <Settings2 size={15} />
                                  Edit workflow
                                </button>

                                <button
                                  onClick={() =>
                                    duplicateAutomation(automation)
                                  }
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  <Copy size={15} />
                                  Duplicate
                                </button>

                                <button
                                  onClick={() =>
                                    deleteAutomation(automation.id)
                                  }
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={15} />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {filteredAutomations.length} of {automations.length}{" "}
                automations
              </span>
              <span>Execution counts are sample data.</span>
            </div>
          </section>

          {/* Builder preview */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              {/* <Sparkles size={19} className="text-emerald-600" /> */}
              <h2 className="font-bold text-slate-900">How a workflow works</h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Every automation follows a simple trigger → condition → action
              structure.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <ExampleStep
                number="01"
                title="Trigger"
                description="An event occurs, such as a new customer sending a message."
                icon={<Zap size={21} />}
              />

              <ExampleStep
                number="02"
                title="Condition"
                description="The system checks whether the message matches a configured rule."
                icon={<GitBranch size={21} />}
              />

              <ExampleStep
                number="03"
                title="Action"
                description="The workflow can send a reply, assign an agent, or add a tag."
                icon={<MessageSquare size={21} />}
              />
            </div>
          </section>
        </div>
      </div>

      {/* Create / edit modal */}
      {showBuilder && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeBuilder();
          }}
        >
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white p-5 sm:p-6">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  {/* <Sparkles size={16} /> */}
                  Workflow builder
                </div>

                <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                  {editingId ? "Edit automation" : "Create automation"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Configure the trigger, condition and action.
                </p>
              </div>

              <button
                onClick={closeBuilder}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close builder"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              {/* Basic details */}
              <div className="space-y-4">
                <SectionHeading number="01" title="Basic details" />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Automation name <span className="text-red-500">*</span>
                  </label>

                  <input
                    value={form.name}
                    onChange={(event) => updateForm("name", event.target.value)}
                    placeholder="e.g. Welcome new customers"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Description
                  </label>

                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateForm("description", event.target.value)
                    }
                    rows={2}
                    placeholder="What does this automation do?"
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              {/* Trigger */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 sm:p-5">
                <SectionHeading number="02" title="When should it run?" />

                <label className="mb-2 mt-4 block text-sm font-semibold text-slate-700">
                  Trigger
                </label>

                <select
                  value={form.trigger}
                  onChange={(event) =>
                    updateForm(
                      "trigger",
                      event.target.value as AutomationTrigger,
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  {triggers.map((trigger) => (
                    <option key={trigger} value={trigger}>
                      {trigger}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-sm leading-5 text-slate-500">
                  {triggerDescriptions[form.trigger]}
                </p>
              </div>

              {/* Condition */}
              <div className="rounded-2xl border border-violet-200 bg-violet-50/40 p-4 sm:p-5">
                <SectionHeading number="03" title="Add a condition" />

                <p className="mt-1 text-sm text-slate-500">
                  Describe the rule that must be satisfied before the action
                  runs.
                </p>

                <input
                  value={form.condition}
                  onChange={(event) =>
                    updateForm("condition", event.target.value)
                  }
                  placeholder="e.g. Message contains: price, cost"
                  className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
                />
              </div>

              {/* Action */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 sm:p-5">
                <SectionHeading number="04" title="What should happen?" />

                <label className="mb-2 mt-4 block text-sm font-semibold text-slate-700">
                  Action
                </label>

                <select
                  value={form.action}
                  onChange={(event) =>
                    updateForm("action", event.target.value as AutomationAction)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                >
                  {actions.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>

                <label className="mb-2 mt-4 block text-sm font-semibold text-slate-700">
                  Action details
                </label>

                <textarea
                  value={form.actionValue}
                  onChange={(event) =>
                    updateForm("actionValue", event.target.value)
                  }
                  rows={3}
                  placeholder={
                    form.action === "Send Message"
                      ? "Enter the message to send..."
                      : form.action === "Assign Agent"
                        ? "Enter the agent or team name..."
                        : form.action === "Add Tag"
                          ? "Enter the tag name..."
                          : form.action === "Notify Team"
                            ? "Enter the team to notify..."
                            : "Enter the approved template name..."
                  }
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              {/* Workflow preview */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <Activity size={17} className="text-slate-600" />
                  <h3 className="font-semibold text-slate-900">
                    Workflow preview
                  </h3>
                </div>

                <div className="mt-4 space-y-3">
                  <PreviewRow
                    label="Trigger"
                    value={form.trigger}
                    icon={<Zap size={16} />}
                  />

                  <div className="ml-5">
                    <ArrowDown size={16} className="text-slate-400" />
                  </div>

                  <PreviewRow
                    label="Condition"
                    value={form.condition || "Your condition will appear here"}
                    icon={<GitBranch size={16} />}
                  />

                  <div className="ml-5">
                    <ArrowDown size={16} className="text-slate-400" />
                  </div>

                  <PreviewRow
                    label="Action"
                    value={`${form.action}: ${
                      form.actionValue || "Configure action details"
                    }`}
                    icon={<Check size={16} />}
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-100 bg-white p-5 sm:flex-row sm:justify-end sm:p-6">
              <button
                onClick={closeBuilder}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <Check size={17} />
                {editingId ? "Save changes" : "Create automation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {notice && (
        <div className="fixed bottom-5 right-5 z-[60] flex max-w-sm items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="mt-0.5 rounded-full bg-emerald-50 p-1 text-emerald-700">
            <Check size={16} />
          </div>

          <p className="flex-1 text-sm leading-5 text-slate-700">{notice}</p>

          <button
            onClick={() => setNotice("")}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function WorkflowNode({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2">
      <p className="text-[9px] font-bold tracking-wider text-slate-400">
        {label}
      </p>

      <div className="mt-1 flex items-center gap-1.5">
        <span className="shrink-0 text-emerald-600">{icon}</span>
        <span className="truncate text-[11px] font-semibold text-slate-700">
          {value}
        </span>
      </div>
    </div>
  );
}

function ExampleStep({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-wider text-slate-400">
          STEP {number}
        </span>
        <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
          {icon}
        </span>
      </div>

      <h3 className="mt-4 font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-bold text-slate-700 shadow-sm">
        {number}
      </span>
      <h3 className="font-bold text-slate-900">{title}</h3>
    </div>
  );
}

function PreviewRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="mt-0.5 rounded-lg bg-slate-100 p-2 text-slate-600">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-medium text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}
