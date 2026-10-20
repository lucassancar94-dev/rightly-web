export type Complaint = { id: string; label: string; icon: string; hint: string };

export const COMPLAINTS: Complaint[] = [
  { id: "augen", label: "Augen / Makula", icon: "👁️", hint: "Sehkraft, Makula, trockene Augen" },
  { id: "gelenke", label: "Rücken / Gelenke", icon: "🦴", hint: "Rücken, Knie, Hüfte, Beweglichkeit" },
  { id: "muedigkeit", label: "Müdigkeit / Erschöpfung", icon: "🔋", hint: "Energie, Antrieb, Erschöpfung" },
  { id: "muskeln", label: "Muskeln / Krämpfe", icon: "💪", hint: "Wadenkrämpfe, Verspannungen" },
  { id: "gedaechtnis", label: "Gedächtnis / Konzentration", icon: "🧠", hint: "Vergesslichkeit, Konzentration" },
  { id: "prostata", label: "Prostata", icon: "♂️", hint: "Prostata, nächtliches Wasserlassen" },
  { id: "blase", label: "Blase / Harndrang", icon: "💧", hint: "Harndrang, Blasenschwäche" },
  { id: "immun", label: "Immunsystem", icon: "🛡️", hint: "Abwehrkräfte, häufig erkältet" },
  { id: "herbst", label: "Herbst / Winter", icon: "🍂", hint: "Erkältungszeit, wenig Sonne" },
  { id: "haut", label: "Haut / Juckreiz", icon: "✋", hint: "Trockene Haut, Juckreiz" },
  { id: "verdauung", label: "Verdauung", icon: "🌿", hint: "Darm, Blähungen, Verstopfung" },
  { id: "herz", label: "Herz / Kreislauf", icon: "❤️", hint: "Herz, Blutdruck, Kreislauf" },
  { id: "schlaf", label: "Schlaf", icon: "🌙", hint: "Einschlafen, Durchschlafen" },
  { id: "andere", label: "Andere Beschwerden", icon: "➕", hint: "Im Freitext beschreiben" },
];

export type Objection = { id: string; label: string };

export const OBJECTIONS: Objection[] = [
  { id: "genug-produkte", label: "Ich habe genug Produkte" },
  { id: "medikamente", label: "Ich nehme viele Medikamente" },
  { id: "zu-teuer", label: "Das ist zu teuer" },
  { id: "brauche-nicht", label: "Ich brauche das nicht" },
  { id: "keine-beschwerden", label: "Ich habe keine Beschwerden" },
  { id: "keine-zeit", label: "Ich habe wenig Zeit" },
  { id: "staendig-angerufen", label: "Ich werde ständig angerufen" },
  { id: "ueberlegen", label: "Ich muss erst überlegen" },
  { id: "arzt-fragen", label: "Ich muss meinen Arzt fragen" },
  { id: "nichts-bestellen", label: "Ich möchte nichts bestellen" },
];

export type QuickAction = { id: string; label: string; prompt?: string; local?: "focus" | "reset" };

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "mehr-argumente",
    label: "Weitere Argumente",
    prompt:
      "Gib mir 2–3 weitere seriöse, rechtlich zulässige Argumente für dieses Gespräch. Nur Aussagen, die durch die Produktdaten oder zugelassene Health-Claims gedeckt sind.",
  },
  {
    id: "kuerzer",
    label: "Kürzer formulieren",
    prompt: "Formuliere deine letzte Antwort deutlich kürzer – maximal 1–2 kurze Sätze für [SAGEN]. Andere Abschnitte nur, wenn wirklich nötig.",
  },
  {
    id: "einfacher",
    label: "Einfacher erklären",
    prompt:
      "Erkläre das noch einfacher, so dass es ein 85-jähriger Kunde am Telefon sofort versteht. Kurze Sätze, keine Fachwörter.",
  },
  {
    id: "produkt-finden",
    label: "Passendes Produkt finden",
    prompt:
      "Welches Produkt aus der Datenbank passt nach allen bisherigen Angaben am besten? Begründe kurz und nenne Ausschlussgründe. Wenn keines wirklich passt, sag das ehrlich.",
  },
  {
    id: "kunde-lehnt-ab",
    label: "Kunde lehnt ab",
    prompt:
      "Der Kunde lehnt ab. Prüfe, ob es eine klare, endgültige Ablehnung ist. Wenn ja: respektvoll und freundlich verabschieden, keinen Druck. Wenn es eher ein Zögern ist: eine einzige sanfte, respektvolle Nachfrage formulieren.",
  },
  {
    id: "preis",
    label: "Preisargument",
    prompt:
      "Gib mir ein ehrliches Preisargument (z. B. Preis pro Tag, nur wenn Preis und Packungsgröße in den Produktdaten stehen). Keine erfundenen Rabatte, keine künstliche Verknappung.",
  },
  {
    id: "abschluss",
    label: "Abschluss versuchen",
    prompt:
      "Der Kunde wirkt interessiert. Formuliere einen natürlichen, respektvollen Abschluss mit einer klaren, einfachen Frage. Keine Druckmittel. Weise darauf hin, was vor der Bestellung zu bestätigen ist (Produkt, Menge, Preis, Widerrufsrecht).",
  },
  { id: "neue-frage", label: "Neue Frage stellen", local: "focus" },
  { id: "neuer-kunde", label: "Neuer Kunde", local: "reset" },
];

export function complaintLabel(id: string) {
  return COMPLAINTS.find((c) => c.id === id)?.label ?? id;
}

export function objectionLabel(id: string | null) {
  if (!id) return null;
  return OBJECTIONS.find((o) => o.id === id)?.label ?? id;
}
