"use client";

import { useMemo, useState } from "react";
import { COMPLAINTS, OBJECTIONS, complaintLabel, objectionLabel } from "@/lib/catalog";
import { detectRisks } from "@/lib/safety";
import { useConversation } from "@/components/ConversationProvider";
import { Thread } from "@/components/Thread";
import { ChatInput } from "@/components/ChatInput";
import { MicButton } from "@/components/MicButton";
import { RiskBanner } from "@/components/RiskBanner";
import { IconChevron } from "@/components/Icons";

function Step({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-xs font-bold text-black">{n}</span>
        <h2 className="text-[17px] font-semibold">{title}</h2>
        {hint ? <span className="text-xs text-muted">{hint}</span> : null}
      </div>
      {children}
    </section>
  );
}

export default function LiveCoachPage() {
  const { active, setContext, analyze, streaming, ready } = useConversation();
  const { complaints, objection, notes } = active.context;
  const hasMessages = active.messages.length > 0;
  const [editing, setEditing] = useState(false);
  const showForm = !hasMessages || editing;
  const canAnalyze = complaints.length > 0 || Boolean(objection) || notes.trim().length > 0;

  const previewRisks = useMemo(() => (hasMessages ? [] : detectRisks([notes], active.context)), [notes, active.context, hasMessages]);

  const toggleComplaint = (id: string) =>
    setContext({ complaints: complaints.includes(id) ? complaints.filter((c) => c !== id) : [...complaints, id] });

  const run = async () => {
    setEditing(false);
    await analyze();
  };

  if (!ready) return <div className="py-20 text-center text-muted">Lade …</div>;

  return (
    <div className="space-y-6">
      {hasMessages ? (
        <button
          onClick={() => setEditing((e) => !e)}
          className="flex w-full items-center justify-between gap-3 rounded-2xl bg-card px-4 py-3 text-left ring-1 ring-line"
          aria-expanded={editing}
        >
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">Kundensituation</div>
            <div className="truncate text-[14px]">
              {[...complaints.map(complaintLabel), objection ? `„${objectionLabel(objection)}“` : null].filter(Boolean).join(" · ") || "Freitext-Angaben"}
            </div>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-accent">
            {editing ? "Schließen" : "Bearbeiten"}
            <IconChevron className={`h-4 w-4 transition-transform ${editing ? "rotate-180" : ""}`} />
          </span>
        </button>
      ) : (
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Live-Coach</h1>
          <p className="mt-1 text-sm text-muted">Antippen, was der Kunde sagt – der Coach liefert in Sekunden die passende Antwort.</p>
        </div>
      )}

      {showForm ? (
        <div className="space-y-7">
          <Step n={1} title="Beschwerden" hint="Mehrfachauswahl">
            <div className="grid grid-cols-2 gap-2">
              {COMPLAINTS.map((c) => {
                const on = complaints.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleComplaint(c.id)}
                    aria-pressed={on}
                    className={`flex min-h-[56px] items-center gap-2.5 rounded-2xl px-3 text-left text-[14px] font-medium leading-tight ring-1 transition active:scale-[0.97] ${
                      on ? "bg-accent-soft text-white ring-2 ring-accent" : "bg-card text-zinc-200 ring-line"
                    }`}
                  >
                    <span className="text-xl" aria-hidden>
                      {c.icon}
                    </span>
                    {c.label}
                  </button>
                );
              })}
            </div>
          </Step>

          <Step n={2} title="Kundeneinwand" hint="optional">
            <div className="flex flex-wrap gap-2">
              {OBJECTIONS.map((o) => {
                const on = objection === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => setContext({ objection: on ? null : o.id })}
                    aria-pressed={on}
                    className={`min-h-[44px] rounded-full px-4 text-[14px] font-medium ring-1 transition active:scale-95 ${
                      on ? "bg-accent text-black ring-accent" : "bg-card text-zinc-200 ring-line"
                    }`}
                  >
                    „{o.label}“
                  </button>
                );
              })}
            </div>
          </Step>

          <Step n={3} title="Weitere Angaben" hint="ohne Namen/Adresse">
            <div className="relative">
              <textarea
                value={notes}
                onChange={(e) => setContext({ notes: e.target.value })}
                rows={4}
                placeholder="z. B. „Kunde ist 75, hat feuchte Makula und nimmt Blutverdünner.“"
                className="w-full resize-none rounded-2xl bg-card p-4 pr-16 text-[16px] leading-snug text-white placeholder:text-muted ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <div className="absolute bottom-3 right-3">
                <MicButton onText={(t) => setContext({ notes: notes ? `${notes} ${t}` : t })} />
              </div>
            </div>
            <p className="text-xs text-muted">Bitte keine Namen, Telefonnummern oder Adressen eingeben. Erkannte Kennungen werden automatisch entfernt.</p>
          </Step>

          <RiskBanner risks={previewRisks} />

          <div className={hasMessages ? "" : "fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 bg-gradient-to-t from-black via-black/95 to-transparent px-4 pb-3 pt-6"}>
            <div className="mx-auto max-w-2xl">
              <button
                onClick={run}
                disabled={!canAnalyze || streaming}
                className="h-14 w-full rounded-2xl bg-accent text-[17px] font-bold text-black shadow-[0_8px_30px_rgba(34,197,94,0.25)] transition active:scale-[0.98] disabled:bg-card2 disabled:text-muted disabled:shadow-none"
              >
                {streaming ? "Coach analysiert …" : hasMessages ? "Angaben aktualisieren & neu analysieren" : "Coach fragen"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <Thread />

      {hasMessages ? <ChatInput /> : null}
    </div>
  );
}
