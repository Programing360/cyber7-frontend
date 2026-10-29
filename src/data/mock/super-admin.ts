export type AdminUserRole = "Owner" | "Admin" | "Manager" | "Agent";

export type AdminUserStatus = "Active" | "Suspended" | "Pending";

export type AdminSubscriptionPlan = "Free" | "Pro" | "Business";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  business: string;
  role: AdminUserRole;
  plan: AdminSubscriptionPlan;
  status: AdminUserStatus;
  joinedAt: string;
  lastActive: string;
}

export interface PlatformActivity {
  id: string;
  title: string;
  description: string;
  type: "user" | "subscription" | "business" | "security";
  createdAt: string;
}

export const platformStats = {
  totalUsers: 12840,
  usersGrowth: 12.8,

  businessAccounts: 3260,
  businessGrowth: 8.4,

  activeSubscriptions: 1840,
  subscriptionGrowth: 15.2,

  monthlyRevenue: 28450,
  revenueGrowth: 9.6,

  suspendedAccounts: 24,
  pendingAccounts: 18,
};

export const userGrowthData = [
  { month: "May", users: 7200, businesses: 1800 },
  { month: "Jun", users: 8100, businesses: 2050 },
  { month: "Jul", users: 9200, businesses: 2380 },
  { month: "Aug", users: 10100, businesses: 2670 },
  { month: "Sep", users: 11400, businesses: 2950 },
  { month: "Oct", users: 12840, businesses: 3260 },
];

export const subscriptionDistribution = [
  { name: "Free", users: 1000, color: "#94a3b8" },
  { name: "Pro", users: 620, color: "#88da1c" },
  { name: "Business", users: 220, color: "#365314" },
];

export const adminUsers: AdminUser[] = [
  {
    id: "USR-1001",
    name: "Rahim Ahmed",
    email: "[rahim@example.com](mailto:rahim@example.com)",
    business: "Rahim Electronics",
    role: "Owner",
    plan: "Business",
    status: "Active",
    joinedAt: "2026-06-12",
    lastActive: "2026-10-30T10:20:00",
  },
  {
    id: "USR-1002",
    name: "Nusrat Jahan",
    email: "[nusrat@example.com](mailto:nusrat@example.com)",
    business: "Nusrat Fashion",
    role: "Owner",
    plan: "Pro",
    status: "Active",
    joinedAt: "2026-07-04",
    lastActive: "2026-10-30T09:45:00",
  },
  {
    id: "USR-1003",
    name: "Tanvir Hasan",
    email: "[tanvir@example.com](mailto:tanvir@example.com)",
    business: "Tanvir Digital",
    role: "Admin",
    plan: "Pro",
    status: "Pending",
    joinedAt: "2026-10-28",
    lastActive: "2026-10-29T15:30:00",
  },
  {
    id: "USR-1004",
    name: "Sadia Islam",
    email: "[sadia@example.com](mailto:sadia@example.com)",
    business: "Sadia Cosmetics",
    role: "Owner",
    plan: "Business",
    status: "Active",
    joinedAt: "2026-05-20",
    lastActive: "2026-10-30T08:10:00",
  },
  {
    id: "USR-1005",
    name: "Imran Hossain",
    email: "[imran@example.com](mailto:imran@example.com)",
    business: "Imran Store",
    role: "Manager",
    plan: "Free",
    status: "Suspended",
    joinedAt: "2026-04-18",
    lastActive: "2026-10-20T11:00:00",
  },
  {
    id: "USR-1006",
    name: "Mim Akter",
    email: "[mim@example.com](mailto:mim@example.com)",
    business: "Mim Boutique",
    role: "Owner",
    plan: "Pro",
    status: "Active",
    joinedAt: "2026-08-16",
    lastActive: "2026-10-30T11:05:00",
  },
  {
    id: "USR-1007",
    name: "Fahim Chowdhury",
    email: "[fahim@example.com](mailto:fahim@example.com)",
    business: "Fahim Tech",
    role: "Agent",
    plan: "Free",
    status: "Pending",
    joinedAt: "2026-10-29",
    lastActive: "2026-10-29T17:20:00",
  },
  {
    id: "USR-1008",
    name: "Ayesha Rahman",
    email: "[ayesha@example.com](mailto:ayesha@example.com)",
    business: "Ayesha Lifestyle",
    role: "Owner",
    plan: "Business",
    status: "Active",
    joinedAt: "2026-03-10",
    lastActive: "2026-10-30T10:55:00",
  },
  {
    id: "USR-1009",
    name: "Sabbir Khan",
    email: "[sabbir@example.com](mailto:sabbir@example.com)",
    business: "Sabbir Mart",
    role: "Admin",
    plan: "Pro",
    status: "Active",
    joinedAt: "2026-09-01",
    lastActive: "2026-10-28T14:25:00",
  },
  {
    id: "USR-1010",
    name: "Tania Sultana",
    email: "[tania@example.com](mailto:tania@example.com)",
    business: "Tania Collection",
    role: "Owner",
    plan: "Free",
    status: "Suspended",
    joinedAt: "2026-02-14",
    lastActive: "2026-10-15T12:00:00",
  },
];

export const recentPlatformActivities: PlatformActivity[] = [
  {
    id: "ACT-001",
    title: "New business registered",
    description: "Mim Boutique created a new account.",
    type: "business",
    createdAt: "2026-10-30T11:05:00",
  },
  {
    id: "ACT-002",
    title: "Subscription upgraded",
    description: "Rahim Electronics is on the Business plan.",
    type: "subscription",
    createdAt: "2026-10-30T10:20:00",
  },
  {
    id: "ACT-003",
    title: "New user registered",
    description: "Fahim Chowdhury joined Cyber7.",
    type: "user",
    createdAt: "2026-10-29T17:20:00",
  },
  {
    id: "ACT-004",
    title: "Account requires review",
    description: "Tanvir Digital is awaiting account review.",
    type: "security",
    createdAt: "2026-10-29T15:30:00",
  },
  {
    id: "ACT-005",
    title: "Subscription activated",
    description: "Sadia Cosmetics has an active Business plan.",
    type: "subscription",
    createdAt: "2026-10-28T12:40:00",
  },
];

export const subscriptionSummary = {
  free: {
    label: "Free",
    users: 1000,
    percentage: 54.35,
    color: "#94a3b8",
  },
  pro: {
    label: "Pro",
    users: 620,
    percentage: 33.7,
    color: "#88da1c",
  },
  business: {
    label: "Business",
    users: 220,
    percentage: 11.95,
    color: "#365314",
  },
};
