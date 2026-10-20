"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBox, IconChat, IconCoach, IconHistory } from "./Icons";

const TABS = [
  { href: "/", label: "Live-Coach", Icon: IconCoach },
  { href: "/produkte", label: "Produkte", Icon: IconBox },
  { href: "/chat", label: "KI-Chat", Icon: IconChat },
  { href: "/verlauf", label: "Verlauf", Icon: IconHistory },
];

export function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/login")) return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-black/90 backdrop-blur-xl pb-safe" aria-label="Hauptnavigation">
      <div className="mx-auto grid max-w-2xl grid-cols-4">
        {TABS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium ${active ? "text-accent" : "text-muted"}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-6 w-6" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
