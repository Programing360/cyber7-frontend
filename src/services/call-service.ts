import apiClient, { ApiClientError } from "../lib/api-client";

export interface CallLogItem {
  id: string;
  name: string;
  phone: string;
  type: "INCOMING" | "OUTGOING" | "MISSED";
  status: "RINGING" | "CONNECTED" | "ENDED" | "REJECTED";
  providerCallId?: string | null;
  callSid?: string | null;
  startedAt?: string;
  endedAt?: string;
  timestamp: string;
  duration?: string;
}

export interface StartCallPayload {
  workspaceId: string;
  phoneNumber: string;
  callerName?: string;
}

export interface StartCallResult {
  id: string;
  workspaceId: string;
  phoneNumber: string;
  callerName: string;
  callType: string;
  status: string;
  startedAt: string;
}

export const callService = {
  /**
   * Fetch call logs for a specific workspace with optional filtering and search.
   * Scoped strictly to the authenticated user's workspace membership.
   */
  async getCallLogs(
    workspaceId: string,
    filter?: "ALL" | "MISSED",
    search?: string,
  ): Promise<CallLogItem[]> {
    if (!workspaceId) return [];

    try {
      const response = await apiClient.get<{
        success: boolean;
        data: CallLogItem[];
      }>(`/workspaces/${encodeURIComponent(workspaceId)}/calls`, {
        params: {
          filter: filter && filter !== "ALL" ? filter : undefined,
          search: search?.trim() ? search.trim() : undefined,
        },
      });

      return response.data || [];
    } catch (err) {
      if (err instanceof ApiClientError) {
        console.error("[callService.getCallLogs] API error:", {
          status: err.status,
          message: err.message,
          errors: err.errors,
        });
      } else {
        console.error("[callService.getCallLogs] Unexpected error:", err);
      }
      throw err;
    }
  },

  /**
   * Initiate an outgoing WhatsApp call session via the backend.
   *
   * Note: Outbound calling endpoints in the backend currently return HTTP 501
   * (META_CALLING_NOT_IMPLEMENTED) until the Meta Cloud Calling VoIP API is configured.
   */
  async startCall(payload: StartCallPayload): Promise<StartCallResult | null> {
    if (!payload?.workspaceId) {
      throw new Error("workspaceId is required to start a call.");
    }

    try {
      const response = await apiClient.post<{
        success: boolean;
        call?: StartCallResult;
        data?: StartCallResult;
      }>(`/workspaces/${encodeURIComponent(payload.workspaceId)}/calls/start`, {
        phoneNumber: payload.phoneNumber,
        callerName: payload.callerName,
      });

      return response.call || response.data || null;
    } catch (err) {
      if (err instanceof ApiClientError) {
        console.warn("[callService.startCall] Provider status:", {
          status: err.status,
          message: err.message,
        });
      }
      throw err;
    }
  },

  /**
   * Terminate a call session in the backend.
   *
   * Note: Backend provider call termination returns HTTP 501
   * (META_CALL_TERMINATION_NOT_IMPLEMENTED) until the Meta Cloud Calling API is configured.
   */
  async endCall(
    workspaceId: string,
    callId: string,
    durationSeconds?: number,
    status?: string,
  ): Promise<boolean> {
    if (!workspaceId || !callId) return false;

    try {
      await apiClient.post(
        `/workspaces/${encodeURIComponent(workspaceId)}/calls/${encodeURIComponent(callId)}/end`,
        {
          durationSeconds: durationSeconds ?? 0,
          status,
        },
      );
      return true;
    } catch (err) {
      if (err instanceof ApiClientError) {
        console.warn("[callService.endCall] Provider termination status:", {
          status: err.status,
          message: err.message,
        });
      }
      return false;
    }
  },
};
