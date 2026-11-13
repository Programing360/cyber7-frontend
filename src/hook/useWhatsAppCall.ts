"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { callSounds } from "@/src/lib/call-sounds";
import { getStoredToken } from "@/src/lib/token-storage";

export type CallState = "idle" | "ringing" | "assigned" | "connected" | "ended";
export type CallDirection = "incoming" | "outgoing";

export interface CallContact {
  callId?: string;
  name: string;
  phone: string;
  callSid?: string;
  databaseCallId?: string;
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

type SocketAck = (
  error: Error | null,
  response?: {
    received?: boolean;
    accepted?: boolean;
    callId?: string;
    sdpAnswer?: string;
  },
) => void;

type IncomingCallPayload = {
  notificationId?: string;
  callId?: string;
  providerCallId?: string;
  callSid?: string;
  id?: string;
  name?: string;
  phone?: string;
  workspaceId?: string;
  sdpOffer?: string;
  session?: { sdp?: string };
};

const waitForIceGathering = (
  peer: RTCPeerConnection,
  timeoutMs = 8000,
): Promise<string> =>
  new Promise((resolve, reject) => {
    const getSdp = () => peer.localDescription?.sdp || "";

    if (peer.iceGatheringState === "complete") {
      const sdp = getSdp();
      sdp ? resolve(sdp) : reject(new Error("Local SDP is empty."));
      return;
    }

    const timeout = window.setTimeout(() => {
      const sdp = getSdp();
      if (sdp) resolve(sdp);
      else reject(new Error("ICE gathering timed out without local SDP."));
    }, timeoutMs);

    const onStateChange = () => {
      if (peer.iceGatheringState !== "complete") return;
      window.clearTimeout(timeout);
      peer.removeEventListener("icegatheringstatechange", onStateChange);
      const sdp = getSdp();
      sdp ? resolve(sdp) : reject(new Error("Local SDP is empty."));
    };

    peer.addEventListener("icegatheringstatechange", onStateChange);
  });

const makePeerConnection = (): RTCPeerConnection =>
  new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  });

export function useWhatsAppCall({
  workspaceId,
  serverUrl,
  onCallEnded,
}: UseWhatsAppCallProps) {
  const [callState, setCallState] = useState<CallState>("idle");
  const [callDirection, setCallDirection] = useState<CallDirection>("incoming");
  const [activeContact, setActiveContact] = useState<CallContact | null>(null);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callNotice, setCallNotice] = useState<string | null>(null);
  const [callError, setCallError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const incomingOfferSdpRef = useRef<string | null>(null);

  const activeCallIdRef = useRef<string | undefined>(undefined);
  const databaseCallIdRef = useRef<string | undefined>(undefined);
  const activeContactRef = useRef<CallContact | null>(null);
  const durationRef = useRef(0);
  const onCallEndedRef = useRef(onCallEnded);
  const endBeepPlayedRef = useRef(false);
  const endingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const acceptingCallRef = useRef(false);
  const pendingCallAbortRef = useRef<{ isAborted: boolean; phone?: string }>({
    isAborted: false,
  });

  useEffect(() => {
    onCallEndedRef.current = onCallEnded;
  }, [onCallEnded]);

  useEffect(() => {
    activeContactRef.current = activeContact;
  }, [activeContact]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  const playEndBeepOnce = useCallback(() => {
    if (endBeepPlayedRef.current) return;
    endBeepPlayedRef.current = true;
    callSounds.playCallEndedBeep();
  }, []);

  const markCallConnected = useCallback(() => {
    setCallState("connected");
    setCallNotice(null);
    setCallError(null);
    callSounds.stopAll();
  }, []);

  const cleanupMedia = useCallback(() => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    const peer = peerConnectionRef.current;
    if (peer) {
      peer.ontrack = null;
      peer.onconnectionstatechange = null;
      peer.oniceconnectionstatechange = null;
      peer.close();
      peerConnectionRef.current = null;
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause();
      remoteAudioRef.current.srcObject = null;
    }

    incomingOfferSdpRef.current = null;
  }, []);

  const resolvedServerUrl =
    serverUrl ||
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    (process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")
      : "http://localhost:5000");

  // Remote audio element
  useEffect(() => {
    const audio = new Audio();
    audio.autoplay = true;
    audio.setAttribute("playsinline", "true");
    remoteAudioRef.current = audio;

    return () => {
      audio.pause();
      audio.srcObject = null;
      remoteAudioRef.current = null;
    };
  }, []);

  // Call sounds and timer
  useEffect(() => {
    if (callState === "ringing") {
      callDirection === "incoming"
        ? callSounds.playIncomingRingtone()
        : callSounds.playOutgoingRingback();
    } else if (callState === "connected") {
      callSounds.stopAll();
    } else if (callState === "ended") {
      callSounds.stopAll();
      playEndBeepOnce();
    } else {
      callSounds.stopAll();
    }

    return () => callSounds.stopAll();
  }, [callState, callDirection, playEndBeepOnce]);

  useEffect(() => {
    if (callState === "connected") {
      timerRef.current = setInterval(() => setDuration((v) => v + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      if (callState === "idle" || callState === "ringing") setDuration(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [callState]);

  // const attachPeerHandlers = useCallback(
  //   (peer: RTCPeerConnection) => {
  //     peer.ontrack = async (event) => {
  //       const stream = event.streams?.[0];
  //       if (remoteAudioRef.current && stream) {
  //         remoteAudioRef.current.srcObject = stream;
  //         try {
  //           await remoteAudioRef.current.play();
  //         } catch (error) {
  //           console.warn(
  //             "[WhatsApp Call] Remote audio autoplay blocked:",
  //             error,
  //           );
  //         }
  //       }
  //     };

  //     peer.onconnectionstatechange = () => {
  //       if (peer.connectionState === "connected") {
  //         markCallConnected();
  //       } else if (
  //         peer.connectionState === "failed" ||
  //         peer.connectionState === "closed"
  //       ) {
  //         if (!endingRef.current) {
  //           setCallError("WebRTC connection failed or closed.");
  //         }
  //       }
  //     };

  //     peer.oniceconnectionstatechange = () => {
  //       if (
  //         peer.iceConnectionState === "connected" ||
  //         peer.iceConnectionState === "completed"
  //       ) {
  //         markCallConnected();
  //       }
  //     };
  //   },
  //   [markCallConnected],
  // );

  const attachPeerHandlers = useCallback((peer: RTCPeerConnection) => {
    peer.ontrack = async (event) => {
      const stream = event.streams?.[0];

      if (remoteAudioRef.current && stream) {
        remoteAudioRef.current.srcObject = stream;

        try {
          await remoteAudioRef.current.play();
        } catch (error) {
          console.warn("[WhatsApp Call] Remote audio autoplay blocked:", error);
        }
      }
    };

    peer.onconnectionstatechange = () => {
      console.info("[WhatsApp Call] WebRTC Connection:", peer.connectionState);

      if (peer.connectionState === "failed") {
        setCallError("WebRTC connection failed.");
      }
    };

    peer.oniceconnectionstatechange = () => {
      console.info("[WhatsApp Call] ICE Connection:", peer.iceConnectionState);
    };
  }, []);

  // Authenticated socket connection and event listeners
  useEffect(() => {
    if (!workspaceId) return;

    const token = getStoredToken();
    if (!token) {
      setCallError("Login token not found. Please sign in again.");
      return;
    }

    const socket = io(resolvedServerUrl, {
      auth: { accessToken: token, token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.info("[WhatsApp Call] Socket connected:", socket.id);
      socket.emit("join-workspace", workspaceId);
    });

    socket.on("connect_error", (error) => {
      console.error("[WhatsApp Call] Socket connection error:", error.message);
      setCallError(error.message || "Call server connection failed.");
    });

    socket.on(
      "socket-error",
      (payload: { code?: string; message?: string }) => {
        const message = payload?.message || "Call operation failed.";
        console.error("[WhatsApp Call] Server error:", payload);
        setCallError(message);
        setCallNotice(null);
      },
    );

    // ACK is required by the backend notification outbox.
    socket.on("incoming-call", (raw: IncomingCallPayload, ack?: SocketAck) => {
      const callId = raw?.callId || raw?.providerCallId;
      const callSid = raw?.callSid || raw?.id;
      const offer = raw?.sdpOffer || raw?.session?.sdp || null;

      if (!callId) {
        ack?.(new Error("Incoming call payload has no callId."));
        console.error("[WhatsApp Call] Invalid incoming call payload:", raw);
        return;
      }

      // Acknowledge receipt, not acceptance. The agent must still answer.
      ack?.(null, { received: true });

      if (activeContactRef.current && !endingRef.current) {
        console.warn("[WhatsApp Call] Another call is already active.");
        return;
      }

      endingRef.current = false;
      endBeepPlayedRef.current = false;
      activeCallIdRef.current = callId;
      databaseCallIdRef.current = callSid;

      incomingOfferSdpRef.current = offer;
      const contact: CallContact = {
        callId,
        callSid: callSid || callId,
        databaseCallId: callSid,
        name: raw?.name || raw?.phone || "WhatsApp Caller",
        phone: raw?.phone || "",
      };

      activeContactRef.current = contact;
      setActiveContact(contact);
      setCallDirection("incoming");
      setDuration(0);
      setCallNotice("Incoming WhatsApp call");
      setCallError(null);
      setCallState("ringing");
    });

    socket.on(
      "call-dialing",
      (data: {
        callId?: string;
        targetPhone?: string;
        callerName?: string;
      }) => {
        if (data?.callId) {
          activeCallIdRef.current = data.callId;
          setActiveContact((previous) => {
            const next = previous
              ? { ...previous, callId: data.callId }
              : {
                  callId: data.callId,
                  name: data.callerName || "WhatsApp Contact",
                  phone: data.targetPhone || "",
                };
            activeContactRef.current = next;
            return next;
          });
        }
        setCallNotice("Calling WhatsApp...");
      },
    );

    socket.on(
      "webrtc-answer",
      async (data: {
        callId?: string;
        sdp?: RTCSessionDescriptionInit | string;
      }) => {
        try {
          const peer = peerConnectionRef.current;
          if (!peer || !data?.sdp) {
            console.warn(
              "[WhatsApp Call] No peer or SDP answer available.",
              data,
            );
            return;
          }

          const sdp =
            typeof data.sdp === "string"
              ? { type: "answer" as const, sdp: data.sdp }
              : data.sdp;

          await peer.setRemoteDescription(
            new RTCSessionDescription({
              type: "answer",
              sdp: sdp.sdp,
            }),
          );
          setCallNotice("Connecting call...");
        } catch (error) {
          console.error("[WhatsApp Call] Failed to apply remote SDP:", error);
          setCallError(
            error instanceof Error
              ? error.message
              : "Unable to connect call audio.",
          );
        }
      },
    );

    const handleCallAccepted = (data?: { callId?: string }) => {
      const isMatch =
        !data?.callId ||
        data.callId === activeCallIdRef.current ||
        data.callId === databaseCallIdRef.current ||
        activeContactRef.current !== null;

      // console.log(data, acceptingCallRef);

      if (isMatch) {
        console.info("[WhatsApp Call] User accepted the call:", data?.callId);
        markCallConnected();
      }
    };

    socket.on("call-accepted", handleCallAccepted);
    socket.on("call:accepted" as any, handleCallAccepted);

    socket.on(
      "call-taken",
      (data: { callId?: string; assignedTo?: string }) => {
        if (
          data?.callId &&
          data.callId === activeCallIdRef.current &&
          data.assignedTo
        ) {
          // Another agent answered; stop this agent's incoming ring.
          setCallState("assigned");
          setCallNotice("This call was answered by another agent.");
          callSounds.stopAll();
          cleanupMedia();
        }
      },
    );

    socket.on(
      "incoming-call-ended",
      (data: { callId?: string; status?: string }) => {
        const eventCallId = data?.callId;
        if (
          eventCallId &&
          activeCallIdRef.current &&
          eventCallId !== activeCallIdRef.current
        )
          return;

        endingRef.current = true;
        const finalDuration = durationRef.current;
        const contact = activeContactRef.current;

        setCallState("ended");
        callSounds.stopAll();
        playEndBeepOnce();
        cleanupMedia();

        if (contact) {
          onCallEndedRef.current?.({
            duration: finalDuration,
            phone: contact.phone,
            callId: eventCallId || activeCallIdRef.current,
            status: data?.status || (finalDuration > 0 ? "ENDED" : "MISSED"),
          });
        }

        window.setTimeout(() => {
          setCallState("idle");
          setActiveContact(null);
          activeContactRef.current = null;
          activeCallIdRef.current = undefined;
          databaseCallIdRef.current = undefined;
          setCallNotice(null);
          setDuration(0);
          setCallError(null);
          endingRef.current = false;
          endBeepPlayedRef.current = false;
        }, 1400);
      },
    );

    return () => {
      cleanupMedia();
      socket.removeAllListeners();
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
    };
    // Workspace/socket lifecycle only. Event handlers use refs for mutable values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, resolvedServerUrl, cleanupMedia, attachPeerHandlers]);

  const acceptCall = useCallback(async () => {
    if (acceptingCallRef.current) {
      console.warn("[WhatsApp Call] Accept already in progress.");
      return;
    }
    const socket = socketRef.current;
    const callId = activeCallIdRef.current;
    const offerSdp = incomingOfferSdpRef.current;
    acceptingCallRef.current = true;

    if (!socket?.connected || !workspaceId || !callId) {
      setCallError(
        "Call socket is not connected or call information is missing.",
      );
      return;
    }

    if (!offerSdp) {
      setCallError(
        "Incoming call SDP offer is missing. Meta cannot establish audio.",
      );
      return;
    }

    if (!socket?.connected || !workspaceId || !callId) {
      setCallError(
        "Call socket is not connected or call information is missing.",
      );
      return;
    }
    if (!offerSdp) {
      setCallError(
        "Incoming call SDP offer is missing. Meta cannot establish audio.",
      );
      return;
    }

    try {
      callSounds.stopAll();
      setCallError(null);
      setCallNotice("Requesting microphone access...");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      localStreamRef.current = stream;

      const peer = makePeerConnection();
      peerConnectionRef.current = peer;
      attachPeerHandlers(peer);

      stream.getAudioTracks().forEach((track) => peer.addTrack(track, stream));

      await peer.setRemoteDescription(
        new RTCSessionDescription({ type: "offer", sdp: offerSdp }),
      );

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      const sdpAnswer = await waitForIceGathering(peer);

      setCallNotice("Accepting WhatsApp call...");

      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(
          () => reject(new Error("Server did not confirm call acceptance.")),
          15000,
        );

        (socket as any).emit(
          "answer-incoming-call",
          { workspaceId, callId, sdpAnswer },
          (error: Error | null, response?: { accepted?: boolean }) => {
            window.clearTimeout(timeout);
            if (error) reject(error);
            else if (response?.accepted) resolve();
            else reject(new Error("Server did not accept the incoming call."));
          },
        );
      });

      setCallNotice("Connecting audio...");
    } catch (error) {
      console.error("[WhatsApp Call] Accept failed:", error);
      setCallError(
        error instanceof Error
          ? error.message
          : "Failed to accept WhatsApp call.",
      );
      cleanupMedia();
      setCallState("ringing");
      acceptingCallRef.current = false;
    }
  }, [workspaceId, attachPeerHandlers, cleanupMedia]);

  const startCall = useCallback(
    async (contact: CallContact) => {
      const socket = socketRef.current;
      if (!workspaceId || !socket?.connected) {
        setCallError("Call server is not connected. Please try again.");
        return;
      }
      if (!contact.phone) {
        setCallError("Contact phone number is missing.");
        return;
      }

      try {
        endingRef.current = false;
        endBeepPlayedRef.current = false;
        pendingCallAbortRef.current = {
          isAborted: false,
          phone: contact.phone,
        };
        cleanupMedia();

        activeCallIdRef.current = undefined;
        databaseCallIdRef.current = undefined;
        activeContactRef.current = contact;
        setActiveContact(contact);
        setCallDirection("outgoing");
        setCallState("ringing");
        setDuration(0);
        setCallError(null);
        setCallNotice("Requesting microphone access...");

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        localStreamRef.current = stream;

        const peer = makePeerConnection();
        peerConnectionRef.current = peer;
        attachPeerHandlers(peer);
        stream
          .getAudioTracks()
          .forEach((track) => peer.addTrack(track, stream));

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        const sdpOffer = await waitForIceGathering(peer);

        setCallNotice("Calling WhatsApp...");

        await new Promise<void>((resolve, reject) => {
          const timeout = window.setTimeout(
            () => reject(new Error("Meta call initiation timed out.")),
            20000,
          );

          (socket as any).emit(
            "initiate-call",
            {
              workspaceId,
              targetPhone: contact.phone,
              callerName: contact.name,
              sdpOffer,
            },
            (
              error: Error | null,
              response?: { accepted?: boolean; callId?: string },
            ) => {
              window.clearTimeout(timeout);
              if (error) {
                reject(error);
                return;
              }

              // Check if user clicked cancel/hangup while initiation was in flight
              if (pendingCallAbortRef.current.isAborted) {
                console.info(
                  "[WhatsApp Call] Call was aborted while dialing. Cancelling immediately.",
                );
                if (response?.callId) {
                  socket.emit("call:cancel" as any, {
                    workspaceId,
                    callId: response.callId,
                    targetPhone: contact.phone,
                  });
                  socket.emit("cancel-call" as any, {
                    workspaceId,
                    callId: response.callId,
                    targetPhone: contact.phone,
                  });
                  socket.emit("hangup-call", {
                    workspaceId,
                    callId: response.callId,
                  });
                }
                reject(new Error("Call cancelled by user."));
                return;
              }

              if (!response?.accepted) {
                reject(new Error("could not start the WhatsApp call."));
                return;
              }
              if (response.callId) {
                activeCallIdRef.current = response.callId;
                const updated = { ...contact, callId: response.callId };
                activeContactRef.current = updated;
                setActiveContact(updated);
              }
              resolve();
            },
          );
        });
      } catch (error) {
        console.error("[WhatsApp Call] Start outgoing call failed:", error);

        cleanupMedia();
        setCallError(
          error instanceof Error
            ? error.message
            : "Failed to accept WhatsApp call.",
        );
        setCallState("ended");
        window.setTimeout(() => {
          setCallState("idle");
          setActiveContact(null);
          activeContactRef.current = null;
        }, 1800);
      }
    },
    [workspaceId, cleanupMedia, attachPeerHandlers],
  );

  const endCall = useCallback(async () => {
    if (endingRef.current) return;
    endingRef.current = true;
    pendingCallAbortRef.current.isAborted = true;

    const finalDuration = durationRef.current;
    const callId = activeCallIdRef.current || databaseCallIdRef.current;
    const contact = activeContactRef.current;

    setCallState("ended");
    callSounds.stopAll();
    playEndBeepOnce();

    if (socketRef.current?.connected && workspaceId) {
      if (callId) {
        socketRef.current.emit("hangup-call", { workspaceId, callId });
        socketRef.current.emit("call:cancel" as any, {
          workspaceId,
          callId,
          targetPhone: contact?.phone,
        });
        socketRef.current.emit("cancel-call" as any, {
          workspaceId,
          callId,
          targetPhone: contact?.phone,
        });
      } else if (contact?.phone) {
        // Inflight dial cancellation before callId is returned
        socketRef.current.emit("call:cancel" as any, {
          workspaceId,
          targetPhone: contact.phone,
        });
        socketRef.current.emit("cancel-call" as any, {
          workspaceId,
          targetPhone: contact.phone,
        });
      }
    }

    cleanupMedia();

    if (contact) {
      onCallEndedRef.current?.({
        duration: finalDuration,
        phone: contact.phone,
        callId,
        status: finalDuration > 0 ? "ENDED" : "CANCELLED",
      });
    }

    window.setTimeout(() => {
      setCallState("idle");
      setActiveContact(null);
      activeContactRef.current = null;
      activeCallIdRef.current = undefined;
      databaseCallIdRef.current = undefined;
      setCallNotice(null);
      setCallError(null);
      setDuration(0);
      endBeepPlayedRef.current = false;
      endingRef.current = false;
    }, 1300);
  }, [workspaceId, cleanupMedia, playEndBeepOnce]);

  const toggleMute = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setIsMuted(!track.enabled);
  }, []);

  const toggleSpeaker = useCallback(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !remoteAudioRef.current.muted;
      setIsSpeakerOn(!remoteAudioRef.current.muted);
    } else {
      setIsSpeakerOn((previous) => !previous);
    }
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
