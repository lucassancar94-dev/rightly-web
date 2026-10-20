"use client";

import { useEffect, useRef, useState } from "react";
import { IconMic, IconStop } from "./Icons";

type SR = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

/**
 * Spracheingabe:
 * 1. Web Speech API (Safari/Chrome) – sofort, ohne Server
 * 2. Fallback: Aufnahme → /api/transcribe (OpenAI Whisper)
 */
export function MicButton({ onText, className = "" }: { onText: (text: string) => void; className?: string }) {
  const [state, setState] = useState<"idle" | "listening" | "recording" | "transcribing">("idle");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SR | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  useEffect(() => () => {
    recRef.current?.stop();
    mediaRef.current?.stop();
  }, []);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(t);
  }, [error]);

  async function startRecorder() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setState("transcribing");
        try {
          const blob = new Blob(chunks.current, { type: mr.mimeType || "audio/mp4" });
          const ext = (mr.mimeType || "audio/mp4").includes("webm") ? "webm" : "m4a";
          const fd = new FormData();
          fd.append("audio", blob, `aufnahme.${ext}`);
          const res = await fetch("/api/transcribe", { method: "POST", body: fd });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          if (data.text) onText(data.text);
        } catch (e) {
          setError((e as Error).message || "Spracheingabe fehlgeschlagen");
        } finally {
          setState("idle");
        }
      };
      mr.start();
      mediaRef.current = mr;
      setState("recording");
    } catch {
      setError("Kein Mikrofonzugriff. Tipp: Diktiertaste der iPhone-Tastatur nutzen.");
      setState("idle");
    }
  }

  function start() {
    setError(null);
    const W = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!Ctor) return startRecorder();
    const rec = new Ctor();
    rec.lang = "de-DE";
    rec.interimResults = false;
    rec.continuous = true;
    let fellBack = false;
    rec.onresult = (e) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) text += e.results[i][0].transcript;
      if (text.trim()) onText(text.trim());
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        fellBack = true;
        startRecorder();
      } else if (e.error !== "no-speech" && e.error !== "aborted") setError("Spracherkennung nicht verfügbar.");
    };
    rec.onend = () => {
      if (!fellBack) setState("idle");
      recRef.current = null;
    };
    recRef.current = rec;
    try {
      rec.start();
      setState("listening");
    } catch {
      startRecorder();
    }
  }

  function stop() {
    if (recRef.current) recRef.current.stop();
    if (mediaRef.current && mediaRef.current.state !== "inactive") mediaRef.current.stop();
  }

  const active = state === "listening" || state === "recording";
  return (
    <div className="relative">
      <button
        type="button"
        onClick={active ? stop : start}
        disabled={state === "transcribing"}
        className={`grid h-11 w-11 place-items-center rounded-full ring-1 active:scale-95 ${
          active ? "animate-pulse bg-danger text-white ring-danger" : "bg-card2 text-white ring-line"
        } ${className}`}
        aria-label={active ? "Aufnahme beenden" : "Spracheingabe starten"}
      >
        {state === "transcribing" ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : active ? (
          <IconStop className="h-5 w-5" />
        ) : (
          <IconMic className="h-5 w-5" />
        )}
      </button>
      {error ? (
        <div className="absolute bottom-full right-0 z-50 mb-2 w-64 rounded-xl bg-card2 p-2.5 text-xs text-zinc-200 shadow-xl ring-1 ring-line">{error}</div>
      ) : null}
    </div>
  );
}
