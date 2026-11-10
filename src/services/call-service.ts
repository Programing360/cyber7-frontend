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
  sdpOffer?: string; // WebRTC SDP Offer
}

export interface StartCallResult {
  id: string;
  callId?: string;
  callSid?: string;
  status: string;
  session?: {
    sdp_type?: string;
    sdp?: string;
  } | null;
  workspaceId?: string;
  phoneNumber?: string;
  callerName?: string;
  callType?: string;
  startedAt?: string;
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
   * Initiate an outgoing WhatsApp call session via the backend with WebRTC SDP offer.
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
        sdpOffer: payload.sdpOffer,
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
