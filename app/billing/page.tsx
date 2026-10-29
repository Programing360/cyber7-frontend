"use client";

import { useState } from "react";
import {
ArrowDownRight,
ArrowUpRight,
Check,
ChevronDown,
CreditCard,
Download,
FileText,
Receipt,
ShieldCheck,
Sparkles,
X,
} from "lucide-react";

import DashboardLayout from "@/src/component/dashboard/dashboard-layout";
import {
billingPlans,
currentSubscription,
invoices,
paymentMethod,
usageStats,
type BillingCycle,
type Invoice,
type InvoiceStatus,
type PlanId,
} from "@/src/data/mock/billing";

function formatCurrency(amount: number) {
return new Intl.NumberFormat("en-US", {
style: "currency",
currency: currentSubscription.currency,
maximumFractionDigits: 0,
}).format(amount);
}

function formatDate(date: string) {
return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
month: "short",
day: "numeric",
year: "numeric",
});
}

function getInvoiceStatusClass(status: InvoiceStatus) {
switch (status) {
case "Paid":
return "bg-emerald-50 text-emerald-700";
case "Pending":
return "bg-amber-50 text-amber-700";
case "Failed":
return "bg-rose-50 text-rose-700";
default:
return "bg-default-100 text-default-600";
}
}

function UsageCard({
label,
used,
limit,
}: {
label: string;
used: number;
limit: number;
}) {
const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
const remaining = Math.max(limit - used, 0);

return ( <div className="rounded-2xl border border-default-200 bg-white p-5"> <div className="flex items-start justify-between gap-3"> <div> <p className="text-sm font-medium text-default-500">{label}</p> <p className="mt-2 text-2xl font-bold text-default-900">
{used.toLocaleString()} <span className="ml-1 text-sm font-medium text-default-400">
/ {limit.toLocaleString()} </span> </p> </div>


    <div className="rounded-xl bg-default-100 p-2.5">
      <Receipt size={19} className="text-default-600" />
    </div>
  </div>

  <div className="mt-5 h-2 overflow-hidden rounded-full bg-default-100">
    <div
      className={`h-full rounded-full transition-all ${
        percentage >= 90 ? "bg-rose-500" : "bg-blue-600"
      }`}
      style={{ width: `${percentage}%` }}
    />
  </div>

  <div className="mt-2 flex items-center justify-between gap-2 text-xs">
    <span className="text-default-500">
      {percentage.toFixed(0)}% used
    </span>
    <span className="font-medium text-default-700">
      {remaining.toLocaleString()} remaining
    </span>
  </div>
</div>


);
}

function InvoiceRow({
invoice,
onDownload,
}: {
invoice: Invoice;
onDownload: (invoice: Invoice) => void;
}) {
return ( <tr className="border-b border-default-100 last:border-0 hover:bg-default-50/70"> <td className="px-5 py-4"> <p className="font-semibold text-default-900">{invoice.id}</p> <p className="mt-1 text-xs text-default-500">
{invoice.description} </p> </td>


  <td className="whitespace-nowrap px-5 py-4 text-sm text-default-600">
    {formatDate(invoice.date)}
  </td>

  <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-default-900">
    {formatCurrency(invoice.amount)}
  </td>

  <td className="px-5 py-4">
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getInvoiceStatusClass(
        invoice.status
      )}`}
    >
      {invoice.status}
    </span>
  </td>

  <td className="px-5 py-4 text-right">
    <button
      type="button"
      onClick={() => onDownload(invoice)}
      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-default-600 transition hover:bg-default-100 hover:text-default-900"
      aria-label={`Download invoice ${invoice.id}`}
    >
      <Download size={15} />
      <span className="hidden sm:inline">Invoice</span>
    </button>
  </td>
</tr>


);
}

export default function BillingPage() {
const [billingCycle, setBillingCycle] =
useState<BillingCycle>("monthly");

const [selectedPlan, setSelectedPlan] =
useState<PlanId>(currentSubscription.planId);

const [showCancelModal, setShowCancelModal] = useState(false);
const [showPaymentDetails, setShowPaymentDetails] = useState(false);
const [toast, setToast] = useState("");
const [invoiceFilter, setInvoiceFilter] = useState<"All" | InvoiceStatus>(
"All"
);

const activePlan = billingPlans.find(
(plan) => plan.id === currentSubscription.planId
)!;

const selectedPlanData = billingPlans.find(
(plan) => plan.id === selectedPlan
)!;

const currentPrice =
billingCycle === "monthly"
? selectedPlanData.monthlyPrice
: selectedPlanData.yearlyPrice;

const displayedInvoices =
invoiceFilter === "All"
? invoices
: invoices.filter((invoice) => invoice.status === invoiceFilter);

function showToast(message: string) {
setToast(message);
window.setTimeout(() => setToast(""), 3000);
}

function handlePlanSelection(planId: PlanId) {
setSelectedPlan(planId);


const plan = billingPlans.find((item) => item.id === planId);

if (planId === currentSubscription.planId) {
  showToast(`You are already subscribed to the ${plan?.name} plan.`);
  return;
}

showToast(
  `${plan?.name} selected. This is a demo; no payment has been processed.`
);


}

function handleDownloadInvoice(invoice: Invoice) {
const content = [
"Cyber7 - Demo Invoice",
"----------------------",
`Invoice ID: ${invoice.id}`,
`Date: ${invoice.date}`,
`Description: ${invoice.description}`,
`Amount: ${formatCurrency(invoice.amount)}`,
`Status: ${invoice.status}`,
`Payment method: ${invoice.paymentMethod}`,
"",
"DEMO ONLY - This is not a real payment receipt.",
].join("\n");


const blob = new Blob([content], {
  type: "text/plain;charset=utf-8",
});

const url = URL.createObjectURL(blob);
const link = document.createElement("a");

link.href = url;
link.download = `${invoice.id}.txt`;
document.body.appendChild(link);
link.click();
link.remove();

URL.revokeObjectURL(url);
showToast("Demo invoice downloaded.");


}

function handleCancelSubscription() {
setShowCancelModal(false);
showToast(
"Demo only: cancellation was not processed. Your subscription is unchanged."
);
}

return ( <DashboardLayout> <div className="min-h-screen bg-default-50/60 px-4 py-6 sm:px-6 lg:px-8"> <div className="mx-auto max-w-7xl space-y-8">
{/* Page heading */} <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"> <div> <div className="mb-2 flex items-center gap-2 text-sm text-default-500"> <span>Workspace</span> <span>/</span> <span className="text-default-700">Subscription & Billing</span> </div>


          <h1 className="text-2xl font-bold tracking-tight text-default-900 sm:text-3xl">
            Subscription & Billing
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-default-500">
            Manage your plan, monitor usage, and review your billing
            history.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            document
              .getElementById("pricing-plans")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Sparkles size={17} />
          Explore plans
        </button>
      </div>

      {/* Demo notice */}
      <div className="flex gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <ShieldCheck
          size={20}
          className="mt-0.5 shrink-0 text-blue-700"
        />
        <div>
          <p className="text-sm font-semibold text-blue-950">
            Demo billing environment
          </p>
          <p className="mt-1 text-sm leading-6 text-blue-800">
            Plan changes, payment information, and cancellation are
            simulated. No real payment will be taken, and no subscription
            will be changed.
          </p>
        </div>
      </div>

      {/* Current subscription */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-6 text-white shadow-sm lg:col-span-2">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 right-28 h-52 w-52 rounded-full bg-white/5" />

          <div className="relative">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold">
                    CURRENT PLAN
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-blue-100">
                    <span className="h-2 w-2 rounded-full bg-emerald-300" />
                    {currentSubscription.status}
                  </span>
                </div>

                <h2 className="mt-5 text-3xl font-bold">
                  Cyber7 {activePlan.name}
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-blue-100">
                  {activePlan.description}
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 sm:min-w-36">
                <p className="text-xs text-blue-100">Current price</p>
                <p className="mt-1 text-3xl font-bold">
                  {formatCurrency(currentSubscription.amount)}
                </p>
                <p className="mt-1 text-xs text-blue-100">per month</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 border-t border-white/20 pt-5 sm:grid-cols-2">
              <div>
                <p className="text-xs text-blue-100">Subscription started</p>
                <p className="mt-1 font-semibold">
                  {formatDate(currentSubscription.startDate)}
                </p>
              </div>

              <div>
                <p className="text-xs text-blue-100">Next billing date</p>
                <p className="mt-1 font-semibold">
                  {formatDate(currentSubscription.nextBillingDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-default-200 bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-default-500">
                Payment method
              </p>
              <h3 className="mt-2 text-lg font-bold text-default-900">
                {paymentMethod.brand} ending in {paymentMethod.lastFour}
              </h3>
            </div>

            <div className="rounded-xl bg-blue-50 p-3">
              <CreditCard size={21} className="text-blue-700" />
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-default-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-default-500">Card expiry</span>
              <span className="text-sm font-semibold text-default-800">
                {paymentMethod.expiry}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-default-500">Status</span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                {paymentMethod.isDefault ? "Default" : "Saved"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPaymentDetails((value) => !value)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-default-200 px-4 py-3 text-sm font-semibold text-default-700 transition hover:bg-default-50"
          >
            {showPaymentDetails ? "Hide details" : "Manage payment method"}
            <ChevronDown
              size={16}
              className={`transition-transform ${
                showPaymentDetails ? "rotate-180" : ""
              }`}
            />
          </button>

          {showPaymentDetails && (
            <div className="mt-3 rounded-xl bg-default-50 p-3 text-sm leading-6 text-default-600">
              Payment method management is a demo feature. Connect a
              payment provider to securely manage real payment methods.
            </div>
          )}
        </div>
      </section>

      {/* Usage overview */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-default-900">
            Usage overview
          </h2>
          <p className="mt-1 text-sm text-default-500">
            Monitor how much of your current plan you have used.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Object.values(usageStats).map((item) => (
            <UsageCard
              key={item.label}
              label={item.label}
              used={item.used}
              limit={item.limit}
            />
          ))}
        </div>
      </section>

      {/* Pricing plans */}
      <section id="pricing-plans" className="scroll-mt-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-xl font-bold text-default-900">
              Choose the right plan
            </h2>
            <p className="mt-1 text-sm text-default-500">
              Compare plans and explore what works best for your business.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-1 rounded-xl border border-default-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                billingCycle === "monthly"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-default-600 hover:bg-default-100"
              }`}
            >
              Monthly
            </button>

            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                billingCycle === "yearly"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-default-600 hover:bg-default-100"
              }`}
            >
              Yearly
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  billingCycle === "yearly"
                    ? "bg-white/20 text-white"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                SAVE
              </span>
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {billingPlans.map((plan) => {
            const price =
              billingCycle === "monthly"
                ? plan.monthlyPrice
                : plan.yearlyPrice;

            const isCurrent = plan.id === currentSubscription.planId;
            const isSelected = plan.id === selectedPlan;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border bg-white p-6 transition ${
                  plan.recommended
                    ? "border-blue-500 shadow-lg shadow-blue-600/5"
                    : "border-default-200 shadow-sm"
                } ${isSelected ? "ring-1 ring-blue-500" : ""}`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-6 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-default-900">
                      {plan.name}
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-default-500">
                      {plan.description}
                    </p>
                  </div>

                  {isCurrent && (
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Current
                    </span>
                  )}
                </div>

                <div className="mt-6 flex items-end gap-1">
                  <span className="text-4xl font-bold tracking-tight text-default-900">
                    {formatCurrency(price)}
                  </span>
                  <span className="pb-1 text-sm text-default-500">
                    / {billingCycle === "monthly" ? "month" : "year"}
                  </span>
                </div>

                {billingCycle === "yearly" && price > 0 && (
                  <p className="mt-2 text-xs text-emerald-700">
                    Equivalent to {formatCurrency(price / 12)} per month
                  </p>
                )}

                <div className="my-6 h-px bg-default-200" />

                <p className="mb-4 text-sm font-semibold text-default-800">
                  What&apos;s included
                </p>

                <ul className="flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm text-default-600"
                    >
                      <span className="mt-0.5 rounded-full bg-emerald-50 p-0.5">
                        <Check size={13} className="text-emerald-700" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7">
                  <button
                    type="button"
                    onClick={() => handlePlanSelection(plan.id)}
                    disabled={isCurrent}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      isCurrent
                        ? "cursor-not-allowed border border-default-200 bg-default-50 text-default-400"
                        : plan.recommended
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "border border-default-200 text-default-800 hover:bg-default-50"
                    }`}
                  >
                    {isCurrent
                      ? "Current plan"
                      : plan.monthlyPrice > activePlan.monthlyPrice
                        ? "Upgrade plan"
                        : "Select plan"}
                    {!isCurrent && <ArrowUpRight size={16} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Billing history */}
      <section>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-xl font-bold text-default-900">
              Billing history
            </h2>
            <p className="mt-1 text-sm text-default-500">
              Review your previous invoices and payment statuses.
            </p>
          </div>

          <label className="flex items-center gap-2">
            <span className="text-sm text-default-500">Status:</span>
            <select
              value={invoiceFilter}
              onChange={(event) =>
                setInvoiceFilter(
                  event.target.value as "All" | InvoiceStatus
                )
              }
              className="rounded-xl border border-default-200 bg-white px-3 py-2.5 text-sm text-default-700 outline-none focus:border-blue-500"
            >
              <option value="All">All invoices</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </label>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-default-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="border-b border-default-200 bg-default-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-default-500">
                  <th className="px-5 py-4">Invoice</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {displayedInvoices.map((invoice) => (
                  <InvoiceRow
                    key={invoice.id}
                    invoice={invoice}
                    onDownload={handleDownloadInvoice}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {displayedInvoices.length === 0 && (
            <div className="px-5 py-12 text-center">
              <FileText
                size={30}
                className="mx-auto text-default-300"
              />
              <p className="mt-3 font-semibold text-default-800">
                No invoices found
              </p>
              <p className="mt-1 text-sm text-default-500">
                Try selecting another status filter.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 border-t border-default-200 bg-default-50/70 px-5 py-4 text-xs text-default-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {displayedInvoices.length} demo invoice
              {displayedInvoices.length === 1 ? "" : "s"}
            </span>
            <span>Invoice downloads are sample text files only.</span>
          </div>
        </div>
      </section>

      {/* Cancellation */}
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-rose-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
        <div>
          <h2 className="font-bold text-default-900">
            Cancel subscription
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-default-500">
            The demo cancellation flow shows a confirmation step. It will
            not change your actual plan or process a payment.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCancelModal(true)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
        >
          Cancel subscription
          <ArrowDownRight size={16} />
        </button>
      </section>
    </div>
  </div>

  {/* Cancel confirmation modal */}
  {showCancelModal && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setShowCancelModal(false);
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-modal-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50">
            <X size={22} className="text-rose-600" />
          </div>

          <button
            type="button"
            onClick={() => setShowCancelModal(false)}
            className="rounded-lg p-2 text-default-500 transition hover:bg-default-100"
            aria-label="Close cancellation dialog"
          >
            <X size={18} />
          </button>
        </div>

        <h3
          id="cancel-modal-title"
          className="mt-5 text-xl font-bold text-default-900"
        >
          Cancel your subscription?
        </h3>

        <p className="mt-2 text-sm leading-6 text-default-500">
          You are currently on the Cyber7 {activePlan.name} plan. This demo
          will not cancel your real subscription or change your billing
          status.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setShowCancelModal(false)}
            className="rounded-xl border border-default-200 px-4 py-3 text-sm font-semibold text-default-700 transition hover:bg-default-50"
          >
            Keep subscription
          </button>

          <button
            type="button"
            onClick={handleCancelSubscription}
            className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Confirm demo action
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Toast */}
  {toast && (
    <div
      role="status"
      className="fixed bottom-5 right-5 z-[60] flex max-w-sm items-start gap-3 rounded-xl border border-default-200 bg-white px-4 py-3 shadow-xl"
    >
      <div className="mt-0.5 rounded-full bg-emerald-50 p-1">
        <Check size={15} className="text-emerald-700" />
      </div>

      <p className="flex-1 text-sm leading-5 text-default-700">{toast}</p>

      <button
        type="button"
        onClick={() => setToast("")}
        className="rounded-md p-1 text-default-400 hover:bg-default-100"
        aria-label="Dismiss notification"
      >
        <X size={15} />
      </button>
    </div>
  )}
</DashboardLayout>


);
}
