import Link from "next/link";
import { Logo } from "@/components/logo";
import { ArrowIcon } from "@/components/icons";
import { AudienceTabs } from "./_landing/audience-tabs";
import { BookedToast, InstaBio, PhoneProfile, TeamBoard, WeekGrid } from "./_landing/mockups";

const DEMO = "/casa-brava";

const TICKER = ["Agenda aberta", "Perfil com Instagram", "Vários barbeiros", "Reserva em 3 toques", "Sem aplicativo pra baixar", "Sem horário duplicado"];

const FEATURES = [
  {
    tag: "01 · Agenda",
    title: ["A agenda", "à vista"],
    body: "O cliente vê a semana inteira do barbeiro: o que está livre, o que está ocupado e o que está fechado. Acabou o “deixa eu ver e te falo”.",
    cta: "Ver uma agenda real",
    href: `${DEMO}/rafa#agenda`,
    bg: "bg-cream",
    art: <WeekGrid className="w-full max-w-[380px] -rotate-2" />,
    extra: <BookedToast className="absolute right-4 -bottom-6 rotate-3 sm:right-8" />,
  },
  {
    tag: "02 · Perfil",
    title: ["Perfil", "que vende"],
    body: "Cada barbeiro ganha uma vitrine: foto, bio, especialidades, portfólio em grade e o botão pro Instagram dele. O cliente escolhe pelo trabalho, não pelo acaso.",
    cta: "Abrir um perfil",
    href: `${DEMO}/diego`,
    bg: "bg-sky",
    art: <PhoneProfile className="rotate-3 scale-[.92] sm:scale-100" />,
  },
  {
    tag: "03 · Equipe",
    title: ["Uma casa,", "várias cadeiras"],
    body: "Multi-barbeiro de verdade. O dono convida por link, cada barbeiro cuida dos próprios horários e o painel mostra o dia da casa inteira.",
    cta: "Criar minha barbearia",
    href: "/cadastro?next=/nova-barbearia",
    bg: "bg-pole",
    art: <TeamBoard className="w-full max-w-[360px] -rotate-1" />,
  },
];

const FAQ = [
  ["O cliente precisa baixar aplicativo?", "Não. O Navalha é todo web: o cliente abre o link da barbearia no celular, cria a conta uma vez e reserva."],
  ["O cliente vê quem está marcado com o barbeiro?", "Não. Na agenda pública aparece só “ocupado”. Nome, serviço e telefone do cliente ficam visíveis apenas para o barbeiro e o dono."],
  ["E se dois clientes tocarem no mesmo horário ao mesmo tempo?", "Só um leva. A regra que impede horários sobrepostos está no próprio banco de dados, não só na tela; o segundo recebe um aviso para escolher outro."],
  ["Cada barbeiro controla os próprios horários?", "Sim. Cada um define os turnos da semana e bloqueia folgas ou compromissos. O dono vê e gerencia todos."],
  ["Como o Instagram entra nisso?", "Cada barbeiro coloca o @ dele no perfil e o botão aparece para o cliente. E o link da barbearia vai na bio: quem vê o corte no feed já cai na agenda."],
];

export default function Landing() {
  return (
    <div className="bg-night text-paper">
      {/* topo */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-night/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" aria-label="Navalha, início">
            <Logo className="text-paper [--logo-handle:var(--color-night)]" />
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-paper/70 md:flex">
            <a href="#recursos" className="hover:text-paper">Recursos</a>
            <a href="#para-quem" className="hover:text-paper">Para quem</a>
            <a href="#como-funciona" className="hover:text-paper">Como funciona</a>
            <a href="#perguntas" className="hover:text-paper">Perguntas</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/entrar" className="hidden h-9 items-center rounded-full px-4 text-sm font-semibold text-paper/80 hover:text-paper sm:inline-flex">
              Entrar
            </Link>
            <Link href="/cadastro?next=/nova-barbearia" className="inline-flex h-9 items-center rounded-full bg-pole px-4 text-sm font-bold uppercase tracking-wide text-white hover:bg-pole/90">
              Começar
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* hero */}
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-[1.25fr_1fr] lg:pt-20 lg:pb-28">
            <div className="relative z-10">
              <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-paper/70">
                <span className="h-1.5 w-1.5 rounded-full bg-pole" /> Agenda online para barbearias
              </p>
              <h1 className="font-display text-[clamp(60px,9.4vw,148px)] leading-[0.82]">
                Chega de
                <br />
                marcar corte
                <br />
                <span className="text-pole">por áudio.</span>
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-paper/70">
                O Navalha abre a agenda de cada barbeiro pro cliente: livre, ocupado, fechado. Ele escolhe o horário, reserva e pronto. Você só corta.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href="/cadastro?next=/nova-barbearia" className="inline-flex h-13 items-center gap-2 rounded-full bg-pole px-7 font-bold uppercase tracking-wide text-white hover:bg-pole/90">
                  Criar minha barbearia <ArrowIcon className="h-5 w-5" />
                </Link>
                <Link href={DEMO} className="inline-flex h-13 items-center rounded-full border border-white/20 px-7 font-semibold hover:border-paper">
                  Ver barbearia demo
                </Link>
              </div>
            </div>

            <div className="relative mx-auto h-[600px] w-full max-w-[460px] lg:mx-0 lg:justify-self-end">
              <div className="pole-stripes animate-pole absolute top-10 right-6 bottom-16 w-16 rounded-full opacity-90 ring-8 ring-night sm:right-0" aria-hidden />
              <PhoneProfile className="absolute top-0 left-1/2 -translate-x-1/2 -rotate-3 sm:left-[44%]" />
              <BookedToast className="absolute bottom-6 -left-2 rotate-[-4deg] sm:left-0" />
            </div>
          </div>
        </section>

        {/* faixa */}
        <div className="overflow-hidden border-y border-white/10 bg-pole py-3 text-white" aria-hidden>
          <div className="animate-marquee flex w-max gap-8 whitespace-nowrap font-display text-3xl">
            {[...TICKER, ...TICKER, ...TICKER, ...TICKER].map((t, i) => (
              <span key={i} className="flex items-center gap-8">
                {t}
                <span className="inline-block h-3 w-3 rotate-45 bg-white/80" />
              </span>
            ))}
          </div>
        </div>

        {/* recursos: linhas alternadas com bloco de cor e mockup */}
        <section id="recursos" className="mx-auto max-w-7xl scroll-mt-20 space-y-24 px-4 py-24 sm:px-6 lg:space-y-32 lg:py-32">
          {FEATURES.map((f, i) => (
            <article key={f.tag} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div className={i % 2 ? "lg:order-2" : ""}>
                <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-paper/50">{f.tag}</p>
                <h2 className="font-display text-[clamp(56px,9vw,120px)] leading-[0.85]">
                  {f.title[0]}
                  <br />
                  {f.title[1]}
                </h2>
                <p className="mt-6 max-w-md text-lg leading-relaxed text-paper/70">{f.body}</p>
                <Link href={f.href} className="group mt-8 inline-flex items-center gap-3 rounded-full border border-white/20 py-2 pr-2 pl-5 font-semibold hover:border-paper">
                  {f.cta}
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-paper text-night transition group-hover:translate-x-0.5">
                    <ArrowIcon className="h-4 w-4" />
                  </span>
                </Link>
              </div>
              <div className={`relative grid min-h-[420px] place-items-center rounded-[28px] p-8 sm:min-h-[480px] ${f.bg}`}>
                {f.art}
                {f.extra}
              </div>
            </article>
          ))}
        </section>

        {/* para quem */}
        <section id="para-quem" className="scroll-mt-20 border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
            <AudienceTabs />
          </div>
        </section>

        {/* instagram */}
        <section className="bg-paper text-ink">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:py-32">
            <div>
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-ink-2">Link na bio</p>
              <h2 className="font-display text-[clamp(56px,9vw,120px)] leading-[0.85]">
                Do feed
                <br />
                <span className="text-pole">pra cadeira.</span>
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-2">
                Cada barbearia tem seu endereço. Coloca na bio do Instagram e quem curtiu o degradê no feed já cai na agenda do barbeiro que fez.
              </p>
            </div>
            <div className="relative mx-auto h-[380px] w-full max-w-[460px]">
              <InstaBio className="absolute top-0 left-0 -rotate-2" />
              <div className="absolute right-0 bottom-0 w-[250px] rotate-2 rounded-2xl border-2 border-ink bg-white p-4 shadow-[8px_8px_0_0_var(--color-ink)]">
                <p className="font-mono text-[10px] uppercase tracking-wider text-ink-2">navalha.app/casa-brava</p>
                <p className="mt-1 font-display text-3xl leading-none">Escolha seu barbeiro</p>
                <div className="mt-3 flex -space-x-2">
                  {[
                    ["RN", "#D7372A"],
                    ["DA", "#1F4FA8"],
                    ["JP", "#2F6B4F"],
                  ].map(([i, c]) => (
                    <span key={i} className="grid h-9 w-9 place-items-center rounded-full font-display text-sm text-white ring-2 ring-white" style={{ background: c }}>
                      {i}
                    </span>
                  ))}
                </div>
                <p className="mt-3 rounded-full bg-paper-2 px-3 py-1.5 font-mono text-[11px]">Livre hoje 15:30</p>
              </div>
            </div>
          </div>
        </section>

        {/* como funciona */}
        <section id="como-funciona" className="scroll-mt-20">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
            <h2 className="font-display text-[clamp(56px,9vw,120px)] leading-[0.85]">
              Em pé em
              <br />
              <span className="text-cream">dez minutos.</span>
            </h2>
            <ol className="mt-14 grid gap-px overflow-hidden rounded-[28px] bg-white/10 md:grid-cols-3">
              {[
                ["Crie a barbearia", "Nome, endereço da página e os serviços com duração e preço. Já vem com três serviços pra editar."],
                ["Chame a equipe", "Gere um link de convite e mande no WhatsApp. Cada barbeiro monta perfil, Instagram e horários."],
                ["Divulgue o link", "Na bio, no story, no espelho. O cliente reserva sozinho e a agenda se preenche."],
              ].map(([t, d], i) => (
                <li key={t} className="bg-night p-8">
                  <span className="font-display text-8xl leading-none text-pole">{String(i + 1).padStart(2, "0")}</span>
                  <p className="mt-6 font-display text-3xl">{t}</p>
                  <p className="mt-2 text-paper/65">{d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* perguntas */}
        <section id="perguntas" className="scroll-mt-20 border-t border-white/10">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:py-32">
            <h2 className="font-display text-[clamp(56px,7vw,96px)] leading-[0.85]">
              Perguntas
              <br />
              de balcão
            </h2>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {FAQ.map(([q, a]) => (
                <details key={q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-lg font-semibold">
                    {q}
                    <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/25 text-sm transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 max-w-2xl text-paper/65">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* chamada final */}
        <section className="relative overflow-hidden bg-pole">
          <div className="pole-stripes animate-pole absolute inset-x-0 top-0 h-3" aria-hidden />
          <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:py-32">
            <h2 className="font-display text-[clamp(72px,15vw,220px)] leading-[0.8] text-white">
              Bora abrir
              <br />a agenda?
            </h2>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link href="/cadastro?next=/nova-barbearia" className="inline-flex h-13 items-center gap-2 rounded-full bg-night px-8 font-bold uppercase tracking-wide text-paper hover:bg-night/85">
                Criar minha barbearia <ArrowIcon className="h-5 w-5" />
              </Link>
              <Link href={DEMO} className="inline-flex h-13 items-center rounded-full border-2 border-white/60 px-8 font-semibold text-white hover:border-white">
                Ver a demo
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-10 text-sm text-paper/50 sm:px-6">
          <Logo className="text-paper [--logo-handle:var(--color-night)]" />
          <nav className="flex flex-wrap gap-6">
            <Link href="/entrar" className="hover:text-paper">Entrar</Link>
            <Link href="/cadastro" className="hover:text-paper">Criar conta</Link>
            <Link href={DEMO} className="hover:text-paper">Demo</Link>
          </nav>
          <p>© {new Date().getFullYear()} Navalha</p>
        </div>
      </footer>
    </div>
  );
}
