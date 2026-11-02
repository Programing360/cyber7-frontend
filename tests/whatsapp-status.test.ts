/**
 * Phase 12A — Frontend WhatsApp status derivation tests.
 *
 * Run with:
 *   node --test tests/whatsapp-status.test.ts
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  deriveWhatsAppStatus,
  selectConfigForWorkspace,
  validateWabaId,
} from "../src/lib/whatsapp-status.ts";
import type { WhatsAppConfigStatus } from "../src/types/api.ts";

function createConfig(
  overrides: Partial<WhatsAppConfigStatus> = {},
): WhatsAppConfigStatus {
  return {
    metaApp: { configured: true },
    webhook: {
      configured: true,
      verified: true,
      callbackUrl: "https://api.example.com/api/whatsapp/webhook",
    },
    workspaceAccount: { totalAccounts: 1, connectedAccounts: 1 },
    ...overrides,
  };
}

describe("Platform status is independent of workspace accounts", () => {
  it("keeps the Meta App configured when the workspace has zero accounts", () => {
    const status = deriveWhatsAppStatus(
      createConfig({
        workspaceAccount: { totalAccounts: 0, connectedAccounts: 0 },
      }),
    );

    assert.equal(status.metaAppConfigured, true);
    assert.equal(status.workspaceAccountState, "none");
    assert.equal(status.totalAccounts, 0);
    assert.equal(status.connectedAccounts, 0);
  });

  it("reports the Meta App as not configured independently of accounts", () => {
    const status = deriveWhatsAppStatus(
      createConfig({
        metaApp: { configured: false },
        workspaceAccount: { totalAccounts: 2, connectedAccounts: 2 },
      }),
    );

    assert.equal(status.metaAppConfigured, false);
    assert.equal(status.workspaceAccountState, "connected");
  });

  it("reports connected workspace accounts", () => {
    const status = deriveWhatsAppStatus(
      createConfig({
        workspaceAccount: { totalAccounts: 3, connectedAccounts: 2 },
      }),
    );

    assert.equal(status.workspaceAccountState, "connected");
    assert.equal(status.connectedAccounts, 2);
    assert.equal(status.totalAccounts, 3);
  });

  it("reports disconnected workspace accounts", () => {
    const status = deriveWhatsAppStatus(
      createConfig({
        workspaceAccount: { totalAccounts: 2, connectedAccounts: 0 },
      }),
    );

    assert.equal(status.workspaceAccountState, "disconnected");
  });
});

describe("Webhook display state", () => {
  it("reports verified when the GET handshake has completed", () => {
    const status = deriveWhatsAppStatus(createConfig());
    assert.equal(status.webhookState, "verified");
    assert.equal(status.webhookVerified, true);
  });

  it("reports listening when the verify token exists but no handshake completed", () => {
    const status = deriveWhatsAppStatus(
      createConfig({
        webhook: {
          configured: true,
          verified: false,
          callbackUrl: "https://api.example.com/api/whatsapp/webhook",
        },
      }),
    );

    assert.equal(status.webhookState, "listening");
  });

  it("reports pending when the verify token is not configured", () => {
    const status = deriveWhatsAppStatus(
      createConfig({
        webhook: {
          configured: false,
          verified: false,
          callbackUrl: null,
        },
      }),
    );

    assert.equal(status.webhookState, "pending");
    assert.equal(status.hasPublicCallbackUrl, false);
    assert.equal(status.callbackUrl, null);
  });
});

describe("Workspace switching does not display stale configuration", () => {
  it("ignores configuration fetched for a different workspace", () => {
    const config = createConfig();

    const selected = selectConfigForWorkspace(config, "workspace-a", "workspace-b");

    assert.equal(selected, null);
  });

  it("uses configuration that belongs to the active workspace", () => {
    const config = createConfig();

    const selected = selectConfigForWorkspace(
      config,
      "workspace-a",
      "workspace-a",
    );

    assert.equal(selected, config);
  });

  it("falls back to empty status while the new workspace loads", () => {
    const status = deriveWhatsAppStatus(
      selectConfigForWorkspace(createConfig(), "workspace-a", "workspace-b"),
    );

    assert.equal(status.hasConfigData, false);
    assert.equal(status.metaAppConfigured, false);
    assert.equal(status.workspaceAccountState, "none");
    assert.equal(status.callbackUrl, null);
  });
});

describe("WhatsApp Business Account ID (WABA ID) validation", () => {
  it("accepts valid numeric WABA IDs", () => {
    const res = validateWabaId("100234567890123");
    assert.equal(res.valid, true);
    assert.equal(res.error, undefined);
  });

  it("accepts valid numeric WABA IDs with leading and trailing whitespace", () => {
    const res = validateWabaId("  100234567890123  ");
    assert.equal(res.valid, true);
    assert.equal(res.error, undefined);
  });

  it("rejects non-numeric WABA IDs", () => {
    const res = validateWabaId("WABA_INVALID_123");
    assert.equal(res.valid, false);
    assert.match(res.error!, /must contain only digits/i);
  });

  it("rejects too-short WABA IDs", () => {
    const res = validateWabaId("1234");
    assert.equal(res.valid, false);
    assert.match(res.error!, /invalid whatsapp business account id/i);
  });

  it("rejects empty or whitespace-only WABA IDs", () => {
    const res = validateWabaId("   ");
    assert.equal(res.valid, false);
    assert.match(res.error!, /invalid whatsapp business account id/i);
  });
});
