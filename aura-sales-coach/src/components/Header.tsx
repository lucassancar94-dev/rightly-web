"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useConversation } from "./ConversationProvider";
import { IconPlus } from "./Icons";

export function Header() {
  const { newCustomer, active, streaming } = useConversation();
  const pathname = usePathname();
  const hasConversation = active.messages.length > 0 || active.context.complaints.length > 0 || Boolean(active.context.objection) || Boolean(active.context.notes);

  if (pathname.startsWith("/login")) return null;

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-black/85 backdrop-blur-xl pt-safe">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Aura Sales Coach – Startseite">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent text-sm font-black text-black">A</span>
          <span className="leading-tight">
            <span className="block whitespace-nowrap text-[15px] font-semibold">Aura Coach</span>
            <span className="block text-[11px] text-muted">{streaming ? "Coach denkt nach …" : hasConversation ? "Gespräch aktiv" : "Bereit"}</span>
          </span>
        </Link>
        <button
          onClick={() => {
            if (!hasConversation || confirm("Neuen Kunden starten? Das aktuelle Gespräch wird im Verlauf abgelegt.")) newCustomer();
          }}
          className="flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-card2 px-3.5 text-sm font-semibold text-white ring-1 ring-line active:scale-95"
        >
          <IconPlus className="h-4 w-4 text-accent" /> Neuer Kunde
        </button>
      </div>
    </header>
  );
}
