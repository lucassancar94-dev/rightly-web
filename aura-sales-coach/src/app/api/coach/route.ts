import { listProducts } from "@/lib/products/repo";
import { buildSystemPrompt } from "@/lib/prompt";
import { detectRisks } from "@/lib/safety";
import { fallbackAnswer } from "@/lib/fallback";
import { redact } from "@/lib/redact";
import { hasOpenAI, MODEL, openai } from "@/lib/openai";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import type { CoachContext } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  messages?: { role: string; content: string }[];
  context?: Partial<CoachContext>;
  actionId?: string;
};

const MAX_MESSAGES = 30;

function textStream(text: string, chunk = 24, delayMs = 12) {
  const enc = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for (let i = 0; i < text.length; i += chunk) {
        controller.enqueue(enc.encode(text.slice(i, i + chunk)));
        await new Promise((r) => setTimeout(r, delayMs));
      }
      controller.close();
    },
  });
}

const headers = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Accel-Buffering": "no",
};

export async function POST(req: Request) {
  if (!rateLimit(`coach:${clientIp(req)}`)) {
    return new Response("Zu viele Anfragen – bitte kurz warten.", { status: 429 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return new Response("Ungültige Anfrage.", { status: 400 });
  }

  const ctx: CoachContext = {
    complaints: Array.isArray(body.context?.complaints) ? body.context!.complaints.slice(0, 20).map(String) : [],
    objection: typeof body.context?.objection === "string" ? body.context.objection : null,
    notes: redact(String(body.context?.notes ?? "")).slice(0, 4000),
  };

  const all = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .map((m) => ({ role: m.role as "user" | "assistant", content: redact(m.content).slice(0, 6000) }));
  if (!all.length || all[all.length - 1].role !== "user") {
    return new Response("Keine Frage übermittelt.", { status: 400 });
  }
  // Kontext behalten: erste Nachricht (Analyse) + die letzten Nachrichten
  const messages = all.length > MAX_MESSAGES ? [all[0], ...all.slice(-(MAX_MESSAGES - 1))] : all;

  const risks = detectRisks([ctx.notes, ...all.filter((m) => m.role === "user").map((m) => m.content)], ctx);

  let products;
  try {
    products = await listProducts();
  } catch (e) {
    return new Response(`Produktdatenbank nicht erreichbar: ${(e as Error).message}`, { status: 503 });
  }

  if (!hasOpenAI()) {
    return new Response(textStream(fallbackAnswer({ products, ctx, risks, actionId: body.actionId })), { headers });
  }

  try {
    const completion = await openai().chat.completions.create({
      model: MODEL(),
      stream: true,
      temperature: 0.4,
      max_tokens: 900,
      messages: [{ role: "system", content: buildSystemPrompt(products, ctx, risks) }, ...messages],
    });

    const enc = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const part of completion) {
            const delta = part.choices[0]?.delta?.content;
            if (delta) controller.enqueue(enc.encode(delta));
          }
        } catch {
          controller.enqueue(enc.encode("\n\n[HINWEISE]\n- Verbindung zur KI unterbrochen. Bitte erneut versuchen."));
        } finally {
          controller.close();
        }
      },
      cancel() {
        completion.controller.abort();
      },
    });
    return new Response(stream, { headers });
  } catch (e) {
    // KI nicht erreichbar → regelbasierte Antwort, damit der Verkäufer nicht ohne Hilfe dasteht
    console.error("OpenAI-Fehler:", (e as Error).message);
    return new Response(textStream(fallbackAnswer({ products, ctx, risks, actionId: body.actionId }), 64, 0), {
      headers: { ...headers, "X-Coach-Fallback": "1" },
    });
  }
}
