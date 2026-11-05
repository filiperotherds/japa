import { requestTime } from "@/lib/clock";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { barbers, services } from "@/db/schema";
import { agendaRules, loadAgenda } from "@/lib/agenda";
import { bookableStarts } from "@/lib/slots";
import { getOrgBySlug } from "@/lib/tenant";
import { fmtDuration, fmtPrice, fmtTime, localDateISO, addDaysISO } from "@/lib/time";
import { Avatar } from "@/components/avatar";
import { ArrowIcon, InstagramIcon, PhoneIcon, PinIcon } from "@/components/icons";
import { SiteHeader } from "@/components/site-header";

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const org = await getOrgBySlug((await params).slug);
  return org ? { title: org.name, description: org.description ?? undefined } : {};
}

export default async function ShopPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const org = await getOrgBySlug(slug);
  if (!org) notFound();

  const [team, svcList] = await Promise.all([
    db
      .select()
      .from(barbers)
      .where(and(eq(barbers.orgId, org.id), eq(barbers.active, true)))
      .orderBy(asc(barbers.createdAt)),
    db
      .select()
      .from(services)
      .where(and(eq(services.orgId, org.id), eq(services.active, true)))
      .orderBy(asc(services.sort), asc(services.name)),
  ]);

  // próximo horário livre de cada barbeiro (serviço mais curto, 7 dias)
  const now = requestTime();
  const today = localDateISO(now, org.timezone);
  const rules = agendaRules(org, now);
  const shortest = Math.min(...svcList.map((s) => s.durationMin));
  const nextFree = await Promise.all(
    team.map(async (b) => {
      if (!svcList.length) return null;
      const days = await loadAgenda(org, b.id, today, 7);
      for (const d of days) {
        const first = bookableStarts(d, shortest, rules)[0];
        if (first) return { date: d.date, ms: first };
      }
      return null;
    }),
  );
  const dayLabel = (date: string) =>
    date === today ? "hoje" : date === addDaysISO(today, 1) ? "amanhã" : new Intl.DateTimeFormat("pt-BR", { weekday: "long", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));

  return (
    <>
      <SiteHeader next={`/${slug}`} />
      <main>
        <section className="border-b border-line">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr] md:py-16">
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-ink-2">Barbearia</p>
              <h1 className="font-display text-[clamp(52px,9vw,112px)] leading-[0.85]">{org.name}</h1>
              {org.description && <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">{org.description}</p>}
            </div>
            <ul className="space-y-3 self-end text-[15px]">
              {(org.address || org.city) && (
                <li className="flex gap-3">
                  <PinIcon className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>
                    {org.address}
                    {org.address && org.city && <br />}
                    <span className="text-ink-2">{org.city}</span>
                  </span>
                </li>
              )}
              {org.phone && (
                <li className="flex gap-3">
                  <PhoneIcon className="h-5 w-5 shrink-0" />
                  {org.phone}
                </li>
              )}
              {org.instagram && (
                <li className="flex gap-3">
                  <InstagramIcon className="h-5 w-5 shrink-0" />
                  <a href={`https://instagram.com/${org.instagram}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                    @{org.instagram}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-display text-5xl leading-none">Escolha seu barbeiro</h2>
            <p className="hidden text-sm text-ink-2 sm:block">Toque para ver o perfil e a agenda completa.</p>
          </div>
          {team.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line p-10 text-center text-ink-2">Nenhum barbeiro atendendo por aqui ainda.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((b, i) => (
                <li key={b.id}>
                  <Link
                    href={`/${slug}/${b.handle}`}
                    className="group flex h-full flex-col rounded-3xl border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-ink hover:shadow-[0_10px_30px_-15px_rgba(21,19,15,.4)]"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar name={b.displayName} src={b.avatarUrl} size={64} />
                      <div className="min-w-0">
                        <p className="truncate text-lg font-bold">{b.displayName}</p>
                        {b.instagram && <p className="truncate font-mono text-xs text-ink-2">@{b.instagram}</p>}
                      </div>
                    </div>
                    {b.specialties.length > 0 && (
                      <p className="mt-4 line-clamp-1 text-sm text-ink-2">{b.specialties.join(" · ")}</p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-5">
                      <span className="rounded-full bg-paper-2 px-3 py-1.5 font-mono text-xs">
                        {nextFree[i]
                          ? `Livre ${dayLabel(nextFree[i]!.date)} ${fmtTime(nextFree[i]!.ms, org.timezone)}`
                          : "Sem horários esta semana"}
                      </span>
                      <ArrowIcon className="h-5 w-5 transition group-hover:translate-x-1" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {svcList.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
            <h2 className="mb-6 font-display text-5xl leading-none">Serviços</h2>
            <ul className="divide-y divide-line border-y border-line">
              {svcList.map((s) => (
                <li key={s.id} className="flex items-baseline justify-between gap-6 py-4">
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    {s.description && <p className="text-sm text-ink-2">{s.description}</p>}
                  </div>
                  <p className="shrink-0 text-right font-mono text-sm">
                    <span className="text-ink-2">{fmtDuration(s.durationMin)}</span>
                    <span className="ml-4 font-semibold">{fmtPrice(s.priceCents)}</span>
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}
