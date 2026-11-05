import Link from "next/link";
import { headers } from "next/headers";
import { and, asc, desc, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { barbers, invites, users } from "@/db/schema";
import { requireMember } from "@/lib/tenant";
import { Avatar } from "@/components/avatar";
import { buttonClass, cx } from "@/components/styles";
import { becomeBarber, createInvite, revokeInvite, toggleBarber } from "./actions";
import { CopyButton } from "./copy-button";

export default async function TeamPage({ params }: PageProps<"/painel/[slug]/equipe">) {
  const { slug } = await params;
  const { org, barber: me } = await requireMember(slug, ["owner"]);
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;

  const [team, pending] = await Promise.all([
    db
      .select({ barber: barbers, email: users.email })
      .from(barbers)
      .innerJoin(users, eq(users.id, barbers.userId))
      .where(eq(barbers.orgId, org.id))
      .orderBy(asc(barbers.createdAt)),
    db
      .select()
      .from(invites)
      .where(and(eq(invites.orgId, org.id), isNull(invites.usedAt), gt(invites.expiresAt, new Date())))
      .orderBy(desc(invites.createdAt)),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-2">Equipe</p>
      <h1 className="font-display text-5xl leading-none sm:text-6xl">Barbeiros</h1>

      {!me && (
        <form action={becomeBarber} className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-cream p-5">
          <input type="hidden" name="slug" value={slug} />
          <p className="max-w-md">
            <strong>Você também corta?</strong> Crie seu perfil de barbeiro para ter agenda própria e receber reservas.
          </p>
          <button className={buttonClass({ size: "sm" })}>Eu também atendo</button>
        </form>
      )}

      <ul className="mt-6 divide-y divide-line rounded-3xl border border-line bg-white">
        {team.length === 0 && <li className="p-6 text-center text-sm text-ink-2">Nenhum barbeiro ainda.</li>}
        {team.map(({ barber: b, email }) => (
          <li key={b.id} className={cx("flex flex-wrap items-center gap-4 p-4", !b.active && "opacity-60")}>
            <Avatar name={b.displayName} src={b.avatarUrl} size={44} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {b.displayName} {b.id === me?.id && <span className="text-xs font-normal text-ink-2">(você)</span>}
              </p>
              <p className="truncate text-sm text-ink-2">
                <Link href={`/${slug}/${b.handle}`} className="underline underline-offset-4">
                  /{slug}/{b.handle}
                </Link>{" "}
                · {email}
              </p>
            </div>
            <form action={toggleBarber}>
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="id" value={b.id} />
              <input type="hidden" name="active" value={b.active ? "0" : "1"} />
              <button className={buttonClass({ variant: b.active ? "ghost" : "outline", size: "sm" })}>
                {b.active ? "Pausar" : "Reativar"}
              </button>
            </form>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-ink-2">Barbeiro pausado some da página pública e não recebe novas reservas. As reservas existentes continuam.</p>

      <section className="mt-10 rounded-3xl border border-line bg-white p-5 sm:p-6">
        <h2 className="font-display text-3xl">Convidar barbeiro</h2>
        <p className="mb-4 text-sm text-ink-2">
          Gere um link e mande no WhatsApp. O barbeiro cria a conta (ou entra) e já ganha perfil e agenda. Cada link vale para uma pessoa,
          por 7 dias.
        </p>
        <form action={createInvite}>
          <input type="hidden" name="slug" value={slug} />
          <button className={buttonClass({ variant: "accent" })}>Gerar link de convite</button>
        </form>
        {pending.length > 0 && (
          <ul className="mt-5 space-y-2">
            {pending.map((inv) => {
              const link = `${origin}/convite/${inv.token}`;
              return (
                <li key={inv.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-paper p-3">
                  <code className="min-w-0 flex-1 truncate font-mono text-xs">{link}</code>
                  <CopyButton text={link} />
                  <form action={revokeInvite}>
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="id" value={inv.id} />
                    <button className={buttonClass({ variant: "danger", size: "sm" })}>Revogar</button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
