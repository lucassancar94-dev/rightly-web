/**
 * Allgemeine Fachinformationen, die NICHT produktspezifisch sind.
 *
 * 1. NUTRIENT_CLAIMS: Auszug zugelassener gesundheitsbezogener Angaben nach
 *    VO (EG) 1924/2006 / VO (EU) 432/2012. Dürfen nur verwendet werden, wenn das
 *    Produkt den Nährstoff nachweislich in ausreichender Menge enthält
 *    (i. d. R. mind. 15 % des Referenzwerts pro Tagesdosis bzw. die genannte
 *    Mindestmenge). Vor produktiver Nutzung bitte mit der EU-Register-Datenbank
 *    abgleichen.
 *
 * 2. BOTANICAL_NOTES: Für Pflanzenstoffe (Ginkgo, Ginseng, Kurkuma, Sägepalme …)
 *    gibt es derzeit KEINE zugelassenen Health-Claims („on hold“). Daher nur
 *    vorsichtige, nicht-gesundheitsbezogene Formulierungen.
 *
 * 3. INTERACTION_NOTES: Allgemein dokumentierte Vorsichtshinweise je Wirkstoff.
 *    Sie ersetzen keine Fachinformation und keine ärztliche Beratung.
 */

export const NUTRIENT_CLAIMS: Record<string, string[]> = {
  "Vitamin A": [
    "trägt zur Erhaltung normaler Sehkraft bei",
    "trägt zu einer normalen Funktion des Immunsystems bei",
    "trägt zur Erhaltung normaler Haut bei",
  ],
  "Vitamin B2 (Riboflavin)": [
    "trägt zur Erhaltung normaler Sehkraft bei",
    "trägt zur Verringerung von Müdigkeit und Ermüdung bei",
  ],
  "Vitamin B6": [
    "trägt zur Verringerung von Müdigkeit und Ermüdung bei",
    "trägt zu einer normalen Funktion des Nervensystems bei",
    "trägt zu einer normalen Funktion des Immunsystems bei",
  ],
  "Vitamin B12": [
    "trägt zur Verringerung von Müdigkeit und Ermüdung bei",
    "trägt zu einer normalen Funktion des Nervensystems bei",
    "trägt zu einer normalen Funktion des Immunsystems bei",
  ],
  "Vitamin C": [
    "trägt zu einer normalen Funktion des Immunsystems bei",
    "trägt zur Verringerung von Müdigkeit und Ermüdung bei",
    "trägt zu einer normalen Kollagenbildung für eine normale Funktion der Knorpel, Knochen und Haut bei",
  ],
  "Vitamin D": [
    "trägt zu einer normalen Funktion des Immunsystems bei",
    "trägt zur Erhaltung normaler Knochen bei",
    "trägt zur Erhaltung einer normalen Muskelfunktion bei",
  ],
  "Vitamin E": ["trägt dazu bei, die Zellen vor oxidativem Stress zu schützen"],
  Magnesium: [
    "trägt zur Verringerung von Müdigkeit und Ermüdung bei",
    "trägt zu einer normalen Muskelfunktion bei",
    "trägt zu einer normalen Funktion des Nervensystems bei",
    "trägt zur Erhaltung normaler Knochen bei",
  ],
  Zink: [
    "trägt zur Erhaltung normaler Sehkraft bei",
    "trägt zu einer normalen Funktion des Immunsystems bei",
    "trägt zur Erhaltung normaler Haut bei",
    "trägt zur Erhaltung eines normalen Testosteronspiegels im Blut bei",
  ],
  Selen: [
    "trägt zu einer normalen Funktion des Immunsystems bei",
    "trägt zur Erhaltung normaler Haare und Nägel bei",
  ],
  Kupfer: ["trägt zu einer normalen Funktion des Immunsystems bei", "trägt zu einer normalen Pigmentierung der Haare und Haut bei"],
  "DHA (Omega-3)": [
    "trägt zur Erhaltung normaler Sehkraft bei (ab 250 mg DHA pro Tag)",
    "trägt zur Erhaltung einer normalen Gehirnfunktion bei (ab 250 mg DHA pro Tag)",
  ],
  "EPA und DHA (Omega-3)": ["tragen zu einer normalen Herzfunktion bei (ab 250 mg EPA + DHA pro Tag)"],
  "Vitamin B1 (Thiamin)": ["trägt zu einer normalen Herzfunktion bei"],
  Folat: ["trägt zur Verringerung von Müdigkeit und Ermüdung bei"],
};

export const BOTANICAL_NOTES = [
  "Für Pflanzenstoffe (z. B. Ginkgo, Ginseng, Kurkuma, Sägepalme, Kürbiskern, Cranberry, Lutein-haltige Pflanzenextrakte) gibt es in der EU aktuell keine zugelassenen gesundheitsbezogenen Angaben. Keine Wirkversprechen formulieren – nur über Tradition, Inhaltsstoffe und Herstellerangaben sprechen.",
  "Verboten sind Aussagen, die eine Krankheit verhüten, behandeln oder heilen sollen (z. B. „hilft gegen Makuladegeneration“, „heilt Arthrose“, „wirkt gegen Prostatavergrößerung“, „bei Potenzstörungen“).",
];

export const INTERACTION_NOTES: { substance: string; notes: string[] }[] = [
  {
    substance: "Ginkgo",
    notes: [
      "Kann in Kombination mit Blutverdünnern (z. B. Phenprocoumon/Marcumar, ASS, Clopidogrel, Rivaroxaban, Apixaban) das Blutungsrisiko erhöhen – nur nach ärztlicher Rücksprache.",
      "Vor geplanten Operationen Einnahme mit dem Arzt besprechen.",
    ],
  },
  {
    substance: "Omega-3-Fettsäuren",
    notes: [
      "In höheren Dosen (> 1 g/Tag EPA+DHA) ist bei gleichzeitiger Einnahme von Blutverdünnern ärztliche Rücksprache sinnvoll.",
      "EFSA/BfR: Bei hohen Dosen (> 1 g/Tag) Hinweis auf erhöhtes Risiko für Vorhofflimmern bei Vorerkrankten.",
    ],
  },
  {
    substance: "Kurkuma / Curcumin",
    notes: [
      "Kann die Wirkung von Blutverdünnern verstärken – Rücksprache mit dem Arzt.",
      "Nicht bei Gallenwegsverschluss/Gallensteinen ohne ärztliche Rücksprache.",
      "Das BfR hat Einzelfälle von Leberschäden im Zusammenhang mit Kurkuma-Präparaten beschrieben – bei Lebererkrankungen ärztliche Rücksprache.",
    ],
  },
  {
    substance: "Magnesium",
    notes: [
      "Zeitlichen Abstand (mind. 2–3 Stunden) zu bestimmten Antibiotika (Tetrazykline, Chinolone), Bisphosphonaten (Osteoporose) und L-Thyroxin (Schilddrüse) einhalten.",
      "Bei eingeschränkter Nierenfunktion nur nach ärztlicher Rücksprache.",
      "Höhere Dosen können zu weichem Stuhl führen.",
    ],
  },
  {
    substance: "Sibirischer Ginseng (Eleutherococcus)",
    notes: [
      "Bei Bluthochdruck, Diabetes-Medikamenten oder Herzmedikamenten (z. B. Digoxin) ärztliche Rücksprache empfohlen.",
      "Nicht in Schwangerschaft und Stillzeit ohne ärztliche Rücksprache.",
    ],
  },
  {
    substance: "Beta-Carotin (hochdosiert)",
    notes: [
      "Hochdosiertes Beta-Carotin wird für (Ex-)Raucher nicht empfohlen (erhöhtes Lungenkrebsrisiko in Studien). Bei Augenpräparaten nach Raucherstatus fragen.",
    ],
  },
  {
    substance: "Vitamin K",
    notes: ["Kann die Wirkung von Vitamin-K-Antagonisten (Phenprocoumon/Marcumar, Warfarin) abschwächen – nur nach ärztlicher Rücksprache."],
  },
  {
    substance: "Sägepalme / Kürbiskern / Prostata-Präparate",
    notes: [
      "Prostatabeschwerden sollten immer urologisch abgeklärt sein (u. a. PSA-Kontrolle).",
      "Sägepalme: Bei Einnahme von Blutverdünnern ärztliche Rücksprache.",
    ],
  },
  {
    substance: "Cranberry / Blasen-Präparate",
    notes: [
      "Blasenbeschwerden mit Fieber, Schmerzen oder Blut im Urin müssen ärztlich abgeklärt werden.",
      "Cranberry kann bei Warfarin/Marcumar die Blutgerinnung beeinflussen – Rücksprache mit dem Arzt.",
    ],
  },
];

/** Kompakte Textfassung für den System-Prompt */
export function knowledgeAsText() {
  const claims = Object.entries(NUTRIENT_CLAIMS)
    .map(([n, c]) => `- ${n}: ${c.join("; ")}`)
    .join("\n");
  const inter = INTERACTION_NOTES.map((i) => `- ${i.substance}: ${i.notes.join(" ")}`).join("\n");
  return `ZUGELASSENE NÄHRSTOFF-CLAIMS (nur nutzen, wenn das Produkt den Stoff laut Produktdaten nachweislich enthält):
${claims}

PFLANZENSTOFFE:
${BOTANICAL_NOTES.map((b) => `- ${b}`).join("\n")}

ALLGEMEINE WECHSELWIRKUNGS-HINWEISE JE WIRKSTOFF (keine Produktangabe!):
${inter}`;
}

const SUBSTANCE_KEYS: Record<string, RegExp> = {
  Ginkgo: /ginkgo/i,
  "Omega-3-Fettsäuren": /omega|epa|dha|fisch[öo]l|krill/i,
  "Kurkuma / Curcumin": /kurkuma|curcum/i,
  Magnesium: /magnesium/i,
  "Sibirischer Ginseng (Eleutherococcus)": /ginseng|eleuthero/i,
  "Beta-Carotin (hochdosiert)": /beta-?carotin/i,
  "Vitamin K": /vitamin\s*k\b|phyllochinon|menachinon/i,
  "Sägepalme / Kürbiskern / Prostata-Präparate": /s[äa]gepalm|k[üu]rbis|prosta/i,
  "Cranberry / Blasen-Präparate": /cranberr|preiselbeer|blase/i,
};

/** Allgemeine Wirkstoffhinweise, die zu Name/Inhaltsstoffen eines Produkts passen */
export function generalNotesFor(p: { name: string; ingredients: string[] }) {
  const hay = [p.name, ...p.ingredients].join(" ");
  return INTERACTION_NOTES.filter((n) => SUBSTANCE_KEYS[n.substance]?.test(hay));
}
