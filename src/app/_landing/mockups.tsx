// Mockups do produto desenhados em HTML: mostram a interface real em vez de foto de banco de imagens.
import { cx } from "@/components/styles";

const Avatar = ({ i, tone, size = 40 }: { i: string; tone: string; size?: number }) => (
  <span
    className="grid shrink-0 place-items-center rounded-full font-display text-white"
    style={{ width: size, height: size, background: tone, fontSize: size * 0.38 }}
  >
    {i}
  </span>
);

/* ---------- celular com perfil do barbeiro ---------- */
export function PhoneProfile({ className = "" }: { className?: string }) {
  const slots: [string, "free" | "busy" | "sel"][] = [
    ["09:00", "busy"],
    ["09:30", "busy"],
    ["10:00", "free"],
    ["10:30", "sel"],
    ["11:00", "free"],
    ["11:30", "busy"],
  ];
  return (
    <div className={cx("w-[300px] rounded-[46px] bg-[#1d1b18] p-[10px] shadow-[0_40px_80px_-30px_rgba(0,0,0,.8)] ring-1 ring-white/10", className)}>
      <div className="overflow-hidden rounded-[37px] bg-paper text-ink">
        <div className="flex items-center justify-between px-6 pt-3 pb-1 font-mono text-[11px] font-semibold">
          <span>9:41</span>
          <span className="h-5 w-20 rounded-full bg-[#1d1b18]" />
          <span>●●●</span>
        </div>
        <div className="px-5 pt-3 pb-5">
          <div className="flex items-center gap-4">
            <div className="pole-ring rounded-full p-[2.5px]">
              <div className="rounded-full bg-paper p-[2.5px]">
                <Avatar i="DA" tone="#1F4FA8" size={64} />
              </div>
            </div>
            <dl className="flex flex-1 justify-around text-center">
              {[
                ["412", "cortes"],
                ["7", "anos"],
                ["36", "fotos"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dd className="font-display text-xl leading-none">{v}</dd>
                  <dt className="text-[10px] text-ink-2">{l}</dt>
                </div>
              ))}
            </dl>
          </div>
          <p className="mt-3 font-display text-2xl leading-none">Diego Almeida</p>
          <p className="font-mono text-[11px] text-ink-2">@diego.fade · Casa Brava</p>
          <p className="mt-2 text-[12px] leading-snug">Degradê é comigo. Fade do zero ao alto, freestyle e desenho.</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] font-semibold">
            <span className="rounded-lg bg-ink py-2 text-center text-paper">Agendar</span>
            <span className="rounded-lg border border-ink/15 py-2 text-center">Instagram</span>
          </div>
          <p className="mt-4 mb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-2">Quinta, 13 nov</p>
          <div className="grid grid-cols-3 gap-1.5">
            {slots.map(([t, s]) => (
              <span
                key={t}
                className={cx(
                  "rounded-md py-1.5 text-center font-mono text-[11px]",
                  s === "busy" && "busy-stripes text-pole-ink/70 line-through",
                  s === "free" && "border border-line bg-white",
                  s === "sel" && "bg-ink text-paper",
                )}
              >
                {t}
              </span>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-1">
            {["#C9B79A", "#8C7A62", "#3C342B", "#A8957A", "#5E5142", "#D6C7AE"].map((c, i) => (
              <span key={i} className="aspect-square rounded-[3px]" style={{ background: `linear-gradient(135deg, ${c}, ${c}cc)` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- grade semanal ---------- */
const PATTERN = [
  "bbfffbbf",
  "fbbffffb",
  "ffbbbfff",
  "bffsbbff",
  "fffbbffb",
];
const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex"];
const HOURS = ["09", "10", "11", "12", "14", "15", "16", "17"];

export function WeekGrid({ className = "" }: { className?: string }) {
  return (
    <div className={cx("rounded-2xl bg-white p-4 text-ink shadow-[0_24px_60px_-28px_rgba(0,0,0,.55)]", className)}>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-xl leading-none">Agenda · Rafa</p>
        <span className="font-mono text-[10px] text-ink-2">10–14 nov</span>
      </div>
      <div className="grid grid-cols-[28px_repeat(5,1fr)] gap-1">
        <span />
        {DAYS.map((d) => (
          <span key={d} className="text-center text-[10px] font-semibold uppercase text-ink-2">
            {d}
          </span>
        ))}
        {HOURS.map((h, r) => (
          <div key={h} className="contents">
            <span className="pt-1 font-mono text-[9px] text-ink-3">{h}h</span>
            {DAYS.map((d, c) => {
              const s = PATTERN[c][r];
              return (
                <span
                  key={d}
                  className={cx(
                    "h-6 rounded-[5px]",
                    s === "b" && "busy-stripes",
                    s === "f" && "border border-line bg-paper/40",
                    s === "s" && "bg-ink",
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-3 text-[10px] text-ink-2">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm border border-line" /> livre
        </span>
        <span className="flex items-center gap-1">
          <span className="busy-stripes h-2.5 w-2.5 rounded-sm" /> ocupado
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-ink" /> seu horário
        </span>
      </div>
    </div>
  );
}

/* ---------- toast de confirmação ---------- */
export function BookedToast({ className = "" }: { className?: string }) {
  return (
    <div className={cx("flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 text-ink shadow-[0_20px_50px_-20px_rgba(0,0,0,.6)]", className)}>
      <span className="grid h-10 w-10 place-items-center rounded-full bg-moss font-display text-xl text-white">✓</span>
      <div>
        <p className="text-[13px] font-bold">Reserva confirmada</p>
        <p className="font-mono text-[11px] text-ink-2">Qui 13/11 · 10:30 · Degradê</p>
      </div>
    </div>
  );
}

/* ---------- painel do dono ---------- */
export function TeamBoard({ className = "" }: { className?: string }) {
  const team = [
    { i: "RN", n: "Rafa", tone: "#D7372A", busy: 0.8, count: 9 },
    { i: "DA", n: "Diego", tone: "#1F4FA8", busy: 0.62, count: 7 },
    { i: "JP", n: "Jonas", tone: "#2F6B4F", busy: 0.45, count: 5 },
  ];
  return (
    <div className={cx("rounded-2xl bg-night p-4 text-paper shadow-[0_24px_60px_-28px_rgba(0,0,0,.6)]", className)}>
      <div className="mb-4 flex items-baseline justify-between">
        <p className="font-display text-xl leading-none">Hoje na casa</p>
        <p className="font-mono text-[10px] text-paper/50">21 reservas · R$ 1.380</p>
      </div>
      <ul className="space-y-3">
        {team.map((b) => (
          <li key={b.n} className="flex items-center gap-3">
            <Avatar i={b.i} tone={b.tone} size={32} />
            <div className="flex-1">
              <div className="flex justify-between text-[12px]">
                <span className="font-semibold">{b.n}</span>
                <span className="font-mono text-paper/60">{b.count}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-cream" style={{ width: `${b.busy * 100}%` }} />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-[11px]">
        <span className="font-mono text-paper/60">navalha.app/convite/x8Kq…</span>
        <span className="font-semibold text-cream">Copiar</span>
      </div>
    </div>
  );
}

/* ---------- bio do Instagram ---------- */
export function InstaBio({ className = "" }: { className?: string }) {
  return (
    <div className={cx("w-[320px] rounded-3xl bg-white p-5 text-ink shadow-[0_30px_70px_-30px_rgba(0,0,0,.7)]", className)}>
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-[conic-gradient(#f9ce34,#ee2a7b,#6228d7,#f9ce34)] p-[2.5px]">
          <div className="rounded-full bg-white p-[2.5px]">
            <Avatar i="CB" tone="#15130F" size={58} />
          </div>
        </div>
        <div className="flex flex-1 justify-around text-center text-[12px]">
          {[
            ["318", "posts"],
            ["12,4 mil", "seguidores"],
          ].map(([v, l]) => (
            <div key={l}>
              <p className="font-bold">{v}</p>
              <p className="text-ink-2">{l}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-[13px] font-bold">Casa Brava Barbearia</p>
      <p className="text-[12px] leading-snug text-ink-2">Corte clássico, degradê e barba na toalha quente. Rua Augusta, 1200.</p>
      <p className="mt-1 flex items-center gap-1 text-[12px] font-semibold text-[#00376b]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3.5 w-3.5" aria-hidden>
          <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
        </svg>
        <span className="rounded bg-cream px-1">navalha.app/casa-brava</span>
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] font-semibold">
        <span className="rounded-lg bg-[#efefef] py-1.5 text-center">Seguindo</span>
        <span className="rounded-lg bg-[#efefef] py-1.5 text-center">Mensagem</span>
      </div>
    </div>
  );
}
