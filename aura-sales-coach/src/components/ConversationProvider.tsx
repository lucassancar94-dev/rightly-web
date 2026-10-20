"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage, CoachContext, Conversation, Outcome, Product } from "@/lib/types";
import { analysisMessage } from "@/lib/prompt";
import { complaintLabel, objectionLabel } from "@/lib/catalog";
import { redact } from "@/lib/redact";

/**
 * Gesprächsgedächtnis.
 * Das aktive Gespräch und der Verlauf liegen NUR auf diesem Gerät (localStorage).
 * Serverseitig wird nichts gespeichert. Verlaufseinträge werden nach
 * HISTORY_DAYS automatisch gelöscht (Datenminimierung).
 */

const ACTIVE_KEY = "asc.active.v1";
const HISTORY_KEY = "asc.history.v1";
const HISTORY_DAYS = 30;
const HISTORY_MAX = 60;

const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

const emptyContext = (): CoachContext => ({ complaints: [], objection: null, notes: "" });

function newConversation(): Conversation {
  const now = Date.now();
  return { id: uid(), title: "Neues Gespräch", createdAt: now, updatedAt: now, context: emptyContext(), messages: [], outcome: "offen" };
}

function titleFor(ctx: CoachContext, fallback: string) {
  const parts = [...ctx.complaints.map(complaintLabel)];
  const obj = objectionLabel(ctx.objection);
  if (obj) parts.push(`„${obj}“`);
  return parts.length ? parts.join(" · ") : fallback;
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Speicher voll oder privat – App funktioniert trotzdem */
  }
}

type Ctx = {
  ready: boolean;
  active: Conversation;
  history: Conversation[];
  products: Product[];
  productsError: string | null;
  streaming: boolean;
  setContext: (patch: Partial<CoachContext>) => void;
  analyze: () => Promise<void>;
  ask: (text: string, opts?: { display?: string; actionId?: string; kind?: ChatMessage["kind"] }) => Promise<void>;
  retry: () => Promise<void>;
  stop: () => void;
  newCustomer: () => void;
  resume: (id: string) => void;
  setOutcome: (id: string, outcome: Outcome) => void;
  deleteConversation: (id: string) => void;
  clearHistory: () => void;
  reloadProducts: () => Promise<void>;
  focusInput: () => void;
  registerInput: (el: HTMLTextAreaElement | null) => void;
};

const ConversationCtx = createContext<Ctx | null>(null);

export function useConversation() {
  const c = useContext(ConversationCtx);
  if (!c) throw new Error("useConversation außerhalb des Providers");
  return c;
}

export function ConversationProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState<Conversation>(newConversation);
  const [history, setHistory] = useState<Conversation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const activeRef = useRef(active);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const lastAction = useRef<string | undefined>(undefined);

  // Laden + Aufräumen alter Verläufe
  useEffect(() => {
    const cutoff = Date.now() - HISTORY_DAYS * 86400_000;
    const h = load<Conversation[]>(HISTORY_KEY, []).filter((c) => c.updatedAt > cutoff);
    setHistory(h);
    const a = load<Conversation | null>(ACTIVE_KEY, null);
    if (a && a.updatedAt > cutoff) {
      activeRef.current = a;
      setActive(a);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !streaming) save(ACTIVE_KEY, active);
  }, [active, ready, streaming]);

  useEffect(() => {
    if (ready) save(HISTORY_KEY, history);
  }, [history, ready]);

  const reloadProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fehler beim Laden");
      setProducts(data);
      setProductsError(null);
    } catch (e) {
      setProductsError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    reloadProducts();
  }, [reloadProducts]);

  // Synchron über die Ref, damit direkt folgende Aufrufe (z. B. run nach ask) den neuesten Stand sehen
  const update = useCallback((fn: (c: Conversation) => Conversation) => {
    const next = fn(activeRef.current);
    activeRef.current = next;
    setActive(next);
  }, []);

  const setContext = useCallback(
    (patch: Partial<CoachContext>) => {
      update((c) => {
        const context = { ...c.context, ...patch };
        return { ...c, context, title: titleFor(context, c.title), updatedAt: Date.now() };
      });
    },
    [update],
  );

  const run = useCallback(
    async (actionId?: string) => {
      const conv = activeRef.current;
      const payload = {
        context: conv.context,
        actionId,
        messages: conv.messages.filter((m) => !m.error).map((m) => ({ role: m.role, content: m.content })),
      };
      const assistantId = uid();
      update((c) => ({
        ...c,
        messages: [...c.messages, { id: assistantId, role: "assistant", content: "", createdAt: Date.now() }],
      }));
      setStreaming(true);
      const controller = new AbortController();
      abortRef.current = controller;

      const patch = (fn: (m: ChatMessage) => ChatMessage) =>
        update((c) => ({ ...c, updatedAt: Date.now(), messages: c.messages.map((m) => (m.id === assistantId ? fn(m) : m)) }));

      try {
        const res = await fetch("/api/coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        if (!res.ok || !res.body) throw new Error((await res.text()) || `Fehler ${res.status}`);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let text = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
          const snapshot = text;
          patch((m) => ({ ...m, content: snapshot }));
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") {
          patch((m) => ({ ...m, content: m.content || "[HINWEISE]\n- Abgebrochen." }));
        } else {
          const offline = typeof navigator !== "undefined" && !navigator.onLine;
          patch((m) => ({
            ...m,
            error: true,
            content: offline ? "Keine Internetverbindung. Bitte Verbindung prüfen und erneut versuchen." : (e as Error).message,
          }));
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [update],
  );

  const ask = useCallback<Ctx["ask"]>(
    async (text, opts) => {
      const clean = redact(text.trim());
      if (!clean || streaming) return;
      lastAction.current = opts?.actionId;
      update((c) => ({
        ...c,
        updatedAt: Date.now(),
        title: c.messages.length || c.title !== "Neues Gespräch" ? c.title : clean.slice(0, 60),
        messages: [
          ...c.messages.filter((m) => !m.error),
          { id: uid(), role: "user", content: clean, display: opts?.display, kind: opts?.kind ?? "followup", createdAt: Date.now() },
        ],
      }));
      await run(opts?.actionId);
    },
    [run, streaming, update],
  );

  const analyze = useCallback(async () => {
    const c = activeRef.current;
    const ctx = { ...c.context, notes: redact(c.context.notes) };
    if (!ctx.complaints.length && !ctx.objection && !ctx.notes.trim()) return;
    const isUpdate = c.messages.some((m) => m.kind === "analysis");
    await ask(analysisMessage(ctx, isUpdate), { kind: "analysis" });
  }, [ask]);

  const retry = useCallback(async () => {
    if (streaming) return;
    update((c) => ({ ...c, messages: c.messages.filter((m) => !m.error) }));
    const msgs = activeRef.current.messages;
    if (msgs.length && msgs[msgs.length - 1].role === "user") await run(lastAction.current);
  }, [run, streaming, update]);

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const archive = useCallback((conv: Conversation) => {
    if (!conv.messages.length) return;
    setHistory((h) => [conv, ...h.filter((x) => x.id !== conv.id)].slice(0, HISTORY_MAX));
  }, []);

  const newCustomer = useCallback(() => {
    abortRef.current?.abort();
    archive(activeRef.current);
    const fresh = newConversation();
    activeRef.current = fresh;
    setActive(fresh);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [archive]);

  const resume = useCallback(
    (id: string) => {
      const conv = history.find((c) => c.id === id);
      if (!conv) return;
      archive(activeRef.current);
      setHistory((h) => h.filter((c) => c.id !== id));
      activeRef.current = conv;
      setActive(conv);
    },
    [archive, history],
  );

  const setOutcome = useCallback(
    (id: string, outcome: Outcome) => {
      if (activeRef.current.id === id) update((c) => ({ ...c, outcome }));
      setHistory((h) => h.map((c) => (c.id === id ? { ...c, outcome } : c)));
    },
    [update],
  );

  const deleteConversation = useCallback((id: string) => setHistory((h) => h.filter((c) => c.id !== id)), []);
  const clearHistory = useCallback(() => setHistory([]), []);

  const registerInput = useCallback((el: HTMLTextAreaElement | null) => {
    inputRef.current = el;
  }, []);
  const focusInput = useCallback(() => {
    const el = inputRef.current;
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ready,
      active,
      history,
      products,
      productsError,
      streaming,
      setContext,
      analyze,
      ask,
      retry,
      stop,
      newCustomer,
      resume,
      setOutcome,
      deleteConversation,
      clearHistory,
      reloadProducts,
      focusInput,
      registerInput,
    }),
    [ready, active, history, products, productsError, streaming, setContext, analyze, ask, retry, stop, newCustomer, resume, setOutcome, deleteConversation, clearHistory, reloadProducts, focusInput, registerInput],
  );

  return <ConversationCtx.Provider value={value}>{children}</ConversationCtx.Provider>;
}
