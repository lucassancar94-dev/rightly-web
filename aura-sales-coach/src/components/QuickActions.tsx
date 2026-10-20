"use client";

import { QUICK_ACTIONS } from "@/lib/catalog";
import { useConversation } from "./ConversationProvider";

export function QuickActions() {
  const { ask, streaming, focusInput, newCustomer } = useConversation();
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 no-scrollbar">
      <div className="flex w-max gap-2">
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.id}
            disabled={streaming && !a.local}
            onClick={() => {
              if (a.local === "focus") return focusInput();
              if (a.local === "reset") {
                if (confirm("Neuen Kunden starten? Das aktuelle Gespräch wird im Verlauf abgelegt.")) newCustomer();
                return;
              }
              ask(a.prompt!, { display: a.label, actionId: a.id, kind: "action" });
            }}
            className={`h-10 whitespace-nowrap rounded-full px-4 text-[14px] font-medium ring-1 active:scale-95 disabled:opacity-40 ${
              a.id === "abschluss"
                ? "bg-accent text-black ring-accent"
                : a.id === "kunde-lehnt-ab"
                  ? "bg-card2 text-red-200 ring-danger/40"
                  : "bg-card2 text-white ring-line"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
