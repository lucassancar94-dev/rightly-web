import { NextResponse } from "next/server";
import { APP_COOKIE, cookieOptions, createToken, timingSafeEqual } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export async function POST(req: Request) {
  if (!rateLimit(`login:${clientIp(req)}`, 10)) {
    return NextResponse.json({ error: "Zu viele Versuche. Bitte eine Minute warten." }, { status: 429 });
  }
  const { code } = (await req.json().catch(() => ({}))) as { code?: string };
  const expected = process.env.APP_ACCESS_CODE;
  if (!expected || !code || !timingSafeEqual(String(code).trim(), expected)) {
    return NextResponse.json({ error: "Zugangscode ist nicht korrekt." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(APP_COOKIE, await createToken("app"), cookieOptions);
  return res;
}
