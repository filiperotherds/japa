import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { services } from "@/db/schema";
import { requireMember } from "@/lib/tenant";
import { fmtDuration, fmtPrice } from "@/lib/time";
import { cx } from "@/components/styles";
import { ServiceForm } from "./service-form";

export default async function ServicesPage({ params }: PageProps<"/painel/[slug]/servicos">) {
  const { slug } = await params;
  const { org } = await requireMember(slug, ["owner"]);
  const list = await db.select().from(services).where(eq(services.orgId, org.id)).orderBy(asc(services.sort), asc(services.name));

  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-2">Serviços</p>
      <h1 className="font-display text-5xl leading-none sm:text-6xl">Cardápio</h1>
      <p className="mt-2 mb-8 text-ink-2">A duração define quanto da agenda cada reserva ocupa. Serviço oculto não aparece para novos clientes.</p>

      <section className="rounded-3xl bg-night p-5 text-paper sm:p-6 [&_input]:text-ink [&_select]:text-ink">
        <h2 className="mb-4 font-display text-3xl">Novo serviço</h2>
        <ServiceForm slug={slug} />
      </section>

      <ul className="mt-8 space-y-3">
        {list.map((s) => (
          <li key={s.id}>
            <details className={cx("group rounded-3xl border border-line bg-white", !s.active && "opacity-60")}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
                <span>
                  <span className="font-semibold">{s.name}</span>
                  {!s.active && <span className="ml-2 text-xs text-ink-2">(oculto)</span>}
                </span>
                <span className="font-mono text-sm">
                  <span className="text-ink-2">{fmtDuration(s.durationMin)}</span>
                  <span className="ml-4 font-semibold">{fmtPrice(s.priceCents)}</span>
                  <span className="ml-3 inline-block transition group-open:rotate-90">›</span>
                </span>
              </summary>
              <div className="border-t border-line p-5">
                <ServiceForm slug={slug} service={s} />
              </div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
