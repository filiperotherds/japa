import { requestTime } from "@/lib/clock";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, desc, eq, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { appointments, barberPhotos, barbers, services } from "@/db/schema";
import { getUser } from "@/lib/auth/session";
import { agendaRules, loadAgenda } from "@/lib/agenda";
import { getOrgBySlug } from "@/lib/tenant";
import { addDaysISO, diffDaysISO, isISODate, localDateISO } from "@/lib/time";
import { Avatar } from "@/components/avatar";
import { InstagramIcon } from "@/components/icons";
import { SiteHeader } from "@/components/site-header";
import { BookingAgenda } from "./booking-agenda";

async function getBarber(slug: string, handle: string) {
  const org = await getOrgBySlug(slug);
  if (!org) return null;
  const [barber] = await db
    .select()
    .from(barbers)
    .where(and(eq(barbers.orgId, org.id), eq(barbers.handle, handle), eq(barbers.active, true)))
    .limit(1);
  return barber ? { org, barber } : null;
}

export async function generateMetadata({ params }: PageProps<"/[slug]/[barber]">): Promise<Metadata> {
  const { slug, barber: handle } = await params;
  const found = await getBarber(slug, handle);
  if (!found) return {};
  return {
    title: `${found.barber.displayName} · ${found.org.name}`,
    description: found.barber.bio ?? `Agende com ${found.barber.displayName} na ${found.org.name}.`,
  };
}

export default async function BarberPage({ params, searchParams }: PageProps<"/[slug]/[barber]">) {
  const { slug, barber: handle } = await params;
  const sp = await searchParams;
  const found = await getBarber(slug, handle);
  if (!found) notFound();
  const { org, barber } = found;

  const now = requestTime();
  const today = localDateISO(now, org.timezone);
  const lastStart = addDaysISO(today, Math.max(org.bookingWindowDays - 6, 0));
  let from = isISODate(sp.de) ? sp.de : today;
  if (from < today) from = today;
  if (from > lastStart) from = lastStart;
  const offset = diffDaysISO(from, today);

  const [svcList, photos, [{ served }], days, user] = await Promise.all([
    db
      .select({ id: services.id, name: services.name, durationMin: services.durationMin, priceCents: services.priceCents })
      .from(services)
      .where(and(eq(services.orgId, org.id), eq(services.active, true)))
      .orderBy(asc(services.sort), asc(services.name)),
    db.select().from(barberPhotos).where(eq(barberPhotos.barberId, barber.id)).orderBy(desc(barberPhotos.createdAt)),
    db
      .select({ served: sql<number>`count(*)::int` })
      .from(appointments)
      .where(
        and(
          eq(appointments.barberId, barber.id),
          eq(appointments.kind, "booking"),
          eq(appointments.status, "confirmed"),
          lt(appointments.endsAt, new Date(now)),
        ),
      ),
    loadAgenda(org, barber.id, from, 7),
    getUser(),
  ]);

  const path = `/${slug}/${handle}`;
  const years = barber.since ? new Date().getFullYear() - barber.since : null;

  return (
    <>
      <SiteHeader next={path} />
      <main className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <nav className="pt-6 text-sm text-ink-2">
          <Link href={`/${slug}`} className="hover:text-ink">
            ← {org.name}
          </Link>
        </nav>

        {/* cabeçalho estilo perfil social */}
        <section className="grid gap-6 pt-6 pb-8 sm:grid-cols-[auto_1fr] sm:gap-10">
          <div className="pole-ring h-fit w-fit rounded-full p-[3px]">
            <div className="rounded-full bg-paper p-[3px]">
              <Avatar name={barber.displayName} src={barber.avatarUrl} size={136} />
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-5xl leading-none sm:text-6xl">{barber.displayName}</h1>
            </div>
            {barber.instagram && (
              <a
                href={`https://instagram.com/${barber.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 font-mono text-sm text-ink-2 hover:text-ink"
              >
                <InstagramIcon className="h-4 w-4" />@{barber.instagram}
              </a>
            )}
            <dl className="mt-5 flex gap-8">
              <Stat value={served} label="atendimentos" />
              {years !== null && <Stat value={years} label={years === 1 ? "ano de cadeira" : "anos de cadeira"} />}
              <Stat value={photos.length} label="fotos" />
            </dl>
            {barber.bio && <p className="mt-5 max-w-xl whitespace-pre-line text-[15px] leading-relaxed">{barber.bio}</p>}
            {barber.specialties.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {barber.specialties.map((s) => (
                  <li key={s} className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold">
                    {s}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6 flex flex-wrap gap-2">
              <a href="#agenda" className="inline-flex h-11 items-center rounded-full bg-ink px-5 font-semibold text-paper hover:bg-ink/85">
                Ver agenda e reservar
              </a>
              {barber.instagram && (
                <a
                  href={`https://instagram.com/${barber.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-ink/20 px-5 font-semibold hover:border-ink"
                >
                  <InstagramIcon className="h-4 w-4" /> Seguir no Instagram
                </a>
              )}
            </div>
          </div>
        </section>

        {/* abas âncora */}
        <div className="sticky top-16 z-20 -mx-4 border-y border-line bg-paper/95 px-4 backdrop-blur sm:mx-0 sm:px-0">
          <nav className="flex gap-6 text-sm font-semibold">
            <a href="#agenda" className="border-b-2 border-ink py-3">
              Agenda
            </a>
            <a href="#portfolio" className="border-b-2 border-transparent py-3 text-ink-2 hover:text-ink">
              Portfólio
            </a>
          </nav>
        </div>

        <section id="agenda" className="scroll-mt-32 pt-8">
          {svcList.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line p-8 text-center text-ink-2">
              A barbearia ainda não cadastrou serviços.
            </p>
          ) : (
            <BookingAgenda
              key={from}
              slug={slug}
              barberId={barber.id}
              barberName={barber.displayName.split(" ")[0]}
              tz={org.timezone}
              services={svcList}
              days={days}
              rules={agendaRules(org, now)}
              now={now}
              initialServiceId={typeof sp.servico === "string" ? sp.servico : undefined}
              prevFrom={offset > 0 ? addDaysISO(from, -Math.min(7, offset)) : null}
              nextFrom={from < lastStart ? addDaysISO(from, Math.min(7, diffDaysISO(lastStart, from))) : null}
              loginHref={user ? null : `/entrar?next=${encodeURIComponent(path)}`}
            />
          )}
        </section>

        <section id="portfolio" className="scroll-mt-32 pt-14">
          <h2 className="mb-4 font-display text-4xl">Portfólio</h2>
          {photos.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line p-8 text-center text-ink-2">
              {barber.displayName.split(" ")[0]} ainda não postou fotos por aqui.
              {barber.instagram && (
                <>
                  {" "}
                  Veja os trabalhos no{" "}
                  <a
                    className="font-semibold text-ink underline underline-offset-4"
                    href={`https://instagram.com/${barber.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram
                  </a>
                  .
                </>
              )}
            </p>
          ) : (
            <ul className="grid grid-cols-3 gap-1 sm:gap-2">
              {photos.map((p) => (
                <li key={p.id} className="group relative aspect-square overflow-hidden rounded-md bg-paper-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.caption ?? ""} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-[1.03]" />
                  {p.caption && (
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 p-2 text-xs text-white opacity-0 transition group-hover:opacity-100">
                      {p.caption}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd>
        <span className="block font-display text-3xl leading-none">{value}</span>
        <span className="text-xs text-ink-2">{label}</span>
      </dd>
    </div>
  );
}
