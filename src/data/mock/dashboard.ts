import type { LucideIcon } from "lucide-react";
import {
  Users,
  MessageCircle,
  Send,
  Megaphone,
} from "lucide-react";

export interface DashboardStat {
  title: string;
  value: string;
  change: string;
  description: string;
  icon: LucideIcon;
  trend: "up" | "down";
}

export const dashboardStats: DashboardStat[] = [
  {
    title: "Total Contacts",
    value: "2,450",
    change: "+12.8%",
    description: "Compared with last month",
    icon: Users,
    trend: "up",
  },
  {
    title: "Total Messages",
    value: "18,294",
    change: "+8.2%",
    description: "Compared with last month",
    icon: MessageCircle,
    trend: "up",
  },
  {
    title: "Messages Sent",
    value: "12,840",
    change: "+6.4%",
    description: "Compared with last month",
    icon: Send,
    trend: "up",
  },
  {
    title: "Active Campaigns",
    value: "08",
    change: "+2",
    description: "Compared with last month",
    icon: Megaphone,
    trend: "up",
  },
];

export const messageAnalytics = [
  { day: "Mon", incoming: 320, outgoing: 280 },
  { day: "Tue", incoming: 420, outgoing: 350 },
  { day: "Wed", incoming: 360, outgoing: 410 },
  { day: "Thu", incoming: 510, outgoing: 430 },
  { day: "Fri", incoming: 450, outgoing: 520 },
  { day: "Sat", incoming: 620, outgoing: 480 },
  { day: "Sun", incoming: 540, outgoing: 590 },
];

export const recentConversations = [
  {
    id: "1",
    name: "Sarah Ahmed",
    message: "Thank you! I received my order.",
    time: "2 min ago",
    initials: "SA",
    color: "bg-purple-100 text-purple-700",
    unread: 2,
    status: "Customer",
  },
  {
    id: "2",
    name: "Mohammad Rahman",
    message: "Could you share the product details?",
    time: "8 min ago",
    initials: "MR",
    color: "bg-blue-100 text-blue-700",
    unread: 1,
    status: "New lead",
  },
  {
    id: "3",
    name: "Nusrat Jahan",
    message: "When will my order be delivered?",
    time: "15 min ago",
    initials: "NJ",
    color: "bg-pink-100 text-pink-700",
    unread: 0,
    status: "Customer",
  },
  {
    id: "4",
    name: "Tanvir Hasan",
    message: "I would like to know about pricing.",
    time: "32 min ago",
    initials: "TH",
    color: "bg-amber-100 text-amber-700",
    unread: 0,
    status: "Potential lead",
  },
];

export const recentCampaigns = [
  {
    id: "CMP-001",
    name: "October Product Launch",
    audience: 1250,
    sent: 1250,
    delivered: 1180,
    status: "Completed",
  },
  {
    id: "CMP-002",
    name: "Customer Retention",
    audience: 800,
    sent: 640,
    delivered: 610,
    status: "In Progress",
  },
  {
    id: "CMP-003",
    name: "Weekend Special Offer",
    audience: 2000,
    sent: 0,
    delivered: 0,
    status: "Scheduled",
  },
];