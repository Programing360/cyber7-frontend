/**
 * Automation Service
 *
 * Encapsulates backend HTTP calls for workspace-scoped WhatsApp automation rules.
 * Supports CRUD operations, status toggling, and real-time execution statistics.
 */

import apiClient from "../lib/api-client";
import type {
  ApiResponse,
  AutomationRuleItem,
  CreateAutomationRulePayload,
  UpdateAutomationRulePayload,
} from "../types/api";

export const automationService = {
  /**
   * Fetch all automation rules configured for a specific workspace.
   * Endpoint: GET /api/workspaces/:workspaceId/automations
   */
  async getAutomationRules(workspaceId: string): Promise<AutomationRuleItem[]> {
    if (!workspaceId) {
      throw new Error("Workspace ID is required to fetch automation rules");
    }

    const response = await apiClient.get<ApiResponse<AutomationRuleItem[]>>(
      `/workspaces/${workspaceId}/automations`,
    );

    return response?.data ?? [];
  },

  /**
   * Create a new automation rule for a workspace.
   * Endpoint: POST /api/workspaces/:workspaceId/automations
   */
  async createAutomationRule(
    workspaceId: string,
    payload: CreateAutomationRulePayload,
  ): Promise<AutomationRuleItem> {
    if (!workspaceId) {
      throw new Error("Workspace ID is required to create an automation rule");
    }

    const response = await apiClient.post<
      ApiResponse<AutomationRuleItem>,
      CreateAutomationRulePayload
    >(`/workspaces/${workspaceId}/automations`, payload);

    if (!response?.data) {
      throw new Error(response?.message || "Failed to create automation rule");
    }

    return response.data;
  },

  /**
   * Update an existing automation rule.
   * Endpoint: PATCH /api/workspaces/:workspaceId/automations/:ruleId
   */
  async updateAutomationRule(
    workspaceId: string,
    ruleId: string,
    payload: UpdateAutomationRulePayload,
  ): Promise<AutomationRuleItem> {
    if (!workspaceId || !ruleId) {
      throw new Error("Workspace ID and Rule ID are required to update an automation rule");
    }

    const response = await apiClient.patch<
      ApiResponse<AutomationRuleItem>,
      UpdateAutomationRulePayload
    >(`/workspaces/${workspaceId}/automations/${ruleId}`, payload);

    if (!response?.data) {
      throw new Error(response?.message || "Failed to update automation rule");
    }

    return response.data;
  },

  /**
   * Toggle an automation rule's active/inactive status.
   * Endpoint: PATCH /api/workspaces/:workspaceId/automations/:ruleId
   */
  async toggleAutomationRule(
    workspaceId: string,
    ruleId: string,
    isActive: boolean,
  ): Promise<AutomationRuleItem> {
    return this.updateAutomationRule(workspaceId, ruleId, { isActive });
  },

  /**
   * Delete an automation rule.
   * Endpoint: DELETE /api/workspaces/:workspaceId/automations/:ruleId
   */
  async deleteAutomationRule(
    workspaceId: string,
    ruleId: string,
  ): Promise<void> {
    if (!workspaceId || !ruleId) {
      throw new Error("Workspace ID and Rule ID are required to delete an automation rule");
    }

    await apiClient.delete<ApiResponse<unknown>>(
      `/workspaces/${workspaceId}/automations/${ruleId}`,
    );
  },
};

export default automationService;

