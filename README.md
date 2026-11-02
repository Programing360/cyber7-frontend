# VexChat Frontend Application

VexChat Frontend is a Next.js App Router application providing customer engagement workflows, real-time shared inbox management, contact management, WhatsApp message template dispatching, and workspace collaboration.

---

## 1. Technology Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **UI Library:** React with Tailwind CSS, Lucide Icons, and Radix UI primitives
- **Testing:** Node.js built-in test runner (`node:test`)
- **Deployment Platform:** Vercel

---

## 2. Environment Configuration

All environment variables use safe configuration placeholders. Never commit actual secret keys or credentials.

| Variable Name | Scope | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Public (Client & Server) | API base URL. In Preview and Production, set to `/api` for same-origin proxying. In local development, typically `http://localhost:5000/api`. |
| `BACKEND_INTERNAL_URL` | Server-Only | Upstream backend URL target for the Next.js API proxy route (e.g., `https://backend-preview.example.app/api`). |
| `BACKEND_BYPASS_SECRET` | Server-Only | Secret header token forwarded upstream by the proxy to authenticate server-to-server calls. Never exposed to browser bundles. |
| `VERCEL_ENV` | Platform | Automatically populated by Vercel (`development`, `preview`, or `production`). |

---

## 3. Architecture & Features

### 3.1 Same-Origin Preview API Proxy
To eliminate cross-origin cookie restrictions and prevent sensitive backend credentials from leaking into the browser:
- Client browser components communicate exclusively with `/api/*` on the same origin.
- The Next.js Route Handler (`app/api/[...path]/route.ts`) handles allowlisting, method checking, and securely forwards permitted requests to `BACKEND_INTERNAL_URL`.
- Upstream requests append the private `BACKEND_BYPASS_SECRET` strictly on the server side.
- Webhook routes and unapproved endpoints are strictly rejected with HTTP 403.

### 3.2 Authentication & Workspace Context
- Authenticated users operate within a specific workspace context (`workspaceId`).
- All data requests (contacts, conversations, messages, templates) are scoped to the active workspace.
- Switching workspaces resets the active conversation state to prevent cross-workspace data bleed.

### 3.3 Inbox & Real-Time Messaging Features
- **Conversations & Message History:** View active customer threads with real-time delivery status indicators (`sent`, `delivered`, `read`, `failed`).
- **24-Hour Customer Service Window UI:**
  - Displays a live badge indicating whether the 24-hour service window is open or expired.
  - When open, agents can compose and send free-form text messages.
  - When expired, an alert banner explains that free-form messaging is restricted by Meta messaging policies and directs agents to the template modal.
- **WhatsApp Message Template Dispatching:**
  - Integrated template modal lets agents select an approved template outside the 24-hour window.
  - Supports input parameters for dynamic variables (header media URLs, header text substitutions, body variables, and interactive button parameters).
- **Contact Opt-Out Protection & Indicators:**
  - Displays a prominent red "Opted Out" badge in both the contact info panel and chat window when a contact has opted out.
  - Message input is disabled for opted-out contacts with a notification banner.
  - **Compliance Note:** Inbound `START` or `UNSTOP` keywords record an opt-in event in the audit trail, but do *not* automatically clear marketing opt-out status. Resuming marketing communication requires verified, explicit consent.

---

## 4. Development & Testing Commands

### Install Dependencies
```bash
npm install
```

### Local Development Server
```bash
npm run dev
```
Starts the Next.js development server at `http://localhost:3000`.

### Typecheck
```bash
npx tsc --noEmit
```
Verifies TypeScript types across the entire Next.js application without compiling files.

### Automated Test Suite
```bash
node --test tests/proxy-security.test.ts tests/whatsapp-status.test.ts
```
Executes security tests for the same-origin API proxy and WhatsApp status validation logic.

### Production Build
```bash
npm run build
```
Creates an optimized production build of the Next.js application.
