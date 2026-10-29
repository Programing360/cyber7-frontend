export interface ChatMessage {
  id: string;
  text: string;
  time: string;
  direction: "incoming" | "outgoing";
  status?: "sent" | "delivered" | "read";
}

export interface Conversation {
  id: string;
  name: string;
  phone: string;
  initials: string;
  color: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  assignedTo: string;
  status: "Open" | "Pending" | "Resolved";
  messages: ChatMessage[];
}

export const initialConversations: Conversation[] = [
  {
    id: "conv-1",
    name: "Sarah Ahmed",
    phone: "+880 1712-345678",
    initials: "SA",
    color: "bg-purple-100 text-purple-700",
    lastMessage: "Thank you! I received my order.",
    lastMessageTime: "10:42 AM",
    unread: 2,
    assignedTo: "Admin User",
    status: "Open",
    messages: [
      {
        id: "m-1",
        text: "Hello, I need some information about my order.",
        time: "10:35 AM",
        direction: "incoming",
      },
      {
        id: "m-2",
        text: "Hello Sarah! I'd be happy to help you.",
        time: "10:37 AM",
        direction: "outgoing",
        status: "read",
      },
      {
        id: "m-3",
        text: "Your order has been delivered successfully.",
        time: "10:40 AM",
        direction: "outgoing",
        status: "read",
      },
      {
        id: "m-4",
        text: "Thank you! I received my order.",
        time: "10:42 AM",
        direction: "incoming",
      },
    ],
  },
  {
    id: "conv-2",
    name: "Mohammad Rahman",
    phone: "+880 1812-456789",
    initials: "MR",
    color: "bg-blue-100 text-blue-700",
    lastMessage: "Could you share the product details?",
    lastMessageTime: "10:30 AM",
    unread: 1,
    assignedTo: "Admin User",
    status: "Open",
    messages: [
      {
        id: "m-5",
        text: "Hi, I'm interested in your products.",
        time: "10:25 AM",
        direction: "incoming",
      },
      {
        id: "m-6",
        text: "Welcome! Which product would you like to know about?",
        time: "10:27 AM",
        direction: "outgoing",
        status: "delivered",
      },
      {
        id: "m-7",
        text: "Could you share the product details?",
        time: "10:30 AM",
        direction: "incoming",
      },
    ],
  },
  {
    id: "conv-3",
    name: "Nusrat Jahan",
    phone: "+880 1912-567890",
    initials: "NJ",
    color: "bg-pink-100 text-pink-700",
    lastMessage: "When will my order arrive?",
    lastMessageTime: "10:15 AM",
    unread: 0,
    assignedTo: "Admin User",
    status: "Pending",
    messages: [
      {
        id: "m-8",
        text: "I placed an order yesterday.",
        time: "10:10 AM",
        direction: "incoming",
      },
      {
        id: "m-9",
        text: "Could you please share your order number?",
        time: "10:12 AM",
        direction: "outgoing",
        status: "delivered",
      },
      {
        id: "m-10",
        text: "When will my order arrive?",
        time: "10:15 AM",
        direction: "incoming",
      },
    ],
  },
  {
    id: "conv-4",
    name: "Tanvir Hasan",
    phone: "+880 1612-678901",
    initials: "TH",
    color: "bg-amber-100 text-amber-700",
    lastMessage: "I would like to know about pricing.",
    lastMessageTime: "9:55 AM",
    unread: 0,
    assignedTo: "Unassigned",
    status: "Resolved",
    messages: [
      {
        id: "m-11",
        text: "Hello, can you tell me about your pricing?",
        time: "9:50 AM",
        direction: "incoming",
      },
      {
        id: "m-12",
        text: "Of course! I'll share the available plans with you.",
        time: "9:55 AM",
        direction: "outgoing",
        status: "read",
      },
    ],
  },
];