"use client";

import { useEffect, useRef, useState } from "react";
import { useConversation } from "./ConversationProvider";
import { MicButton } from "./MicButton";
import { IconSend, IconStop } from "./Icons";

export function ChatInput({ placeholder = "Frage an den Coach … z. B. „Er nimmt Blutverdünner“" }: { placeholder?: string }) {
  const { ask, streaming, stop, registerInput } = useConversation();
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    registerInput(ref.current);
    return () => registerInput(null);
  }, [registerInput]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [text]);

  const submit = () => {
    if (!text.trim() || streaming) return;
    ask(text);
    setText("");
  };

  return (
    <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-line/70 bg-black/90 backdrop-blur-xl">
      <form
        className="mx-auto flex max-w-2xl items-end gap-2 px-3 py-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <MicButton onText={(t) => setText((prev) => (prev ? `${prev} ${t}` : t))} />
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !("ontouchstart" in window)) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder={placeholder}
          className="max-h-36 min-h-[44px] flex-1 resize-none rounded-[22px] bg-card2 px-4 py-2.5 text-[16px] leading-snug text-white placeholder:text-muted ring-1 ring-line focus:outline-none focus:ring-accent"
          enterKeyHint="send"
        />
        {streaming ? (
          <button type="button" onClick={stop} className="grid h-11 w-11 place-items-center rounded-full bg-white text-black active:scale-95" aria-label="Antwort stoppen">
            <IconStop className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!text.trim()}
            className="grid h-11 w-11 place-items-center rounded-full bg-accent text-black active:scale-95 disabled:bg-card2 disabled:text-muted"
            aria-label="Senden"
          >
            <IconSend className="h-5 w-5" />
          </button>
        )}
      </form>
    </div>
  );
}
