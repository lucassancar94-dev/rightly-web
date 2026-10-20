import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminGuard";
import { listProducts, upsertProduct } from "@/lib/products/repo";
import { normalizeProduct } from "@/lib/products/validate";

export const dynamic = "force-dynamic";

const deny = () => NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

export async function GET() {
  if (!(await isAdmin())) return deny();
  return NextResponse.json(await listProducts());
}

/** Speichert ein Produkt oder (bei Array) mehrere Produkte – z. B. JSON-Import */
export async function POST(req: Request) {
  if (!(await isAdmin())) return deny();
  try {
    const body = await req.json();
    const items = (Array.isArray(body) ? body : [body]).slice(0, 200);
    const saved = [];
    for (const item of items) saved.push(await upsertProduct(normalizeProduct(item)));
    return NextResponse.json(Array.isArray(body) ? saved : saved[0]);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
