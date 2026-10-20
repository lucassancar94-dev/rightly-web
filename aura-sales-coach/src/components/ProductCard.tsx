"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { complaintLabel } from "@/lib/catalog";
import { generalNotesFor } from "@/lib/knowledge";
import { IconChevron } from "./Icons";

export function VerifiedBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">Verifiziert</span>
  ) : (
    <span className="rounded-full bg-warn-soft px-2 py-0.5 text-[11px] font-semibold text-warn">Unbestätigt</span>
  );
}

function List({ title, items, tone = "default" }: { title: string; items: string[]; tone?: "default" | "warn" }) {
  if (!items.length) return null;
  return (
    <div>
      <div className={`mb-1 text-[11px] font-semibold uppercase tracking-wide ${tone === "warn" ? "text-warn" : "text-muted"}`}>{title}</div>
      <ul className="space-y-1 text-[14px] leading-snug text-zinc-200">
        {items.map((x, i) => (
          <li key={i} className="flex gap-2">
            <span className={tone === "warn" ? "text-warn" : "text-accent"}>•</span>
            <span>{x}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProductCard({ product, reason, defaultOpen = false }: { product: Product; reason?: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const general = generalNotesFor(product);
  const benefits = [...product.approvedClaims, ...product.salesArguments];
  const cautions = [...product.precautions, ...product.interactions];

  return (
    <div className="overflow-hidden rounded-2xl bg-card2 ring-1 ring-line">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-start gap-3 p-3.5 text-left" aria-expanded={open}>
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-xl bg-white object-contain" loading="lazy" />
        ) : (
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-accent-soft text-xl font-bold text-accent">{product.name.charAt(0)}</div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[16px] font-semibold">{product.name}</span>
            <VerifiedBadge verified={product.verified} />
          </div>
          {reason ? <div className="mt-1 text-[14px] leading-snug text-accent">{reason}</div> : null}
          <div className="mt-1 line-clamp-2 text-[13px] text-muted">
            {product.description || product.categories.map(complaintLabel).join(" · ")}
          </div>
        </div>
        <IconChevron className={`mt-1 h-5 w-5 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="space-y-3 border-t border-line px-3.5 pb-3.5 pt-3">
          {!product.verified && product.unverifiedNotes ? (
            <div className="rounded-xl bg-warn-soft p-2.5 text-[13px] leading-snug text-amber-100">
              <b>Unbestätigt:</b> {product.unverifiedNotes}
            </div>
          ) : null}
          <List title="Wichtige Inhaltsstoffe" items={product.ingredients.length ? product.ingredients : ["Noch nicht aus Herstellerunterlagen hinterlegt – bitte nicht nennen."]} />
          <List title="Nutzenargumente (zulässig)" items={benefits} />
          <List title="Gegenanzeigen & Wechselwirkungen" items={cautions} tone="warn" />
          {general.length ? (
            <List title="Allgemeine Wirkstoffhinweise (falls enthalten)" items={general.flatMap((g) => g.notes.map((n) => `${g.substance}: ${n}`))} tone="warn" />
          ) : null}
          <div className="grid grid-cols-2 gap-2 text-[13px]">
            <div className="rounded-xl bg-card p-2.5">
              <div className="text-[11px] font-semibold uppercase text-muted">Dosierung</div>
              <div className="mt-0.5">{product.dosage || "Nicht hinterlegt"}</div>
            </div>
            <div className="rounded-xl bg-card p-2.5">
              <div className="text-[11px] font-semibold uppercase text-muted">Preis</div>
              <div className="mt-0.5">{product.price || "Nicht hinterlegt"}</div>
            </div>
          </div>
          <Link href={`/produkte/${product.id}`} className="block text-center text-sm font-medium text-accent">
            Alle Produktdetails →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
