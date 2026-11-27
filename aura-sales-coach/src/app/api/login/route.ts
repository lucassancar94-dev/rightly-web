import { NextResponse } from "next/server";
import { APP_COOKIE, appUsers, cookieOptions, createToken, timingSafeEqual } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export async function GET() {
  return NextResponse.json({ accounts: appUsers().size > 0 });
}

export async function POST(req: Request) {
  if (!rateLimit(`login:${clientIp(req)}`, 10)) {
    return NextResponse.json({ error: "Zu viele Versuche. Bitte eine Minute warten." }, { status: 429 });
  }
  const { name, code } = (await req.json().catch(() => ({}))) as { name?: string; code?: string };
  const given = String(code ?? "").trim();
  const userCode = name ? appUsers().get(String(name).trim().toLowerCase()) : undefined;
  const shared = process.env.APP_ACCESS_CODE;
  const ok = Boolean(given) && ((userCode && timingSafeEqual(given, userCode)) || (shared && timingSafeEqual(given, shared)));
  if (!ok) {
    return NextResponse.json({ error: "Name oder Zugangscode ist nicht korrekt." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(APP_COOKIE, await createToken("app"), cookieOptions);
  return res;
}
