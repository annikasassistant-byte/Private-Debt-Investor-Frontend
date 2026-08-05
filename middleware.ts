import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Soft gate for /admin/* — client AuthGuard + API authorize remain authoritative.
 * Blocks obvious investor soft-nav into admin shells when a role hint cookie/header is present.
 * Always allows through when role is unknown (AuthGuard hydrates from API).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Optional client hint set after login (non-httpOnly) — investors redirected early
  const roleHint = request.cookies.get("depth_role_hint")?.value;
  if (roleHint === "investor") {
    const url = request.nextUrl.clone();
    url.pathname = "/unauthorized";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
