import type {
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
  PlanCode,
  PlatformRole,
  SubscriptionStatus,
  WorkspaceRole,
  WorkspaceStatus,
} from "../../types/admin";

interface AdminStatusBadgeProps {
  status:
    | WorkspaceStatus
    | SubscriptionStatus
    | PaymentStatus
    | InvoiceStatus
    | PlatformRole
    | WorkspaceRole
    | PlanCode
    | PaymentMethod
    | string;
  type?:
    | "workspace"
    | "subscription"
    | "payment"
    | "invoice"
    | "platformRole"
    | "workspaceRole"
    | "plan"
    | "paymentMethod";
}

function formatSnakeCase(str: string): string {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export default function AdminStatusBadge({
  status,
  type,
}: AdminStatusBadgeProps) {
  let colorClasses = "bg-slate-100 text-slate-700 border-slate-200";
  let dotClass = "bg-slate-400";
  let label = typeof status === "string" ? formatSnakeCase(status) : String(status);

  // 1. Plan Code Mapping
  if (status === "STARTER") {
    colorClasses = "bg-sky-50 text-sky-800 border-sky-200";
    dotClass = "bg-sky-500";
    label = "Starter (৳3k)";
  } else if (status === "BUSINESS_PRO") {
    colorClasses = "bg-[#effbdd] text-[#365314] border-[#d4f2aa]";
    dotClass = "bg-[#88da1c]";
    label = "Business Pro (৳7.4k)";
  } else if (status === "ENTERPRISE") {
    colorClasses = "bg-purple-50 text-purple-800 border-purple-200";
    dotClass = "bg-purple-500";
    label = "Enterprise (৳18.6k)";
  }
  // 2. Platform Roles
  else if (status === "SUPER_ADMIN") {
    colorClasses = "bg-purple-100 text-purple-900 border-purple-300 font-bold";
    dotClass = "bg-purple-600";
    label = "Super Admin";
  } else if (status === "FINANCE_ADMIN") {
    colorClasses = "bg-blue-100 text-blue-900 border-blue-300 font-bold";
    dotClass = "bg-blue-600";
    label = "Finance Admin";
  } else if (status === "USER" && type === "platformRole") {
    colorClasses = "bg-slate-100 text-slate-700 border-slate-200";
    dotClass = "bg-slate-400";
    label = "Standard User";
  }
  // 3. Workspace Roles
  else if (status === "OWNER" && type === "workspaceRole") {
    colorClasses = "bg-amber-50 text-amber-900 border-amber-300 font-bold";
    dotClass = "bg-amber-600";
    label = "Workspace Owner";
  } else if (status === "ADMIN" && type === "workspaceRole") {
    colorClasses = "bg-indigo-50 text-indigo-900 border-indigo-200";
    dotClass = "bg-indigo-600";
    label = "Workspace Admin";
  } else if (status === "AGENT" && type === "workspaceRole") {
    colorClasses = "bg-slate-100 text-slate-700 border-slate-200";
    dotClass = "bg-slate-500";
    label = "Support Agent";
  }
  // 4. Positive / Active States
  else if (
    status === "ACTIVE" ||
    status === "COMPLETED" ||
    status === "PAID" ||
    status === "VERIFIED"
  ) {
    colorClasses = "bg-emerald-50 text-emerald-800 border-emerald-200";
    dotClass = "bg-emerald-500 animate-pulse";
    label = formatSnakeCase(status);
  }
  // 5. Pending / In-Review States
  else if (
    status === "PENDING_VERIFICATION" ||
    status === "PENDING" ||
    status === "INITIATED"
  ) {
    colorClasses = "bg-amber-50 text-amber-800 border-amber-200";
    dotClass = "bg-amber-500";
    label = status === "PENDING_VERIFICATION" ? "Pending Review" : formatSnakeCase(status);
  }
  // 6. Negative / Terminated / Error States
  else if (
    status === "SUSPENDED" ||
    status === "FAILED" ||
    status === "REJECTED" ||
    status === "VOID" ||
    status === "DISABLED"
  ) {
    colorClasses = "bg-rose-50 text-rose-800 border-rose-200";
    dotClass = "bg-rose-500";
    label = formatSnakeCase(status);
  }
  // 7. Expired / Inactive / Neutral
  else if (status === "EXPIRED" || status === "CANCELLED" || status === "REFUNDED") {
    colorClasses = "bg-slate-100 text-slate-600 border-slate-200";
    dotClass = "bg-slate-400";
    label = formatSnakeCase(status);
  }
  // 8. Payment Methods
  else if (status === "CITY_BANK_TRANSFER") {
    colorClasses = "bg-indigo-50 text-indigo-800 border-indigo-200";
    dotClass = "bg-indigo-500";
    label = "City Bank Transfer";
  } else if (status === "BKASH") {
    colorClasses = "bg-pink-50 text-pink-800 border-pink-200";
    dotClass = "bg-[#E2136E]";
    label = "bKash";
  } else if (status === "CITY_BANK_CARD") {
    colorClasses = "bg-cyan-50 text-cyan-800 border-cyan-200";
    dotClass = "bg-cyan-600";
    label = "City Bank Card";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${colorClasses}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotClass}`} />
      <span>{label}</span>
    </span>
  );
}
