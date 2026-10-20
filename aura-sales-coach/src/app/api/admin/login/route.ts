import { NextResponse } from "next/server";
import { ADMIN_COOKIE, cookieOptions, createToken, timingSafeEqual } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { isAdmin } from "@/lib/adminGuard";
import { storageMode } from "@/lib/products/repo";
import { hasOpenAI } from "@/lib/openai";

export async function GET() {
  return NextResponse.json({
    admin: await isAdmin(),
    configured: Boolean(process.env.ADMIN_PASSWORD),
    storage: storageMode(),
    ai: hasOpenAI(),
  });
}

export async function POST(req: Request) {
  if (!rateLimit(`admin-login:${clientIp(req)}`, 5)) {
    return NextResponse.json({ error: "Zu viele Versuche. Bitte eine Minute warten." }, { status: 429 });
  }
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return NextResponse.json({ error: "ADMIN_PASSWORD ist auf dem Server nicht gesetzt." }, { status: 503 });
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!password || !timingSafeEqual(password, expected)) {
    return NextResponse.json({ error: "Passwort ist nicht korrekt." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, await createToken("admin"), cookieOptions);
  return res;
}
