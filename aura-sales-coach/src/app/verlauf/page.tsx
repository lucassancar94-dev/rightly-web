"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConversation } from "@/components/ConversationProvider";
import { CoachAnswer } from "@/components/CoachAnswer";
import { IconTrash } from "@/components/Icons";
import type { Conversation, Outcome } from "@/lib/types";

const OUTCOMES: { id: Outcome; label: string; cls: string }[] = [
  { id: "offen", label: "Offen", cls: "bg-card2 text-zinc-300" },
  { id: "abschluss", label: "Abschluss", cls: "bg-accent text-black" },
  { id: "rueckruf", label: "Rückruf", cls: "bg-sky-500 text-black" },
  { id: "abgelehnt", label: "Abgelehnt", cls: "bg-danger text-white" },
];

function fmt(ts: number) {
  return new Date(ts).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function Item({ c, isActive }: { c: Conversation; isActive: boolean }) {
  const { resume, setOutcome, deleteConversation, products } = useConversation();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const turns = c.messages.filter((m) => m.role === "user").length;

  return (
    <div className="rounded-2xl bg-card ring-1 ring-line">
      <button className="w-full p-4 text-left" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <div className="flex items-center justify-between gap-2">
          <div className="truncate font-semibold">{c.title}</div>
          {isActive ? <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">Aktiv</span> : null}
        </div>
        <div className="mt-0.5 text-xs text-muted">
          {fmt(c.updatedAt)} · {turns} {turns === 1 ? "Frage" : "Fragen"} · {OUTCOMES.find((o) => o.id === c.outcome)?.label}
        </div>
      </button>
      {open ? (
        <div className="space-y-3 border-t border-line p-4">
          <div className="flex flex-wrap gap-2">
            {OUTCOMES.map((o) => (
              <button
                key={o.id}
                onClick={() => setOutcome(c.id, o.id)}
                className={`h-9 rounded-full px-3 text-sm font-medium ring-1 ring-line ${c.outcome === o.id ? o.cls : "bg-card2 text-zinc-400"}`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="max-h-[50vh] space-y-3 overflow-y-auto rounded-xl bg-black/40 p-3">
            {c.messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="ml-8 rounded-xl bg-accent/15 px-3 py-2 text-sm text-accent">
                  {m.display ?? m.content}
                </div>
              ) : (
                <CoachAnswer key={m.id} message={m} products={products} streaming={false} />
              ),
            )}
          </div>
          <div className="flex gap-2">
            {!isActive ? (
              <button
                onClick={() => {
                  resume(c.id);
                  router.push("/chat");
                }}
                className="h-11 flex-1 rounded-xl bg-accent font-semibold text-black active:scale-95"
              >
                Gespräch fortsetzen
              </button>
            ) : null}
            {!isActive ? (
              <button
                onClick={() => confirm("Dieses Gespräch endgültig löschen?") && deleteConversation(c.id)}
                className="grid h-11 w-11 place-items-center rounded-xl bg-card2 text-red-300 ring-1 ring-line"
                aria-label="Löschen"
              >
                <IconTrash className="h-5 w-5" />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function HistoryPage() {
  const { active, history, clearHistory, ready } = useConversation();
  if (!ready) return <div className="py-20 text-center text-muted">Lade …</div>;

  const stats = {
    total: history.length + (active.messages.length ? 1 : 0),
    won: [...history, active].filter((c) => c.outcome === "abschluss" && c.messages.length).length,
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gesprächsverlauf</h1>
        <p className="text-sm text-muted">
          {stats.total} Gespräche · {stats.won} Abschlüsse
        </p>
      </div>

      <div className="rounded-2xl bg-card2 p-3 text-xs leading-snug text-muted ring-1 ring-line">
        🔒 Verläufe werden nur auf diesem Gerät gespeichert und nach 30 Tagen automatisch gelöscht. Es werden keine Namen oder Kontaktdaten gespeichert.
      </div>

      {active.messages.length ? <Item c={active} isActive /> : null}
      {history.map((c) => (
        <Item key={c.id} c={c} isActive={false} />
      ))}
      {!history.length && !active.messages.length ? <p className="py-12 text-center text-muted">Noch keine Gespräche.</p> : null}

      {history.length ? (
        <button
          onClick={() => confirm("Alle gespeicherten Gespräche auf diesem Gerät löschen?") && clearHistory()}
          className="h-12 w-full rounded-2xl bg-card text-sm font-medium text-red-300 ring-1 ring-line"
        >
          Gesamten Verlauf löschen
        </button>
      ) : null}
    </div>
  );
}
