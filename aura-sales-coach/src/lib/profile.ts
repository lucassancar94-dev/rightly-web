/**
 * Persönliches Verkäuferprofil: So klingt der Coach wie der Verkäufer selbst.
 * Wird nur lokal auf dem Gerät gespeichert und mit jeder Anfrage mitgeschickt.
 */
export type SellerProfile = {
  /** Vorname/Nachname, mit dem sich der Verkäufer am Telefon meldet */
  sellerName: string;
  /** Beispieltext, wie der Verkäufer typischerweise spricht */
  style: string;
  /** Aktuell gültige, vom Unternehmen freigegebene Aktion (exakter Wortlaut) */
  promotion: string;
};

export const DEFAULT_PROFILE: SellerProfile = {
  sellerName: "",
  style:
    "Locker, herzlich, direkt. Kurze Sätze. Fragt zuerst nach dem Befinden, bevor es um Produkte geht. Beispiel: „Hallo, schönen guten Tag, mein Name ist … Spreche ich mit Herrn …? Super! An erster Stelle: Wie geht es Ihnen?“",
  promotion: "",
};

const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function sanitizeProfile(p: unknown): SellerProfile {
  const o = (p && typeof p === "object" ? p : {}) as Record<string, unknown>;
  return { sellerName: clip(o.sellerName, 60), style: clip(o.style, 1500), promotion: clip(o.promotion, 500) };
}

/** Gesprächseinstieg im Stil des Verkäufers – vorlesbar, rechtlich sauber */
export function buildOpener(p: SellerProfile) {
  const name = p.sellerName || "[Ihr Name]";
  const steps = [
    { label: "Begrüßung", text: `Hallo, schönen guten Tag, mein Name ist ${name} von Aura Natura. Spreche ich mit Herrn/Frau [Name]?` },
    { label: "Befinden", text: "Super! An erster Stelle: Wie geht es Ihnen denn?" },
    {
      label: "Anlass",
      text: "Ich wollte mich mal bei Ihnen melden und nachfragen, wie es Ihnen mit Ihren Produkten geht – nehmen Sie noch etwas von uns?",
    },
  ];
  if (p.promotion) {
    steps.push({
      label: "Aktion",
      text: `Ich rufe auch an, weil wir gerade eine Aktion haben: ${p.promotion} Gibt es denn etwas, wobei ich Sie unterstützen kann? Ich berate Sie gern.`,
    });
  } else {
    steps.push({ label: "Bedarf", text: "Gibt es denn gerade etwas, wobei ich Sie unterstützen kann? Ich berate Sie gern." });
  }
  return steps;
}

export function profileAsPrompt(p: SellerProfile) {
  const parts: string[] = [];
  if (p.sellerName) parts.push(`Der Verkäufer heißt ${p.sellerName} und meldet sich für Aura Natura.`);
  if (p.style) {
    parts.push(
      `So spricht der Verkäufer (übernimm Tonfall, Wortwahl und Satzlänge für alles, was er vorliest – aber korrigiere Grammatik und bleib rechtlich sauber):\n"""${p.style}"""`,
    );
  }
  return parts.join("\n") || "Kein persönliches Stilprofil hinterlegt – natürlicher, freundlicher Standardstil.";
}

export function promotionAsPrompt(p: SellerProfile) {
  return p.promotion
    ? `Vom Verkäufer als aktuell gültig angegeben: „${p.promotion}“
- Nur in genau diesem Umfang nennen. „Bis zu“ immer beibehalten (nie „40 % auf alles“).
- Keinen Rabatt für ein bestimmtes Produkt behaupten, wenn er dort nicht ausdrücklich gilt – sonst „Ich schaue gleich nach, was das für Ihr Produkt bedeutet.“
- Keine künstliche Verknappung („nur heute“, „letzte Chance“), außer das Enddatum steht oben ausdrücklich.
- Die Aktion ist ein Anlass, kein Druckmittel: zuerst Bedarf klären, dann Aktion.`
    : "Keine Aktion hinterlegt – keine Rabatte, Prozente oder Sonderpreise nennen.";
}
