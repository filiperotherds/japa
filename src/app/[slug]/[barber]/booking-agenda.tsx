"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { bookableStarts, mergeIntervals, type AgendaDay, type AgendaRules } from "@/lib/slots";
import {
  fmtDateLong,
  fmtDayMonth,
  fmtDuration,
  fmtMinutes,
  fmtPrice,
  fmtTime,
  fmtWeekdayShort,
  localDateISO,
  localMinutes,
} from "@/lib/time";
import { buttonClass, cx, FormMessage, SubmitButton, Textarea } from "@/components/ui";
import { bookAppointment } from "./actions";

type Svc = { id: string; name: string; durationMin: number; priceCents: number };

const PX_PER_MIN = 1.25;

export function BookingAgenda(props: {
  slug: string;
  barberId: string;
  barberName: string;
  tz: string;
  services: Svc[];
  days: AgendaDay[];
  rules: AgendaRules;
  now: number;
  initialServiceId?: string;
  prevFrom: string | null;
  nextFrom: string | null;
  loginHref: string | null;
}) {
  const { tz, days, rules, now, services } = props;
  const [serviceId, setServiceId] = useState(
    services.some((s) => s.id === props.initialServiceId) ? props.initialServiceId! : services[0]?.id,
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [state, action] = useActionState(bookAppointment, undefined);
  const service = services.find((s) => s.id === serviceId);

  const bookable = useMemo(
    () => days.map((d) => (service ? bookableStarts(d, service.durationMin, rules) : [])),
    [days, service, rules],
  );

  // Faixa vertical da grade: do primeiro ao último minuto de expediente na semana.
  const [minMin, maxMin] = useMemo(() => {
    let lo = Infinity;
    let hi = -Infinity;
    for (const d of days)
      for (const w of d.open) {
        lo = Math.min(lo, localMinutes(w.start, tz));
        const end = localDateISO(w.end, tz) === d.date ? localMinutes(w.end, tz) : 1440;
        hi = Math.max(hi, end);
      }
    if (!Number.isFinite(lo)) return [9 * 60, 18 * 60];
    return [Math.floor(lo / 60) * 60, Math.ceil(hi / 60) * 60];
  }, [days, tz]);

  const y = (ms: number, date: string) => {
    const m = localDateISO(ms, tz) === date ? localMinutes(ms, tz) : ms > now ? 1440 : 0;
    return (Math.min(Math.max(m, minMin), maxMin) - minMin) * PX_PER_MIN;
  };
  const height = (maxMin - minMin) * PX_PER_MIN;
  const hours = Array.from({ length: (maxMin - minMin) / 60 + 1 }, (_, i) => minMin + i * 60);
  const today = localDateISO(now, tz);
  const totalFree = bookable.reduce((a, b) => a + b.length, 0);
  const svcQs = serviceId ? `&servico=${serviceId}` : "";

  return (
    <div>
      {/* serviços */}
      <fieldset>
        <legend className="mb-3 text-sm font-semibold">1. Escolha o serviço</legend>
        <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
          {services.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={s.id === serviceId}
              onClick={() => {
                setServiceId(s.id);
                setSelected(null);
              }}
              className={cx(
                "shrink-0 rounded-2xl border px-4 py-2.5 text-left transition",
                s.id === serviceId ? "border-ink bg-ink text-paper" : "border-line bg-white hover:border-ink/40",
              )}
            >
              <span className="block text-sm font-semibold">{s.name}</span>
              <span className={cx("font-mono text-xs", s.id === serviceId ? "text-paper/70" : "text-ink-2")}>
                {fmtDuration(s.durationMin)} · {fmtPrice(s.priceCents)}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* navegação da semana + legenda */}
      <div className="mt-6 mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">2. Escolha um horário livre</p>
          <p className="text-xs text-ink-2">
            {totalFree} horário{totalFree === 1 ? "" : "s"} para {service?.name.toLowerCase() ?? "—"} nestes 7 dias
          </p>
        </div>
        <div className="flex items-center gap-1">
          <WeekLink href={props.prevFrom && `?de=${props.prevFrom}${svcQs}#agenda`} label="Semana anterior">
            ←
          </WeekLink>
          <WeekLink href={props.nextFrom && `?de=${props.nextFrom}${svcQs}#agenda`} label="Próxima semana">
            →
          </WeekLink>
        </div>
      </div>
      <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm border border-ink/30 bg-white" /> Livre
        </li>
        <li className="flex items-center gap-1.5">
          <span className="busy-stripes h-3 w-3 rounded-sm" /> Ocupado
        </li>
        <li className="flex items-center gap-1.5">
          <span className="closed-hatch h-3 w-3 rounded-sm border border-line" /> Fechado
        </li>
      </ul>

      {/* grade semanal */}
      <div className="overflow-x-auto rounded-2xl border border-line bg-paper-2/60">
        <div className="grid min-w-[760px] grid-cols-[52px_repeat(7,minmax(96px,1fr))]">
          <div className="sticky left-0 z-20 border-b border-line bg-paper-2" />
          {days.map((d, i) => (
            <div
              key={d.date}
              className={cx("border-b border-l border-line px-2 py-2.5 text-center", d.date === today && "bg-white")}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-2">
                {d.date === today ? "Hoje" : fmtWeekdayShort(d.date)}
              </p>
              <p className="font-display text-xl leading-none whitespace-nowrap sm:text-2xl">{fmtDayMonth(d.date)}</p>
              <p className="mt-1 font-mono text-[10px] text-ink-2">
                {d.open.length ? `${bookable[i].length} livres` : "fechado"}
              </p>
            </div>
          ))}

          <div className="sticky left-0 z-20 bg-paper-2" style={{ height }}>
            {hours.map((h) => (
              <span
                key={h}
                className="absolute right-2 -translate-y-1/2 font-mono text-[10px] text-ink-2"
                style={{ top: (h - minMin) * PX_PER_MIN }}
              >
                {h < maxMin || h === minMin ? fmtMinutes(h) : ""}
              </span>
            ))}
          </div>

          {days.map((d, i) => {
            const busy = mergeIntervals(d.busy);
            return (
              <div key={d.date} className="closed-hatch relative border-l border-line" style={{ height }}>
                {hours.slice(1, -1).map((h) => (
                  <div
                    key={h}
                    className="pointer-events-none absolute inset-x-0 border-t border-dashed border-line/80"
                    style={{ top: (h - minMin) * PX_PER_MIN }}
                  />
                ))}
                {d.open.map((w) => (
                  <div
                    key={w.start}
                    className="absolute inset-x-0 bg-white"
                    style={{ top: y(w.start, d.date), height: y(w.end, d.date) - y(w.start, d.date) }}
                  />
                ))}
                {!d.open.length && (
                  <p className="absolute inset-x-0 top-6 text-center text-xs font-semibold uppercase tracking-wider text-ink-3">
                    Fechado
                  </p>
                )}
                {d.date === today && (
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 z-[1] bg-paper-2/70"
                    style={{ height: y(now, d.date) }}
                  />
                )}
                {busy.map((b) => {
                  const h = y(b.end, d.date) - y(b.start, d.date);
                  return (
                    <div
                      key={b.start}
                      className="busy-stripes absolute inset-x-1 z-[2] overflow-hidden rounded-lg px-1.5 py-1 text-[10px] font-semibold text-pole-ink"
                      style={{ top: y(b.start, d.date) + 1, height: Math.max(h - 2, 6) }}
                      title={`Ocupado ${fmtTime(b.start, tz)}–${fmtTime(b.end, tz)}`}
                    >
                      {h >= 30 && (
                        <span className="rounded bg-white/85 px-1">
                          Ocupado · {fmtTime(b.start, tz)}
                        </span>
                      )}
                    </div>
                  );
                })}
                {selected !== null && localDateISO(selected, tz) === d.date && service && (
                  <div
                    className="pointer-events-none absolute inset-x-1 z-[3] rounded-lg border-2 border-ink bg-ink/10"
                    style={{
                      top: y(selected, d.date),
                      height: y(selected + service.durationMin * 60_000, d.date) - y(selected, d.date),
                    }}
                  />
                )}
                {bookable[i].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelected(t === selected ? null : t)}
                    aria-pressed={t === selected}
                    aria-label={`${fmtDateLong(t, tz)}, ${fmtTime(t, tz)}`}
                    className={cx(
                      "absolute inset-x-1 z-[4] flex items-start rounded-lg px-1.5 pt-0.5 font-mono text-[11px] transition",
                      t === selected
                        ? "bg-ink text-paper"
                        : "text-ink/70 hover:bg-moss/15 hover:text-ink focus-visible:bg-moss/15",
                    )}
                    style={{ top: y(t, d.date) + 1, height: rules.slotMinutes * PX_PER_MIN - 2 }}
                  >
                    {fmtTime(t, tz)}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* confirmação */}
      {selected !== null && service && (
        <div className="sticky bottom-3 z-30 mt-4">
          <form
            action={action}
            className="rounded-2xl border border-ink bg-white p-4 shadow-[0_12px_40px_-12px_rgba(21,19,15,.35)] sm:p-5"
          >
            <input type="hidden" name="slug" value={props.slug} />
            <input type="hidden" name="barberId" value={props.barberId} />
            <input type="hidden" name="serviceId" value={service.id} />
            <input type="hidden" name="start" value={selected} />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-2">
                  {service.name} com {props.barberName}
                </p>
                <p className="font-display text-3xl leading-tight first-letter:uppercase">
                  {fmtDateLong(selected, tz)}
                </p>
                <p className="font-mono text-sm">
                  {fmtTime(selected, tz)}–{fmtTime(selected + service.durationMin * 60_000, tz)} ·{" "}
                  {fmtPrice(service.priceCents)}
                </p>
              </div>
              {props.loginHref ? (
                <Link href={props.loginHref} className={buttonClass({ size: "lg" })}>
                  Entrar para reservar
                </Link>
              ) : (
                <SubmitButton size="lg" pending="Reservando…">
                  Confirmar reserva
                </SubmitButton>
              )}
            </div>
            {!props.loginHref && (
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer text-ink-2">Deixar um recado para o barbeiro</summary>
                <Textarea name="note" maxLength={280} className="mt-2" placeholder="Ex.: quero manter o comprimento em cima" />
              </details>
            )}
            <div className="mt-3 empty:hidden">
              <FormMessage state={state} />
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function WeekLink({ href, label, children }: { href: string | null; label: string; children: React.ReactNode }) {
  if (!href)
    return (
      <span aria-disabled className={cx(buttonClass({ variant: "outline", size: "sm" }), "w-10 px-0 opacity-30")}>
        {children}
      </span>
    );
  return (
    <Link href={href} scroll={false} aria-label={label} className={cx(buttonClass({ variant: "outline", size: "sm" }), "w-10 px-0")}>
      {children}
    </Link>
  );
}
