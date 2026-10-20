"use client";

import { useState } from "react";
import { IconCheck, IconCopy } from "./Icons";

export function CopyButton({ text, label = "Kopieren" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text.replace(/\*\*/g, ""));
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* Clipboard nicht verfügbar */
        }
      }}
      className="flex h-8 items-center gap-1 rounded-full px-2.5 text-xs text-muted ring-1 ring-line active:scale-95"
      aria-label={label}
    >
      {done ? <IconCheck className="h-3.5 w-3.5 text-accent" /> : <IconCopy className="h-3.5 w-3.5" />}
      {done ? "Kopiert" : label}
    </button>
  );
}
