# VexChat — Phase 02B.3: API Contract & Backend Alignment Mapping

**Document Version:** 1.1.0  
**Audit & Alignment Date:** 2026-11-05 (Updated in Phase 02B.3.1)  
**Scope:** `cyber7-frontend` to `cyber7-backend` Architectural Interface Alignment  
**Authority:** `cyber7-backend` is the authoritative source of truth.

---

## 1. Executive Summary

This mapping document captures the exhaustive audit of `cyber7-backend` endpoints, Mongoose models, validation schemas, and platform authorization middleware. It explicitly defines which Platform Admin modules have live backend support, which are partially implemented, and which are completely un-implemented.

Where backend endpoints do not exist or where legacy endpoints depend on customer JWT authentication, the frontend strictly classifies the module as `NOT_IMPLEMENTED` or `BLOCKED_FOR_ADMIN`, utilizes schema-validated demo preview records in Bangladeshi Taka (`BDT`), and disables mutation actions with clear user-facing explanations to prevent fake state changes or customer credential leakage.

---

## 2. API Contract Mapping Matrix

| Module | Backend Endpoint | Method | Backend Status | Frontend Status | Notes |
|:---|:---|:---:|:---:|:---:|:---|
| **Overview** | None (platform-wide aggregation not implemented) | N/A | `NOT_IMPLEMENTED` | `DEMO_PREVIEW` | Backend only has workspace-level WhatsApp stats at `GET /api/dashboard/:workspaceId/stats`. Overview displays BDT-aligned demo KPIs. |
| **Workspaces (List)** | None (`/api/admin/workspaces` not implemented) | GET | `NOT_IMPLEMENTED` | `DEMO_PREVIEW` | Customer workspace router only supports `GET /api/workspaces/me`. Frontend provides tenant list via aligned schema. |
| **Workspaces (Inspect)** | None (`/api/admin/workspaces/:id` not implemented) | GET | `NOT_IMPLEMENTED` | `DEMO_PREVIEW` | Drawer shows schema fields: `name`, `slug`, `ownerId`, `status`, `timezone`, `currency`. |
| **Workspaces (Status)** | None (`/api/admin/workspaces/:id/status` not implemented) | PATCH | `NOT_IMPLEMENTED` | `DISABLED` | Action button triggers informative modal detailing missing endpoint. |
| **Users (List)** | None (`/api/admin/users` not implemented) | GET | `NOT_IMPLEMENTED` | `DEMO_PREVIEW` | Auth router only provides `POST /api/auth/register`, `login`, and `GET /api/auth/me`. Table displays platform roles. |
| **Users (Inspect)** | None (`/api/admin/users/:id` not implemented) | GET | `NOT_IMPLEMENTED` | `DEMO_PREVIEW` | Inspects `platformRole` (`SUPER_ADMIN`, `FINANCE_ADMIN`, `USER`), `isActive`, and `isEmailVerified`. |
| **Users (Role Change)** | None (`/api/admin/users/:id/role` not implemented) | PATCH | `NOT_IMPLEMENTED` | `DISABLED` | Disabled. Elevation requires out-of-band CLI tool (`npm run admin:bootstrap`). |
| **Subscriptions (Catalog)** | `/api/workspaces/:workspaceId/billing/plans` | GET | `PARTIAL` | `IMPLEMENTED` | Authoritative plans catalog defined in `billing.config.ts`: `STARTER` (৳3,000), `BUSINESS_PRO` (৳7,400), `ENTERPRISE` (৳18,600). |
| **Subscriptions (List)** | None (`/api/admin/subscriptions` not implemented) | GET | `NOT_IMPLEMENTED` | `DEMO_PREVIEW` | Live subscription model is 1:1 per workspace (`workspaceId` unique). Table displays monthly anchor days and limits. |
| **Subscriptions (Mutate)** | None (`POST /api/admin/billing/plans` not implemented) | POST | `NOT_IMPLEMENTED` | `DISABLED` | Plan creation disabled; catalog driven by backend config. |
| **Payments (Pending Transfers)** | `/api/admin/billing/bank-transfers/pending` | GET | `LEGACY_CUSTOMER_AUTH` | `BLOCKED_FOR_ADMIN` | Backend endpoint exists in `platformAdminBillingRouter` but relies on customer JWT auth (`authenticate.ts`). Blocked in Admin Portal via Customer JWT Isolation Guard; displays `DEMO_ADMIN_PAYMENTS`. |
| **Payments (Approve Transfer)** | `/api/admin/billing/bank-transfers/:paymentId/approve` | POST | `LEGACY_CUSTOMER_AUTH` | `DISABLED` | Backend endpoint exists but relies on customer JWT auth. Action button opens modal explaining that mutations are disabled until Phase 02B.4/5 dedicated AdminSession & TOTP step-up are deployed. |
| **Payments (Reject Transfer)** | `/api/admin/billing/bank-transfers/:paymentId/reject` | POST | `LEGACY_CUSTOMER_AUTH` | `DISABLED` | Backend endpoint exists but relies on customer JWT auth. Action button opens modal explaining that mutations are disabled until Phase 02B.4/5 dedicated AdminSession & TOTP step-up are deployed. |
| **Payments (General List)** | None (`/api/admin/payments` not implemented) | GET | `PARTIAL` | `DEMO_PREVIEW` | General ledger across all gateways (bKash, card) not aggregated in backend. Displayed using backend payment schema. |
| **Payments (Refund)** | None (`/api/admin/billing/payments/:id/refund` not implemented) | POST | `NOT_IMPLEMENTED` | `DISABLED` | Refund action displays disabled explanation dialog. |
| **Invoices (List)** | None (`/api/admin/invoices` not implemented) | GET | `NOT_IMPLEMENTED` | `DEMO_PREVIEW` | Backend only supports workspace-scoped invoices at `/api/workspaces/:workspaceId/billing/invoices`. |
| **Invoices (Inspect)** | `/api/workspaces/:workspaceId/billing/invoices/:id` | GET | `PARTIAL` | `IMPLEMENTED` | Displays invoice details, period covered, BDT amount, and billed customer metadata. |
| **Invoices (PDF Export)** | None (`/api/admin/billing/invoices/:id/pdf` not implemented) | GET | `NOT_IMPLEMENTED` | `DISABLED` | PDF rendering endpoint not available on backend; disabled with notification. |
| **Analytics (Growth)** | None (`/api/admin/analytics` not implemented) | GET | `NOT_IMPLEMENTED` | `DEMO_PREVIEW` | Displays schema-aligned trend models with explicit notice. |
| **Support (Tickets)** | None (No ticket models/routes exist in backend) | N/A | `NOT_IMPLEMENTED` | `DEMO_PREVIEW` | 100% un-implemented in backend. Ticket creation and status changes disabled. |
| **Platform Settings** | None (`/api/admin/settings` not implemented) | N/A | `NOT_IMPLEMENTED` | `DEMO_PREVIEW` | Settings are driven by backend environment variables and static configuration files. |
| **Admin Login** | None (`/api/admin/auth/login` not implemented) | POST | `NOT_IMPLEMENTED` | `DEV_PREVIEW` | Production admin authentication (BFF signed assertion, TOTP MFA) is in Phase 02B design. Local preview portal provided. |

---

## 3. Authoritative Backend Enums & Constraints

### 3.1. Currency & Pricing Integrity
- **Currency:** Strictly `BDT` (Bangladeshi Taka). USD denominations are strictly prohibited across all admin modules.
- **Billing Plans:**
  - `STARTER`: ৳3,000 BDT / month (1 WhatsApp Number, 3 Team Members)
  - `BUSINESS_PRO`: ৳7,400 BDT / month (2 WhatsApp Numbers, 10 Team Members)
  - `ENTERPRISE`: ৳18,600 BDT / month (Unlimited Numbers, Unlimited Team Members)

### 3.2. Role Hierarchy & Separation
- **Platform Roles (System Domain):**
  - `USER`: Regular customer.
  - `FINANCE_ADMIN`: Authorized for payment review and manual transfer approval.
  - `SUPER_ADMIN`: Authoritative control over all platform modules.
- **Workspace Roles (Tenant Domain):**
  - `OWNER`, `ADMIN`, `AGENT`: Scoped strictly within a single customer workspace.
  - Workspace roles **never** grant platform administrative rights.

### 3.3. Payment & Gateway Enums
- **Methods:** `BKASH`, `CITY_BANK_CARD`, `CITY_BANK_TRANSFER`
- **Statuses:** `INITIATED`, `PENDING_VERIFICATION`, `COMPLETED`, `FAILED`, `CANCELLED`, `REJECTED`, `REFUNDED`

### 3.4. Subscription & Invoice Enums
- **Subscription Statuses:** `ACTIVE`, `EXPIRED`, `CANCELLED`
- **Invoice Statuses:** `PAID`, `PENDING`, `VOID`

---

## 4. API Request & Response Conventions

### Success Envelope
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Standard Error Envelope
```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

### Validation Error Envelope (HTTP 400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "notes",
      "message": "Notes must not exceed 500 characters"
    }
  ]
}
```
