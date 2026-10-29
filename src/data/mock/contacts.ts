export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  tags: string[];
  status: "Active" | "Inactive";
  createdAt: string;
}

export const initialContacts: Contact[] = [
  {
    id: "contact-1",
    name: "Rahim Ahmed",
    phone: "+8801712345678",
    email: "rahim@example.com",
    company: "Tech Solutions",
    tags: ["Customer", "VIP"],
    status: "Active",
    createdAt: "2026-10-20",
  },
  {
    id: "contact-2",
    name: "Nusrat Jahan",
    phone: "+8801812345678",
    email: "nusrat@example.com",
    company: "Creative Studio",
    tags: ["Lead"],
    status: "Active",
    createdAt: "2026-10-21",
  },
  {
    id: "contact-3",
    name: "Tanvir Hasan",
    phone: "+8801912345678",
    email: "tanvir@example.com",
    company: "Digital Agency",
    tags: ["Customer"],
    status: "Inactive",
    createdAt: "2026-10-22",
  },
  {
    id: "contact-4",
    name: "Sadia Islam",
    phone: "+8801612345678",
    email: "sadia@example.com",
    company: "Fashion House",
    tags: ["Lead", "New"],
    status: "Active",
    createdAt: "2026-10-23",
  },
  {
    id: "contact-5",
    name: "Fahim Chowdhury",
    phone: "+8801512345678",
    email: "fahim@example.com",
    company: "Smart Commerce",
    tags: ["VIP", "Customer"],
    status: "Active",
    createdAt: "2026-10-24",
  },
  {
    id: "contact-6",
    name: "Ayesha Rahman",
    phone: "+8801312345678",
    email: "ayesha@example.com",
    company: "Ayesha Boutique",
    tags: ["Lead"],
    status: "Inactive",
    createdAt: "2026-10-25",
  },
  {
    id: "contact-7",
    name: "Imran Hossain",
    phone: "+8801412345678",
    email: "imran@example.com",
    company: "Horizon Ltd.",
    tags: ["Customer"],
    status: "Active",
    createdAt: "2026-10-26",
  },
  {
    id: "contact-8",
    name: "Maliha Akter",
    phone: "+8801711122233",
    email: "maliha@example.com",
    company: "Online Shop",
    tags: ["New", "Lead"],
    status: "Active",
    createdAt: "2026-10-27",
  },
];