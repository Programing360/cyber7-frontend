export type CampaignStatus =
  | "Draft"
  | "Scheduled"
  | "Running"
  | "Paused"
  | "Completed";

export interface Campaign {
  id: string;
  name: string;
  description: string;
  templateName: string;
  audience: string;
  recipients: number;
  status: CampaignStatus;
  scheduledAt: string;
  createdAt: string;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
}

export const initialCampaigns: Campaign[] = [
  {
    id: "campaign-1",
    name: "October Special Offer",
    description: "Monthly promotional campaign for customers.",
    templateName: "monthly_special_offer",
    audience: "All Customers",
    recipients: 1200,
    status: "Completed",
    scheduledAt: "2026-10-05T10:00",
    createdAt: "2026-10-01",
    sent: 1200,
    delivered: 1164,
    read: 842,
    failed: 36,
  },
  {
    id: "campaign-2",
    name: "New Product Launch",
    description: "Introduce our latest products to interested leads.",
    templateName: "new_product_announcement",
    audience: "New Leads",
    recipients: 450,
    status: "Running",
    scheduledAt: "2026-10-29T18:00",
    createdAt: "2026-10-26",
    sent: 280,
    delivered: 264,
    read: 193,
    failed: 16,
  },
  {
    id: "campaign-3",
    name: "VIP Customer Rewards",
    description: "Special rewards for high-value customers.",
    templateName: "vip_customer_rewards",
    audience: "VIP Customers",
    recipients: 180,
    status: "Scheduled",
    scheduledAt: "2026-10-30T11:00",
    createdAt: "2026-10-27",
    sent: 0,
    delivered: 0,
    read: 0,
    failed: 0,
  },
  {
    id: "campaign-4",
    name: "Customer Feedback",
    description: "Collect feedback after recent purchases.",
    templateName: "customer_feedback",
    audience: "Recent Buyers",
    recipients: 320,
    status: "Draft",
    scheduledAt: "",
    createdAt: "2026-10-28",
    sent: 0,
    delivered: 0,
    read: 0,
    failed: 0,
  },
  {
    id: "campaign-5",
    name: "Weekend Promotion",
    description: "Weekend promotional offer.",
    templateName: "weekend_promotion",
    audience: "All Customers",
    recipients: 1200,
    status: "Paused",
    scheduledAt: "2026-10-31T12:00",
    createdAt: "2026-10-28",
    sent: 500,
    delivered: 475,
    read: 312,
    failed: 25,
  },
  {
    id: "campaign-6",
    name: "Welcome New Customers",
    description: "Welcome newly registered customers.",
    templateName: "welcome_message",
    audience: "New Customers",
    recipients: 150,
    status: "Completed",
    scheduledAt: "2026-10-20T09:00",
    createdAt: "2026-10-18",
    sent: 150,
    delivered: 147,
    read: 121,
    failed: 3,
  },
];
