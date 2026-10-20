"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { COMPLAINTS } from "@/lib/catalog";
import { useConversation } from "@/components/ConversationProvider";
import { ProductCard } from "@/components/ProductCard";
import { IconRefresh, IconSearch, IconSettings } from "@/components/Icons";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export default function ProductsPage() {
  const { products, productsError, reloadProducts } = useConversation();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const nq = norm(q.trim());
    return products.filter((p) => {
      if (cat && !p.categories.includes(cat)) return false;
      if (!nq) return true;
      const hay = norm(
        [p.name, p.description, p.ingredients.join(" "), p.categories.map((c) => COMPLAINTS.find((x) => x.id === c)?.label ?? c).join(" "), p.unverifiedNotes].join(" "),
      );
      return nq.split(/\s+/).every((t) => hay.includes(t));
    });
  }, [products, q, cat]);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Produkte</h1>
          <p className="text-sm text-muted">
            {products.length} Produkte · {products.filter((p) => p.verified).length} verifiziert
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={reloadProducts} className="grid h-10 w-10 place-items-center rounded-full bg-card2 ring-1 ring-line" aria-label="Neu laden">
            <IconRefresh className="h-4 w-4" />
          </button>
          <Link href="/admin" className="grid h-10 w-10 place-items-center rounded-full bg-card2 ring-1 ring-line" aria-label="Admin-Bereich">
            <IconSettings className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="relative">
        <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Suche: Produkt, Inhaltsstoff, Beschwerde …"
          className="h-12 w-full rounded-2xl bg-card pl-12 pr-4 text-white placeholder:text-muted ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-accent"
          type="search"
        />
      </div>

      <div className="-mx-4 overflow-x-auto px-4 no-scrollbar">
        <div className="flex w-max gap-2">
          <button onClick={() => setCat(null)} className={`h-9 rounded-full px-4 text-sm ring-1 ${!cat ? "bg-accent text-black ring-accent" : "bg-card text-zinc-300 ring-line"}`}>
            Alle
          </button>
          {COMPLAINTS.filter((c) => products.some((p) => p.categories.includes(c.id))).map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(cat === c.id ? null : c.id)}
              className={`h-9 whitespace-nowrap rounded-full px-4 text-sm ring-1 ${cat === c.id ? "bg-accent text-black ring-accent" : "bg-card text-zinc-300 ring-line"}`}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </div>

      {productsError ? <div className="rounded-2xl bg-danger-soft p-4 text-sm text-red-100 ring-1 ring-danger/40">{productsError}</div> : null}

      <div className="space-y-2.5">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {!filtered.length && !productsError ? <p className="py-10 text-center text-muted">Keine Produkte gefunden.</p> : null}
      </div>
    </div>
  );
}
