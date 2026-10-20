"use client";

import { useCallback, useEffect, useState } from "react";
import { COMPLAINTS } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { VerifiedBadge } from "@/components/ProductCard";
import { useConversation } from "@/components/ConversationProvider";

type Status = { admin: boolean; configured: boolean; storage: "supabase" | "file"; ai: boolean };

type Draft = Omit<Product, "ingredients" | "approvedClaims" | "salesArguments" | "precautions" | "interactions" | "offers" | "typicalQuestions"> & {
  ingredients: string;
  approvedClaims: string;
  salesArguments: string;
  precautions: string;
  interactions: string;
  offers: string;
  typicalQuestions: string;
};

const emptyProduct = (): Product => ({
  id: "",
  name: "",
  categories: [],
  description: "",
  ingredients: [],
  dosage: "",
  manufacturerInfo: "",
  approvedClaims: [],
  typicalQuestions: [],
  salesArguments: [],
  precautions: [],
  interactions: [],
  price: "",
  offers: [],
  imageUrl: "",
  verified: false,
  unverifiedNotes: "",
  source: "",
  updatedAt: new Date().toISOString(),
});

const toDraft = (p: Product): Draft => ({
  ...p,
  ingredients: p.ingredients.join("\n"),
  approvedClaims: p.approvedClaims.join("\n"),
  salesArguments: p.salesArguments.join("\n"),
  precautions: p.precautions.join("\n"),
  interactions: p.interactions.join("\n"),
  offers: p.offers.join("\n"),
  typicalQuestions: p.typicalQuestions.map((x) => `${x.q} :: ${x.a}`).join("\n"),
});

const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

const fromDraft = (d: Draft) => ({
  ...d,
  ingredients: lines(d.ingredients),
  approvedClaims: lines(d.approvedClaims),
  salesArguments: lines(d.salesArguments),
  precautions: lines(d.precautions),
  interactions: lines(d.interactions),
  offers: lines(d.offers),
  typicalQuestions: lines(d.typicalQuestions).map((l) => {
    const [q, ...a] = l.split("::");
    return { q: q.trim(), a: a.join("::").trim() };
  }),
});

const input = "w-full rounded-xl bg-black px-3 py-2.5 text-[15px] text-white ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-accent";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[12px] font-semibold uppercase tracking-wide text-muted">
        {label} {hint ? <span className="font-normal normal-case text-zinc-500">– {hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

function Editor({ initial, onSaved, onCancel, status }: { initial: Product; onSaved: () => void; onCancel: () => void; status: Status }) {
  const [d, setD] = useState<Draft>(toDraft(initial));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<Draft>) => setD((x) => ({ ...x, ...patch }));
  const area = (key: keyof Draft, label: string, hint?: string, rows = 3) => (
    <Field label={label} hint={hint}>
      <textarea rows={rows} className={input} value={String(d[key] ?? "")} onChange={(e) => set({ [key]: e.target.value } as Partial<Draft>)} />
    </Field>
  );

  const save = async () => {
    setError(null);
    if (d.verified && !d.source.trim()) return setError("Für verifizierte Produkte bitte die Quelle (offizielle Herstellerunterlage) angeben.");
    setBusy(true);
    const res = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fromDraft(d)) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error || "Speichern fehlgeschlagen");
    onSaved();
  };

  return (
    <div className="space-y-4 rounded-2xl bg-card p-4 ring-1 ring-line">
      <h2 className="text-lg font-semibold">{initial.name ? `${initial.name} bearbeiten` : "Neues Produkt"}</h2>
      <Field label="Name">
        <input className={input} value={d.name} onChange={(e) => set({ name: e.target.value })} />
      </Field>
      <Field label="Kategorien">
        <div className="flex flex-wrap gap-1.5">
          {COMPLAINTS.map((c) => {
            const on = d.categories.includes(c.id);
            return (
              <button
                type="button"
                key={c.id}
                onClick={() => set({ categories: on ? d.categories.filter((x) => x !== c.id) : [...d.categories, c.id] })}
                className={`rounded-full px-3 py-1.5 text-xs ring-1 ${on ? "bg-accent text-black ring-accent" : "bg-black text-zinc-300 ring-line"}`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </Field>
      {area("description", "Originalbeschreibung", "laut Hersteller", 3)}
      {area("ingredients", "Inhaltsstoffe", "eine Zeile je Stoff inkl. Menge/Tagesdosis, z. B. „Magnesium 300 mg (80 % NRV)“", 5)}
      {area("dosage", "Einnahmeempfehlung", undefined, 2)}
      {area("manufacturerInfo", "Herstellerangaben", "Hersteller, PZN, Packungsgröße …", 2)}
      {area("approvedClaims", "Zulässige gesundheitsbezogene Aussagen", "eine je Zeile, nur EU-zugelassene Claims", 3)}
      {area("salesArguments", "Verkaufsargumente", "eine je Zeile", 3)}
      {area("typicalQuestions", "Typische Kundenfragen", "je Zeile: Frage :: Antwort", 3)}
      {area("precautions", "Vorsichtsmaßnahmen", "eine je Zeile", 3)}
      {area("interactions", "Wechselwirkungen", "nur zuverlässig dokumentierte", 3)}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Preis">
          <input className={input} value={d.price} onChange={(e) => set({ price: e.target.value })} placeholder="z. B. 29,90 € / 60 Kapseln" />
        </Field>
        <Field label="Bild-URL">
          <input className={input} value={d.imageUrl ?? ""} onChange={(e) => set({ imageUrl: e.target.value })} placeholder="https://…" />
        </Field>
      </div>
      {area("offers", "Verfügbare Angebote", "eine je Zeile – nur echte Angebote", 2)}
      {area("unverifiedNotes", "Unbestätigte Hinweise", "was noch geprüft werden muss", 2)}
      <Field label="Quelle">
        <input className={input} value={d.source} onChange={(e) => set({ source: e.target.value })} placeholder="z. B. Herstellerkatalog 2026, S. 14" />
      </Field>
      <label className="flex items-start gap-3 rounded-xl bg-black p-3 ring-1 ring-line">
        <input type="checkbox" className="mt-1 h-5 w-5 accent-green-500" checked={d.verified} onChange={(e) => set({ verified: e.target.checked })} />
        <span className="text-sm">
          <b>Verifiziert:</b> Alle Angaben wurden mit offiziellen Herstellerunterlagen abgeglichen. Erst dann nutzt die KI Inhaltsstoffe, Dosierung und Preis im Gespräch.
        </span>
      </label>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {status.storage === "file" ? <p className="text-xs text-muted">Speicherort: data/products.json (lokal). Für den Live-Betrieb Supabase verwenden.</p> : null}
      <div className="flex gap-2">
        <button onClick={save} disabled={busy || !d.name.trim()} className="h-12 flex-1 rounded-xl bg-accent font-semibold text-black disabled:opacity-50">
          {busy ? "Speichere …" : "Speichern"}
        </button>
        <button onClick={onCancel} className="h-12 rounded-xl bg-card2 px-5 ring-1 ring-line">
          Abbrechen
        </button>
      </div>
    </div>
  );
}

function CatalogImport({ status, onDraft }: { status: Status; onDraft: (p: Product) => void }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Product[]>([]);

  return (
    <details className="rounded-2xl bg-card p-4 ring-1 ring-line">
      <summary className="cursor-pointer font-semibold">📄 Katalog / Datenblatt importieren (KI)</summary>
      <div className="mt-3 space-y-3">
        <p className="text-sm text-muted">
          Text aus offiziellem Katalog, Etikett oder Produktdatenblatt einfügen (z. B. aus PDF kopieren). Die KI übernimmt nur, was im Text steht. Ergebnis wird als
          <b> unbestätigter Entwurf</b> zur Prüfung geöffnet.
        </p>
        {!status.ai ? <p className="text-sm text-warn">OPENAI_API_KEY fehlt – KI-Import nicht verfügbar. JSON-Import unten nutzen.</p> : null}
        <input className={input} value={source} onChange={(e) => setSource(e.target.value)} placeholder="Quelle, z. B. „Aura Natura Katalog Herbst 2026, S. 8“" />
        <textarea className={input} rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder="Katalogtext hier einfügen …" />
        <button
          disabled={busy || !status.ai || text.trim().length < 20}
          onClick={async () => {
            setBusy(true);
            setError(null);
            const res = await fetch("/api/admin/extract", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, source }) });
            const data = await res.json().catch(() => ({}));
            setBusy(false);
            if (!res.ok) return setError(data.error || "Fehler");
            setDrafts(data.drafts ?? []);
            if (!data.drafts?.length) setError("Keine Produkte im Text erkannt.");
          }}
          className="h-11 w-full rounded-xl bg-accent font-semibold text-black disabled:opacity-40"
        >
          {busy ? "Analysiere …" : "Produktdaten extrahieren"}
        </button>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        {drafts.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-2 rounded-xl bg-black p-3 ring-1 ring-line">
            <div className="min-w-0">
              <div className="truncate font-medium">{p.name}</div>
              <div className="text-xs text-muted">{p.ingredients.length} Inhaltsstoffe erkannt</div>
            </div>
            <button onClick={() => onDraft(p)} className="h-9 shrink-0 rounded-full bg-card2 px-4 text-sm ring-1 ring-line">
              Prüfen & speichern
            </button>
          </div>
        ))}
      </div>
    </details>
  );
}

function JsonImport({ onDone }: { onDone: () => void }) {
  const [text, setText] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <details className="rounded-2xl bg-card p-4 ring-1 ring-line">
      <summary className="cursor-pointer font-semibold">🧾 JSON-Import / Export</summary>
      <div className="mt-3 space-y-3">
        <input
          type="file"
          accept="application/json,.json"
          className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-card2 file:px-4 file:py-2 file:text-white"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) setText(await f.text());
          }}
        />
        <textarea className={input} rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder='[{"name":"…","ingredients":["…"]}]' />
        <div className="flex gap-2">
          <button
            disabled={!text.trim()}
            onClick={async () => {
              setMsg(null);
              let body: unknown;
              try {
                body = JSON.parse(text);
              } catch {
                return setMsg("Ungültiges JSON.");
              }
              const res = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
              const data = await res.json().catch(() => ({}));
              if (!res.ok) return setMsg(data.error || "Import fehlgeschlagen");
              setMsg(`${Array.isArray(data) ? data.length : 1} Produkt(e) importiert.`);
              setText("");
              onDone();
            }}
            className="h-11 flex-1 rounded-xl bg-accent font-semibold text-black disabled:opacity-40"
          >
            Importieren
          </button>
          <a href="/api/admin/products" download="aura-produkte.json" className="grid h-11 place-items-center rounded-xl bg-card2 px-4 text-sm ring-1 ring-line">
            Export
          </a>
        </div>
        {msg ? <p className="text-sm text-muted">{msg}</p> : null}
      </div>
    </details>
  );
}

export default function AdminPage() {
  const { reloadProducts } = useConversation();
  const [status, setStatus] = useState<Status | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const s: Status = await fetch("/api/admin/login", { cache: "no-store" }).then((r) => r.json());
    setStatus(s);
    if (s.admin) {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      if (res.ok) setProducts(await res.json());
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!status) return <div className="py-20 text-center text-muted">Lade …</div>;

  if (!status.configured) {
    return (
      <div className="space-y-3 rounded-2xl bg-card p-5 ring-1 ring-line">
        <h1 className="text-xl font-bold">Admin-Bereich</h1>
        <p className="text-sm text-muted">
          Bitte <code className="text-white">ADMIN_PASSWORD</code> in den Umgebungsvariablen des Servers setzen und neu starten.
        </p>
      </div>
    );
  }

  if (!status.admin) {
    return (
      <form
        className="mx-auto mt-10 max-w-sm space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) return setError(data.error);
          setPassword("");
          load();
        }}
      >
        <h1 className="text-2xl font-bold">Admin-Login</h1>
        <p className="text-sm text-muted">Produktpflege für Teamleitung und Backoffice.</p>
        <input type="password" className={`${input} h-12`} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin-Passwort" autoFocus />
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <button className="h-12 w-full rounded-xl bg-accent font-semibold text-black">Anmelden</button>
      </form>
    );
  }

  const afterSave = async () => {
    setEditing(null);
    await load();
    await reloadProducts();
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Produktpflege</h1>
          <p className="text-sm text-muted">
            Speicher: {status.storage === "supabase" ? "Supabase (PostgreSQL)" : "lokale Datei"} · KI: {status.ai ? "aktiv" : "Demo-Modus"}
          </p>
        </div>
        <button
          onClick={async () => {
            await fetch("/api/logout", { method: "POST" });
            location.href = "/";
          }}
          className="text-sm text-muted"
        >
          Abmelden
        </button>
      </div>

      {editing ? (
        <Editor initial={editing} status={status} onSaved={afterSave} onCancel={() => setEditing(null)} />
      ) : (
        <>
          <button onClick={() => setEditing(emptyProduct())} className="h-12 w-full rounded-2xl bg-accent font-semibold text-black">
            + Neues Produkt
          </button>
          <CatalogImport status={status} onDraft={setEditing} />
          <JsonImport onDone={afterSave} />
          <div className="space-y-2">
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-line">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{p.name}</span>
                    <VerifiedBadge verified={p.verified} />
                  </div>
                  <div className="text-xs text-muted">
                    {p.ingredients.length} Inhaltsstoffe · {p.price ? "Preis ✓" : "kein Preis"} · {p.dosage ? "Dosierung ✓" : "keine Dosierung"}
                  </div>
                </div>
                <button onClick={() => setEditing(p)} className="h-9 rounded-full bg-card2 px-4 text-sm ring-1 ring-line">
                  Bearbeiten
                </button>
                <button
                  onClick={async () => {
                    if (!confirm(`„${p.name}“ wirklich löschen?`)) return;
                    const res = await fetch(`/api/admin/products/${encodeURIComponent(p.id)}`, { method: "DELETE" });
                    if (!res.ok) alert((await res.json().catch(() => ({}))).error || "Löschen fehlgeschlagen");
                    afterSave();
                  }}
                  className="h-9 rounded-full px-2 text-sm text-red-300"
                  aria-label={`${p.name} löschen`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
