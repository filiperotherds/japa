"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, gt, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { appointments, barbers, services } from "@/db/schema";
import { getUser } from "@/lib/auth/session";
import { agendaRules, loadAgenda } from "@/lib/agenda";
import { bookableStarts } from "@/lib/slots";
import { localDateISO } from "@/lib/time";
import { getOrgBySlug } from "@/lib/tenant";
import { formObject, pgErrorCode, type FormState } from "@/lib/forms";

const MAX_OPEN_BOOKINGS = 3;

const schema = z.object({
  slug: z.string().min(1),
  barberId: z.uuid(),
  serviceId: z.uuid(),
  start: z.coerce.number().int().positive(),
  note: z.string().trim().max(280).optional(),
});

export async function bookAppointment(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = schema.safeParse(formObject(fd));
  if (!parsed.success) return { error: "Reserva inválida. Recarregue a página." };
  const { slug, barberId, serviceId, start, note } = parsed.data;

  const user = await getUser();
  if (!user) redirect(`/entrar?next=/${slug}`);

  const org = await getOrgBySlug(slug);
  if (!org) return { error: "Barbearia não encontrada." };

  // barbeiro e serviço precisam pertencer à MESMA barbearia (isolamento entre tenants)
  const [[barber], [service]] = await Promise.all([
    db
      .select()
      .from(barbers)
      .where(and(eq(barbers.id, barberId), eq(barbers.orgId, org.id), eq(barbers.active, true))),
    db
      .select()
      .from(services)
      .where(and(eq(services.id, serviceId), eq(services.orgId, org.id), eq(services.active, true))),
  ]);
  if (!barber || !service) return { error: "Barbeiro ou serviço indisponível." };
  const profilePath = `/${slug}/${barber.handle}`;

  // revalida no servidor com a mesma regra que desenhou a agenda
  const date = localDateISO(start, org.timezone);
  const [day] = await loadAgenda(org, barber.id, date, 1);
  if (!bookableStarts(day, service.durationMin, agendaRules(org)).includes(start)) {
    revalidatePath(profilePath);
    return { error: "Esse horário não está mais disponível. A agenda foi atualizada." };
  }

  const [{ open }] = await db
    .select({ open: sql<number>`count(*)::int` })
    .from(appointments)
    .where(
      and(
        eq(appointments.orgId, org.id),
        eq(appointments.clientId, user.id),
        eq(appointments.status, "confirmed"),
        gt(appointments.startsAt, new Date()),
      ),
    );
  if (open >= MAX_OPEN_BOOKINGS) {
    return { error: `Você já tem ${open} reservas futuras nesta barbearia. Cancele uma para marcar outra.` };
  }

  let id: string;
  try {
    [{ id }] = await db
      .insert(appointments)
      .values({
        orgId: org.id,
        barberId: barber.id,
        clientId: user.id,
        serviceId: service.id,
        serviceName: service.name,
        priceCents: service.priceCents,
        note: note || null,
        startsAt: new Date(start),
        endsAt: new Date(start + service.durationMin * 60_000),
      })
      .returning({ id: appointments.id });
  } catch (e) {
    // 23P01 = exclusion_violation: outra pessoa reservou no mesmo instante
    if (pgErrorCode(e) === "23P01") {
      revalidatePath(profilePath);
      return { error: "Alguém acabou de reservar esse horário. Escolha outro." };
    }
    throw e;
  }

  revalidatePath(profilePath);
  redirect(`/minhas-reservas?nova=${id}`);
}
