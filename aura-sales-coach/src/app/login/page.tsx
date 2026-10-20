"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const params = useSearchParams();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="mx-auto mt-16 max-w-sm space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        const res = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
        const data = await res.json().catch(() => ({}));
        setBusy(false);
        if (!res.ok) return setError(data.error || "Anmeldung fehlgeschlagen");
        const next = params.get("next");
        window.location.href = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
      }}
    >
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-accent text-3xl font-black text-black">A</div>
      <h1 className="text-center text-2xl font-bold">Aura Sales Coach</h1>
      <p className="text-center text-sm text-muted">Bitte den Zugangscode deines Teams eingeben.</p>
      <input
        type="password"
        inputMode="text"
        autoComplete="current-password"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Zugangscode"
        className="h-14 w-full rounded-2xl bg-card px-4 text-center text-lg tracking-widest ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-accent"
        autoFocus
      />
      {error ? <p className="text-center text-sm text-red-300">{error}</p> : null}
      <button disabled={busy || !code} className="h-14 w-full rounded-2xl bg-accent text-lg font-bold text-black disabled:opacity-50">
        {busy ? "Prüfe …" : "Anmelden"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
