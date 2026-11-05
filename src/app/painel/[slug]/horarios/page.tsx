import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { workingHours } from "@/db/schema";
import { requireMember } from "@/lib/tenant";
import { HoursForm } from "./hours-form";

export default async function HoursPage({ params }: PageProps<"/painel/[slug]/horarios">) {
  const { slug } = await params;
  const { barber } = await requireMember(slug);
  if (!barber) redirect(`/painel/${slug}`);
  const rows = await db.select().from(workingHours).where(eq(workingHours.barberId, barber.id)).orderBy(asc(workingHours.startMin));
  const byDay: Record<number, { startMin: number; endMin: number }[]> = {};
  for (const r of rows) (byDay[r.weekday] ??= []).push({ startMin: r.startMin, endMin: r.endMin });

  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-2">Meus horários</p>
      <h1 className="font-display text-5xl leading-none sm:text-6xl">Expediente</h1>
      <p className="mt-2 mb-8 text-ink-2">Só aparecem horários livres dentro do seu expediente. Para folgas pontuais, use “Bloquear horário” na Agenda.</p>
      <HoursForm slug={slug} initial={byDay} />
    </div>
  );
}
