import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { barbers, invites, memberships, organizations } from "@/db/schema";
import { getUser } from "@/lib/auth/session";
import { createBarberProfile } from "@/lib/barbers";
import { SiteHeader } from "@/components/site-header";
import { ButtonLink, SubmitButton } from "@/components/ui";

export const metadata: Metadata = { title: "Convite" };

async function findInvite(token: string) {
  const [row] = await db
    .select({ invite: invites, org: organizations })
    .from(invites)
    .innerJoin(organizations, eq(organizations.id, invites.orgId))
    .where(and(eq(invites.token, token), isNull(invites.usedAt), gt(invites.expiresAt, new Date())))
    .limit(1);
  return row ?? null;
}

async function accept(fd: FormData) {
  "use server";
  const token = String(fd.get("token"));
  const user = await getUser();
  if (!user) redirect(`/entrar?next=/convite/${token}`);
  const found = await findInvite(token);
  if (!found) redirect(`/convite/${token}`);
  const { invite, org } = found;

  await db.transaction(async (tx) => {
    // marca o convite primeiro: dois aceites simultâneos não passam deste update
    const used = await tx
      .update(invites)
      .set({ usedAt: new Date(), usedBy: user.id })
      .where(and(eq(invites.id, invite.id), isNull(invites.usedAt)))
      .returning({ id: invites.id });
    if (!used.length) return;
    const [existing] = await tx
      .select()
      .from(memberships)
      .where(and(eq(memberships.orgId, org.id), eq(memberships.userId, user.id)));
    if (!existing) await tx.insert(memberships).values({ orgId: org.id, userId: user.id, role: "barber" });
    // já tinha perfil (ex.: dono aceitando o próprio link): mantém o atual
    const [profile] = await tx
      .select({ id: barbers.id })
      .from(barbers)
      .where(and(eq(barbers.orgId, org.id), eq(barbers.userId, user.id)));
    if (!profile) await createBarberProfile(tx, org.id, user);
  });
  redirect(`/painel/${org.slug}/perfil`);
}

export default async function InvitePage({ params }: PageProps<"/convite/[token]">) {
  const { token } = await params;
  const [found, user] = await Promise.all([findInvite(token), getUser()]);

  return (
    <>
      <SiteHeader next={`/convite/${token}`} />
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        {!found ? (
          <>
            <h1 className="font-display text-5xl">Convite inválido</h1>
            <p className="mt-3 text-ink-2">Esse link expirou ou já foi usado. Peça um novo ao dono da barbearia.</p>
            <ButtonLink href="/" variant="outline" className="mt-8">
              Voltar ao início
            </ButtonLink>
          </>
        ) : (
          <>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-2">Convite</p>
            <h1 className="mt-2 font-display text-5xl leading-[0.9]">Bem-vindo à {found.org.name}</h1>
            <p className="mt-4 text-ink-2">
              Aceite para ganhar seu perfil de barbeiro, sua agenda e o link para divulgar no Instagram.
            </p>
            {user ? (
              <form action={accept} className="mt-8">
                <input type="hidden" name="token" value={token} />
                <SubmitButton size="lg" pending="Entrando na equipe…">
                  Aceitar como {user.name.split(" ")[0]}
                </SubmitButton>
              </form>
            ) : (
              <div className="mt-8 flex flex-col items-center gap-3">
                <ButtonLink href={`/cadastro?next=/convite/${token}`} size="lg">
                  Criar conta e aceitar
                </ButtonLink>
                <Link href={`/entrar?next=/convite/${token}`} className="text-sm underline underline-offset-4">
                  Já tenho conta
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
