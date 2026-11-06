import { NextRequest, NextResponse } from "next/server";
import { createBffAssertion } from "@/src/lib/bff-assertion";

function getBackendBaseUrl(): string {
  const envUrl =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.BACKEND_API_URL;

  if (!envUrl) return "http://localhost:5000";
  return envUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");
}

function getBffSecret(): string {
  return (process.env.ADMIN_BFF_SECRET || "").trim();
}

async function proxyDashboardRequest(
  req: NextRequest,
  params: Promise<{ path: string[] }>,
): Promise<Response> {
  const bffSecret = getBffSecret();

  if (!bffSecret) {
    return NextResponse.json(
      {
        success: false,
        code: "BFF_SECRET_MISSING",
        message: "ADMIN_BFF_SECRET is not configured in Next.js environment.",
      },
      { status: 500 },
    );
  }

  try {
    const { path } = await params;
    const subPath = (path || []).join("/");
    // এক্সপ্রেস ব্যাকএন্ডের আসল টার্গেট পাথ
    const backendPath = `/api/platform-admin/dashboard/${subPath}`;
    const backendBaseUrl = getBackendBaseUrl();
    const queryString = req.nextUrl.search || "";

    // ১. ব্যাকএন্ডের এক্সাক্ট পাথ ও মেথডের সাথে assertion টোকেন তৈরি করুন
    const assertion = createBffAssertion({
      method: req.method.toUpperCase(),
      path: backendPath,
      secret: bffSecret,
      issuer: "vexchat-bff",
      audience: "vexchat-backend",
      ttlSeconds: 60,
    });

    // ২. হেডারে স্ট্রিক্টলি 'x-admin-bff-assertion' সেট করুন
    const headers: Record<string, string> = {
      accept: "application/json",
      "x-admin-bff-assertion": assertion,
    };

    // ৩. সেশন কুকি ও আইপি ফরোয়ার্ড করুন
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      headers["cookie"] = cookieHeader;
    }

    const clientIp =
      req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    if (clientIp) {
      headers["x-forwarded-for"] = clientIp;
    }

    const bypassSecret = process.env.BACKEND_BYPASS_SECRET;
    if (bypassSecret) {
      headers["x-vercel-protection-bypass"] = bypassSecret;
    }

    // ৪. বডি প্রিপারেশন
    let bodyBuffer: ArrayBuffer | undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      headers["content-type"] =
        req.headers.get("content-type") || "application/json";
      try {
        bodyBuffer = await req.arrayBuffer();
      } catch {
        // empty body
      }
    }

    // ৫. ব্যাকএন্ডে প্রক্সি কল
    const targetUrl = `${backendBaseUrl}${backendPath}${queryString}`;
    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: bodyBuffer,
      cache: "no-store",
    });

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

    return clientResponse;
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Dashboard proxy gateway error";

    console.error("[BFF Dashboard Proxy Error]:", err);

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

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyDashboardRequest(req, context.params);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyDashboardRequest(req, context.params);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyDashboardRequest(req, context.params);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyDashboardRequest(req, context.params);
}
