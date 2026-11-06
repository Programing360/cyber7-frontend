import { createBffAssertion } from "@/src/lib/bff-assertion";
import { NextRequest, NextResponse } from "next/server";
// import { createBffAssertion } from "@/src/lib/verify-bff-assertion";

// ব্যাকএন্ড API এর বেস URL
const BACKEND_BASE_URL =
  process.env.BACKEND_API_URL ||
  "https://cyber7-backend-l48kp7h5h-md-limons-projects-283c7c6c.vercel.app";

const BFF_SECRET = process.env.ADMIN_BFF_SECRET || "";

/**
 * ফ্রন্টএন্ড পাথের সাথে ব্যাকএন্ডের আসল রাউট পাথ ম্যাপিং
 * ফ্রন্টএন্ড: /api/admin/auth/logout -> ব্যাকএন্ড: /api/platform-admin/auth/logout
 * ফ্রন্টএন্ড: /api/admin/dashboard/overview -> ব্যাকএন্ড: /api/platform-admin/dashboard/overview
 */
function resolveBackendPath(segments: string[]): string {
  const pathStr = segments.join("/");

  if (pathStr.startsWith("auth/")) {
    return `/api/platform-admin/${pathStr}`;
  }

  if (pathStr.startsWith("dashboard/")) {
    return `/api/platform-admin/${pathStr}`;
  }

  return `/api/platform-admin/${pathStr}`;
}

async function handleAdminBffProxy(
  req: NextRequest,
  rawPath: string[],
): Promise<Response> {
  if (!BFF_SECRET) {
    return NextResponse.json(
      { success: false, code: "CONFIG_ERROR", message: "ADMIN_BFF_SECRET is not configured in Next.js" },
      { status: 500 }
    );
  }

  const method = req.method.toUpperCase();
  const targetBackendPath = resolveBackendPath(rawPath);
  const targetUrl = new URL(
    `${BACKEND_BASE_URL}${targetBackendPath}${req.nextUrl.search}`,
  );

  // ১. ক্রিপ্টোগ্রাফিক BFF Assertion সাইন করুন
  const bffAssertion = createBffAssertion({
    method,
    path: targetBackendPath,
    secret: BFF_SECRET,
    issuer: "vexchat-bff",
    audience: "vexchat-backend",
    ttlSeconds: 60,
  });

  // ২. সিকিউর হেডার প্রস্তুত করুন
  const forwardHeaders = new Headers();
  forwardHeaders.set("Content-Type", req.headers.get("content-type") || "application/json");
  forwardHeaders.set("Accept", req.headers.get("accept") || "application/json");

  // অ্যাডমিন সেশনের জন্য অপরিহার্য Host-Only HttpOnly কুকি ফরোয়ার্ড করুন
  const incomingCookie = req.headers.get("cookie");
  if (incomingCookie) {
    forwardHeaders.set("cookie", incomingCookie);
  }

  // ক্রিপ্টোগ্রাফিক Assertion হেডার যোগ করুন
  forwardHeaders.set("x-admin-bff-assertion", bffAssertion);

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

    // ৪. কন্টেন্ট টাইপ ও ক্যাশ কন্ট্রোল ফরোয়ার্ড
    clientResponse.headers.set(
      "Content-Type",
      backendRes.headers.get("content-type") || "application/json",
    );
    clientResponse.headers.set("Cache-Control", "no-store");

    // ৫. ব্যাকএন্ডের Set-Cookie (সেশন সেট বা লগআউটের সময় কুকি ডিলিট) ক্লায়েন্টে পৌঁছে দিন
    const setCookies = backendRes.headers.getSetCookie?.() || [];
    for (const cookieStr of setCookies) {
      clientResponse.headers.append("set-cookie", cookieStr);
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
      { status: 502 }
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