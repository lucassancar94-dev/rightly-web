import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminGuard";
import { hasOpenAI, MODEL, openai } from "@/lib/openai";
import { normalizeProduct } from "@/lib/products/validate";
import { COMPLAINTS } from "@/lib/catalog";

export const runtime = "nodejs";

const SYSTEM = `Du extrahierst Produktdaten von Nahrungsergänzungsmitteln aus offiziellen Herstellerunterlagen (Katalogtext, Etikett, Produktdatenblatt).
Regeln:
- Übernimm NUR, was wörtlich oder eindeutig im Text steht. Nichts ergänzen, nichts schätzen, nichts aus Allgemeinwissen.
- Inhaltsstoffe mit Menge pro Tagesdosis und ggf. %NRV, eine Zeile je Stoff (Array).
- Fehlt eine Angabe: leerer String bzw. leeres Array.
- "approvedClaims": nur gesundheitsbezogene Aussagen, die im Text stehen.
- "categories": passende IDs aus dieser Liste: ${COMPLAINTS.map((c) => `${c.id} (${c.label})`).join(", ")}.
- "unverifiedNotes": alles, was unklar oder widersprüchlich ist.
- "verified" immer false (ein Mensch muss prüfen).
Antworte als JSON: {"products":[{ "name","categories","description","ingredients","dosage","manufacturerInfo","approvedClaims","typicalQuestions":[{"q","a"}],"salesArguments","precautions","interactions","price","offers","unverifiedNotes" }]}`;

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  if (!hasOpenAI()) return NextResponse.json({ error: "OPENAI_API_KEY fehlt – KI-Extraktion nicht verfügbar." }, { status: 503 });
  const { text, source } = (await req.json().catch(() => ({}))) as { text?: string; source?: string };
  if (!text || text.trim().length < 20) return NextResponse.json({ error: "Bitte Katalogtext einfügen." }, { status: 400 });

  try {
    const res = await openai().chat.completions.create({
      model: MODEL(),
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: text.slice(0, 40_000) },
      ],
    });
    const parsed = JSON.parse(res.choices[0]?.message?.content || "{}") as { products?: Record<string, unknown>[] };
    const drafts = (parsed.products ?? [])
      .map((p) => {
        try {
          return normalizeProduct({ ...p, verified: false, source: source || "KI-Extraktion aus eingefügtem Katalogtext – bitte prüfen" });
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    return NextResponse.json({ drafts });
  } catch (e) {
    return NextResponse.json({ error: `KI-Extraktion fehlgeschlagen: ${(e as Error).message}` }, { status: 502 });
  }
}
