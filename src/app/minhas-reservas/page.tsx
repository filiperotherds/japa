import { requestTime } from "@/lib/clock";
import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { appointments, barbers, organizations } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { fmtDateLong, fmtPrice, fmtTime } from "@/lib/time";
import { Avatar } from "@/components/avatar";
import { SiteHeader } from "@/components/site-header";
import { buttonClass, cx } from "@/components/styles";
import { cancelMyBooking } from "./actions";

export const metadata: Metadata = { title: "Minhas reservas" };

export default async function MyBookingsPage({ searchParams }: PageProps<"/minhas-reservas">) {
  const user = await requireUser("/minhas-reservas");
  const { nova } = await searchParams;
  const rows = await db
    .select({
      id: appointments.id,
      startsAt: appointments.startsAt,
      endsAt: appointments.endsAt,
      status: appointments.status,
      serviceName: appointments.serviceName,
      priceCents: appointments.priceCents,
      barberName: barbers.displayName,
      barberHandle: barbers.handle,
      barberAvatar: barbers.avatarUrl,
      orgName: organizations.name,
      orgSlug: organizations.slug,
      tz: organizations.timezone,
      cancelHours: organizations.cancelHours,
      address: organizations.address,
    })
    .from(appointments)
    .innerJoin(barbers, eq(barbers.id, appointments.barberId))
    .innerJoin(organizations, eq(organizations.id, appointments.orgId))
    .where(eq(appointments.clientId, user.id))
    .orderBy(desc(appointments.startsAt))
    .limit(100);

  const now = requestTime();
  const upcoming = rows.filter((r) => r.status === "confirmed" && r.endsAt.getTime() > now).reverse();
  const history = rows.filter((r) => !(r.status === "confirmed" && r.endsAt.getTime() > now));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-6xl leading-none">Minhas reservas</h1>

        {typeof nova === "string" && upcoming.some((r) => r.id === nova) && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-moss px-5 py-4 text-white">
            <span className="font-display text-3xl">✓</span>
            <p className="font-semibold">Reserva confirmada! Ela já aparece como ocupada na agenda do barbeiro.</p>
          </div>
        )}

        <section className="mt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-2">Próximas</h2>
          {upcoming.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line p-8 text-center text-ink-2">
              Nenhuma reserva marcada.
            </div>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((r) => {
                const canCancel = r.startsAt.getTime() - now > r.cancelHours * 3_600_000;
                return (
                  <li
                    key={r.id}
                    className={cx("rounded-3xl border bg-white p-5", r.id === nova ? "border-moss" : "border-line")}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <Avatar name={r.barberName} src={r.barberAvatar} size={52} />
                        <div>
                          <p className="font-display text-3xl leading-none first-letter:uppercase">
                            {fmtDateLong(r.startsAt.getTime(), r.tz)}
                          </p>
                          <p className="mt-1 font-mono text-sm">
                            {fmtTime(r.startsAt.getTime(), r.tz)}–{fmtTime(r.endsAt.getTime(), r.tz)}
                          </p>
                          <p className="mt-2 text-sm">
                            {r.serviceName} com{" "}
                            <Link href={`/${r.orgSlug}/${r.barberHandle}`} className="font-semibold underline underline-offset-4">
                              {r.barberName}
                            </Link>
                          </p>
                          <p className="text-sm text-ink-2">
                            {r.orgName}
                            {r.address && ` · ${r.address}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {r.priceCents != null && <span className="font-mono text-sm font-semibold">{fmtPrice(r.priceCents)}</span>}
                        {canCancel ? (
                          <form action={cancelMyBooking}>
                            <input type="hidden" name="id" value={r.id} />
                            <button className={buttonClass({ variant: "danger", size: "sm" })}>Cancelar</button>
                          </form>
                        ) : (
                          <span className="max-w-40 text-right text-xs text-ink-2">
                            Cancelamento só até {r.cancelHours}h antes. Fale com a barbearia.
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {history.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-2">Histórico</h2>
            <ul className="divide-y divide-line border-y border-line">
              {history.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span>
                    <span className="font-semibold">{r.serviceName}</span> com {r.barberName} ·{" "}
                    <span className="text-ink-2">{r.orgName}</span>
                  </span>
                  <span className="shrink-0 text-right font-mono text-xs text-ink-2">
                    {new Intl.DateTimeFormat("pt-BR", { timeZone: r.tz, dateStyle: "short" }).format(r.startsAt)}
                    {r.status === "cancelled" && <span className="ml-2 text-pole">cancelada</span>}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}
