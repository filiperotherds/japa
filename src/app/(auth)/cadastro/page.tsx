import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/session";
import { safeNext } from "@/lib/forms";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Criar conta" };

export default async function SignUpPage({ searchParams }: PageProps<"/cadastro">) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" ? safeNext(next) : undefined;
  if (await getUser()) redirect(nextPath ?? "/inicio");
  return (
    <>
      <h1 className="font-display text-5xl">Criar conta</h1>
      <p className="mt-2 mb-8 text-ink-2">Uma conta serve para reservar em qualquer barbearia do Navalha.</p>
      <AuthForm mode="cadastro" next={nextPath} />
    </>
  );
}
