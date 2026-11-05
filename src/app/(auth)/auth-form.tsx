"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Field, FormMessage, Input, SubmitButton } from "@/components/ui";
import { signIn, signUp } from "./actions";

export function AuthForm({ mode, next }: { mode: "entrar" | "cadastro"; next?: string }) {
  const [state, action] = useActionState(mode === "entrar" ? signIn : signUp, undefined);
  const f = state?.fields ?? {};
  const qs = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      {mode === "cadastro" && (
        <Field label="Nome">
          <Input name="name" autoComplete="name" required defaultValue={f.name} />
        </Field>
      )}
      <Field label="E-mail">
        <Input name="email" type="email" autoComplete="email" required defaultValue={f.email} />
      </Field>
      {mode === "cadastro" && (
        <Field label="WhatsApp" hint="Opcional. O barbeiro vê para confirmar ou avisar atrasos.">
          <Input name="phone" type="tel" autoComplete="tel" placeholder="(11) 90000-0000" defaultValue={f.phone} />
        </Field>
      )}
      <Field label="Senha">
        <Input
          name="password"
          type="password"
          autoComplete={mode === "entrar" ? "current-password" : "new-password"}
          minLength={mode === "cadastro" ? 8 : undefined}
          required
        />
      </Field>
      <FormMessage state={state} />
      <SubmitButton className="w-full" size="lg" pending="Um instante…">
        {mode === "entrar" ? "Entrar" : "Criar conta"}
      </SubmitButton>
      <p className="text-center text-sm text-ink-2">
        {mode === "entrar" ? (
          <>
            Primeira vez?{" "}
            <Link href={`/cadastro${qs}`} className="font-semibold text-ink underline underline-offset-4">
              Crie sua conta
            </Link>
          </>
        ) : (
          <>
            Já tem conta?{" "}
            <Link href={`/entrar${qs}`} className="font-semibold text-ink underline underline-offset-4">
              Entrar
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
