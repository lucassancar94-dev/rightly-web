"use client";

import { useMemo } from "react";
import type { ChatMessage, Product } from "@/lib/types";
import { parseAnswer, SECTION_META, type SectionKey } from "@/lib/sections";
import { RichText } from "./RichText";
import { CopyButton } from "./CopyButton";
import { ProductCard } from "./ProductCard";
import { IconAlert, IconRefresh } from "./Icons";

function SectionTitle({ k }: { k: SectionKey }) {
  const meta = SECTION_META[k];
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="grid h-5 w-5 place-items-center rounded-md bg-accent/15 text-[11px] font-bold text-accent">{meta.letter}</span>
      <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">{meta.label}</span>
    </div>
  );
}

export function CoachAnswer({
  message,
  products,
  streaming,
  onRetry,
}: {
  message: ChatMessage;
  products: Product[];
  streaming: boolean;
  onRetry?: () => void;
}) {
  const parsed = useMemo(() => parseAnswer(message.content), [message.content]);

  if (message.error) {
    return (
      <div className="rounded-2xl bg-danger-soft p-4 ring-1 ring-danger/40">
        <div className="flex items-center gap-2 font-semibold text-red-100">
          <IconAlert className="h-5 w-5 text-danger" /> Antwort fehlgeschlagen
        </div>
        <p className="mt-1 text-sm text-red-100/90">{message.content}</p>
        {onRetry ? (
          <button onClick={onRetry} className="mt-3 flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black active:scale-95">
            <IconRefresh className="h-4 w-4" /> Erneut versuchen
          </button>
        ) : null}
      </div>
    );
  }

  if (!message.content) {
    return (
      <div className="rounded-2xl bg-card p-4 ring-1 ring-line">
        <div className="flex items-center gap-3 text-sm text-muted">
          <span className="flex gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-accent" />
          </span>
          Coach analysiert …
        </div>
      </div>
    );
  }

  const picks = parsed.products
    .map((p) => ({ ...p, product: products.find((x) => x.id === p.id) }))
    .filter((p): p is typeof p & { product: Product } => Boolean(p.product));

  return (
    <div className="space-y-3">
      {parsed.intro ? (
        <div className="rounded-2xl bg-card p-4 text-[15px] leading-relaxed ring-1 ring-line">
          <RichText text={parsed.intro} />
        </div>
      ) : null}

      {parsed.order.map((key) => {
        const body = parsed.sections[key] ?? "";
        if (key === "SAGEN") {
          return (
            <section key={key} className="rounded-2xl bg-card p-4 ring-2 ring-accent/60">
              <div className="flex items-start justify-between gap-2">
                <SectionTitle k={key} />
                {!streaming && body ? <CopyButton text={body} /> : null}
              </div>
              <RichText text={body} className="text-[18px] font-medium leading-relaxed text-white" />
            </section>
          );
        }
        if (key === "PRODUKTE") {
          if (!picks.length && streaming) return null;
          return (
            <section key={key} className="rounded-2xl bg-card p-4 ring-1 ring-line">
              <SectionTitle k={key} />
              {picks.length ? (
                <div className="space-y-2">
                  {picks.map((p) => (
                    <ProductCard key={p.id} product={p.product} reason={p.reason} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">Aktuell kein Produkt empfohlen – erst mehr über den Kunden erfahren.</p>
              )}
            </section>
          );
        }
        if (key === "HINWEISE") {
          if (/^-?\s*keine besonderen hinweise\.?$/i.test(body.trim())) return null;
          return (
            <section key={key} className="rounded-2xl bg-warn-soft p-4 ring-1 ring-warn/40">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-warn">
                <IconAlert className="h-4 w-4" /> {SECTION_META[key].letter} · {SECTION_META[key].label} – nicht vorlesen
              </div>
              <RichText text={body} className="text-[14px] leading-snug text-amber-50" />
            </section>
          );
        }
        return (
          <section key={key} className="rounded-2xl bg-card p-4 ring-1 ring-line">
            <div className="flex items-start justify-between gap-2">
              <SectionTitle k={key} />
              {!streaming && body ? <CopyButton text={body} /> : null}
            </div>
            <RichText text={body} className="text-[16px] leading-relaxed text-zinc-100" />
          </section>
        );
      })}
    </div>
  );
}
