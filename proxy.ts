import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

// ─── Constants ────────────────────────────────────────────────────────────────

const PROTECTED_PATHS = ["/notes"];
const BODY_SIZE_LIMIT = 1 * 1024 * 1024; // 1 MB

// Session cookie name set by better-auth (default, no custom prefix configured)
const SESSION_COOKIE = "better-auth.session_token";

// Auth endpoints that should be rate-limited
const AUTH_RATE_LIMITED = [
  "/api/auth/sign-in",
  "/api/auth/sign-up",
];

// Notes mutation endpoints — rate-limited per IP
const NOTES_WRITE_PATHS = ["/api/notes"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ─── Proxy ────────────────────────────────────────────────────────────────────
//
// Runs in the Edge Runtime (V8 isolate) — NO Node.js / Bun native modules here.
// bun:sqlite lives in lib/auth.ts which is server-only; importing it here would
// crash the edge worker. Full session validation happens inside each page /
// API route (server components and route handlers run in the Node.js runtime).

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const httpMethod = request.method;

  // 1. Body size limit — reject oversized POST/PATCH payloads early.
  //    Missing Content-Length header bypasses this check; the per-field size
  //    limit in lib/validation.ts (MAX_CONTENT_JSON_BYTES) handles that case.
  if (["POST", "PATCH", "PUT"].includes(httpMethod)) {
    const contentLength = request.headers.get("content-length");
    if (contentLength !== null && parseInt(contentLength, 10) > BODY_SIZE_LIMIT) {
      return new NextResponse("Payload too large", { status: 413 });
    }
  }

  // 2. Rate limiting on auth endpoints (5 req / minute per IP)
  if (AUTH_RATE_LIMITED.some((p) => pathname.startsWith(p))) {
    const ip = getIP(request);
    const allowed = checkRateLimit(`auth:${ip}`, 5, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute." },
        { status: 429 }
      );
    }
  }

  // 3. Rate limiting on notes mutation endpoints (60 writes / minute per IP)
  if (
    ["POST", "PATCH", "PUT", "DELETE"].includes(httpMethod) &&
    NOTES_WRITE_PATHS.some((p) => pathname.startsWith(p))
  ) {
    const ip = getIP(request);
    const allowed = checkRateLimit(`notes:${ip}`, 60, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }
  }

  // 4. Protected page routes — redirect to /login if the session cookie is absent.
  //    Cookie presence is a lightweight proxy for "logged in"; an expired or
  //    invalid token will pass here but be caught by the server-component auth
  //    check inside the page (e.g. app/notes/page.tsx → redirect("/login")).
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isProtected && !request.cookies.get(SESSION_COOKIE)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
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
    // Notes API (body size + write rate limit)
    "/api/notes",
    "/api/notes/:path*",
  ],
};
