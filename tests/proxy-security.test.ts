/**
 * Phase 6 — Step 18: Frontend Secure Preview Proxy Automated Security Tests
 *
 * Covers all 25 Phase D security test specifications using mocked upstream fetch.
 * Run with:
 *   node --test tests/proxy-security.test.ts
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server.js";
import * as proxyHandler from "../app/api/[...path]/route.ts";

const VALID_UPSTREAM = "https://cyber7-backend-l48kp7h5h-md-limons-projects-283c7c6c.vercel.app/api";
const DUMMY_SECRET = "test-automation-bypass-secret-12345";

// Helper to construct NextRequest for proxy testing
function makeReq(
  urlPath: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: BodyInit;
    signal?: AbortSignal;
  } = {},
): NextRequest {
  const fullUrl = `https://cyber7-frontend-preview.vercel.app/api/${urlPath}`;
  return new NextRequest(fullUrl, {
    method: options.method || "GET",
    headers: options.headers,
    body: options.body,
    signal: options.signal,
  });
}

function makeContext(segments: string[]) {
  return { params: Promise.resolve({ path: segments }) };
}

describe("Phase 6 — Step 18: Secure Preview API Proxy Security Tests", () => {
  const originalEnv = { ...process.env };
  let originalFetch: typeof globalThis.fetch;
  let lastFetchCall: { url: string; init?: RequestInit } | null = null;

  beforeEach(() => {
    process.env.VERCEL_ENV = "preview";
    process.env.BACKEND_BYPASS_SECRET = DUMMY_SECRET;
    process.env.BACKEND_PREVIEW_UPSTREAM_URL = VALID_UPSTREAM;

    originalFetch = globalThis.fetch;
    lastFetchCall = null;

    // Default mock fetch
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      lastFetchCall = { url: input.toString(), init };
      return new Response(JSON.stringify({ success: true, message: "Mocked upstream response" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "x-vercel-id": "fra1::test-id", // Should be stripped
          "Set-Cookie": "secret_cookie=bad", // Should be stripped
          "Server": "Vercel", // Should be stripped
        },
      });
    }) as unknown as typeof globalThis.fetch;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    globalThis.fetch = originalFetch;
  });

  // 1. Preview-only environment guard
  it("1. Preview-only environment guard: returns 404 when not preview", async () => {
    process.env.VERCEL_ENV = "development";
    const req = makeReq("health");
    const res = await proxyHandler.GET(req, makeContext(["health"]));
    assert.equal(res.status, 404);
  });

  // 2. Missing environment variables
  it("2. Missing environment variables: fails closed with 500 when secret is missing", async () => {
    delete process.env.BACKEND_BYPASS_SECRET;
    const req = makeReq("health");
    const res = await proxyHandler.GET(req, makeContext(["health"]));
    assert.equal(res.status, 500);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  // 3. Invalid upstream hostname
  it("3. Invalid upstream hostname: fails closed with 502", async () => {
    process.env.BACKEND_PREVIEW_UPSTREAM_URL = "https://evil-attacker.vercel.app/api";
    const req = makeReq("health");
    const res = await proxyHandler.GET(req, makeContext(["health"]));
    assert.equal(res.status, 502);
  });

  // 4. HTTP instead of HTTPS
  it("4. HTTP instead of HTTPS: fails closed with 502", async () => {
    process.env.BACKEND_PREVIEW_UPSTREAM_URL = "http://cyber7-backend-l48kp7h5h-md-limons-projects-283c7c6c.vercel.app/api";
    const req = makeReq("health");
    const res = await proxyHandler.GET(req, makeContext(["health"]));
    assert.equal(res.status, 502);
  });

  // 5. Unexpected port
  it("5. Unexpected port: rejects non-standard port with 502", async () => {
    process.env.BACKEND_PREVIEW_UPSTREAM_URL = "https://cyber7-backend-l48kp7h5h-md-limons-projects-283c7c6c.vercel.app:8443/api";
    const req = makeReq("health");
    const res = await proxyHandler.GET(req, makeContext(["health"]));
    assert.equal(res.status, 502);
  });

  // 6. URL credentials, query, or fragment
  it("6. URL credentials, query, or fragment: rejects credentialed upstream URL", async () => {
    process.env.BACKEND_PREVIEW_UPSTREAM_URL = "https://admin:pass@cyber7-backend-l48kp7h5h-md-limons-projects-283c7c6c.vercel.app/api";
    const req = makeReq("health");
    const res = await proxyHandler.GET(req, makeContext(["health"]));
    assert.equal(res.status, 502);
  });

  // 7. Unexpected upstream path
  it("7. Unexpected upstream path: rejects base path other than /api", async () => {
    process.env.BACKEND_PREVIEW_UPSTREAM_URL = "https://cyber7-backend-l48kp7h5h-md-limons-projects-283c7c6c.vercel.app/other";
    const req = makeReq("health");
    const res = await proxyHandler.GET(req, makeContext(["health"]));
    assert.equal(res.status, 502);
  });

  // 8. Invalid route
  it("8. Invalid route: rejects unapproved route with 403", async () => {
    const req = makeReq("unknown/random/endpoint");
    const res = await proxyHandler.GET(req, makeContext(["unknown", "random", "endpoint"]));
    assert.equal(res.status, 403);
    assert.equal(lastFetchCall, null);
  });

  // 9. Invalid HTTP method
  it("9. Invalid HTTP method: returns 405 for disallowed method", async () => {
    const req = makeReq("health", { method: "DELETE" });
    const res = await proxyHandler.DELETE(req, makeContext(["health"]));
    assert.equal(res.status, 405);
    assert.equal(res.headers.get("Allow"), "GET");
  });

  // 10. Collection/item route separation
  it("10. Collection vs item route separation: rejects DELETE on accounts collection", async () => {
    const req = makeReq("whatsapp/ws123/accounts", { method: "DELETE" });
    const res = await proxyHandler.DELETE(req, makeContext(["whatsapp", "ws123", "accounts"]));
    assert.equal(res.status, 405);
  });

  // 11. Campaign route rejection
  it("11. Campaign route rejection: explicitly rejects campaign routes with 403", async () => {
    const req = makeReq("campaigns/ws123", { method: "POST", headers: { "Content-Type": "application/json" } });
    const res = await proxyHandler.POST(req, makeContext(["campaigns", "ws123"]));
    assert.equal(res.status, 403);
    assert.equal(lastFetchCall, null);
  });

  // 12. Webhook route rejection
  it("12. Webhook route rejection: explicitly rejects whatsapp/webhook with 403", async () => {
    const req = makeReq("whatsapp/webhook");
    const res = await proxyHandler.GET(req, makeContext(["whatsapp", "webhook"]));
    assert.equal(res.status, 403);
    assert.equal(lastFetchCall, null);
  });

  // 13. Request body exactly at the allowed limit (2 MB)
  it("13. Request body exactly at 2 MB is accepted and forwarded", async () => {
    const exact2MbPayload = JSON.stringify({ data: "x".repeat(2 * 1024 * 1024 - 50) });
    const req = makeReq("workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: exact2MbPayload,
    });
    const res = await proxyHandler.POST(req, makeContext(["workspaces"]));
    assert.equal(res.status, 200);
    assert.notEqual(lastFetchCall, null);
  });

  // 14. Request body exceeding the limit
  it("14. Request body exceeding limit: rejected with 413 based on Content-Length", async () => {
    const oversizedPayload = JSON.stringify({ data: "x".repeat(2 * 1024 * 1024 + 100) });
    const req = makeReq("workspaces", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": String(oversizedPayload.length),
      },
      body: oversizedPayload,
    });
    const res = await proxyHandler.POST(req, makeContext(["workspaces"]));
    assert.equal(res.status, 413);
    assert.equal(lastFetchCall, null);
  });

  // 15. Chunked body exceeding limit
  it("15. Chunked body exceeding limit: rejects with 413 during stream reading", async () => {
    const chunk1 = new Uint8Array(1.5 * 1024 * 1024);
    const chunk2 = new Uint8Array(1.0 * 1024 * 1024); // Total 2.5 MB

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(chunk1);
        controller.enqueue(chunk2);
        controller.close();
      },
    });

    const req = new NextRequest("https://cyber7-frontend-preview.vercel.app/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: stream,
      duplex: "half",
    });

    const res = await proxyHandler.POST(req, makeContext(["workspaces"]));
    assert.equal(res.status, 413);
    assert.equal(lastFetchCall, null);
  });

  // 16. Unsupported content type
  it("16. Unsupported content type: rejects text/plain on payload requests with 415", async () => {
    const req = makeReq("workspaces", {
      method: "POST",
      headers: { "Content-Type": "text/plain", "Content-Length": "10" },
      body: "plain text",
    });
    const res = await proxyHandler.POST(req, makeContext(["workspaces"]));
    assert.equal(res.status, 415);
  });

  // 17. Upstream redirect rejection
  it("17. Upstream redirect rejection: rejects 302 from upstream with 502", async () => {
    globalThis.fetch = (async () => {
      return new Response(null, {
        status: 302,
        headers: { Location: "https://evil.com/leak" },
      });
    }) as unknown as typeof globalThis.fetch;

    const req = makeReq("health");
    const res = await proxyHandler.GET(req, makeContext(["health"]));
    assert.equal(res.status, 502);
    assert.equal(res.headers.has("Location"), false);
  });

  // 18. Upstream timeout
  it("18. Upstream timeout: returns 504 on abort due to timeout", async () => {
    globalThis.fetch = (async () => {
      const err = new Error("Upstream timeout");
      err.name = "AbortError";
      throw err;
    }) as unknown as typeof globalThis.fetch;

    const req = makeReq("health");
    const res = await proxyHandler.GET(req, makeContext(["health"]));
    assert.equal(res.status, 504);
  });

  // 19. Client abort handling
  it("19. Client abort handling: cleanly handles client abort", async () => {
    const clientController = new AbortController();
    clientController.abort("User cancelled");

    globalThis.fetch = (async () => {
      const err = new Error("User cancelled");
      err.name = "AbortError";
      throw err;
    }) as unknown as typeof globalThis.fetch;

    const req = makeReq("health", { signal: clientController.signal });
    const res = await proxyHandler.GET(req, makeContext(["health"]));
    assert.equal(res.status, 499);
  });

  // 20. Secret never appearing in response headers or body
  it("20. Secret never appears in response headers or body", async () => {
    const req = makeReq("health");
    const res = await proxyHandler.GET(req, makeContext(["health"]));
    const bodyText = await res.text();

    assert.equal(bodyText.includes(DUMMY_SECRET), false);
    assert.equal(res.headers.has("x-vercel-protection-bypass"), false);
    assert.equal(res.headers.has("Set-Cookie"), false);
    assert.equal(res.headers.has("x-vercel-id"), false);
    assert.equal(res.headers.has("Server"), false);
  });

  // 21. Secret never appearing in logs
  it("21. Secret never appears in console output", async () => {
    const logs: string[] = [];
    const origLog = console.log;
    const origError = console.error;
    console.log = (...args) => logs.push(args.join(" "));
    console.error = (...args) => logs.push(args.join(" "));

    try {
      const req = makeReq("health");
      await proxyHandler.GET(req, makeContext(["health"]));
      const combinedLogs = logs.join("\n");
      assert.equal(combinedLogs.includes(DUMMY_SECRET), false);
    } finally {
      console.log = origLog;
      console.error = origError;
    }
  });

  // 22. Authorization header forwarding
  it("22. Authorization header forwarding: preserves Bearer token upstream", async () => {
    const req = makeReq("workspaces/me", {
      headers: { Authorization: "Bearer eyJhbGciOi..." },
    });
    const res = await proxyHandler.GET(req, makeContext(["workspaces", "me"]));
    assert.equal(res.status, 200);
    assert.notEqual(lastFetchCall, null);
    const forwardedHeaders = new Headers(lastFetchCall?.init?.headers);
    assert.equal(forwardedHeaders.get("Authorization"), "Bearer eyJhbGciOi...");
    assert.equal(forwardedHeaders.get("x-vercel-protection-bypass"), DUMMY_SECRET);
  });

  // 23. Production environment guard
  it("23. Production environment guard: returns 404 in production", async () => {
    process.env.VERCEL_ENV = "production";
    const req = makeReq("health");
    const res = await proxyHandler.GET(req, makeContext(["health"]));
    assert.equal(res.status, 404);
    assert.equal(lastFetchCall, null);
  });

  // 24. Query parameter preservation
  it("24. Query parameter preservation: preserves search parameters upstream", async () => {
    const req = makeReq("whatsapp/ws123/conversations?limit=20&status=open");
    const res = await proxyHandler.GET(req, makeContext(["whatsapp", "ws123", "conversations"]));
    assert.equal(res.status, 200);
    assert.notEqual(lastFetchCall, null);
    assert.equal(
      lastFetchCall?.url,
      "https://cyber7-backend-l48kp7h5h-md-limons-projects-283c7c6c.vercel.app/api/whatsapp/ws123/conversations?limit=20&status=open",
    );
  });

  // 25. Error response handling
  it("25. Error response handling: preserves upstream error status and payload", async () => {
    globalThis.fetch = (async () => {
      return new Response(
        JSON.stringify({ success: false, message: "Workspace member not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }) as unknown as typeof globalThis.fetch;

    const req = makeReq("workspaces/ws123/members/m999", { method: "DELETE" });
    const res = await proxyHandler.DELETE(req, makeContext(["workspaces", "ws123", "members", "m999"]));
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.message, "Workspace member not found");
  });

  // 26. WhatsApp config-status route acceptance with valid workspaceId
  it("26. WhatsApp config-status: accepts GET /api/whatsapp/:workspaceId/config-status", async () => {
    const req = makeReq("whatsapp/ws_abc123/config-status");
    const res = await proxyHandler.GET(req, makeContext(["whatsapp", "ws_abc123", "config-status"]));
    assert.equal(res.status, 200);
    assert.notEqual(lastFetchCall, null);
    assert.equal(
      lastFetchCall?.url,
      "https://cyber7-backend-l48kp7h5h-md-limons-projects-283c7c6c.vercel.app/api/whatsapp/ws_abc123/config-status",
    );
  });

  // 27. WhatsApp config-status route rejection for empty or missing workspaceId
  it("27. WhatsApp config-status: rejects empty or missing workspaceId with 403", async () => {
    // Missing workspaceId segment
    const reqMissing = makeReq("whatsapp/config-status");
    const resMissing = await proxyHandler.GET(reqMissing, makeContext(["whatsapp", "config-status"]));
    assert.equal(resMissing.status, 403);
    assert.equal(lastFetchCall, null);

    // Empty workspaceId segment
    const reqEmpty = makeReq("whatsapp//config-status");
    const resEmpty = await proxyHandler.GET(reqEmpty, makeContext(["whatsapp", "", "config-status"]));
    assert.equal(resEmpty.status, 403);
    assert.equal(lastFetchCall, null);
  });

  // 28. WhatsApp config-status route rejection for extra path segments
  it("28. WhatsApp config-status: rejects extra path segments with 403", async () => {
    const req = makeReq("whatsapp/ws123/config-status/extra");
    const res = await proxyHandler.GET(req, makeContext(["whatsapp", "ws123", "config-status", "extra"]));
    assert.equal(res.status, 403);
    assert.equal(lastFetchCall, null);
  });

  // 29. WhatsApp config-status route method rejection
  it("29. WhatsApp config-status: rejects POST with 405 and Allow: GET", async () => {
    const req = makeReq("whatsapp/ws123/config-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "val" }),
    });
    const res = await proxyHandler.POST(req, makeContext(["whatsapp", "ws123", "config-status"]));
    assert.equal(res.status, 405);
    assert.equal(res.headers.get("Allow"), "GET");
    assert.equal(lastFetchCall, null);
  });

  // 30. WhatsApp config-status route path traversal rejection
  it("30. WhatsApp config-status: rejects path traversal in workspaceId with 403", async () => {
    const req = makeReq("whatsapp/../config-status");
    const res = await proxyHandler.GET(req, makeContext(["whatsapp", "..", "config-status"]));
    assert.equal(res.status, 403);
    assert.equal(lastFetchCall, null);
  });

  // 31. Path traversal protection: direct and encoded ..
  it("31. Path traversal protection: rejects .. and %2e%2e segments with 403", async () => {
    // Direct ..
    const reqDirect = makeReq("health");
    const resDirect = await proxyHandler.GET(reqDirect, makeContext(["..", "health"]));
    assert.equal(resDirect.status, 403);
    assert.equal(lastFetchCall, null);

    // Encoded %2e%2e
    const reqEncoded = makeReq("health");
    const resEncoded = await proxyHandler.GET(reqEncoded, makeContext(["%2e%2e", "health"]));
    assert.equal(resEncoded.status, 403);
    assert.equal(lastFetchCall, null);

    // Interstitial %2e%2e
    const reqInter = makeReq("health");
    const resInter = await proxyHandler.GET(reqInter, makeContext(["auth", "%2e%2e", "health"]));
    assert.equal(resInter.status, 403);
    assert.equal(lastFetchCall, null);
  });

  // 32. Path traversal protection: encoded slash and backslash
  it("32. Path traversal protection: rejects encoded slash %2f and backslash %5c with 403", async () => {
    // Encoded slash %2f
    const reqSlash = makeReq("whatsapp/ws123%2faccounts");
    const resSlash = await proxyHandler.GET(reqSlash, makeContext(["whatsapp", "ws123%2faccounts"]));
    assert.equal(resSlash.status, 403);
    assert.equal(lastFetchCall, null);

    // Encoded backslash %5c
    const reqBackslash = makeReq("workspaces%5cme");
    const resBackslash = await proxyHandler.GET(reqBackslash, makeContext(["workspaces%5cme"]));
    assert.equal(resBackslash.status, 403);
    assert.equal(lastFetchCall, null);
  });

  // 33. Path traversal protection: null byte injection
  it("33. Path traversal protection: rejects null bytes with 403", async () => {
    // Encoded null byte %00
    const reqNullEncoded = makeReq("health%00");
    const resNullEncoded = await proxyHandler.GET(reqNullEncoded, makeContext(["health%00"]));
    assert.equal(resNullEncoded.status, 403);
    assert.equal(lastFetchCall, null);

    // Raw null byte \0
    const reqNullRaw = makeReq("health\0");
    const resNullRaw = await proxyHandler.GET(reqNullRaw, makeContext(["health\0"]));
    assert.equal(resNullRaw.status, 403);
    assert.equal(lastFetchCall, null);
  });

  // 34. Asynchronous mid-flight client abort during active pending upstream fetch
  it("34. Client abort: cleanly aborts pending upstream fetch mid-flight and returns 499", async () => {
    let upstreamSignal: AbortSignal | undefined;

    globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      lastFetchCall = { url: input.toString(), init };
      upstreamSignal = init?.signal as AbortSignal | undefined;

      return new Promise((resolve, reject) => {
        if (upstreamSignal?.aborted) {
          const err = new Error("Aborted");
          err.name = "AbortError";
          return reject(err);
        }
        upstreamSignal?.addEventListener("abort", () => {
          const err = new Error("Aborted");
          err.name = "AbortError";
          reject(err);
        });
      });
    }) as unknown as typeof globalThis.fetch;

    const clientController = new AbortController();
    const req = makeReq("health", { signal: clientController.signal });

    const proxyPromise = proxyHandler.GET(req, makeContext(["health"]));

    // Abort mid-flight while fetch is waiting
    await new Promise((r) => setTimeout(r, 20));
    clientController.abort(new Error("Client abort mid-flight"));

    const res = await proxyPromise;
    assert.equal(res.status, 499);
    assert.equal(upstreamSignal?.aborted, true);
  });

  // 35. Strips Content-Length and preserves allowlisted response headers
  it("35. Response headers: strips Content-Length and preserves only allowlisted headers", async () => {
    globalThis.fetch = (async () => {
      return new Response(JSON.stringify({ status: "healthy" }), {
        status: 200,
        headers: {
          "Content-Length": "12345",
          "Content-Type": "application/json",
          "Content-Disposition": "inline; filename=test.json",
          "Vary": "Accept-Encoding, Authorization",
          "WWW-Authenticate": "Bearer realm=test",
          "Server": "Vercel",
          "x-vercel-id": "fra1::test-id",
          "Set-Cookie": "session=invalid",
        },
      });
    }) as unknown as typeof globalThis.fetch;

    const req = makeReq("health");
    const res = await proxyHandler.GET(req, makeContext(["health"]));

    assert.equal(res.status, 200);

    // Stripped headers
    assert.equal(res.headers.has("content-length"), false, "Content-Length must be stripped");
    assert.equal(res.headers.has("server"), false, "Server header must be stripped");
    assert.equal(res.headers.has("x-vercel-id"), false, "x-vercel-id must be stripped");
    assert.equal(res.headers.has("set-cookie"), false, "Set-Cookie must be stripped");

    // Preserved allowlisted headers
    assert.equal(res.headers.get("content-type"), "application/json");
    assert.equal(res.headers.get("content-disposition"), "inline; filename=test.json");
    assert.equal(res.headers.get("vary"), "Accept-Encoding, Authorization");
    assert.equal(res.headers.get("www-authenticate"), "Bearer realm=test");
    assert.equal(res.headers.get("cache-control"), "no-store");
  });
});
