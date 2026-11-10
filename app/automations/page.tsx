"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  GitBranch,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Power,
  RefreshCw,
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
import { useWorkspace } from "@/src/context/workspace-context";
import { automationService } from "@/src/services/automation-service";
import type {
  AutomationActionType,
  AutomationRuleItem,
  AutomationTriggerType,
  CreateAutomationRulePayload,
} from "@/src/types/api";

export type AutomationStatus = "Active" | "Inactive";

export type AutomationTrigger =
  | "Incoming Message"
  | "Keyword Match"
  | "New Contact"
  | "No Reply"
  | "Away Hours"
  | "Order Received";

export type AutomationAction =
  | "Send Message"
  | "Assign Agent"
  | "Add Tag"
  | "Notify Team"
  | "Send Template";

export interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  condition: string;
  action: AutomationAction;
  actionValue: string;
  status: AutomationStatus;
  executions: number;
  lastExecuted: string;
  createdAt: string;
  backendRule?: AutomationRuleItem;
}

const triggers: AutomationTrigger[] = [
  "Incoming Message",
  "Keyword Match",
  "New Contact",
  "No Reply",
  "Away Hours",
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
  "Incoming Message": "Runs when a customer sends an inbound message.",
  "Keyword Match": "Runs when a message contains specific matching keywords.",
  "New Contact": "Runs when a new customer contact is registered.",
  "No Reply": "Runs when a customer conversation remains unanswered.",
  "Away Hours": "Runs when a message is received outside business hours.",
  "Order Received": "Runs when a customer places or confirms an order.",
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

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Never";

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function mapTriggerToBackend(t: AutomationTrigger): AutomationTriggerType {
  switch (t) {
    case "New Contact":
      return "NEW_CONTACT";
    case "Keyword Match":
      return "KEYWORD_MATCH";
    case "No Reply":
      return "NO_REPLY";
    case "Away Hours":
    case "Order Received":
      return "AWAY_HOURS";
    case "Incoming Message":
    default:
      return "INCOMING_MESSAGE";
  }
}

function mapTriggerFromBackend(t: AutomationTriggerType): AutomationTrigger {
  switch (t) {
    case "NEW_CONTACT":
      return "New Contact";
    case "KEYWORD_MATCH":
      return "Keyword Match";
    case "NO_REPLY":
      return "No Reply";
    case "AWAY_HOURS":
      return "Away Hours";
    case "INCOMING_MESSAGE":
    default:
      return "Incoming Message";
  }
}

function mapActionToBackend(a: AutomationAction): AutomationActionType {
  switch (a) {
    case "Send Message":
      return "SEND_MESSAGE";
    case "Send Template":
      return "SEND_TEMPLATE";
    case "Assign Agent":
      return "ASSIGN_AGENT";
    case "Add Tag":
      return "ADD_TAGS";
    case "Notify Team":
    default:
      return "CREATE_TICKET";
  }
}

function mapActionFromBackend(a: AutomationActionType): AutomationAction {
  switch (a) {
    case "SEND_MESSAGE":
      return "Send Message";
    case "SEND_TEMPLATE":
      return "Send Template";
    case "ASSIGN_AGENT":
      return "Assign Agent";
    case "ADD_TAGS":
      return "Add Tag";
    case "CREATE_TICKET":
    default:
      return "Notify Team";
  }
}

function transformRuleToUI(rule: AutomationRuleItem): Automation {
  const triggerUI = mapTriggerFromBackend(rule.trigger);
  const actionUI = mapActionFromBackend(rule.action);

  let condition = "";
  if (
    rule.trigger === "KEYWORD_MATCH" &&
    rule.keywords &&
    rule.keywords.length > 0
  ) {
    condition = `Keywords: ${rule.keywords.join(", ")}`;
  } else if (rule.trigger === "NEW_CONTACT") {
    condition = "New contact registered";
  } else if (rule.trigger === "INCOMING_MESSAGE") {
    condition = "Inbound message received";
  } else if (rule.trigger === "AWAY_HOURS") {
    condition = "Outside business hours";
  } else if (rule.trigger === "NO_REPLY") {
    condition = "No agent reply within window";
  }

  let actionValue = "";
  if (rule.action === "SEND_MESSAGE") {
    actionValue = rule.actionConfig?.messageBody || "";
  } else if (rule.action === "SEND_TEMPLATE") {
    actionValue = rule.actionConfig?.templateName || "";
  } else if (rule.action === "ADD_TAGS") {
    actionValue = rule.actionConfig?.tags?.join(", ") || "";
  } else if (rule.action === "ASSIGN_AGENT") {
    actionValue = rule.actionConfig?.assignedUserId
      ? String(rule.actionConfig.assignedUserId)
      : "Auto-assigned Agent";
  } else if (rule.action === "CREATE_TICKET") {
    actionValue = rule.actionConfig?.ticketPriority
      ? `Ticket (${rule.actionConfig.ticketPriority})`
      : "Support Ticket";
  }

  return {
    id: rule._id,
    name: rule.name,
    description: rule.description || "",
    trigger: triggerUI,
    condition: condition || "Matches trigger criteria",
    action: actionUI,
    actionValue: actionValue || "Configured action",
    status: rule.isActive ? "Active" : "Inactive",
    executions: rule.executionsCount || 0,
    lastExecuted: formatRelativeTime(rule.lastExecutedAt),
    createdAt: rule.createdAt ? rule.createdAt.slice(0, 10) : "",
    backendRule: rule,
  };
}

export default function AutomationsPage() {
  const { activeWorkspace, isLoading: isWorkspaceLoading } = useWorkspace();

  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | AutomationStatus>(
    "All",
  );

  const [showBuilder, setShowBuilder] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState<AutomationForm>(emptyForm);

  const loadAutomations = useCallback(async () => {
    if (!activeWorkspace?.id) {
      setAutomations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await automationService.getAutomationRules(
        activeWorkspace.id,
      );
      const mapped = data.map(transformRuleToUI);
      setAutomations(mapped);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load automations";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace]);

  useEffect(() => {
    loadAutomations();
  }, [loadAutomations]);

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

    // Extract clean condition keywords if keyword match
    let conditionText = automation.condition;
    if (
      automation.backendRule?.keywords &&
      automation.backendRule.keywords.length > 0
    ) {
      conditionText = automation.backendRule.keywords.join(", ");
    } else if (conditionText.startsWith("Keywords: ")) {
      conditionText = conditionText.replace("Keywords: ", "");
    }

    setForm({
      name: automation.name,
      description: automation.description,
      trigger: automation.trigger,
      condition: conditionText,
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

  const handleSave = async () => {
    if (!activeWorkspace?.id) {
      setNotice("No active workspace selected.");
      return;
    }

    if (!form.name.trim()) {
      setNotice("Please enter an automation name.");
      return;
    }

    if (form.name.trim().length < 3) {
      setNotice("Automation name must be at least 3 characters.");
      return;
    }

    if (!form.condition.trim() && form.trigger === "Keyword Match") {
      setNotice("Please enter at least one matching keyword for this trigger.");
      return;
    }

    if (!form.actionValue.trim()) {
      setNotice("Please enter action details.");
      return;
    }

    if (form.description.trim().length > 300) {
      setNotice("Description cannot exceed 300 characters.");
      return;
    }

    setSaving(true);

    try {
      const backendTrigger = mapTriggerToBackend(form.trigger);
      const backendAction = mapActionToBackend(form.action);

      let keywords: string[] = [];
      if (backendTrigger === "KEYWORD_MATCH") {
        const raw = form.condition
          .replace(/^message\s+contains:\s*/i, "")
          .replace(/^keywords:\s*/i, "");
        keywords = raw
          .split(",")
          .map((k) => k.trim().toLowerCase())
          .filter(Boolean);
      }

      const actionConfig: CreateAutomationRulePayload["actionConfig"] = {};
      if (backendAction === "SEND_MESSAGE") {
        actionConfig.messageBody = form.actionValue.trim();
      } else if (backendAction === "SEND_TEMPLATE") {
        actionConfig.templateName = form.actionValue.trim();
        actionConfig.templateLanguage = "en";
      } else if (backendAction === "ADD_TAGS") {
        actionConfig.tags = form.actionValue
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      } else if (backendAction === "ASSIGN_AGENT") {
        // If it's a mongo object ID, pass it; otherwise store in text or omit
        if (/^[0-9a-fA-F]{24}$/.test(form.actionValue.trim())) {
          actionConfig.assignedUserId = form.actionValue.trim();
        }
      } else if (backendAction === "CREATE_TICKET") {
        actionConfig.ticketPriority = "MEDIUM";
      }

      if (editingId) {
        const updated = await automationService.updateAutomationRule(
          activeWorkspace.id,
          editingId,
          {
            name: form.name.trim(),
            description: form.description.trim(),
            trigger: backendTrigger,
            keywords,
            matchType: "CONTAINS",
            action: backendAction,
            actionConfig,
          },
        );

        setAutomations((previous) =>
          previous.map((item) =>
            item.id === editingId ? transformRuleToUI(updated) : item,
          ),
        );

        setNotice("Automation rule updated successfully.");
      } else {
        const created = await automationService.createAutomationRule(
          activeWorkspace.id,
          {
            name: form.name.trim(),
            description: form.description.trim(),
            trigger: backendTrigger,
            keywords,
            matchType: "CONTAINS",
            action: backendAction,
            actionConfig,
            isActive: true,
          },
        );

        const newUI = transformRuleToUI(created);
        setAutomations((previous) => [newUI, ...previous]);
        setNotice("Automation rule created and activated successfully.");
      }

      closeBuilder();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to save automation rule";
      setNotice(`Error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id: string) => {
    if (!activeWorkspace?.id) return;
    const target = automations.find((item) => item.id === id);
    if (!target) return;

    const nextActive = target.status !== "Active";
    const nextStatus: AutomationStatus = nextActive ? "Active" : "Inactive";

    // Optimistic UI update
    setAutomations((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, status: nextStatus } : item,
      ),
    );
    setMenuId(null);

    try {
      const updated = await automationService.toggleAutomationRule(
        activeWorkspace.id,
        id,
        nextActive,
      );
      setAutomations((previous) =>
        previous.map((item) =>
          item.id === id ? transformRuleToUI(updated) : item,
        ),
      );
      setNotice(
        `Rule turned ${nextActive ? "ON (Active)" : "OFF (Inactive)"}.`,
      );
    } catch (err: unknown) {
      // Revert on error
      setAutomations((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, status: target.status } : item,
        ),
      );
      const msg =
        err instanceof Error ? err.message : "Failed to toggle status";
      setNotice(`Error: ${msg}`);
    }
  };

  const duplicateAutomation = async (automation: Automation) => {
    if (!activeWorkspace?.id || !automation.backendRule) return;

    setMenuId(null);
    setSaving(true);

    try {
      const created = await automationService.createAutomationRule(
        activeWorkspace.id,
        {
          name: `${automation.name} (Copy)`,
          description: automation.description,
          trigger: automation.backendRule.trigger,
          keywords: automation.backendRule.keywords || [],
          matchType: automation.backendRule.matchType || "CONTAINS",
          action: automation.backendRule.action,
          actionConfig: automation.backendRule.actionConfig || {},
          isActive: false,
        },
      );

      const uiItem = transformRuleToUI(created);
      setAutomations((previous) => [uiItem, ...previous]);
      setNotice(`Duplicated "${automation.name}" as inactive copy.`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to duplicate rule";
      setNotice(`Error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const deleteAutomation = async (id: string) => {
    if (!activeWorkspace?.id) return;

    const automation = automations.find((item) => item.id === id);
    if (!automation) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${automation.name}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      setMenuId(null);
      return;
    }

    setMenuId(null);

    // Optimistic removal
    const backup = [...automations];
    setAutomations((previous) => previous.filter((item) => item.id !== id));

    try {
      await automationService.deleteAutomationRule(activeWorkspace.id, id);
      setNotice(`Automation "${automation.name}" deleted successfully.`);
    } catch (err: unknown) {
      // Revert on failure
      setAutomations(backup);
      const msg =
        err instanceof Error ? err.message : "Failed to delete automation";
      setNotice(`Error: ${msg}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-7">
          {/* Page heading */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
                <Zap size={16} />
                WhatsApp Workflow Automations
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Automations
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Automate repetitive customer conversations, instant replies, and
                lead routing in real-time.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadAutomations}
                disabled={loading}
                title="Refresh automations"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={openCreate}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:scale-105 duration-300 "
              >
                <Plus size={18} />
                Create automation
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">
                  Failed to load automations
                </p>
                <p className="mt-0.5 text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={loadAutomations}
                className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total automations"
              value={loading ? "—" : automations.length.toString()}
              detail="All configured workspace rules"
              icon={<GitBranch size={20} />}
            />

            <StatCard
              label="Active automations"
              value={loading ? "—" : activeCount.toString()}
              detail="Currently active on incoming messages"
              icon={<Power size={20} />}
            />

            <StatCard
              label="Total executions"
              value={loading ? "—" : totalExecutions.toLocaleString()}
              detail="Recorded trigger executions"
              icon={<Activity size={20} />}
            />

            <StatCard
              label="Automation engine"
              value={loading ? "—" : activeWorkspace ? "Live" : "No Workspace"}
              detail="Meta Cloud API webhook listener"
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
                  Manage your automated customer journeys and routing rules.
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

            {loading || isWorkspaceLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 size={36} className="animate-spin text-emerald-600" />
                <p className="mt-4 text-sm font-medium text-slate-600">
                  Loading automation workflows...
                </p>
              </div>
            ) : filteredAutomations.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                  <GitBranch size={24} />
                </div>

                <h3 className="mt-4 font-semibold text-slate-900">
                  {automations.length === 0
                    ? "No automation rules yet"
                    : "No matching automations found"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {automations.length === 0
                    ? "Create your first automated reply or routing rule to engage customers automatically."
                    : "Try a different search query or filter."}
                </p>

                {automations.length === 0 && (
                  <button
                    onClick={openCreate}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    <Plus size={16} />
                    Create automation
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredAutomations.map((automation) => {
                  const ActionIcon =
                    actionIcons[automation.action] || MessageSquare;

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

                            {automation.description && (
                              <p className="mt-1 max-w-xl text-sm leading-5 text-slate-500">
                                {automation.description}
                              </p>
                            )}

                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                              <span className="inline-flex items-center gap-1.5">
                                <Clock3 size={13} />
                                Last run: {automation.lastExecuted}
                              </span>

                              <span>
                                {automation.executions.toLocaleString()}{" "}
                                executions
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
              <span>
                Workflows execute automatically via Meta WhatsApp Cloud API
                webhooks.
              </span>
            </div>
          </section>

          {/* Builder preview info section */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <Sparkles size={19} className="text-emerald-600" />
              <h2 className="font-bold text-slate-900">
                How WhatsApp Automations Work
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Every automation follows a reliable Trigger → Condition → Action
              pipeline executing atomically within the 24h customer window.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <ExampleStep
                number="01"
                title="Trigger"
                description="An inbound webhook event occurs, such as a customer sending a message or registering."
                icon={<Zap size={21} />}
              />

              <ExampleStep
                number="02"
                title="Condition"
                description="The engine validates keywords, business operating hours, or message intervals."
                icon={<GitBranch size={21} />}
              />

              <ExampleStep
                number="03"
                title="Action"
                description="The system sends an automated response, adds contact tags, creates a support ticket, or routes to an agent."
                icon={<MessageSquare size={21} />}
              />
            </div>
          </section>
        </div>
      </div>

      {/* Create / Edit Modal */}
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
                  <Sparkles size={16} />
                  Workflow builder
                </div>

                <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                  {editingId ? "Edit automation" : "Create automation"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Configure the trigger, matching conditions, and executed
                  WhatsApp action.
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
                <SectionHeading number="03" title="Condition / Keywords" />

                <p className="mt-1 text-sm text-slate-500">
                  {form.trigger === "Keyword Match"
                    ? "Enter comma-separated keywords to match (e.g. price, cost, quote, order)."
                    : "Optional condition notes or routing criteria for this trigger."}
                </p>

                <input
                  value={form.condition}
                  onChange={(event) =>
                    updateForm("condition", event.target.value)
                  }
                  placeholder={
                    form.trigger === "Keyword Match"
                      ? "price, cost, quote, catalog"
                      : "e.g. First contact only / Business hours"
                  }
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
                  Action details <span className="text-red-500">*</span>
                </label>

                <textarea
                  value={form.actionValue}
                  onChange={(event) =>
                    updateForm("actionValue", event.target.value)
                  }
                  rows={3}
                  placeholder={
                    form.action === "Send Message"
                      ? "Enter the message to send automatically..."
                      : form.action === "Assign Agent"
                        ? "Enter user ID or agent tag..."
                        : form.action === "Add Tag"
                          ? "Enter comma-separated tags (e.g. lead, interested, vip)..."
                          : form.action === "Notify Team"
                            ? "Enter ticket notes or notification channel..."
                            : "Enter the approved Meta template name (e.g. hello_world)..."
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
                    value={form.condition || "Default trigger criteria"}
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
                disabled={saving}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={17} />
                    {editingId ? "Save changes" : "Create automation"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:scale-105 transition-all duration-300">
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
