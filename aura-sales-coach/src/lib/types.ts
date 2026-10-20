export type Product = {
  /** URL-sicherer Schlüssel, z. B. "sehkraft-forte" */
  id: string;
  name: string;
  /** IDs aus COMPLAINTS (lib/catalog.ts) */
  categories: string[];
  /** Originalbeschreibung laut Hersteller */
  description: string;
  /** Vollständige Inhaltsstoffe mit Menge pro Tagesdosis, eine Zeile je Stoff */
  ingredients: string[];
  /** Einnahmeempfehlung laut Hersteller */
  dosage: string;
  /** Herstellerangaben (Hersteller, Inverkehrbringer, PZN, Packungsgröße …) */
  manufacturerInfo: string;
  /** Zulässige gesundheitsbezogene Aussagen (EU-Health-Claims) für dieses Produkt */
  approvedClaims: string[];
  typicalQuestions: { q: string; a: string }[];
  salesArguments: string[];
  precautions: string[];
  /** Nur zuverlässig dokumentierte Wechselwirkungen */
  interactions: string[];
  price: string;
  offers: string[];
  imageUrl?: string;
  /** true = alle Angaben wurden aus offiziellen Herstellerunterlagen geprüft */
  verified: boolean;
  /** Vermutungen / Hinweise, die NICHT bestätigt sind (z. B. aus dem Produktnamen abgeleitet) */
  unverifiedNotes: string;
  /** Quelle der Daten (Katalog, Datum, Seite …) */
  source: string;
  updatedAt: string;
};

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  /** Vollständiger Inhalt, der an die KI geht bzw. von ihr kommt */
  content: string;
  /** Kurzform für die Anzeige (z. B. Text eines Schnellaktions-Buttons) */
  display?: string;
  kind?: "analysis" | "followup" | "action";
  error?: boolean;
  createdAt: number;
};

export type CoachContext = {
  complaints: string[];
  objection: string | null;
  notes: string;
};

export type Outcome = "offen" | "abschluss" | "abgelehnt" | "rueckruf";

export type Conversation = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  context: CoachContext;
  messages: ChatMessage[];
  outcome: Outcome;
};

export type RiskFlag = {
  id: string;
  level: "info" | "warn" | "danger";
  title: string;
  text: string;
};
