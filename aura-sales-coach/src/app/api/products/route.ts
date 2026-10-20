import { NextResponse } from "next/server";
import { listProducts } from "@/lib/products/repo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await listProducts(), { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 503 });
  }
}
