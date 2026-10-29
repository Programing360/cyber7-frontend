export type TemplateCategory = "Marketing" | "Utility" | "Authentication";

export type TemplateStatus = "Draft" | "Pending" | "Approved" | "Rejected";

export interface MessageTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  language: string;
  status: TemplateStatus;
  body: string;
  footer: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

export const initialTemplates: MessageTemplate[] = [
  {
    id: "template-1",
    name: "welcome_customer",
    category: "Utility",
    language: "English",
    status: "Approved",
    body: "Hello {{1}}, welcome to {{2}}! We are happy to have you with us.",
    footer: "Thank you for choosing us.",
    variables: ["Customer Name", "Business Name"],
    createdAt: "2026-10-10",
    updatedAt: "2026-10-12",
  },
  {
    id: "template-2",
    name: "special_offer",
    category: "Marketing",
    language: "English",
    status: "Approved",
    body: "Hi {{1}}, enjoy {{2}}% off on your next purchase. Offer ends soon!",
    footer: "Terms and conditions apply.",
    variables: ["Customer Name", "Discount"],
    createdAt: "2026-10-11",
    updatedAt: "2026-10-15",
  },
  {
    id: "template-3",
    name: "order_confirmation",
    category: "Utility",
    language: "English",
    status: "Approved",
    body: "Hi {{1}}, your order #{{2}} has been confirmed. Total: {{3}}.",
    footer: "Thank you for your order.",
    variables: ["Customer Name", "Order ID", "Order Total"],
    createdAt: "2026-10-13",
    updatedAt: "2026-10-14",
  },
  {
    id: "template-4",
    name: "payment_reminder",
    category: "Utility",
    language: "English",
    status: "Pending",
    body: "Hello {{1}}, this is a reminder about your pending payment of {{2}}.",
    footer: "Please contact support if you need help.",
    variables: ["Customer Name", "Amount"],
    createdAt: "2026-10-20",
    updatedAt: "2026-10-20",
  },
  {
    id: "template-5",
    name: "login_verification",
    category: "Authentication",
    language: "English",
    status: "Approved",
    body: "Your verification code is {{1}}. Do not share this code with anyone.",
    footer: "",
    variables: ["Verification Code"],
    createdAt: "2026-10-22",
    updatedAt: "2026-10-22",
  },
  {
    id: "template-6",
    name: "black_friday_offer",
    category: "Marketing",
    language: "English",
    status: "Rejected",
    body: "Hello {{1}}, get exciting deals on selected products this week!",
    footer: "Visit our store today.",
    variables: ["Customer Name"],
    createdAt: "2026-10-23",
    updatedAt: "2026-10-24",
  },
  {
    id: "template-7",
    name: "appointment_reminder",
    category: "Utility",
    language: "English",
    status: "Draft",
    body: "Hi {{1}}, your appointment is scheduled for {{2}}.",
    footer: "Reply if you need assistance.",
    variables: ["Customer Name", "Appointment Time"],
    createdAt: "2026-10-27",
    updatedAt: "2026-10-27",
  },
];
