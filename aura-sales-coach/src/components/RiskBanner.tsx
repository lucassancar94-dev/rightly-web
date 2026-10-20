"use client";

import type { RiskFlag } from "@/lib/types";
import { IconAlert } from "./Icons";

const STYLE = {
  danger: "bg-danger-soft ring-danger/40 text-red-100",
  warn: "bg-warn-soft ring-warn/40 text-amber-100",
  info: "bg-card2 ring-line text-zinc-200",
} as const;

export function RiskBanner({ risks }: { risks: RiskFlag[] }) {
  if (!risks.length) return null;
  return (
    <div className="space-y-2" role="alert">
      {risks.map((r) => (
        <div key={r.id} className={`flex gap-3 rounded-2xl p-3 ring-1 ${STYLE[r.level]}`}>
          <IconAlert className={`mt-0.5 h-5 w-5 shrink-0 ${r.level === "danger" ? "text-danger" : r.level === "warn" ? "text-warn" : "text-muted"}`} />
          <div>
            <div className="text-sm font-semibold">{r.title}</div>
            <div className="text-[13px] leading-snug opacity-90">{r.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
