import { NextResponse, type NextRequest } from "next/server";
import { APP_COOKIE, verifyToken } from "@/lib/auth";

/**
 * Zugangsschutz: Ist APP_ACCESS_CODE gesetzt, benötigen alle Seiten und APIs
 * einen gültigen Login-Cookie. Der Admin-Bereich hat zusätzlich ein eigenes Passwort.
 */
const PUBLIC = ["/login", "/api/login", "/manifest.webmanifest", "/sw.js", "/offline.html"];

export async function middleware(req: NextRequest) {
  if (!process.env.APP_ACCESS_CODE) return NextResponse.next();
  const { pathname } = req.nextUrl;
  if (PUBLIC.includes(pathname) || pathname.startsWith("/icons/") || pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }
  if (await verifyToken(req.cookies.get(APP_COOKIE)?.value, "app")) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Bitte anmelden." }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|apple-touch-icon.png).*)"],
};
