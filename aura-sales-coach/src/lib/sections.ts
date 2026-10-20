export type SectionKey = "SAGEN" | "PRODUKTE" | "FRAGE" | "UEBERLEITUNG" | "HINWEISE";

export const SECTION_META: Record<SectionKey, { label: string; letter: string }> = {
  SAGEN: { label: "Das sagst du jetzt", letter: "A" },
  PRODUKTE: { label: "Passende Produkte", letter: "B" },
  FRAGE: { label: "Deine nächste Frage", letter: "C" },
  UEBERLEITUNG: { label: "Verkaufsüberleitung", letter: "D" },
  HINWEISE: { label: "Wichtige Hinweise", letter: "E" },
};

export type ProductPick = { id: string; reason: string };

export type ParsedAnswer = {
  intro: string;
  sections: Partial<Record<SectionKey, string>>;
  products: ProductPick[];
  order: SectionKey[];
};

const MARKER = /^\s*\[(SAGEN|PRODUKTE|FRAGE|UEBERLEITUNG|ÜBERLEITUNG|HINWEISE)\]\s*:?\s*(.*)$/i;

/** Robust gegen Streaming: unvollständige Abschnitte werden einfach mit angezeigt. */
export function parseAnswer(raw: string): ParsedAnswer {
  const result: ParsedAnswer = { intro: "", sections: {}, products: [], order: [] };
  let current: SectionKey | null = null;
  const buf: Record<string, string[]> = {};
  const intro: string[] = [];

  for (const line of raw.split("\n")) {
    const m = line.match(MARKER);
    if (m) {
      let key = m[1].toUpperCase();
      if (key === "ÜBERLEITUNG") key = "UEBERLEITUNG";
      current = key as SectionKey;
      if (!buf[current]) {
        buf[current] = [];
        result.order.push(current);
      }
      if (m[2]) buf[current].push(m[2]);
      continue;
    }
    if (current) buf[current].push(line);
    else intro.push(line);
  }

  result.intro = intro.join("\n").trim();
  for (const key of result.order) {
    result.sections[key] = (buf[key] ?? []).join("\n").trim();
  }

  if (result.sections.PRODUKTE) {
    for (const line of result.sections.PRODUKTE.split("\n")) {
      const clean = line.replace(/^[-*•\d.)\s]+/, "").trim();
      if (!clean || /^keine?\b/i.test(clean)) continue;
      const [id, ...rest] = clean.split("|");
      const pid = id.trim().toLowerCase();
      if (/^[a-z0-9-]+$/.test(pid)) result.products.push({ id: pid, reason: rest.join("|").trim() });
    }
  }
  return result;
}
