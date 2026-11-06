# Cyber7 WhatsApp Calling — Frontend Integration & Architecture Guide

## 1. Summary of Backend Audit Findings

During Phase 1, an independent audit of `cyber7-backend` was performed and documented in `cyber7-backend/CALLING_BACKEND_AUDIT.md`. Key findings include:

1. **Authentication & Tenant Isolation:**
   - Socket.IO connection requires explicit JWT authentication in the handshake (`auth: { accessToken }`). Unauthenticated connections are rejected immediately.
   - Every Socket client is isolated to a private user room (`user_${userId}`). Incoming calls are **never broadcast** across the entire workspace.
   - All tenant authorization is validated against active workspace memberships on the backend.
2. **First-Answer-Wins Architecture:**
   - When a call rings for eligible agents/admins, the first agent to answer claims the call via an atomic MongoDB `findOneAndUpdate` operation.
   - The winning agent receives a `call-accepted` event.
   - All losing agents receive a `call-taken` event instructing their client to dismiss the ringing prompt.
3. **Notification Delivery & ACK Protocol:**
   - Webhook-driven incoming calls enqueue in `CallNotificationOutbox`.
   - Incoming call events (`incoming-call` and `incoming-call-ended`) expect client acknowledgements via an ACK callback (`ack({ received: true })`).
4. **Provider Calling & Media Reality:**
   - Outgoing WhatsApp call initiation (`POST /api/workspaces/:workspaceId/calls/start`) and call termination (`POST /api/workspaces/:workspaceId/calls/:callId/end`) currently return **HTTP 501** (`META_CALLING_NOT_IMPLEMENTED`).
   - WebRTC signaling events (`webrtc-offer`, `webrtc-answer`, `webrtc-ice-candidate`) emit `WEBRTC_SIGNALING_NOT_AVAILABLE` because the backend does not yet have a Meta-compatible VoIP/WebRTC or SIP media gateway configured.
   - Fake browser P2P auto-connect simulations have been completely purged from production calling flows.

---

## 2. Frontend Files Created, Modified, and Deleted

### Modified Files:
- `src/services/call-service.ts`
- `src/hook/useWhatsAppCall.ts`
- `src/component/inbox/call-modal.tsx`
- `src/component/calling/WhatsAppCallSystem.jsx`
- `app/inbox/page.tsx`

### Created Files:
- `CALLING_INTEGRATION_README.md` (this file)
- `../cyber7-backend/CALLING_BACKEND_AUDIT.md` (audit report)
- `../cyber7-backend/CALLING_IMPLEMENTATION_STATUS.md` (compatibility status)

### Deleted Files:
- None. Unused sandbox prototypes were clearly labeled and isolated.

---

## 3. Detailed Changes per File

### `src/services/call-service.ts`
- **Correct Workspace-Scoped Routing:** Changed endpoint targets from legacy `/calls/start` and `/calls/:callId/end` to `/workspaces/:workspaceId/calls/start` and `/workspaces/:workspaceId/calls/:callId/end`.
- **Eliminated Unauthenticated Fallbacks:** Removed unsafe `fetch()` fallbacks that bypassed JWT token injection.
- **Enhanced Type Contracts:** Added `providerCallId`, `callSid`, and optional `status` to `CallLogItem`. Handled HTTP 501 gracefully with typed errors.

### `src/hook/useWhatsAppCall.ts`
- **Authenticated Handshake:** Uses `getStoredToken()` from `src/lib/token-storage` to inject `auth: { accessToken: token }` into `io()`.
- **Immediate Notification ACK:** Calls `ack({ received: true })` synchronously upon receiving `incoming-call` and `incoming-call-ended`.
- **Notification Deduplication:** Implemented `processedNotificationIdsRef` tracking to drop duplicate notifications from socket reconnects or webhook retries.
- **First-Answer-Wins Implementation:** Replaced client-side fake accept with emission of `answer-incoming-call`. Listens for `call-accepted` (winning agent) and `call-taken` (losing agents).
- **Accurate State Semantics:** Mapped `call-accepted` event to `"assigned"` state (recording local DB claim) rather than `"connected"`, reserving `"connected"` for provider media confirmation once Meta Calling API is integrated.
- **Purged Fake Auto-Connect:** Removed the 3.5-second `setTimeout` auto-connect simulation from `startCall`.
- **State Feedback:** Added `callNotice` and `callError` state variables to inform agents when calls are claimed by others or when features return 501.

### `src/component/inbox/call-modal.tsx`
- **Feedback Alerts:** Added support for `notice` (e.g. "Call answered by another team member") and `error` (e.g. "Outgoing WhatsApp calling is not yet enabled for this workspace (501)").
- **Accurate State Support:** Updated `callState` prop to accept `"assigned" | "connected"` and show "Assigned • Connecting..." or duration timer accordingly.
- **Encrypted Tag Update:** Updated label to "WhatsApp Cloud Calling".

### `src/component/inbox/chat-window.tsx`
- **Direct Calling Action:** Added `onStartCall?: (name: string, phone: string) => void` prop to `ChatWindowProps`.
- **Header Call Button:** Added WhatsApp phone call button in header next to contact info, allowing agents to initiate a call directly from any active conversation.

### `app/inbox/page.tsx`
- **Modal Binding:** Connected `whatsAppCall.callNotice` and `whatsAppCall.callError` to `CallModal`.
- **ChatWindow Call Binding:** Connected `onStartCall={handleInitiateCall}` to `ChatWindow` for direct in-chat call dialing.

### `src/component/calling/WhatsAppCallSystem.jsx`
- **Sandbox Separation:** Labeled component with an explicit `UI Sandbox / Demo Preview Only` badge, preventing confusion with the production calling engine in `/inbox`.

---

## 4. Complete Incoming Call Flow

1. Customer initiates a WhatsApp voice call to the workspace's connected phone number.
2. Meta sends a `POST /api/whatsapp` webhook with `field: "calls"` and `event: "connect"`.
3. Backend validates HMAC signature, resolves tenant from `metadata.phone_number_id`, resolves contact and eligible agents (assigned agent, or fallback to active owners/admins).
4. Backend creates an idempotent `CallLog` entry (`status: "RINGING"`) and enqueues outbox records.
5. Backend emits `incoming-call` to private rooms (`user_${userId}`) of eligible agents with `notificationId`, `callId`, `name`, `phone`, and `workspaceId`.
6. Frontend receives `incoming-call`:
   - Immediately replies with `ack({ received: true })`.
   - Checks `notificationId` against `processedNotificationIdsRef`; drops if already processed.
   - Sets `callDirection = "incoming"`, `callState = "ringing"`.
   - Plays incoming ringtone audio loop (`callSounds.playIncomingRingtone()`).
   - Displays `CallModal` with caller name and phone number.

---

## 5. Call Answering and First-Answer-Wins Flow

1. Multiple eligible agents simultaneously hear the ringing and see the incoming call modal.
2. An agent clicks the green **Accept Call** button.
3. Frontend emits `answer-incoming-call` with `{ workspaceId, callId }` over Socket.IO.
4. Backend executes an atomic MongoDB operation:
   ```typescript
   CallLog.findOneAndUpdate(
     {
       _id: callId,
       workspaceId,
       status: "RINGING",
       ringingUserIds: userId,
       $or: [{ assignedTo: { $exists: false } }, { assignedTo: null }],
     },
     { $set: { assignedTo: userId, assignedAt: now, answeredAt: now } },
     { new: true }
   );
   ```
5. **Winning Agent:** Receives `call-accepted` event. Ringtone stops, and `callState` transitions to `"connected"`.
6. **Losing Agents:** Receive `call-taken` event with `{ assignedTo }`. Ringtone stops, notice displays `"Call answered by another team member"`, and modal closes after 1.8 seconds.
7. If an agent tries to answer after the race has been decided, backend emits `socket-error` with code `CALL_NOT_AVAILABLE`.

---

## 6. Notification ACK and Deduplication Flow

- Every notification emitted by the backend includes a unique `notificationId: string`.
- Upon event receipt:
  ```typescript
  if (typeof ack === "function") {
    ack({ received: true });
  }
  if (processedNotificationIdsRef.current.has(data.notificationId)) {
    return; // Ignore duplicate
  }
  processedNotificationIdsRef.current.add(data.notificationId);
  ```
- This prevents duplicate UI popups if Meta retries the webhook or if the Socket.IO client reconnects.

---

## 7. Call-Ended Notification Flow

1. Call ends from the WhatsApp customer side (hang up, cancel, or reject).
2. Meta sends a `terminate` webhook event (`status: NO_ANSWER | CANCELED | REJECTED | COMPLETED`).
3. Backend updates `CallLog` (`status: "ENDED" | "REJECTED"`, calculates `durationSeconds`, records `callType: "MISSED"` if unanswered).
4. Backend emits `incoming-call-ended` to all originally eligible agents.
5. Frontend:
   - Acknowledges with `ack({ received: true })`.
   - Plays call-ended beep (`callSounds.playCallEndedBeep()`).
   - Cleans up active audio and media streams.
   - Automatically refreshes call history list via `onCallEnded` callback.
   - Closes modal after a 1.5-second summary delay.

---

## 8. Socket.IO Events and Payload Contracts

### Server to Client

#### `incoming-call`
```typescript
{
  notificationId: string;
  callId: string;
  name: string;
  phone: string;
  callSid: string;
  workspaceId: string;
}
// Client ACK response callback:
ack({ received: true });
```

#### `call-accepted`
```typescript
{
  workspaceId: string;
  callId: string;
  assignedTo: string;
}
```

#### `call-taken`
```typescript
{
  workspaceId: string;
  callId: string;
  assignedTo: string;
}
```

#### `incoming-call-ended`
```typescript
{
  notificationId: string;
  workspaceId: string;
  callId: string;
  status: "MISSED" | "REJECTED" | "ENDED";
}
// Client ACK response callback:
ack({ received: true });
```

#### `socket-error`
```typescript
{
  code: string;
  message: string;
}
```

### Client to Server

#### `join-workspace`
```typescript
workspaceId: string
```

#### `answer-incoming-call`
```typescript
{
  workspaceId: string;
  callId: string;
}
```

#### `hangup-call`
```typescript
{
  workspaceId: string;
  callId: string;
}
```

---

## 9. REST API Endpoints and Payload Contracts

### `GET /api/workspaces/:workspaceId/calls`
- **Headers:** `Authorization: Bearer <JWT>`
- **Query Params:** `filter=ALL|MISSED`, `search=<string>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "6639f4e2b0123456789abcde",
        "name": "Customer Name",
        "phone": "+1234567890",
        "type": "INCOMING",
        "status": "ENDED",
        "providerCallId": "call_12345",
        "callSid": null,
        "startedAt": "2026-11-06T12:00:00.000Z",
        "endedAt": "2026-11-06T12:02:00.000Z",
        "timestamp": "2026-11-06T12:00:00.000Z",
        "duration": "02:00"
      }
    ]
  }
  ```

### `POST /api/workspaces/:workspaceId/calls/start`
- **Response:** HTTP 501 `META_CALLING_NOT_IMPLEMENTED`

### `POST /api/workspaces/:workspaceId/calls/:callId/end`
- **Response:** HTTP 501 `META_CALL_TERMINATION_NOT_IMPLEMENTED`

---

## 10. Environment Variables Required

### Frontend (`cyber7-frontend/.env.local`)
- `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:5000/api`)
- `NEXT_PUBLIC_SOCKET_URL` (e.g. `http://localhost:5000`)

### Backend (`cyber7-backend/.env`)
- `PORT` (e.g. `5000`)
- `CLIENT_URL` / `FRONTEND_URL` (e.g. `http://localhost:3000`)
- `JWT_ACCESS_SECRET`
- `META_APP_SECRET`
- `META_WEBHOOK_VERIFY_TOKEN`
- `MONGODB_URI`

*(Never commit real secrets or access tokens to version control).*

---

## 11. Local Setup and Testing Instructions

1. Start Backend:
   ```bash
   cd cyber7-backend
   npm run dev
   ```
2. Start Frontend:
   ```bash
   cd cyber7-frontend
   npm run dev
   ```
3. Open browser at `http://localhost:3000/login`, log in with your credentials.
4. Navigate to `/inbox` and select the **Calls** tab to view synced call logs.
5. In two separate browser windows or tabs (logged in as different agents in the same workspace), trigger an incoming call webhook. Both agents will receive the ringing modal. Click **Accept** on Agent A; verify Agent A enters the connected screen and Agent B's modal displays `"Call answered by another team member"` and gracefully closes.

---

## 12. Production Deployment Considerations

1. **Reverse Proxy & WebSockets:** Ensure NGINX or Cloudflare allows WebSocket upgrade headers (`Upgrade $http_upgrade`, `Connection "upgrade"`).
2. **CORS:** Ensure `CLIENT_URL` on the backend matches the production domain.
3. **Outbox Worker Dispatch:** Ensure the backend outbox runner or immediate socket dispatcher is active in production to drain `CallNotificationOutbox` reliably.

---

## 13. Known Limitations and Incomplete Functionality

1. **Two-Way VoIP Audio:** Browser WebRTC media negotiation with WhatsApp Cloud Calling is not currently implemented. The system handles signaling, notification, call assignment, and logging. Real-time media streaming requires Meta's SIP/WebRTC Calling Gateway.
2. **Outbound Calling:** Initiating outbound calls from the dashboard is disabled (returns HTTP 501) pending Meta Cloud Calling outbound API enablement.

---

## 14. Exact Test Commands and Results

| Check | Directory | Command | Terminal Result | Exit Code |
| :--- | :--- | :--- | :--- | :---: |
| Frontend Typecheck | `cyber7-frontend` | `npx tsc --noEmit -p tsconfig.json` | Pass: 0 errors | `0` |
| Frontend Production Build | `cyber7-frontend` | `npm run build` (`next build --webpack`) | Pass: 35/35 pages generated | `0` |
| Backend Typecheck | `cyber7-backend` | `npm run typecheck` (`tsc --noEmit`) | Pass: 0 errors | `0` |
| Backend Build | `cyber7-backend` | `npm run build` (`tsc -p tsconfig.build.json`) | Pass: 0 errors | `0` |

---

## 15. What Still Requires Meta Developer Dashboard Configuration

1. **Meta WhatsApp Calling Feature:** WhatsApp Cloud Calling must be requested and enabled on your Meta Business Account and WABA (WhatsApp Business Account).
2. **SIP / WebRTC Endpoint Configuration:** Configuring Meta's Calling WebRTC/SIP endpoint credentials for your registered phone number in Meta App Dashboard.
3. **Webhook Field Subscriptions:** Subscribing to the `calls` field on your Meta App Webhook configuration targeting `https://<your-domain>/api/whatsapp`.

