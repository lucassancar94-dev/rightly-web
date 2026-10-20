import type { Product } from "../types";

const str = (v: unknown, max = 5000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const list = (v: unknown, max = 60) =>
  (Array.isArray(v) ? v : typeof v === "string" ? v.split("\n") : [])
    .map((x) => str(x, 1000))
    .filter(Boolean)
    .slice(0, max);

export function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/&/g, " ")
    .replace(/\+/g, " plus ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Normalisiert beliebige Eingaben (Admin-Formular, JSON-Import, KI-Extraktion) zu einem gültigen Produkt. */
export function normalizeProduct(input: Record<string, unknown>): Product {
  const name = str(input.name, 200);
  if (!name) throw new Error("Produktname fehlt.");
  const id = slugify(str(input.id, 120) || name);
  const tq = Array.isArray(input.typicalQuestions) ? input.typicalQuestions : [];
  return {
    id,
    name,
    categories: list(input.categories, 20).map((c) => c.toLowerCase()),
    description: str(input.description),
    ingredients: list(input.ingredients, 80),
    dosage: str(input.dosage, 2000),
    manufacturerInfo: str(input.manufacturerInfo, 2000),
    approvedClaims: list(input.approvedClaims),
    typicalQuestions: tq
      .map((x) => (x && typeof x === "object" ? { q: str((x as { q?: unknown }).q, 500), a: str((x as { a?: unknown }).a, 2000) } : null))
      .filter((x): x is { q: string; a: string } => Boolean(x && x.q)),
    salesArguments: list(input.salesArguments),
    precautions: list(input.precautions),
    interactions: list(input.interactions),
    price: str(input.price, 500),
    offers: list(input.offers, 20),
    imageUrl: str(input.imageUrl, 1000),
    verified: input.verified === true,
    unverifiedNotes: str(input.unverifiedNotes, 3000),
    source: str(input.source, 500),
    updatedAt: new Date().toISOString(),
  };
}
