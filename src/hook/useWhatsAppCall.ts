"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { callSounds } from "@/src/lib/call-sounds";
import { callService } from "@/src/services/call-service";
import { getStoredToken } from "@/src/lib/token-storage";
import { ApiClientError } from "@/src/lib/api-client";

/**
 * Call lifecycle states visible to the UI.
 *
 * "idle"     – no active call.
 * "ringing"  – incoming/outgoing call ringing; awaiting answer.
 * "assigned" – agent claimed the call in the backend DB (Cyber7-side only).
 *              The call is NOT yet accepted at the Meta/provider level.
 *              Previously mislabeled as "connected". Renamed for semantic
 *              accuracy. The UI may show "Connecting…" in this state.
 * "connected"– reserved for real provider/media connection confirmation.
 *              Requires Meta Calling API integration — NOT YET IMPLEMENTED.
 *              Currently unreachable in production. Kept in the type for
 *              future implementation.
 * "ended"    – call ended (or rejected/missed/taken by another agent).
 */
export type CallState = "idle" | "ringing" | "assigned" | "connected" | "ended";
export type CallDirection = "incoming" | "outgoing";

export interface CallContact {
  callId?: string;
  name: string;
  phone: string;
  callSid?: string;
}

interface UseWhatsAppCallProps {
  workspaceId?: string;
  serverUrl?: string;
  onCallEnded?: (callLog: {
    duration: number;
    phone: string;
    callId?: string;
    status?: string;
  }) => void;
}

export function useWhatsAppCall({
  workspaceId,
  serverUrl,
  onCallEnded,
}: UseWhatsAppCallProps) {
  const [callState, setCallState] = useState<CallState>("idle");
  const [callDirection, setCallDirection] = useState<CallDirection>("outgoing");
  const [activeContact, setActiveContact] = useState<CallContact | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [callNotice, setCallNotice] = useState<string | null>(null);
  const [callError, setCallError] = useState<string | null>(null);

  // References to maintain active state across async event handlers
  const activeCallIdRef = useRef<string | undefined>(undefined);
  const activeContactRef = useRef<CallContact | null>(null);
  const durationRef = useRef<number>(0);
  const processedNotificationIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    activeContactRef.current = activeContact;
    activeCallIdRef.current = activeContact?.callId;
  }, [activeContact]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  // Audio and Socket references
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Compute resolved Socket.IO server URL
  const resolvedServerUrl =
    serverUrl ||
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    (process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")
      : "http://localhost:5000");

  // Audio playback synchronized with verified call lifecycle
  useEffect(() => {
    if (callState === "ringing") {
      if (callDirection === "incoming") {
        callSounds.playIncomingRingtone();
      } else {
        callSounds.playOutgoingRingback();
      }
    } else if (callState === "assigned" || callState === "connected") {
      callSounds.stopAll();
    } else if (callState === "ended") {
      callSounds.playCallEndedBeep();
    } else if (callState === "idle") {
      callSounds.stopAll();
    }

    return () => {
      callSounds.stopAll();
    };
  }, [callState, callDirection]);

  // Call duration counter for connected calls
  useEffect(() => {
    if (callState === "assigned" || callState === "connected") {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (callState === "idle") setDuration(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  // Cleanup media tracks safely
  const cleanupMedia = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Track stop fallback
        }
      });
      localStreamRef.current = null;
    }
  }, []);

  const onCallEndedRef = useRef(onCallEnded);
  useEffect(() => {
    onCallEndedRef.current = onCallEnded;
  }, [onCallEnded]);

  // Socket.IO Authenticated Connection and Calling Event Handlers
  useEffect(() => {
    if (!workspaceId) return;

    const token = getStoredToken();
    if (!token) {
      console.warn(
        "[useWhatsAppCall] No access token found. Socket connection postponed.",
      );
      return;
    }

    const socket = io(resolvedServerUrl, {
      auth: { accessToken: token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    // 2. সার্ভার কানেকশন রিজেক্ট করলে আসল কারণ এখানে দেখতে পাবেন
    socket.on("connect_error", (err) => {
      console.error("[useWhatsAppCall] Socket Connect Error:", err.message);
    });

    socket.on("connect", () => {
      console.log(
        "[useWhatsAppCall] Socket connected successfully:",
        socket.id,
      );
      socket.emit("join-workspace", workspaceId);
    });

    // 1. Incoming Call Event with ACK and Deduplication
    socket.on(
      "incoming-call",
      (
        data: {
          notificationId: string;
          callId: string;
          name: string;
          phone: string;
          callSid?: string;
          workspaceId: string;
        },
        ack?: (response: { received: boolean }) => void,
      ) => {
        // Acknowledge receipt to server immediately
        if (typeof ack === "function") {
          try {
            ack({ received: true });
          } catch (e) {
            console.warn("[useWhatsAppCall] Failed to send incoming ACK:", e);
          }
        }

        if (!data?.notificationId) return;

        // Deduplicate notification delivery
        if (processedNotificationIdsRef.current.has(data.notificationId)) {
          return;
        }
        processedNotificationIdsRef.current.add(data.notificationId);

        activeCallIdRef.current = data.callId;
        setActiveContact({
          callId: data.callId,
          name: data.name || data.phone,
          phone: data.phone,
          callSid: data.callSid || data.callId,
        });
        setCallDirection("incoming");
        setCallNotice(null);
        setCallError(null);
        setCallState("ringing");
      },
    );

    // 2. First-Answer-Wins: Winning Agent Confirmation
    socket.on(
      "call-accepted",
      (data: { workspaceId: string; callId: string; assignedTo: string }) => {
        if (
          activeCallIdRef.current &&
          activeCallIdRef.current !== data.callId
        ) {
          return;
        }
        callSounds.stopAll();
        setCallNotice(null);
        // "assigned" = Cyber7 DB claim confirmed. NOT yet Meta/provider connected.
        // Transition to "connected" only when real provider media is confirmed
        // (Meta Calling API — NOT YET IMPLEMENTED).
        setCallState("assigned");
      },
    );

    // 3. First-Answer-Wins: Losing Agents Notification (Call Taken)
    socket.on(
      "call-taken",
      (data: { workspaceId: string; callId: string; assignedTo: string }) => {
        if (
          activeCallIdRef.current &&
          activeCallIdRef.current !== data.callId
        ) {
          return;
        }
        callSounds.stopAll();
        setCallNotice("Call answered by another team member");
        setCallState("ended");

        setTimeout(() => {
          setCallState("idle");
          setActiveContact(null);
          activeCallIdRef.current = undefined;
          setCallNotice(null);
        }, 1800);
      },
    );

    // 4. Incoming Call Ended / Terminated with ACK
    socket.on(
      "incoming-call-ended",
      (
        data: {
          notificationId: string;
          workspaceId: string;
          callId: string;
          status: "MISSED" | "REJECTED" | "ENDED";
        },
        ack?: (response: { received: boolean }) => void,
      ) => {
        if (typeof ack === "function") {
          try {
            ack({ received: true });
          } catch (e) {
            console.warn("[useWhatsAppCall] Failed to send ended ACK:", e);
          }
        }

        if (
          activeCallIdRef.current &&
          data?.callId &&
          activeCallIdRef.current !== data.callId
        ) {
          return;
        }

        setCallState("ended");
        callSounds.playCallEndedBeep();
        cleanupMedia();

        const finalDuration = durationRef.current;
        const contact = activeContactRef.current;

        if (onCallEnded && contact) {
          onCallEnded({
            duration: finalDuration,
            phone: contact.phone,
            callId: data?.callId || activeCallIdRef.current,
            status: data?.status,
          });
        }

        setTimeout(() => {
          setCallState("idle");
          setActiveContact(null);
          activeCallIdRef.current = undefined;
          setCallNotice(null);
        }, 1500);
      },
    );

    // 5. Backend Socket Error Handling
    socket.on("socket-error", (err: { code: string; message: string }) => {
      console.warn("[useWhatsAppCall] Backend socket error:", err);

      if (err.code === "CALL_NOT_AVAILABLE") {
        setCallNotice(
          "This call was answered by another agent or is no longer available.",
        );
        setCallState("ended");
        setTimeout(() => {
          setCallState("idle");
          setActiveContact(null);
          activeCallIdRef.current = undefined;
          setCallNotice(null);
        }, 2000);
      } else if (err.code === "META_CALLING_NOT_IMPLEMENTED") {
        setCallError(
          "Outgoing WhatsApp calling is not configured yet on this workspace.",
        );
      } else {
        setCallError(err.message || "Call error occurred.");
      }
    });

    socket.on("disconnect", (reason) => {
      if (reason === "io server disconnect") {
        // Disconnected by server (e.g. auth failed)
        socket.connect();
      }
    });

    return () => {
      cleanupMedia();
      socket.disconnect();
    };
  }, [workspaceId, resolvedServerUrl, cleanupMedia, onCallEnded]);

  // Initiate Outgoing Call (Backend REST integration)
  const startCall = useCallback(
    async (contact: CallContact) => {
      if (!workspaceId) {
        setCallError("Active workspace is required to start a call.");
        return;
      }

      setCallNotice(null);
      setCallError(null);
      setActiveContact(contact);
      setCallDirection("outgoing");
      setCallState("ringing");

      try {
        const result = await callService.startCall({
          workspaceId,
          phoneNumber: contact.phone,
          callerName: contact.name,
        });

        if (result?.id) {
          activeCallIdRef.current = result.id;
          setActiveContact((prev) =>
            prev ? { ...prev, callId: result.id } : prev,
          );
        }
      } catch (err) {
        // Backend currently returns HTTP 501 (META_CALLING_NOT_IMPLEMENTED)
        const message =
          err instanceof ApiClientError && err.status === 501
            ? "Outgoing WhatsApp calling is not yet enabled for this workspace (501)."
            : err instanceof Error
              ? err.message
              : "Unable to start outgoing call.";

        setCallError(message);
        setCallState("ended");
        callSounds.playCallEndedBeep();

        setTimeout(() => {
          setCallState("idle");
          setActiveContact(null);
          setCallError(null);
        }, 2500);
      }
    },
    [workspaceId],
  );

  // Accept Incoming Call (Atomic First-Answer-Wins emission)
  const acceptCall = useCallback(async () => {
    callSounds.stopAll();

    if (!socketRef.current || !workspaceId || !activeCallIdRef.current) {
      console.warn(
        "[useWhatsAppCall] Cannot answer: missing socket or call ID",
      );
      return;
    }

    // Atomic claim request sent to backend
    socketRef.current.emit("answer-incoming-call", {
      workspaceId,
      callId: activeCallIdRef.current,
    });
  }, [workspaceId]);

  // Hangup / Decline Call
  const endCall = useCallback(async () => {
    const finalDuration = durationRef.current;
    const callIdToEnd = activeCallIdRef.current;
    const contact = activeContactRef.current;

    callSounds.playCallEndedBeep();
    setCallState("ended");

    // Signal socket to hangup if connected
    if (socketRef.current && workspaceId && callIdToEnd) {
      socketRef.current.emit("hangup-call", {
        workspaceId,
        callId: callIdToEnd,
      });
    }

    // Persist termination to backend
    if (workspaceId && callIdToEnd) {
      try {
        await callService.endCall(
          workspaceId,
          callIdToEnd,
          finalDuration,
          finalDuration > 0 ? "CONNECTED" : "REJECTED",
        );
      } catch (err) {
        console.warn("[useWhatsAppCall] Backend endCall error:", err);
      }
    }

    if (onCallEnded && contact) {
      onCallEnded({
        duration: finalDuration,
        phone: contact.phone,
        callId: callIdToEnd,
      });
    }

    cleanupMedia();

    setTimeout(() => {
      setCallState("idle");
      setActiveContact(null);
      activeCallIdRef.current = undefined;
      setCallNotice(null);
      setCallError(null);
    }, 1200);
  }, [workspaceId, onCallEnded, cleanupMedia]);

  // Audio controls
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    } else {
      setIsMuted((prev) => !prev);
    }
  }, []);

  const toggleSpeaker = useCallback(() => {
    setIsSpeakerOn((prev) => !prev);
  }, []);

  return {
    callState,
    callDirection,
    activeContact,
    duration,
    isMuted,
    isSpeakerOn,
    callNotice,
    callError,
    startCall,
    acceptCall,
    endCall,
    toggleMute,
    toggleSpeaker,
  };
}
