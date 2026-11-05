import type { Metadata } from "next";
import { headers } from "next/headers";
import { requireUser } from "@/lib/auth/session";
import { SiteHeader } from "@/components/site-header";
import { CreateOrgForm } from "./create-form";

export const metadata: Metadata = { title: "Criar barbearia" };

export default async function NewOrgPage() {
  await requireUser("/nova-barbearia");
  const host = (await headers()).get("host") ?? "";
  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1fr_420px]">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-2">Passo 1 de 3</p>
          <h1 className="mt-2 font-display text-[clamp(56px,8vw,96px)] leading-[0.85]">
            Abra as portas
            <br />
            <span className="text-pole">da sua barbearia.</span>
          </h1>
          <ol className="mt-8 space-y-3 text-ink-2">
            <li>
              <strong className="text-ink">1. Crie a barbearia</strong> com nome e endereço da página.
            </li>
            <li>
              <strong className="text-ink">2. Convide os barbeiros</strong> por link. Cada um monta o próprio perfil e horários.
            </li>
            <li>
              <strong className="text-ink">3. Divulgue o link</strong> na bio do Instagram. Pronto.
            </li>
          </ol>
        </div>
        <CreateOrgForm host={host} />
      </main>
    </>
  );
}
