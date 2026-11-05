import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { memberships, organizations } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { SiteHeader } from "@/components/site-header";
import { ArrowIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui";

export const metadata: Metadata = { title: "Painel" };

export default async function PanelIndex() {
  const user = await requireUser("/painel");
  const orgs = await db
    .select({ slug: organizations.slug, name: organizations.name, role: memberships.role })
    .from(memberships)
    .innerJoin(organizations, eq(organizations.id, memberships.orgId))
    .where(eq(memberships.userId, user.id));
  if (orgs.length === 1) redirect(`/painel/${orgs[0].slug}`);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-6xl leading-none">Painel</h1>
        {orgs.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-night p-8 text-paper">
            <p className="font-display text-4xl leading-none">Você tem uma barbearia?</p>
            <p className="mt-3 max-w-md text-paper/70">
              Crie a página da sua barbearia, convide seus barbeiros e comece a receber reservas. Barbeiro convidado? Abra o
              link de convite que o dono te mandou.
            </p>
            <ButtonLink href="/nova-barbearia" variant="accent" className="mt-6">
              Criar minha barbearia
            </ButtonLink>
          </div>
        ) : (
          <>
            <ul className="mt-8 space-y-3">
              {orgs.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={`/painel/${o.slug}`}
                    className="flex items-center justify-between rounded-2xl border border-line bg-white p-5 hover:border-ink"
                  >
                    <span>
                      <span className="block text-lg font-bold">{o.name}</span>
                      <span className="text-sm text-ink-2">{o.role === "owner" ? "Dono" : "Barbeiro"}</span>
                    </span>
                    <ArrowIcon className="h-5 w-5" />
                  </Link>
                </li>
              ))}
            </ul>
            <ButtonLink href="/nova-barbearia" variant="outline" className="mt-6">
              Criar outra barbearia
            </ButtonLink>
          </>
        )}
      </main>
    </>
  );
}
