export type TeamRole = "ADMIN" | "MANAGER" | "AGENT";

export type TeamMemberStatus = "ACTIVE" | "INACTIVE" | "INVITED";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: TeamMemberStatus;
  assignedConversations: number;
  joinedAt: string;
}

export const initialTeamMembers: TeamMember[] = [
  {
    id: "member-1",
    name: "Sarah Ahmed",
    email: "[sarah@cyber7.demo](mailto:sarah@cyber7.demo)",
    role: "ADMIN",
    status: "ACTIVE",
    assignedConversations: 0,
    joinedAt: "2026-08-12",
  },
  {
    id: "member-2",
    name: "Rakib Hasan",
    email: "[rakib@cyber7.demo](mailto:rakib@cyber7.demo)",
    role: "MANAGER",
    status: "ACTIVE",
    assignedConversations: 12,
    joinedAt: "2026-08-18",
  },
  {
    id: "member-3",
    name: "Nusrat Jahan",
    email: "[nusrat@cyber7.demo](mailto:nusrat@cyber7.demo)",
    role: "AGENT",
    status: "ACTIVE",
    assignedConversations: 8,
    joinedAt: "2026-09-02",
  },
  {
    id: "member-4",
    name: "Tanvir Hossain",
    email: "[tanvir@cyber7.demo](mailto:tanvir@cyber7.demo)",
    role: "AGENT",
    status: "ACTIVE",
    assignedConversations: 15,
    joinedAt: "2026-09-10",
  },
  {
    id: "member-5",
    name: "Maliha Rahman",
    email: "[maliha@cyber7.demo](mailto:maliha@cyber7.demo)",
    role: "AGENT",
    status: "INACTIVE",
    assignedConversations: 0,
    joinedAt: "2026-09-15",
  },
  {
    id: "member-6",
    name: "Fahim Karim",
    email: "[fahim@cyber7.demo](mailto:fahim@cyber7.demo)",
    role: "MANAGER",
    status: "INVITED",
    assignedConversations: 0,
    joinedAt: "2026-10-20",
  },
];
