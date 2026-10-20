// Überträgt data/products.json nach Supabase.
// Aufruf: SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… npm run seed:supabase
// (oder Werte in .env.local eintragen und: node --env-file=.env.local scripts/seed-supabase.mjs)
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY setzen.");
  process.exit(1);
}

const products = JSON.parse(readFileSync(new URL("../data/products.json", import.meta.url), "utf8"));
const rows = products.map((p) => ({
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
}));

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { error } = await sb.from("products").upsert(rows);
if (error) {
  console.error("Fehler:", error.message);
  process.exit(1);
}
console.log(`${rows.length} Produkte nach Supabase übertragen.`);
