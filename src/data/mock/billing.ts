export type PlanId = "free" | "pro" | "business";
export type BillingCycle = "monthly" | "yearly";
export type SubscriptionStatus = "Active" | "Trial" | "Cancelled";
export type InvoiceStatus = "Paid" | "Pending" | "Failed";

export interface BillingPlan {
id: PlanId;
name: string;
description: string;
monthlyPrice: number;
yearlyPrice: number;
messageLimit: number;
contactLimit: number;
teamMemberLimit: number;
features: string[];
recommended?: boolean;
}

export interface Invoice {
id: string;
date: string;
description: string;
amount: number;
status: InvoiceStatus;
paymentMethod: string;
}

export const billingPlans: BillingPlan[] = [
{
id: "free",
name: "Free",
description: "Explore Cyber7 and get started.",
monthlyPrice: 0,
yearlyPrice: 0,
messageLimit: 1000,
contactLimit: 500,
teamMemberLimit: 1,
features: [
"1,000 messages per month",
"Up to 500 contacts",
"1 team member",
"Basic inbox",
"Basic analytics",
],
},
{
id: "pro",
name: "Pro",
description: "For growing businesses and teams.",
monthlyPrice: 29,
yearlyPrice: 290,
messageLimit: 10000,
contactLimit: 5000,
teamMemberLimit: 5,
features: [
"10,000 messages per month",
"Up to 5,000 contacts",
"Up to 5 team members",
"Campaign management",
"Automation workflows",
"Advanced analytics",
],
recommended: true,
},
{
id: "business",
name: "Business",
description: "For businesses scaling their operations.",
monthlyPrice: 99,
yearlyPrice: 990,
messageLimit: 100000,
contactLimit: 50000,
teamMemberLimit: 20,
features: [
"100,000 messages per month",
"Up to 50,000 contacts",
"Up to 20 team members",
"Advanced automation",
"Detailed campaign analytics",
"Priority support",
"API and webhook configuration",
],
},
];

export const currentSubscription = {
planId: "pro" as PlanId,
status: "Active" as SubscriptionStatus,
billingCycle: "monthly" as BillingCycle,
startDate: "2026-10-01",
nextBillingDate: "2026-11-01",
amount: 29,
currency: "USD",
};

export const usageStats = {
messages: {
used: 6840,
limit: 10000,
label: "Messages sent",
},
contacts: {
used: 3250,
limit: 5000,
label: "Contacts",
},
teamMembers: {
used: 4,
limit: 5,
label: "Team members",
},
};

export const invoices: Invoice[] = [
{
id: "INV-2026-003",
date: "2026-10-01",
description: "Cyber7 Pro - October 2026",
amount: 29,
status: "Paid",
paymentMethod: "Visa •••• 4242",
},
{
id: "INV-2026-002",
date: "2026-09-01",
description: "Cyber7 Pro - September 2026",
amount: 29,
status: "Paid",
paymentMethod: "Visa •••• 4242",
},
{
id: "INV-2026-001",
date: "2026-08-01",
description: "Cyber7 Pro - August 2026",
amount: 29,
status: "Paid",
paymentMethod: "Visa •••• 4242",
},
];

export const paymentMethod = {
brand: "Visa",
lastFour: "4242",
expiry: "12/28",
isDefault: true,
};
