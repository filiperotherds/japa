"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { appointments, organizations } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";

export async function cancelMyBooking(fd: FormData) {
  const user = await requireUser("/minhas-reservas");
  const id = String(fd.get("id") ?? "");
  const [row] = await db
    .select({ startsAt: appointments.startsAt, cancelHours: organizations.cancelHours })
    .from(appointments)
    .innerJoin(organizations, eq(organizations.id, appointments.orgId))
    .where(and(eq(appointments.id, id), eq(appointments.clientId, user.id), eq(appointments.status, "confirmed")))
    .limit(1);
  if (!row || row.startsAt.getTime() - Date.now() <= row.cancelHours * 3_600_000) return;
  await db
    .update(appointments)
    .set({ status: "cancelled", cancelledAt: new Date() })
    .where(and(eq(appointments.id, id), eq(appointments.clientId, user.id)));
  revalidatePath("/minhas-reservas");
}
