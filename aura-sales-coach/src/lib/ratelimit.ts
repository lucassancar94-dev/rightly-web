import "server-only";

// Einfaches In-Memory-Rate-Limit pro IP (schützt das OpenAI-Budget vor Missbrauch).
// Für mehrere Server-Instanzen ggf. durch Redis/Upstash ersetzen.
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit = 40, windowMs = 60_000) {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) return false;
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) hits.clear();
  return true;
}

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
}
