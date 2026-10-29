export type TicketPriority = "Low" | "Medium" | "High" | "Urgent";

export type TicketStatus = "Open" | "In Progress" | "Resolved";

export interface TicketMessage {
  id: string;
  sender: string;
  role: "customer" | "support";
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  customer: string;
  email: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  description: string;
  messages: TicketMessage[];
}

export const supportTickets: SupportTicket[] = [
  {
    id: "TKT-1001",
    subject: "WhatsApp messages are not being delivered",
    customer: "Rahim Ahmed",
    email: "rahim@example.com",
    category: "WhatsApp Integration",
    priority: "Urgent",
    status: "Open",
    createdAt: "2026-10-29T09:30:00",
    updatedAt: "2026-10-29T10:15:00",
    description:
      "My WhatsApp campaign messages are not reaching customers. The dashboard shows that the messages were sent, but delivery status is not updating.",
    messages: [
      {
        id: "MSG-1001",
        sender: "Rahim Ahmed",
        role: "customer",
        message:
          "My WhatsApp campaign messages are not being delivered. Could you please investigate this issue?",
        createdAt: "2026-10-29T09:30:00",
      },
      {
        id: "MSG-1002",
        sender: "Cyber7 Support",
        role: "support",
        message:
          "Thank you for reporting this issue. Our support team will investigate the delivery status and WhatsApp connection.",
        createdAt: "2026-10-29T10:15:00",
      },
    ],
  },
  {
    id: "TKT-1002",
    subject: "Unable to connect WhatsApp Business account",
    customer: "Nusrat Jahan",
    email: "[nusrat@example.com](mailto:nusrat@example.com)",
    category: "Account Setup",
    priority: "High",
    status: "In Progress",
    createdAt: "2026-10-28T11:20:00",
    updatedAt: "2026-10-29T08:40:00",
    description:
      "I am trying to connect my WhatsApp Business account, but the configuration process does not complete.",
    messages: [
      {
        id: "MSG-2001",
        sender: "Nusrat Jahan",
        role: "customer",
        message:
          "The WhatsApp account connection process keeps getting stuck. Please help me resolve it.",
        createdAt: "2026-10-28T11:20:00",
      },
      {
        id: "MSG-2002",
        sender: "Cyber7 Support",
        role: "support",
        message:
          "We are reviewing the account configuration steps. Please verify that your WhatsApp Business account has the required permissions.",
        createdAt: "2026-10-29T08:40:00",
      },
    ],
  },
  {
    id: "TKT-1003",
    subject: "Question about subscription upgrade",
    customer: "Tanvir Hasan",
    email: "[tanvir@example.com](mailto:tanvir@example.com)",
    category: "Billing",
    priority: "Medium",
    status: "Open",
    createdAt: "2026-10-27T14:10:00",
    updatedAt: "2026-10-27T14:10:00",
    description:
      "I would like to upgrade from the Free plan to the Pro plan. I need more information about the available features.",
    messages: [
      {
        id: "MSG-3001",
        sender: "Tanvir Hasan",
        role: "customer",
        message:
          "Can you explain the main differences between the Free and Pro plans?",
        createdAt: "2026-10-27T14:10:00",
      },
    ],
  },
  {
    id: "TKT-1004",
    subject: "Campaign report is showing incorrect numbers",
    customer: "Sadia Islam",
    email: "[sadia@example.com](mailto:sadia@example.com)",
    category: "Campaigns",
    priority: "High",
    status: "In Progress",
    createdAt: "2026-10-26T16:45:00",
    updatedAt: "2026-10-28T09:00:00",
    description:
      "The campaign report shows fewer delivered messages than expected. I would like to understand why the report and campaign totals do not match.",
    messages: [
      {
        id: "MSG-4001",
        sender: "Sadia Islam",
        role: "customer",
        message:
          "The delivered message count in my campaign report seems incorrect.",
        createdAt: "2026-10-26T16:45:00",
      },
      {
        id: "MSG-4002",
        sender: "Cyber7 Support",
        role: "support",
        message:
          "We are checking the report calculations. Delivery status updates may affect the totals shown in the dashboard.",
        createdAt: "2026-10-28T09:00:00",
      },
    ],
  },
  {
    id: "TKT-1005",
    subject: "How to add a new team member?",
    customer: "Imran Hossain",
    email: "[imran@example.com](mailto:imran@example.com)",
    category: "Team Management",
    priority: "Low",
    status: "Resolved",
    createdAt: "2026-10-24T10:00:00",
    updatedAt: "2026-10-24T12:30:00",
    description: "I need help inviting another agent to my Cyber7 workspace.",
    messages: [
      {
        id: "MSG-5001",
        sender: "Imran Hossain",
        role: "customer",
        message: "How can I invite a new agent to my workspace?",
        createdAt: "2026-10-24T10:00:00",
      },
      {
        id: "MSG-5002",
        sender: "Cyber7 Support",
        role: "support",
        message:
          "Open Team Management, select Invite Member, enter the member's email address, and assign the appropriate role.",
        createdAt: "2026-10-24T12:30:00",
      },
    ],
  },
];

export const ticketCategories = [
  "WhatsApp Integration",
  "Account Setup",
  "Billing",
  "Campaigns",
  "Team Management",
  "Technical Issue",
  "Other",
];

export const ticketPriorities: TicketPriority[] = [
  "Low",
  "Medium",
  "High",
  "Urgent",
];

export const ticketStatuses: TicketStatus[] = [
  "Open",
  "In Progress",
  "Resolved",
];
