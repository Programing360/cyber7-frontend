import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionToken =
    request.cookies.get("admin_session_token")?.value ||
    request.cookies.get("__Host-vexchat_admin_session")?.value ||
    request.cookies.get("vexchat_admin_session")?.value;
  const userRole = request.cookies.get("user_role")?.value;
  const pathname = request.nextUrl.pathname;

  // If already authenticated as platform admin, redirect away from admin login pages to /admin
  if (
    (pathname === "/admin/login" || pathname === "/platform-admin/login") &&
    sessionToken
  ) {
    if (userRole === "SUPER_ADMIN" || userRole === "FINANCE_ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/login", "/platform-admin/login", "/admin/:path*"],
};

