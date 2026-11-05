import type { z } from "zod";

export type FormState = {
  error?: string;
  fields?: Record<string, string>;
  ok?: string;
} | undefined;

export function formObject(fd: FormData) {
  const out: Record<string, string> = {};
  for (const [k, v] of fd.entries()) if (typeof v === "string") out[k] = v;
  return out;
}

export function firstError(err: z.ZodError) {
  return err.issues[0]?.message ?? "Dados inválidos.";
}

/** Redirect interno seguro: só caminhos relativos do próprio app. */
export function safeNext(next: string | null | undefined, fallback = "/") {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}

/** Normaliza @handle, URL do Instagram ou handle puro para só o handle. */
export function instagramHandle(input: string | undefined | null) {
  if (!input) return null;
  const h = input
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/[/?#].*$/, "");
  return /^[a-zA-Z0-9._]{1,30}$/.test(h) ? h.toLowerCase() : null;
}

export function pgErrorCode(e: unknown): string | undefined {
  const err = e as { code?: string; cause?: { code?: string } };
  return err?.code ?? err?.cause?.code;
}
