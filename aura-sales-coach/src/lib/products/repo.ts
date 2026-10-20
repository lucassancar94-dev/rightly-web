import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Product } from "../types";

/**
 * Produkt-Repository.
 * - Mit SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY → Supabase/PostgreSQL (Tabelle "products")
 * - Sonst → lokale Datei data/products.json (ideal für Entwicklung / Einzelplatz)
 */

const FILE = path.join(process.cwd(), "data", "products.json");

export type StorageMode = "supabase" | "file";

export function storageMode(): StorageMode {
  return process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY ? "supabase" : "file";
}

let client: SupabaseClient | null = null;
function sb() {
  if (!client) {
    client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });
  }
  return client;
}

type Row = {
  id: string;
  name: string;
  categories: string[];
  description: string;
  ingredients: string[];
  dosage: string;
  manufacturer_info: string;
  approved_claims: string[];
  typical_questions: { q: string; a: string }[];
  sales_arguments: string[];
  precautions: string[];
  interactions: string[];
  price: string;
  offers: string[];
  image_url: string | null;
  verified: boolean;
  unverified_notes: string;
  source: string;
  updated_at: string;
};

const toProduct = (r: Row): Product => ({
  id: r.id,
  name: r.name,
  categories: r.categories ?? [],
  description: r.description ?? "",
  ingredients: r.ingredients ?? [],
  dosage: r.dosage ?? "",
  manufacturerInfo: r.manufacturer_info ?? "",
  approvedClaims: r.approved_claims ?? [],
  typicalQuestions: r.typical_questions ?? [],
  salesArguments: r.sales_arguments ?? [],
  precautions: r.precautions ?? [],
  interactions: r.interactions ?? [],
  price: r.price ?? "",
  offers: r.offers ?? [],
  imageUrl: r.image_url ?? "",
  verified: Boolean(r.verified),
  unverifiedNotes: r.unverified_notes ?? "",
  source: r.source ?? "",
  updatedAt: r.updated_at,
});

const toRow = (p: Product): Row => ({
  id: p.id,
  name: p.name,
  categories: p.categories,
  description: p.description,
  ingredients: p.ingredients,
  dosage: p.dosage,
  manufacturer_info: p.manufacturerInfo,
  approved_claims: p.approvedClaims,
  typical_questions: p.typicalQuestions,
  sales_arguments: p.salesArguments,
  precautions: p.precautions,
  interactions: p.interactions,
  price: p.price,
  offers: p.offers,
  image_url: p.imageUrl || null,
  verified: p.verified,
  unverified_notes: p.unverifiedNotes,
  source: p.source,
  updated_at: p.updatedAt,
});

async function readFile(): Promise<Product[]> {
  const raw = await fs.readFile(FILE, "utf8");
  return JSON.parse(raw) as Product[];
}

async function writeFile(products: Product[]) {
  try {
    await fs.writeFile(FILE, JSON.stringify(products, null, 2) + "\n", "utf8");
  } catch {
    throw new Error(
      "Produktdatei ist schreibgeschützt (z. B. auf Vercel). Bitte Supabase konfigurieren (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).",
    );
  }
}

export async function listProducts(): Promise<Product[]> {
  if (storageMode() === "supabase") {
    const { data, error } = await sb().from("products").select("*").order("name");
    if (error) throw new Error(`Supabase: ${error.message}`);
    return (data as Row[]).map(toProduct);
  }
  const list = await readFile();
  return list.sort((a, b) => a.name.localeCompare(b.name, "de"));
}

export async function getProduct(id: string): Promise<Product | null> {
  if (storageMode() === "supabase") {
    const { data, error } = await sb().from("products").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(`Supabase: ${error.message}`);
    return data ? toProduct(data as Row) : null;
  }
  return (await readFile()).find((p) => p.id === id) ?? null;
}

export async function upsertProduct(p: Product): Promise<Product> {
  const product = { ...p, updatedAt: new Date().toISOString() };
  if (storageMode() === "supabase") {
    const { data, error } = await sb().from("products").upsert(toRow(product)).select().single();
    if (error) throw new Error(`Supabase: ${error.message}`);
    return toProduct(data as Row);
  }
  const list = await readFile();
  const idx = list.findIndex((x) => x.id === product.id);
  if (idx >= 0) list[idx] = product;
  else list.push(product);
  await writeFile(list);
  return product;
}

export async function deleteProduct(id: string): Promise<void> {
  if (storageMode() === "supabase") {
    const { error } = await sb().from("products").delete().eq("id", id);
    if (error) throw new Error(`Supabase: ${error.message}`);
    return;
  }
  const list = await readFile();
  await writeFile(list.filter((p) => p.id !== id));
}
