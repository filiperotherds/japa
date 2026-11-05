import { requestTime } from "@/lib/clock";
import Link from "next/link";
import { and, asc, eq, gte, inArray, lt } from "drizzle-orm";
import { db } from "@/db";
import { appointments, barbers, users } from "@/db/schema";
import { requireMember } from "@/lib/tenant";
import { addDaysISO, fmtDateLong, fmtPrice, fmtTime, isISODate, localDateISO, zonedToMs } from "@/lib/time";
import { Avatar } from "@/components/avatar";
import { ButtonLink } from "@/components/ui";
import { buttonClass, cx } from "@/components/styles";
import { cancelAppointment } from "./actions";
import { BlockForm } from "./block-form";

export default async function AgendaPage({ params, searchParams }: PageProps<"/painel/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const { org, role, barber: me } = await requireMember(slug);
  const tz = org.timezone;
  const now = requestTime();
  const today = localDateISO(now, tz);
  const day = isISODate(sp.dia) ? sp.dia : today;

  const team =
    role === "owner"
      ? await db.select().from(barbers).where(and(eq(barbers.orgId, org.id), eq(barbers.active, true))).orderBy(asc(barbers.createdAt))
      : me
        ? [me]
        : [];

  const rows = team.length
    ? await db
        .select({
          id: appointments.id,
          barberId: appointments.barberId,
          kind: appointments.kind,
          status: appointments.status,
          startsAt: appointments.startsAt,
          endsAt: appointments.endsAt,
          serviceName: appointments.serviceName,
          priceCents: appointments.priceCents,
          note: appointments.note,
          clientName: users.name,
          clientPhone: users.phone,
        })
        .from(appointments)
        .leftJoin(users, eq(users.id, appointments.clientId))
        .where(
          and(
            eq(appointments.orgId, org.id),
            inArray(appointments.barberId, team.map((b) => b.id)),
            gte(appointments.startsAt, new Date(zonedToMs(day, 0, tz))),
            lt(appointments.startsAt, new Date(zonedToMs(addDaysISO(day, 1), 0, tz))),
          ),
        )
        .orderBy(asc(appointments.startsAt))
    : [];

  const confirmed = rows.filter((r) => r.kind === "booking" && r.status === "confirmed");
  const revenue = confirmed.reduce((a, r) => a + (r.priceCents ?? 0), 0);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-2">Agenda</p>
          <h1 className="font-display text-5xl leading-none first-letter:uppercase sm:text-6xl">
            {day === today ? "Hoje" : fmtDateLong(zonedToMs(day, 720, tz), tz)}
          </h1>
          {day === today && <p className="mt-1 text-ink-2 first-letter:uppercase">{fmtDateLong(now, tz)}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Link href={`?dia=${addDaysISO(day, -1)}`} className={cx(buttonClass({ variant: "outline", size: "sm" }), "w-10 px-0")} aria-label="Dia anterior">
            ←
          </Link>
          {day !== today && (
            <Link href="?" className={buttonClass({ variant: "outline", size: "sm" })}>
              Hoje
            </Link>
          )}
          <Link href={`?dia=${addDaysISO(day, 1)}`} className={cx(buttonClass({ variant: "outline", size: "sm" }), "w-10 px-0")} aria-label="Próximo dia">
            →
          </Link>
        </div>
      </header>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:max-w-md">
        <div className="rounded-2xl bg-white p-4">
          <dt className="text-xs text-ink-2">Reservas</dt>
          <dd className="font-display text-4xl leading-none">{confirmed.length}</dd>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <dt className="text-xs text-ink-2">Previsto</dt>
          <dd className="font-display text-4xl leading-none">{fmtPrice(revenue)}</dd>
        </div>
      </dl>

      {team.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-line p-8">
          <p className="font-semibold">Nenhum barbeiro ativo ainda.</p>
          <p className="mt-1 text-sm text-ink-2">Convide sua equipe ou crie seu próprio perfil de barbeiro em Equipe.</p>
          {role === "owner" && (
            <ButtonLink href={`/painel/${slug}/equipe`} className="mt-4" size="sm">
              Ir para Equipe
            </ButtonLink>
          )}
        </div>
      ) : (
        <div className={cx("mt-8 grid gap-6", team.length > 1 && "xl:grid-cols-2")}>
          {team.map((b) => {
            const list = rows.filter((r) => r.barberId === b.id);
            return (
              <section key={b.id} className="rounded-3xl border border-line bg-white">
                <header className="flex items-center gap-3 border-b border-line p-4">
                  <Avatar name={b.displayName} src={b.avatarUrl} size={36} />
                  <p className="font-bold">{b.displayName}</p>
                  <span className="ml-auto font-mono text-xs text-ink-2">
                    {list.filter((r) => r.kind === "booking" && r.status === "confirmed").length} reservas
                  </span>
                </header>
                {list.length === 0 ? (
                  <p className="p-6 text-center text-sm text-ink-2">Agenda livre neste dia.</p>
                ) : (
                  <ul className="divide-y divide-line">
                    {list.map((r) => {
                      const cancelled = r.status === "cancelled";
                      const past = r.endsAt.getTime() < now;
                      return (
                        <li key={r.id} className={cx("flex gap-4 p-4", (cancelled || past) && "opacity-55")}>
                          <div className="w-14 shrink-0 font-mono text-sm">
                            <p className="font-semibold">{fmtTime(r.startsAt.getTime(), tz)}</p>
                            <p className="text-ink-2">{fmtTime(r.endsAt.getTime(), tz)}</p>
                          </div>
                          <div className="min-w-0 flex-1">
                            {r.kind === "block" ? (
                              <p className="inline-flex items-center gap-2 font-semibold">
                                <span className="closed-hatch inline-block h-3 w-3 rounded-sm border border-line" />
                                {r.note ?? "Bloqueado"}
                              </p>
                            ) : (
                              <>
                                <p className={cx("font-semibold", cancelled && "line-through")}>{r.clientName ?? "Cliente removido"}</p>
                                <p className="text-sm text-ink-2">
                                  {r.serviceName}
                                  {r.priceCents != null && ` · ${fmtPrice(r.priceCents)}`}
                                </p>
                                {r.clientPhone && (
                                  <a
                                    className="text-sm text-moss underline underline-offset-4"
                                    href={`https://wa.me/55${r.clientPhone.replace(/\D/g, "").replace(/^55/, "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {r.clientPhone}
                                  </a>
                                )}
                                {r.note && <p className="mt-1 rounded-lg bg-paper px-2 py-1 text-sm">“{r.note}”</p>}
                              </>
                            )}
                            {cancelled && <p className="text-xs font-semibold text-pole">Cancelado</p>}
                          </div>
                          {!cancelled && !past && (
                            <form action={cancelAppointment}>
                              <input type="hidden" name="slug" value={slug} />
                              <input type="hidden" name="id" value={r.id} />
                              <button className={buttonClass({ variant: "danger", size: "sm" })}>
                                {r.kind === "block" ? "Liberar" : "Cancelar"}
                              </button>
                            </form>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      {team.length > 0 && (
        <section className="mt-10 max-w-2xl rounded-3xl border border-line bg-white p-5">
          <h2 className="font-display text-3xl">Bloquear horário</h2>
          <p className="mb-4 text-sm text-ink-2">Folga, almoço estendido, compromisso: o horário aparece como ocupado para os clientes.</p>
          <BlockForm slug={slug} day={day} barbers={team.map((b) => ({ id: b.id, name: b.displayName }))} />
        </section>
      )}
    </div>
  );
}
