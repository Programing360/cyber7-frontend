export type AutomationStatus = "Active" | "Inactive";

export type AutomationTrigger =
  | "Incoming Message"
  | "Keyword Match"
  | "New Contact"
  | "No Reply"
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
}

export const initialAutomations: Automation[] = [
  {
    id: "auto-001",
    name: "Welcome New Customers",
    description:
      "Automatically welcome customers when they send their first message.",
    trigger: "New Contact",
    condition: "Contact is new",
    action: "Send Message",
    actionValue:
      "Assalamu Alaikum! Welcome to our business. How can we help you today?",
    status: "Active",
    executions: 1248,
    lastExecuted: "2 minutes ago",
    createdAt: "2026-10-20",
  },
  {
    id: "auto-002",
    name: "Pricing Inquiry",
    description: "Respond automatically when a customer asks about pricing.",
    trigger: "Keyword Match",
    condition: "Message contains: price, pricing, cost",
    action: "Send Message",
    actionValue:
      "Thank you for your interest! Please tell us which product you would like to know about.",
    status: "Active",
    executions: 856,
    lastExecuted: "15 minutes ago",
    createdAt: "2026-10-21",
  },
  {
    id: "auto-003",
    name: "Assign Sales Leads",
    description: "Route incoming sales inquiries to the sales team.",
    trigger: "Keyword Match",
    condition: "Message contains: buy, order, purchase",
    action: "Assign Agent",
    actionValue: "Sales Team",
    status: "Active",
    executions: 432,
    lastExecuted: "1 hour ago",
    createdAt: "2026-10-22",
  },
  {
    id: "auto-004",
    name: "Follow Up Unanswered Chats",
    description: "Identify conversations that have not received a reply.",
    trigger: "No Reply",
    condition: "No agent reply for 30 minutes",
    action: "Notify Team",
    actionValue: "Customer Support Team",
    status: "Inactive",
    executions: 87,
    lastExecuted: "Yesterday",
    createdAt: "2026-10-23",
  },
  {
    id: "auto-005",
    name: "Tag Order Customers",
    description: "Organize customers who contact us about an order.",
    trigger: "Keyword Match",
    condition: "Message contains: order, delivery, tracking",
    action: "Add Tag",
    actionValue: "Order Inquiry",
    status: "Active",
    executions: 312,
    lastExecuted: "35 minutes ago",
    createdAt: "2026-10-24",
  },
];
