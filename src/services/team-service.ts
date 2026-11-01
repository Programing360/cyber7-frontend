/**
 * Team & Workspace Membership API Service
 *
 * Encapsulates all backend HTTP calls for members and invitations.
 */

import apiClient from "../lib/api-client";
import type {
  ApiResponse,
  CreatedInvitationData,
  CreateInvitationInput,
  ListInvitationsResponseData,
  ListMembersResponseData,
  RevokeInvitationData,
  UpdateMemberRoleData,
  UpdateMemberRoleInput,
  UpdateMemberStatusData,
  UpdateMemberStatusInput,
  WorkspaceInvitationItem,
  WorkspaceMemberItem,
} from "../types/api";

export const teamService = {
  /**
   * Fetch members for a workspace (paginated)
   */
  async getMembers(
    workspaceId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ members: WorkspaceMemberItem[]; total: number }> {
    const response = await apiClient.get<
      ApiResponse<ListMembersResponseData>
    >(`/workspaces/${workspaceId}/members`, {
      params: { page, limit },
    });

    return {
      members: response.data?.members ?? [],
      total: response.data?.pagination?.total ?? 0,
    };
  },

  /**
   * Fetch pending invitations for a workspace
   */
  async getInvitations(
    workspaceId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ invitations: WorkspaceInvitationItem[]; total: number }> {
    const response = await apiClient.get<
      ApiResponse<ListInvitationsResponseData>
    >(`/workspaces/${workspaceId}/invitations`, {
      params: { page, limit },
    });

    return {
      invitations: response.data?.invitations ?? [],
      total: response.data?.pagination?.total ?? 0,
    };
  },

  /**
   * Create and send a workspace invitation
   */
  async inviteMember(
    workspaceId: string,
    input: CreateInvitationInput,
  ): Promise<CreatedInvitationData> {
    const response = await apiClient.post<
      ApiResponse<CreatedInvitationData>,
      CreateInvitationInput
    >(`/workspaces/${workspaceId}/invitations`, input);

    if (!response.data) {
      throw new Error("Failed to create invitation");
    }

    return response.data;
  },

  /**
   * Revoke a pending invitation
   */
  async revokeInvitation(
    workspaceId: string,
    invitationId: string,
  ): Promise<RevokeInvitationData> {
    const response = await apiClient.delete<ApiResponse<RevokeInvitationData>>(
      `/workspaces/${workspaceId}/invitations/${invitationId}`,
    );

    return response.data ?? { invitationId };
  },

  /**
   * Update a workspace member's role (ADMIN or AGENT)
   */
  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    role: "ADMIN" | "AGENT",
  ): Promise<UpdateMemberRoleData> {
    const response = await apiClient.patch<
      ApiResponse<UpdateMemberRoleData>,
      UpdateMemberRoleInput
    >(`/workspaces/${workspaceId}/members/${memberId}/role`, { role });

    return response.data!;
  },

  /**
   * Update a member's status (ACTIVE or SUSPENDED)
   */
  async updateMemberStatus(
    workspaceId: string,
    memberId: string,
    status: "ACTIVE" | "SUSPENDED",
  ): Promise<UpdateMemberStatusData> {
    const response = await apiClient.patch<
      ApiResponse<UpdateMemberStatusData>,
      UpdateMemberStatusInput
    >(`/workspaces/${workspaceId}/members/${memberId}/status`, { status });

    return response.data!;
  },

  /**
   * Remove a member from the workspace
   */
  async removeMember(
    workspaceId: string,
    memberId: string,
  ): Promise<{ membershipId?: string }> {
    const response = await apiClient.delete<
      ApiResponse<{ membershipId: string }>
    >(`/workspaces/${workspaceId}/members/${memberId}`);

    return response.data ?? {};
  },

  /**
   * Accept an invitation using an invitation token
   */
  async acceptInvitation(token: string): Promise<unknown> {
    const response = await apiClient.post<
      ApiResponse<{ membershipId: string; workspaceId: string; role: string }>,
      { token: string }
    >("/invitations/accept", { token });

    return response.data;
  },
};
