import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products/repo";
import { complaintLabel } from "@/lib/catalog";
import { generalNotesFor } from "@/lib/knowledge";
import { VerifiedBadge } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

function Block({ title, children, tone }: { title: string; children: React.ReactNode; tone?: "warn" }) {
  return (
    <section className={`rounded-2xl p-4 ring-1 ${tone === "warn" ? "bg-warn-soft ring-warn/40" : "bg-card ring-line"}`}>
      <h2 className={`mb-2 text-[11px] font-bold uppercase tracking-[0.08em] ${tone === "warn" ? "text-warn" : "text-muted"}`}>{title}</h2>
      <div className="text-[15px] leading-relaxed text-zinc-100">{children}</div>
    </section>
  );
}

function Items({ items, empty = "Nicht hinterlegt" }: { items: string[]; empty?: string }) {
  if (!items.length) return <p className="text-muted">{empty}</p>;
  return (
    <ul className="space-y-1">
      {items.map((x, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-accent">•</span>
          {x}
        </li>
      ))}
    </ul>
  );
}

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getProduct(id);
  if (!p) notFound();
  const general = generalNotesFor(p);

  return (
    <div className="space-y-3">
      <Link href="/produkte" className="text-sm text-accent">
        ← Alle Produkte
      </Link>
      <div className="flex items-start gap-4">
        {p.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.imageUrl} alt={p.name} className="h-24 w-24 rounded-2xl bg-white object-contain" />
        ) : null}
        <div>
          <h1 className="text-2xl font-bold">{p.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <VerifiedBadge verified={p.verified} />
            <span className="text-sm text-muted">{p.categories.map(complaintLabel).join(" · ")}</span>
          </div>
        </div>
      </div>

      {!p.verified ? (
        <Block title="Achtung – Daten nicht verifiziert" tone="warn">
          <p>{p.unverifiedNotes || "Die Angaben wurden noch nicht mit offiziellen Herstellerunterlagen abgeglichen."}</p>
        </Block>
      ) : null}

      <Block title="Beschreibung (Hersteller)">{p.description || <span className="text-muted">Nicht hinterlegt</span>}</Block>
      <Block title="Inhaltsstoffe (pro Tagesdosis)">
        <Items items={p.ingredients} />
      </Block>
      <Block title="Einnahmeempfehlung">{p.dosage || <span className="text-muted">Nicht hinterlegt</span>}</Block>
      <Block title="Zulässige gesundheitsbezogene Aussagen">
        <Items items={p.approvedClaims} empty="Keine hinterlegt – keine Wirkaussagen treffen." />
      </Block>
      <Block title="Verkaufsargumente">
        <Items items={p.salesArguments} />
      </Block>
      <Block title="Vorsichtsmaßnahmen & Wechselwirkungen" tone="warn">
        <Items items={[...p.precautions, ...p.interactions]} />
        {general.length ? (
          <div className="mt-3 border-t border-warn/30 pt-3 text-sm">
            <div className="mb-1 font-semibold">Allgemeine Wirkstoffhinweise (falls enthalten):</div>
            <Items items={general.flatMap((g) => g.notes.map((n) => `${g.substance}: ${n}`))} />
          </div>
        ) : null}
      </Block>
      <Block title="Typische Kundenfragen">
        {p.typicalQuestions.length ? (
          <div className="space-y-3">
            {p.typicalQuestions.map((x, i) => (
              <div key={i}>
                <div className="font-semibold">„{x.q}“</div>
                <div className="text-zinc-300">{x.a}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">Nicht hinterlegt</p>
        )}
      </Block>
      <Block title="Preis & Angebote">
        <p>{p.price || <span className="text-muted">Preis nicht hinterlegt</span>}</p>
        {p.offers.length ? <Items items={p.offers} /> : null}
      </Block>
      <Block title="Herstellerangaben & Quelle">
        <p>{p.manufacturerInfo || "–"}</p>
        <p className="mt-1 text-sm text-muted">Quelle: {p.source || "–"} · Stand: {new Date(p.updatedAt).toLocaleDateString("de-DE")}</p>
      </Block>
    </div>
  );
}
