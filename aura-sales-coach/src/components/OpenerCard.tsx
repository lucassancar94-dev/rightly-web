"use client";

import Link from "next/link";
import { useState } from "react";
import { buildOpener } from "@/lib/profile";
import { useConversation } from "./ConversationProvider";
import { CopyButton } from "./CopyButton";
import { IconChevron } from "./Icons";

/** Gesprächseinstieg im eigenen Stil – vor der ersten Analyse sichtbar */
export function OpenerCard() {
  const { profile } = useConversation();
  const [open, setOpen] = useState(false);
  const steps = buildOpener(profile);

  return (
    <section className="rounded-2xl bg-card ring-1 ring-line">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 p-4 text-left" aria-expanded={open}>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Gesprächseinstieg</div>
          <div className="text-[15px] font-medium">
            {profile.promotion ? "Mit aktueller Aktion" : "Begrüßung & Bedarf"} {profile.sellerName ? `· ${profile.sellerName}` : ""}
          </div>
        </div>
        <IconChevron className={`h-5 w-5 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div className="space-y-3 border-t border-line p-4">
          {steps.map((s) => (
            <p key={s.label} className="text-[16px] leading-relaxed">
              <span className="mr-2 text-xs font-semibold uppercase text-accent">{s.label}</span>
              {s.text}
            </p>
          ))}
          <div className="flex items-center justify-between">
            <Link href="/einstellungen" className="text-sm font-medium text-accent">
              Stil & Aktion anpassen →
            </Link>
            <CopyButton text={steps.map((s) => s.text).join("\n")} />
          </div>
        </div>
      ) : null}
    </section>
  );
}
