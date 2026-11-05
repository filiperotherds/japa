"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { appointments, barbers } from "@/db/schema";
import { requireMember } from "@/lib/tenant";
import { zonedToMs } from "@/lib/time";
import { firstError, formObject, pgErrorCode, type FormState } from "@/lib/forms";

/** Dono gerencia qualquer barbeiro da barbearia; barbeiro só a própria agenda. */
async function assertCanManage(slug: string, barberId: string) {
  const ctx = await requireMember(slug);
  if (ctx.role !== "owner" && ctx.barber?.id !== barberId) throw new Error("Sem permissão.");
  const [b] = await db
    .select({ id: barbers.id })
    .from(barbers)
    .where(and(eq(barbers.id, barberId), eq(barbers.orgId, ctx.org.id)));
  if (!b) throw new Error("Barbeiro não encontrado.");
  return ctx;
}

export async function cancelAppointment(fd: FormData) {
  const slug = String(fd.get("slug"));
  const id = String(fd.get("id"));
  const ctx = await requireMember(slug);
  const [appt] = await db
    .select({ barberId: appointments.barberId })
    .from(appointments)
    .where(and(eq(appointments.id, id), eq(appointments.orgId, ctx.org.id)));
  if (!appt) return;
  await assertCanManage(slug, appt.barberId);
  await db
    .update(appointments)
    .set({ status: "cancelled", cancelledAt: new Date() })
    .where(and(eq(appointments.id, id), eq(appointments.orgId, ctx.org.id)));
  revalidatePath(`/painel/${slug}`);
}

const time = z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido.");
const blockSchema = z.object({
  slug: z.string(),
  barberId: z.uuid("Escolha o barbeiro."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida."),
  start: time,
  end: time,
  note: z.string().trim().max(120).optional(),
});

const toMin = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

export async function addBlock(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = blockSchema.safeParse(formObject(fd));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const { slug, barberId, date, start, end, note } = parsed.data;
  if (toMin(end) <= toMin(start)) return { error: "O fim precisa ser depois do início." };
  const ctx = await assertCanManage(slug, barberId);
  const tz = ctx.org.timezone;
  try {
    await db.insert(appointments).values({
      orgId: ctx.org.id,
      barberId,
      kind: "block",
      note: note || "Bloqueado",
      startsAt: new Date(zonedToMs(date, toMin(start), tz)),
      endsAt: new Date(zonedToMs(date, toMin(end), tz)),
    });
  } catch (e) {
    if (pgErrorCode(e) === "23P01") return { error: "Já existe reserva nesse intervalo. Cancele-a antes de bloquear." };
    throw e;
  }
  revalidatePath(`/painel/${slug}`);
  return { ok: "Horário bloqueado." };
}
