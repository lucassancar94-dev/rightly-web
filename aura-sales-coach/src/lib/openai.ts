import "server-only";
import OpenAI from "openai";

let client: OpenAI | null = null;

export function hasOpenAI() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function openai() {
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 45_000, maxRetries: 1 });
  return client;
}

export const MODEL = () => process.env.OPENAI_MODEL || "gpt-4o-mini";
