import { NextRequest } from "next/server.js";

// ── Environment & Security Configuration ─────────────────────────────────────
const EXPECTED_UPSTREAM_HOST = "cyber7-backend-l48kp7h5h-md-limons-projects-283c7c6c.vercel.app";
const MAX_BODY_BYTES = 2 * 1024 * 1024; // 2 MB
const REQUEST_TIMEOUT_MS = 15000; // 15 seconds

// ── Route & Method Allowlist (Exact 35 Endpoints) ─────────────────────────────
interface RouteDefinition {
  regex: RegExp;
  methods: readonly string[];
}

const ALLOWED_ROUTES: readonly RouteDefinition[] = [
  // 1. Diagnostics (1 route)
  { regex: /^health$/, methods: ["GET"] },

  // 2. Authentication (3 routes)
  { regex: /^auth\/register$/, methods: ["POST"] },
  { regex: /^auth\/login$/, methods: ["POST"] },
  { regex: /^auth\/me$/, methods: ["GET"] },

  // 3. Workspaces & Members & Invitations (11 routes)
  { regex: /^workspaces\/me$/, methods: ["GET"] },
  { regex: /^workspaces$/, methods: ["POST"] },
  { regex: /^workspaces\/[a-zA-Z0-9_-]+\/access-check$/, methods: ["GET"] },
  { regex: /^workspaces\/[a-zA-Z0-9_-]+\/members$/, methods: ["GET"] },
  { regex: /^workspaces\/[a-zA-Z0-9_-]+\/members\/[a-zA-Z0-9_-]+$/, methods: ["DELETE"] },
  { regex: /^workspaces\/[a-zA-Z0-9_-]+\/members\/[a-zA-Z0-9_-]+\/role$/, methods: ["PATCH"] },
  { regex: /^workspaces\/[a-zA-Z0-9_-]+\/members\/[a-zA-Z0-9_-]+\/status$/, methods: ["PATCH"] },
  { regex: /^workspaces\/[a-zA-Z0-9_-]+\/invitations$/, methods: ["GET", "POST"] },
  { regex: /^workspaces\/[a-zA-Z0-9_-]+\/invitations\/[a-zA-Z0-9_-]+$/, methods: ["DELETE"] },
  { regex: /^invitations\/accept$/, methods: ["POST"] },

  // 4. Dashboard (1 route)
  { regex: /^dashboard\/[a-zA-Z0-9_-]+\/stats$/, methods: ["GET"] },

  // 5. WhatsApp Module (19 routes)
  { regex: /^whatsapp\/[a-zA-Z0-9_-]+\/config-status$/, methods: ["GET"] },
  { regex: /^whatsapp\/[a-zA-Z0-9_-]+\/accounts$/, methods: ["GET", "POST"] },
  { regex: /^whatsapp\/[a-zA-Z0-9_-]+\/accounts\/[a-zA-Z0-9_-]+$/, methods: ["GET", "DELETE"] },
  { regex: /^whatsapp\/[a-zA-Z0-9_-]+\/accounts\/[a-zA-Z0-9_-]+\/status$/, methods: ["PATCH"] },
  { regex: /^whatsapp\/[a-zA-Z0-9_-]+\/contacts$/, methods: ["GET", "POST"] },
  { regex: /^whatsapp\/[a-zA-Z0-9_-]+\/contacts\/[a-zA-Z0-9_-]+$/, methods: ["GET", "PATCH", "DELETE"] },
  { regex: /^whatsapp\/[a-zA-Z0-9_-]+\/conversations$/, methods: ["GET"] },
  { regex: /^whatsapp\/[a-zA-Z0-9_-]+\/conversations\/[a-zA-Z0-9_-]+$/, methods: ["GET"] },
  { regex: /^whatsapp\/[a-zA-Z0-9_-]+\/conversations\/[a-zA-Z0-9_-]+\/status$/, methods: ["PATCH"] },
  { regex: /^whatsapp\/[a-zA-Z0-9_-]+\/conversations\/[a-zA-Z0-9_-]+\/messages$/, methods: ["GET"] },
  { regex: /^whatsapp\/[a-zA-Z0-9_-]+\/messages$/, methods: ["POST"] },
  { regex: /^whatsapp\/[a-zA-Z0-9_-]+\/templates$/, methods: ["GET"] },
  { regex: /^whatsapp\/[a-zA-Z0-9_-]+\/templates\/sync$/, methods: ["POST"] },
  { regex: /^whatsapp\/[a-zA-Z0-9_-]+\/templates\/[a-zA-Z0-9_-]+$/, methods: ["GET"] },
];

// Response header allowlist
const FORWARDED_RESPONSE_HEADERS = [
  "content-type",
  "content-disposition",
  "vary",
  "www-authenticate",
];

/**
 * Validates the configured upstream base URL against platform and security constraints.
 */
function validateUpstreamUrl(upstreamStr: string): { valid: boolean; error?: string; url?: URL } {
  let parsed: URL;
  try {
    parsed = new URL(upstreamStr);
  } catch {
    return { valid: false, error: "Malformed upstream URL" };
  }

  if (parsed.protocol !== "https:") {
    return { valid: false, error: "Upstream protocol must be HTTPS" };
  }

  if (parsed.hostname !== EXPECTED_UPSTREAM_HOST) {
    return { valid: false, error: "Unexpected upstream hostname" };
  }

  if (parsed.port !== "" && parsed.port !== "443") {
    return { valid: false, error: "Unexpected upstream port" };
  }

  if (parsed.username || parsed.password) {
    return { valid: false, error: "Upstream URL credentials not allowed" };
  }

  if (parsed.pathname.replace(/\/+$/, "") !== "/api") {
    return { valid: false, error: "Upstream path must be exactly /api" };
  }

  if (parsed.search || parsed.hash) {
    return { valid: false, error: "Upstream URL cannot contain query or hash" };
  }

  return { valid: true, url: parsed };
}

/**
 * Validates path segments against traversal, encoding attacks, and route allowlist.
 */
function validatePathAndMethod(
  segments: string[],
  method: string,
): { status: "OK"; normalizedPath: string } | { status: "FORBIDDEN" } | { status: "METHOD_NOT_ALLOWED"; allowedMethods: readonly string[] } {
  // Check for traversal segments, empty segments, backslashes, null bytes
  for (const seg of segments) {
    if (
      seg === ".." ||
      seg === "." ||
      seg === "" ||
      seg.includes("\\") ||
      seg.includes("/") ||
      seg.includes("\0") ||
      /%2e/i.test(seg) ||
      /%2f/i.test(seg) ||
      /%5c/i.test(seg) ||
      /%00/i.test(seg)
    ) {
      return { status: "FORBIDDEN" };
    }
  }

  const normalizedPath = segments.join("/");

  // Explicitly check forbidden prefixes
  if (
    normalizedPath.startsWith("campaigns") ||
    normalizedPath.startsWith("whatsapp/webhook") ||
    normalizedPath === "workspaces" && method === "PATCH"
  ) {
    return { status: "FORBIDDEN" };
  }

  let matchedRoute: RouteDefinition | undefined;
  for (const route of ALLOWED_ROUTES) {
    if (route.regex.test(normalizedPath)) {
      matchedRoute = route;
      break;
    }
  }

  if (!matchedRoute) {
    return { status: "FORBIDDEN" };
  }

  if (!matchedRoute.methods.includes(method)) {
    return { status: "METHOD_NOT_ALLOWED", allowedMethods: matchedRoute.methods };
  }

  return { status: "OK", normalizedPath };
}

/**
 * Reads and validates request body with streaming byte bounds.
 */
async function readAndValidateBody(
  req: NextRequest,
): Promise<{ ok: true; bodyBuffer?: Uint8Array } | { ok: false; status: number; message: string }> {
  const method = req.method;
  if (method === "GET" || method === "HEAD" || method === "OPTIONS" || method === "DELETE") {
    return { ok: true };
  }

  const contentType = req.headers.get("content-type") || "";
  const contentLengthHeader = req.headers.get("content-length");

  // Validate content type for payload-bearing requests
  if (contentLengthHeader !== "0" && req.body) {
    if (!contentType.toLowerCase().includes("application/json")) {
      return { ok: false, status: 415, message: "Unsupported Content-Type: only application/json is supported" };
    }
  }

  // Pre-validate Content-Length header if present
  if (contentLengthHeader) {
    const declaredLength = parseInt(contentLengthHeader, 10);
    if (isNaN(declaredLength) || declaredLength < 0) {
      return { ok: false, status: 400, message: "Invalid Content-Length header" };
    }
    if (declaredLength > MAX_BODY_BYTES) {
      return { ok: false, status: 413, message: `Payload exceeds 2MB limit (declared: ${declaredLength} bytes)` };
    }
  }

  if (!req.body) {
    return { ok: true };
  }

  // Stream byte counting up to MAX_BODY_BYTES
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        totalBytes += value.length;
        if (totalBytes > MAX_BODY_BYTES) {
          try {
            await reader.cancel();
          } catch {
            // Reader cancel might fail if stream is already closed
          }
          return { ok: false, status: 413, message: "Payload exceeds 2MB limit" };
        }
        chunks.push(value);
      }
    }
  } catch {
    return { ok: false, status: 400, message: "Error reading request stream" };
  }

  if (totalBytes === 0) {
    return { ok: true };
  }

  // Combine chunks into single Uint8Array
  const combined = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  return { ok: true, bodyBuffer: combined };
}

/**
 * Central handler for all proxy requests.
 */
async function handleProxy(req: NextRequest, rawSegments: string[]): Promise<Response> {
  // 1. Environment Guard
  if (process.env.VERCEL_ENV !== "preview") {
    return new Response(null, { status: 404 });
  }

  const bypassSecret = process.env.BACKEND_BYPASS_SECRET;
  const upstreamBaseUrl = process.env.BACKEND_PREVIEW_UPSTREAM_URL;

  if (!bypassSecret || !upstreamBaseUrl) {
    return new Response(
      JSON.stringify({ success: false, message: "Preview proxy configuration missing" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      },
    );
  }

  // 2. Upstream URL Validation
  const upstreamCheck = validateUpstreamUrl(upstreamBaseUrl);
  if (!upstreamCheck.valid || !upstreamCheck.url) {
    return new Response(
      JSON.stringify({ success: false, message: "Invalid upstream URL configuration" }),
      {
        status: 502,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      },
    );
  }

  // 3. Path & Method Validation
  const pathCheck = validatePathAndMethod(rawSegments, req.method);
  if (pathCheck.status === "FORBIDDEN") {
    return new Response(
      JSON.stringify({ success: false, message: "Access forbidden: route not allowed" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      },
    );
  }

  if (pathCheck.status === "METHOD_NOT_ALLOWED") {
    return new Response(
      JSON.stringify({ success: false, message: "Method not allowed" }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          Allow: pathCheck.allowedMethods.join(", "),
        },
      },
    );
  }

  // 4. Request Body Validation
  const bodyResult = await readAndValidateBody(req);
  if (!bodyResult.ok) {
    return new Response(
      JSON.stringify({ success: false, message: bodyResult.message }),
      {
        status: bodyResult.status,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      },
    );
  }

  // 5. Build Upstream Target URL
  const targetUrl = new URL(
    `${upstreamCheck.url.origin}/api/${pathCheck.normalizedPath}${req.nextUrl.search}`,
  );

  // 6. Header Forwarding & Injection
  const forwardHeaders = new Headers();
  const authHeader = req.headers.get("authorization");
  if (authHeader) forwardHeaders.set("Authorization", authHeader);

  const contentType = req.headers.get("content-type");
  if (contentType) forwardHeaders.set("Content-Type", contentType);

  const acceptHeader = req.headers.get("accept");
  if (acceptHeader) forwardHeaders.set("Accept", acceptHeader);

  const wsHeader = req.headers.get("x-workspace-id");
  if (wsHeader) forwardHeaders.set("X-Workspace-Id", wsHeader);

  if (bodyResult.bodyBuffer) {
    forwardHeaders.set("Content-Length", String(bodyResult.bodyBuffer.length));
  }

  // Inject Vercel bypass secret server-side
  forwardHeaders.set("x-vercel-protection-bypass", bypassSecret);

  // 7. Timeout and Upstream Fetch
  const abortController = new AbortController();
  let isTimeout = false;
  const timeoutId = setTimeout(() => {
    isTimeout = true;
    abortController.abort(new Error("Upstream timeout"));
  }, REQUEST_TIMEOUT_MS);

  const onClientAbort = () => {
    abortController.abort(req.signal.reason);
  };

  if (req.signal.aborted) {
    onClientAbort();
  } else {
    req.signal.addEventListener("abort", onClientAbort, { once: true });
  }

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(targetUrl.toString(), {
      method: req.method,
      headers: forwardHeaders,
      body: bodyResult.bodyBuffer ? (bodyResult.bodyBuffer as unknown as BodyInit) : undefined,
      redirect: "manual",
      signal: abortController.signal,
    });
  } catch (fetchErr: unknown) {
    clearTimeout(timeoutId);
    req.signal.removeEventListener("abort", onClientAbort);

    if (req.signal.aborted) {
      return new Response(null, { status: 499 }); // Client Closed Request
    }

    if (
      isTimeout ||
      abortController.signal.aborted ||
      (fetchErr instanceof Error && (fetchErr.name === "AbortError" || fetchErr.name === "TimeoutError"))
    ) {
      return new Response(
        JSON.stringify({ success: false, message: "Gateway timeout: upstream took longer than 15s" }),
        {
          status: 504,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        },
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: "Bad gateway: upstream network error" }),
      {
        status: 502,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      },
    );
  } finally {
    clearTimeout(timeoutId);
    req.signal.removeEventListener("abort", onClientAbort);
  }

  // 8. Reject Upstream Redirects (Prevent Bypass Header Leakage)
  if (upstreamResponse.status >= 300 && upstreamResponse.status < 400) {
    return new Response(
      JSON.stringify({ success: false, message: "Upstream redirect rejected" }),
      {
        status: 502,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      },
    );
  }

  // 9. Response Sanitization
  const responseHeaders = new Headers();
  responseHeaders.set("Cache-Control", "no-store");

  for (const headerName of FORWARDED_RESPONSE_HEADERS) {
    const val = upstreamResponse.headers.get(headerName);
    if (val !== null) {
      responseHeaders.set(headerName, val);
    }
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}

// ── Exported Route Handlers ──────────────────────────────────────────────────

export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }): Promise<Response> {
  const { path } = await context.params;
  return handleProxy(req, path || []);
}

export async function POST(req: NextRequest, context: { params: Promise<{ path: string[] }> }): Promise<Response> {
  const { path } = await context.params;
  return handleProxy(req, path || []);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ path: string[] }> }): Promise<Response> {
  const { path } = await context.params;
  return handleProxy(req, path || []);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ path: string[] }> }): Promise<Response> {
  const { path } = await context.params;
  return handleProxy(req, path || []);
}

export async function OPTIONS(): Promise<Response> {
  // Local OPTIONS preflight response — does not forward upstream
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "GET, POST, PATCH, DELETE, OPTIONS",
      "Cache-Control": "no-store",
    },
  });
}

export async function HEAD(): Promise<Response> {
  return new Response(null, {
    status: 405,
    headers: {
      Allow: "GET, POST, PATCH, DELETE, OPTIONS",
      "Cache-Control": "no-store",
    },
  });
}

export async function PUT(): Promise<Response> {
  return new Response(null, {
    status: 405,
    headers: {
      Allow: "GET, POST, PATCH, DELETE, OPTIONS",
      "Cache-Control": "no-store",
    },
  });
}
