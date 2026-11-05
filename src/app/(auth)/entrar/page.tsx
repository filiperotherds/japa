import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/session";
import { safeNext } from "@/lib/forms";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Entrar" };

export default async function SignInPage({ searchParams }: PageProps<"/entrar">) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" ? safeNext(next) : undefined;
  if (await getUser()) redirect(nextPath ?? "/inicio");
  return (
    <>
      <h1 className="font-display text-5xl">Entrar</h1>
      <p className="mt-2 mb-8 text-ink-2">Acesse para reservar ou gerenciar sua agenda.</p>
      <AuthForm mode="entrar" next={nextPath} />
    </>
  );
}
