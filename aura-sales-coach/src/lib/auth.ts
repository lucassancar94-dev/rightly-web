/**
 * Minimaler, signierter Cookie-Login (Web Crypto → läuft in Edge-Middleware
 * und in Node-Route-Handlern).
 */
export const APP_COOKIE = "asc_app";
export const ADMIN_COOKIE = "asc_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 Stunden = eine Schicht

function secret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || process.env.APP_ACCESS_CODE || "dev-only-secret";
}

async function hmac(data: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createToken(scope: "app" | "admin") {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const payload = `${scope}.${exp}`;
  return `${payload}.${await hmac(payload)}`;
}

export async function verifyToken(token: string | undefined, scope: "app" | "admin") {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [s, exp, sig] = parts;
  if (s !== scope || Number(exp) < Date.now() / 1000) return false;
  const expected = await hmac(`${s}.${exp}`);
  return timingSafeEqual(sig, expected);
}

/** Konstante Laufzeit für String-Vergleich */
export function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};

export function appProtectionEnabled() {
  return Boolean(process.env.APP_ACCESS_CODE);
}
