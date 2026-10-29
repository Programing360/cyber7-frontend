import {
  LayoutDashboard,
  MessageCircle,
  Users,
  Megaphone,
  FileText,
  Workflow,
  UserRoundCog,
  ChartNoAxesCombined,
  CreditCard,
  Settings,
  Headset,
  ShieldCheck,
  Plug,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

export const navigationGroups: NavigationGroup[] = [
  {
    title: "WORKSPACE",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "WhatsApp Inbox",
        href: "/inbox",
        icon: MessageCircle,
        badge: "12",
      },
      {
        label: "Contacts",
        href: "/contacts",
        icon: Users,
      },
      {
        label: "Campaigns",
        href: "/campaigns",
        icon: Megaphone,
      },
      {
        label: "Message Templates",
        href: "/templates",
        icon: FileText,
      },
      {
        label: "Automations",
        href: "/automation",
        icon: Workflow,
      },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      {
        label: "Team Management",
        href: "/team",
        icon: UserRoundCog,
      },
      {
        label: "Analytics",
        href: "/analytics",
        icon: ChartNoAxesCombined,
      },
      {
        label: "Billing",
        href: "/billing",
        icon: CreditCard,
      },
    ],
  },
  {
    title: "CONFIGURATION",
    items: [
      {
        label: "Integrations",
        href: "/integrations/whatsapp",
        icon: Plug,
      },
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
      },
      {
        label: "Support",
        href: "/support",
        icon: Headset,
      },
      {
        label: "Super Admin",
        href: "/super-admin",
        icon: ShieldCheck,
      },
    ],
  },
];
