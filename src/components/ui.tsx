"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import type { ComponentProps, ReactNode } from "react";
import { buttonClass, cx, type BtnProps } from "./styles";

export { buttonClass, cx };

export function Button({ variant, size, className, ...p }: ComponentProps<"button"> & BtnProps) {
  return <button className={cx(buttonClass({ variant, size }), className)} {...p} />;
}

export function ButtonLink({ variant, size, className, ...p }: ComponentProps<typeof Link> & BtnProps) {
  return <Link className={cx(buttonClass({ variant, size }), className)} {...p} />;
}

export function SubmitButton({ children, pending, ...p }: ComponentProps<typeof Button> & { pending?: ReactNode }) {
  const status = useFormStatus();
  return (
    <Button type="submit" disabled={status.pending || p.disabled} {...p}>
      {status.pending ? (pending ?? "Salvando…") : children}
    </Button>
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={cx("block", className)}>
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-ink-2">{hint}</span>}
    </label>
  );
}

const inputBase =
  "w-full rounded-xl border border-line bg-white px-3.5 text-[15px] text-ink placeholder:text-ink-3 outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10";

export function Input({ className, ...p }: ComponentProps<"input">) {
  return <input className={cx(inputBase, "h-11", className)} {...p} />;
}

export function Textarea({ className, ...p }: ComponentProps<"textarea">) {
  return <textarea className={cx(inputBase, "min-h-24 py-2.5", className)} {...p} />;
}

export function Select({ className, ...p }: ComponentProps<"select">) {
  return <select className={cx(inputBase, "h-11 pr-8", className)} {...p} />;
}

export function FormMessage({ state }: { state?: { error?: string; ok?: string } }) {
  if (state?.error)
    return (
      <p role="alert" className="rounded-xl border border-pole/30 bg-pole/8 px-3.5 py-2.5 text-sm text-pole">
        {state.error}
      </p>
    );
  if (state?.ok)
    return <p className="rounded-xl border border-moss/30 bg-moss/10 px-3.5 py-2.5 text-sm text-moss">{state.ok}</p>;
  return null;
}
