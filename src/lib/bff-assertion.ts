import crypto from "node:crypto";

const DEFAULT_DEV_BFF_SECRET =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

/**
 * Normalizes canonical HTTP request paths:
 * Strips query strings, trailing slashes, and whitespace.
 */
export function normalizeCanonicalPath(rawPath: string): string {
  if (!rawPath || typeof rawPath !== "string") {
    return "/";
  }

  const pathOnly = rawPath.split("?")[0].trim();
  if (pathOnly === "" || pathOnly === "/") {
    return "/";
  }

  return pathOnly.replace(/\/+$/, "");
}

function base64UrlEncode(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export interface BffAssertionPayload {
  jti: string;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  method: string;
  path: string;
  adminSessionId?: string;
}

/**
 * Generates a signed Next.js BFF service assertion for authenticating to the Express backend.
 */
export function createBffAssertion({
  method,
  path,
  secret = process.env.ADMIN_BFF_SECRET || DEFAULT_DEV_BFF_SECRET,
  issuer = process.env.ADMIN_BFF_ISSUER || "vexchat-bff",
  audience = process.env.ADMIN_BFF_AUDIENCE || "vexchat-backend",
  ttlSeconds = 60,
  adminSessionId,
}: {
  method: string;
  path: string;
  secret?: string;
  issuer?: string;
  audience?: string;
  ttlSeconds?: number;
  adminSessionId?: string;
}): string {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + ttlSeconds;

  const payload: BffAssertionPayload = {
    jti: crypto.randomUUID(),
    iss: issuer.trim(),
    aud: audience.trim(),
    iat,
    exp,
    method: method.trim().toUpperCase(),
    path: normalizeCanonicalPath(path),
    adminSessionId,
  };

  const payloadJson = JSON.stringify(payload);
  const payloadEncoded = base64UrlEncode(Buffer.from(payloadJson, "utf8"));

  const signature = crypto
    .createHmac("sha256", secret)
    .update(payloadEncoded)
    .digest("hex");

  return `${payloadEncoded}.${signature}`;
}

