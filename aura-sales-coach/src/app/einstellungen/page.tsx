"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useConversation } from "@/components/ConversationProvider";
import { DEFAULT_PROFILE, buildOpener, type SellerProfile } from "@/lib/profile";

const input = "w-full rounded-2xl bg-card p-4 text-[16px] leading-snug text-white placeholder:text-muted ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-accent";

export default function SettingsPage() {
  const { profile, setProfile, ready } = useConversation();
  const [draft, setDraft] = useState<SellerProfile>(profile);
  const [saved, setSaved] = useState(false);

  useEffect(() => setDraft(profile), [profile]);
  if (!ready) return <div className="py-20 text-center text-muted">Lade …</div>;

  const set = (patch: Partial<SellerProfile>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setSaved(false);
  };

  return (
    <div className="space-y-5">
      <Link href="/" className="text-sm text-accent">
        ← Live-Coach
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mein Stil & Aktion</h1>
        <p className="mt-1 text-sm text-muted">Der Coach formuliert alles so, wie du am Telefon sprichst. Wird nur auf diesem Gerät gespeichert.</p>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold">Dein Name am Telefon</span>
        <input className={`${input} h-12 py-0`} value={draft.sellerName} onChange={(e) => set({ sellerName: e.target.value })} placeholder="z. B. Sancar" />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold">So redest du</span>
        <span className="block text-xs text-muted">Schreib oder diktiere, wie du ein Gespräch typischerweise führst. Der Coach übernimmt Tonfall und Wortwahl.</span>
        <textarea rows={6} className={input} value={draft.style} onChange={(e) => set({ style: e.target.value })} />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold">Aktuelle Aktion</span>
        <span className="block text-xs text-muted">
          Nur echte, freigegebene Aktionen mit genauem Wortlaut und am besten mit Enddatum. Leer lassen = der Coach nennt keine Rabatte.
        </span>
        <textarea
          rows={3}
          className={input}
          value={draft.promotion}
          onChange={(e) => set({ promotion: e.target.value })}
          placeholder="z. B. Black Week: bis zu 40 % Rabatt auf ausgewählte Produkte, gültig bis 01.12."
        />
      </label>

      <div className="flex gap-2">
        <button
          onClick={() => {
            setProfile(draft);
            setSaved(true);
          }}
          className="h-14 flex-1 rounded-2xl bg-accent text-[17px] font-bold text-black active:scale-[0.98]"
        >
          {saved ? "Gespeichert ✓" : "Speichern"}
        </button>
        <button onClick={() => set({ style: DEFAULT_PROFILE.style })} className="h-14 rounded-2xl bg-card2 px-4 text-sm ring-1 ring-line">
          Stil zurücksetzen
        </button>
      </div>

      <section className="space-y-2 rounded-2xl bg-card p-4 ring-1 ring-line">
        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Vorschau Gesprächseinstieg</div>
        {buildOpener(draft).map((s) => (
          <p key={s.label} className="text-[15px] leading-relaxed">
            <span className="mr-2 text-xs font-semibold uppercase text-accent">{s.label}</span>
            {s.text}
          </p>
        ))}
      </section>
    </div>
  );
}
