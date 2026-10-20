"use client";

import { useEffect, useMemo, useRef } from "react";
import { useConversation } from "./ConversationProvider";
import { CoachAnswer } from "./CoachAnswer";
import { QuickActions } from "./QuickActions";
import { RiskBanner } from "./RiskBanner";
import { detectRisks } from "@/lib/safety";
import type { ChatMessage } from "@/lib/types";

function UserBubble({ m }: { m: ChatMessage }) {
  const text = m.display ?? m.content;
  return (
    <div className="flex justify-end">
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md px-4 py-2.5 text-[15px] leading-snug ${
          m.kind === "action" ? "bg-card2 text-accent ring-1 ring-accent/40" : "bg-accent text-black"
        }`}
      >
        {m.kind === "action" ? `⚡ ${text}` : text}
      </div>
    </div>
  );
}

export function Thread({ autoScroll = true }: { autoScroll?: boolean }) {
  const { active, products, streaming, retry } = useConversation();
  const endRef = useRef<HTMLDivElement>(null);
  const msgs = active.messages;
  const lastAssistant = [...msgs].reverse().find((m) => m.role === "assistant");
  const risks = useMemo(
    () => detectRisks([active.context.notes, ...msgs.filter((m) => m.role === "user").map((m) => m.content)], active.context),
    [active.context, msgs],
  );

  const lastUserId = [...msgs].reverse().find((m) => m.role === "user")?.id;
  useEffect(() => {
    if (autoScroll && lastUserId) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lastUserId, autoScroll]);

  if (!msgs.length) return null;

  return (
    <div className="space-y-4">
      <RiskBanner risks={risks} />
      {msgs.map((m) =>
        m.role === "user" ? (
          <UserBubble key={m.id} m={m} />
        ) : (
          <div key={m.id} className="space-y-3">
            <CoachAnswer message={m} products={products} streaming={streaming && m.id === lastAssistant?.id} onRetry={m.error ? retry : undefined} />
            {m.id === lastAssistant?.id && !streaming && !m.error ? <QuickActions /> : null}
          </div>
        ),
      )}
      <div ref={endRef} className="h-1" />
    </div>
  );
}
