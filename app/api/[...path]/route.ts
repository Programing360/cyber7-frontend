import { createBffAssertion } from "@/src/lib/bff-assertion";
import { NextRequest, NextResponse } from "next/server";
// import { createBffAssertion } from "@/src/lib/verify-bff-assertion";

// ব্যাকএন্ড API এর বেস URL রিটার্ন করার ফাংশন (টেইলিং /api ও স্ল্যাশ ট্রিম করে)
function getBackendBaseUrl(): string {
  const envUrl =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://cyber7-backend-l48kp7h5h-md-limons-projects-283c7c6c.vercel.app";

  return envUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");
}

const BFF_SECRET = process.env.ADMIN_BFF_SECRET || "";

function isPublicAuthRoute(pathStr: string): boolean {
  const publicAuthRoutes = [
    "auth/register/request",
    "auth/register/verify-otp",
    "auth/register/resend-otp",
    "auth/login",
  ];

  return (
    publicAuthRoutes.includes(pathStr) ||
    pathStr.startsWith("auth/send-signup-otp") ||
    pathStr.startsWith("auth/verify-signup-otp") ||
    pathStr.startsWith("campaigns") ||
    pathStr.startsWith("whatsapp") ||
    pathStr.startsWith("workspaces") ||
    pathStr.startsWith("billing") ||
    pathStr.startsWith("settings") ||
    pathStr.startsWith("support") ||
    pathStr.startsWith("contacts") ||
    pathStr.startsWith("conversations") ||
    pathStr.startsWith("templates") ||
    pathStr.startsWith("team") ||
    pathStr.startsWith("dashboard") ||
    pathStr.startsWith("automations")
  );
}

/**
 * ফ্রন্টএন্ড পাথের সাথে ব্যাকএন্ডের আসল রাউট পাথ ম্যাপিং
 * ফ্রন্টএন্ড: /api/admin/auth/logout -> ব্যাকএন্ড: /api/platform-admin/auth/logout
 * ফ্রন্টএন্ড: /api/admin/dashboard/overview -> ব্যাকএন্ড: /api/platform-admin/dashboard/overview
 */
function resolveBackendPath(segments: string[]): string {
  const pathStr = segments.join("/");

  // If path already starts with platform-admin/ (preserve without double prefix)
  if (pathStr.startsWith("platform-admin/")) {
    return `/api/${pathStr}`;
  }

  // If path starts with admin/, strip it and route to /api/platform-admin/...
  if (pathStr.startsWith("admin/")) {
    const subPath = pathStr.replace(/^admin\//, "");
    return `/api/platform-admin/${subPath}`;
  }

  // Client workspace, whatsapp, campaigns, billing, settings, and support routes
  if (
    pathStr.startsWith("campaigns") ||
    pathStr.startsWith("whatsapp") ||
    pathStr.startsWith("workspaces") ||
    pathStr.startsWith("billing") ||
    pathStr.startsWith("settings") ||
    pathStr.startsWith("support") ||
    pathStr.startsWith("contacts") ||
    pathStr.startsWith("conversations") ||
    pathStr.startsWith("templates") ||
    pathStr.startsWith("team") ||
    pathStr.startsWith("dashboard") ||
    pathStr.startsWith("automations")
  ) {
    return `/api/${pathStr}`;
  }

  // Public registration routes
  const publicAuthRoutes = [
    "auth/register/request",
    "auth/register/verify-otp",
    "auth/register/resend-otp",
    "auth/login",
  ];

  if (publicAuthRoutes.includes(pathStr)) {
    return `/api/${pathStr}`;
  }

  // Existing public authentication routes
  if (
    pathStr.startsWith("auth/send-signup-otp") ||
    pathStr.startsWith("auth/verify-signup-otp")
  ) {
    return `/api/${pathStr}`;
  }

  // Platform Admin authentication routes
  if (pathStr.startsWith("auth/")) {
    return `/api/platform-admin/${pathStr}`;
  }

  // Platform Admin dashboard
  if (pathStr.startsWith("dashboard/")) {
    return `/api/platform-admin/${pathStr}`;
  }

  return `/api/platform-admin/${pathStr}`;
}

async function handleAdminBffProxy(
  req: NextRequest,
  rawPath: string[],
): Promise<Response> {
  const pathStr = rawPath.join("/");
  const isPublic = isPublicAuthRoute(pathStr);

  if (!isPublic && !BFF_SECRET) {
    return NextResponse.json(
      {
        success: false,
        code: "CONFIG_ERROR",
        message: "ADMIN_BFF_SECRET is not configured in Next.js",
      },
      { status: 500 },
    );
  }

  const method = req.method.toUpperCase();
  const targetBackendPath = resolveBackendPath(rawPath);
  const backendBaseUrl = getBackendBaseUrl();
  const targetUrl = new URL(
    `${backendBaseUrl}${targetBackendPath}${req.nextUrl.search}`,
  );

  // ২. সিকিউর হেডার প্রস্তুত করুন
  const forwardHeaders = new Headers();
  forwardHeaders.set(
    "Content-Type",
    req.headers.get("content-type") || "application/json",
  );
  forwardHeaders.set("Accept", req.headers.get("accept") || "application/json");

  // Authorization হেডার থাকলে ফরোয়ার্ড করুন
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    forwardHeaders.set("authorization", authHeader);
  }

  // Workspace ID হেডার থাকলে ফরোয়ার্ড করুন
  const workspaceIdHeader = req.headers.get("x-workspace-id");
  if (workspaceIdHeader) {
    forwardHeaders.set("x-workspace-id", workspaceIdHeader);
  }

  // অ্যাডমিন সেশনের জন্য অপরিহার্য Host-Only HttpOnly কুকি ফরোয়ার্ড করুন
  const incomingCookie = req.headers.get("cookie");
  if (incomingCookie) {
    forwardHeaders.set("cookie", incomingCookie);
  }

  // Admin সেশন ও রোল হেডার থাকলে ফরোয়ার্ড করুন
  const sessionId = req.headers.get("x-session-id");
  if (sessionId) forwardHeaders.set("x-session-id", sessionId);

  const adminRole = req.headers.get("x-admin-role");
  if (adminRole) forwardHeaders.set("x-admin-role", adminRole);

  const adminSessionToken = req.headers.get("x-admin-session-token");
  if (adminSessionToken) forwardHeaders.set("x-admin-session-token", adminSessionToken);

  // ১. ক্রিপ্টোগ্রাফিক BFF Assertion সাইন করুন (যদি BFF_SECRET থাকে)
  if (BFF_SECRET) {
    const bffAssertion = createBffAssertion({
      method,
      path: targetBackendPath,
      secret: BFF_SECRET,
      issuer: "vexchat-bff",
      audience: "vexchat-backend",
      ttlSeconds: 60,
    });
    forwardHeaders.set("x-admin-bff-assertion", bffAssertion);
  }

  // যদি Vercel প্রোটেকশন বাইপাস সিক্রেট থাকে
  const bypassSecret = process.env.BACKEND_BYPASS_SECRET;
  if (bypassSecret) {
    forwardHeaders.set("x-vercel-protection-bypass", bypassSecret);
  }

  // ৩. রিকোয়েস্ট বডি প্রিপারেশন
  let requestBody: BodyInit | undefined = undefined;
  if (method !== "GET" && method !== "HEAD") {
    requestBody = await req.arrayBuffer();
  }

  try {
    const backendRes = await fetch(targetUrl.toString(), {
      method,
      headers: forwardHeaders,
      body: requestBody,
      cache: "no-store",
    });

    const responseBody = await backendRes.arrayBuffer();
    const clientResponse = new NextResponse(responseBody, {
      status: backendRes.status,
      statusText: backendRes.statusText,
    });

    // ৪. কন্টেন্ট টাইপ ও মিডিয়া স্ট্রিমিং হেডার ফরোয়ার্ড
    clientResponse.headers.set(
      "Content-Type",
      backendRes.headers.get("content-type") || "application/json",
    );
    const contentLength = backendRes.headers.get("content-length");
    if (contentLength) {
      clientResponse.headers.set("Content-Length", contentLength);
    }
    const acceptRanges = backendRes.headers.get("accept-ranges");
    if (acceptRanges) {
      clientResponse.headers.set("Accept-Ranges", acceptRanges);
    }
    const contentRange = backendRes.headers.get("content-range");
    if (contentRange) {
      clientResponse.headers.set("Content-Range", contentRange);
    }
    clientResponse.headers.set("Cache-Control", "no-store");

    // ৫. ব্যাকএন্ডের Set-Cookie (সেশন সেট বা লগআউটের সময় কুকি ডিলিট) ক্লায়েন্টে পৌঁছে দিন
    const setCookies = backendRes.headers.getSetCookie?.() || [];
    if (setCookies.length > 0) {
      for (const cookieStr of setCookies) {
        clientResponse.headers.append("set-cookie", cookieStr);
      }
    } else {
      const singleSetCookie = backendRes.headers.get("set-cookie");
      if (singleSetCookie) {
        clientResponse.headers.append("set-cookie", singleSetCookie);
      }
    }

    return clientResponse;
  } catch (err: unknown) {
    console.error("[AdminBFFProxy] Connection Failed:", err);
    return NextResponse.json(
      {
        success: false,
        code: "BACKEND_UNREACHABLE",
        message: "Failed to communicate with Cyber7 platform backend",
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
  const { path } = await context.params;
  return handleAdminBffProxy(req, path || []);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handleAdminBffProxy(req, path || []);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handleAdminBffProxy(req, path || []);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handleAdminBffProxy(req, path || []);
}
