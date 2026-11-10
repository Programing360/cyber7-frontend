import { NextRequest, NextResponse } from "next/server";
import { createBffAssertion } from "@/src/lib/bff-assertion";

function getBackendBaseUrl(): string {
  const envUrl =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_URL;

  if (!envUrl) return "http://localhost:5000";
  return envUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");
}

function getBffSecret(): string {
  return (process.env.ADMIN_BFF_SECRET || "").trim();
}

/**
 * র' Set-Cookie স্ট্রিং পার্স করে Next.js response.cookies.set() উপযোগী অবজেক্ট বানায়
 */
function applySetCookieHeader(res: NextResponse, rawSetCookie: string) {
  const parts = rawSetCookie.split(";").map((p) => p.trim());
  if (parts.length === 0 || !parts[0].includes("=")) return;

  const [firstPart, ...attributes] = parts;
  const eqIdx = firstPart.indexOf("=");
  const name = firstPart.slice(0, eqIdx).trim();
  const value = firstPart.slice(eqIdx + 1).trim();

  const options: {
    path?: string;
    expires?: Date;
    maxAge?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "lax" | "strict" | "none";
  } = {
    path: "/",
  };

  const isProduction = process.env.NODE_ENV === "production";

  for (const attr of attributes) {
    const [attrKey, ...valParts] = attr.split("=");
    const key = attrKey.toLowerCase().trim();
    const val = valParts.join("=").trim();

    if (key === "path") {
      options.path = val || "/";
    } else if (key === "expires") {
      options.expires = new Date(val);
    } else if (key === "max-age") {
      options.maxAge = parseInt(val, 10);
    } else if (key === "httponly") {
      options.httpOnly = true;
    } else if (key === "samesite") {
      const lower = val.toLowerCase();
      if (lower === "strict" || lower === "lax" || lower === "none") {
        options.sameSite = lower;
      }
    }
  }

  // লোকালহোস্টে secure: false নিশ্চিত করা যাতে HTTP-তে ব্রাউজার কুকি ড্রপ না করে
  options.secure = isProduction;

  res.cookies.set(name, decodeURIComponent(value), options);
}

async function proxyAuthRequest(
  req: NextRequest,
  params: Promise<{ path: string[] }>,
): Promise<Response> {
  const bffSecret = getBffSecret();

  // ১. সিক্রেট ভ্যালিডেশন
  if (!bffSecret) {
    console.error(
      "❌ CRITICAL: ADMIN_BFF_SECRET is missing in Next.js environment!",
    );
    return NextResponse.json(
      {
        success: false,
        code: "BFF_SECRET_MISSING",
        message:
          "ADMIN_BFF_SECRET is not defined in Next.js environment variables.",
      },
      { status: 500 },
    );
  }

  try {
    const { path } = await params;
    const subPath = (path || []).join("/");
    const backendPath = `/api/platform-admin/auth/${subPath}`;
    const backendBaseUrl = getBackendBaseUrl();
    const queryString = req.nextUrl.search || "";

    // ২. ক্রিপ্টোগ্রাফিক assertion সাইন করা (Outer scope-এ ডিক্লেয়ার করা)
    let assertion = "";
    try {
      assertion = createBffAssertion({
        method: req.method.toUpperCase(),
        path: backendPath,
        secret: bffSecret,
        issuer: "vexchat-bff",
        audience: "vexchat-backend",
        ttlSeconds: 60,
      });
    } catch (signErr) {
      console.error("❌ Next.js BFF Assertion Sign Failed:", signErr);
      return NextResponse.json(
        {
          success: false,
          code: "ASSERTION_GENERATION_FAILED",
          message: "Failed to generate security signature for backend request",
        },
        { status: 500 },
      );
    }

    const headers: Record<string, string> = {
      accept: "application/json",
      "x-admin-bff-assertion": assertion,
    };

    // ৩. ইনকামিং Authorization এবং কুকি ব্যাকএন্ডে ফরোয়ার্ড করা
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      headers["authorization"] = authHeader;
    }

    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      headers["cookie"] = cookieHeader;
    }

    // ৪. ক্লায়েন্ট রিয়েল আইপি ও ইউজার এজেন্ট ফরোয়ার্ড করা
    const clientIp =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      req.headers.get("cf-connecting-ip");
    if (clientIp) {
      headers["x-forwarded-for"] = clientIp;
    }

    const userAgent = req.headers.get("user-agent");
    if (userAgent) {
      headers["user-agent"] = userAgent;
    }

    const bypassSecret = process.env.BACKEND_BYPASS_SECRET;
    if (bypassSecret) {
      headers["x-vercel-protection-bypass"] = bypassSecret;
    }

    // ৫. রিকোয়েস্ট বডি
    let bodyBuffer: ArrayBuffer | undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      const incomingContentType = req.headers.get("content-type");
      headers["content-type"] = incomingContentType || "application/json";

      try {
        bodyBuffer = await req.arrayBuffer();
      } catch {
        // empty body
      }
    }

    // ৬. ব্যাকএন্ডে রিকোয়েস্ট প্রেরণ
    const targetUrl = `${backendBaseUrl}${backendPath}${queryString}`;
    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: bodyBuffer,
      cache: "no-store",
    });

    // ⚠️ ব্যাকএন্ড যদি 500 রিটার্ন করে, টার্মিনালে আসল কারণ প্রিন্ট করা
    if (!backendRes.ok && backendRes.status >= 500) {
      const cloned = backendRes.clone();
      const errText = await cloned.text();
      console.error(
        `❌ Backend returned ${backendRes.status} for ${backendPath}:`,
        errText,
      );
    }

    const responseData = await backendRes.arrayBuffer();
    const clientResponse = new NextResponse(responseData, {
      status: backendRes.status,
      statusText: backendRes.statusText,
    });

    clientResponse.headers.set(
      "content-type",
      backendRes.headers.get("content-type") || "application/json",
    );
    clientResponse.headers.set("cache-control", "no-store");

    // ৭. ব্যাকএন্ডের Set-Cookie Next.js Cookie API দিয়ে নিশ্চিতভাবে সেট করা
    const getSetCookie = (
      backendRes.headers as unknown as { getSetCookie?: () => string[] }
    ).getSetCookie;

    if (typeof getSetCookie === "function") {
      const setCookies = getSetCookie.call(backendRes.headers) || [];
      for (const cookieStr of setCookies) {
        applySetCookieHeader(clientResponse, cookieStr);
      }
    } else {
      const singleSetCookie = backendRes.headers.get("set-cookie");
      if (singleSetCookie) {
        applySetCookieHeader(clientResponse, singleSetCookie);
      }
    }

    return clientResponse;
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error
        ? err.message
        : "Failed to communicate with authentication service";

    console.error("[BFF Auth Proxy Error]:", err);

    return NextResponse.json(
      {
        success: false,
        code: "BFF_PROXY_ERROR",
        message: errorMsg,
      },
      { status: 502 },
    );
  }
}

// ── Exported Route Handlers ──────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyAuthRequest(req, context.params);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyAuthRequest(req, context.params);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyAuthRequest(req, context.params);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyAuthRequest(req, context.params);
}
