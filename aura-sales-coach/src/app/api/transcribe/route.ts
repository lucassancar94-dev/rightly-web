import { NextResponse } from "next/server";
import { hasOpenAI, openai } from "@/lib/openai";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

/** Spracheingabe: Audio → Text. Audio wird nicht gespeichert. */
export async function POST(req: Request) {
  if (!hasOpenAI()) return NextResponse.json({ error: "Spracheingabe benötigt OPENAI_API_KEY. Tipp: Diktierfunktion der iPhone-Tastatur nutzen." }, { status: 503 });
  if (!rateLimit(`stt:${clientIp(req)}`, 20)) return NextResponse.json({ error: "Zu viele Anfragen." }, { status: 429 });
  const form = await req.formData().catch(() => null);
  const file = form?.get("audio");
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "Keine Aufnahme erhalten." }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Aufnahme zu lang." }, { status: 413 });
  try {
    const result = await openai().audio.transcriptions.create({
      file,
      model: process.env.OPENAI_TRANSCRIBE_MODEL || "whisper-1",
      language: "de",
    });
    return NextResponse.json({ text: result.text });
  } catch (e) {
    return NextResponse.json({ error: `Transkription fehlgeschlagen: ${(e as Error).message}` }, { status: 502 });
  }
}
