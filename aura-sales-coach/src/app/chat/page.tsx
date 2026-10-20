"use client";

import { useConversation } from "@/components/ConversationProvider";
import { Thread } from "@/components/Thread";
import { ChatInput } from "@/components/ChatInput";

const EXAMPLES = [
  "Kunde hat feuchte Makula und bekommt Spritzen ins Auge.",
  "Kundin isst kein Fleisch und ist häufig müde.",
  "Kunde hat nachts Wadenkrämpfe und nimmt L-Thyroxin.",
  "Darf ich sagen, dass Ginkgo das Gedächtnis verbessert?",
  "Kunde sagt, er bekommt das günstiger in der Apotheke.",
];

export default function ChatPage() {
  const { active, ask, ready } = useConversation();
  if (!ready) return <div className="py-20 text-center text-muted">Lade …</div>;

  return (
    <div className="space-y-4">
      {!active.messages.length ? (
        <div className="space-y-5 pt-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">KI-Chat</h1>
            <p className="mt-1 text-sm text-muted">
              Schreib einfach, was der Kunde gesagt hat. Der Coach merkt sich alle Angaben bis du auf <b className="text-white">Neuer Kunde</b> tippst.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">Beispiele</div>
            {EXAMPLES.map((e) => (
              <button
                key={e}
                onClick={() => ask(e)}
                className="block w-full rounded-2xl bg-card px-4 py-3 text-left text-[15px] text-zinc-200 ring-1 ring-line active:scale-[0.98]"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <Thread />
      <ChatInput placeholder="Nächste Info oder Frage … z. B. „Was soll ich jetzt sagen?“" />
    </div>
  );
}
