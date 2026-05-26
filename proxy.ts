import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

// ─── Constants ────────────────────────────────────────────────────────────────

const PROTECTED_PATHS = ["/notes"];
const BODY_SIZE_LIMIT = 1 * 1024 * 1024; // 1 MB

// Auth endpoints that should be rate-limited
const AUTH_RATE_LIMITED = [
  "/api/auth/sign-in",
  "/api/auth/sign-up",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ─── Proxy ────────────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const httpMethod = request.method;

  // 1. Body size limit — reject oversized POST/PATCH payloads early
  if (["POST", "PATCH", "PUT"].includes(httpMethod)) {
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > BODY_SIZE_LIMIT) {
      return new NextResponse("Payload too large", { status: 413 });
    }
  }

  // 2. Rate limiting on auth endpoints (10 req / minute per IP)
  if (AUTH_RATE_LIMITED.some((p) => pathname.startsWith(p))) {
    const ip = getIP(request);
    const allowed = checkRateLimit(`auth:${ip}`, 10, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute." },
        { status: 429 }
      );
    }
  }

  // 3. Protected page routes — redirect to login if not authenticated
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isProtected) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protected pages
    "/notes",
    "/notes/:path*",
    // Auth endpoints (rate limiting)
    "/api/auth/:path*",
    // All API POST/PATCH (body size check)
    "/api/:path*",
  ],
};
