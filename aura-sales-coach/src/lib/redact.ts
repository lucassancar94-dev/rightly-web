/**
 * Entfernt offensichtliche personenbezogene Kennungen, bevor Text die
 * Server-/KI-Schnittstelle erreicht (Datenminimierung, Art. 5 DSGVO).
 * Gesundheitsangaben werden nur für die laufende Beratung verarbeitet und
 * serverseitig nicht gespeichert.
 */
const RULES: [RegExp, string][] = [
  [/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[E-Mail]"],
  [/\bDE\d{2}[ ]?(?:\d{4}[ ]?){4}\d{2}\b/gi, "[IBAN]"],
  [/(?:\+49|0049|\b0)[\d\s/()-]{6,}\d/g, "[Telefon]"],
  [/\b\d{1,2}\.\d{1,2}\.(?:19|20)\d{2}\b/g, "[Datum]"],
  [/\b\d{5}\s+[A-ZÄÖÜ][a-zäöüß]+/g, "[PLZ Ort]"],
  [/\b[A-ZÄÖÜ][a-zäöüß]+(?:straße|strasse|str\.|weg|allee|platz|gasse|ring)\s*\d+\w?/g, "[Adresse]"],
  [/\b(?:Kundennr|Kunden-Nr|Kundennummer)\.?\s*:?\s*\w+/gi, "[Kundennummer]"],
];

export function redact(text: string): string {
  return RULES.reduce((t, [re, rep]) => t.replace(re, rep), text);
}
