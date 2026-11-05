"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { workingHours } from "@/db/schema";
import { requireMember } from "@/lib/tenant";
import { WEEKDAYS } from "@/lib/time";
import type { FormState } from "@/lib/forms";

const toMin = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "");
  if (!/^\d{2}:\d{2}$/.test(s)) return null;
  return Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5));
};

export async function saveHours(_: FormState, fd: FormData): Promise<FormState> {
  const slug = String(fd.get("slug"));
  const { barber } = await requireMember(slug);
  if (!barber) return { error: "Você não tem perfil de barbeiro aqui." };

  const rows: { barberId: string; weekday: number; startMin: number; endMin: number }[] = [];
  for (let wd = 0; wd < 7; wd++) {
    if (!fd.get(`d${wd}_on`)) continue;
    const ranges = [
      [toMin(fd.get(`d${wd}_s1`)), toMin(fd.get(`d${wd}_e1`))],
      [toMin(fd.get(`d${wd}_s2`)), toMin(fd.get(`d${wd}_e2`))],
    ].filter(([s, e]) => s !== null || e !== null);
    if (!ranges.length) return { error: `${WEEKDAYS[wd]}: informe o horário ou desmarque o dia.` };
    for (const [s, e] of ranges) {
      if (s === null || e === null || s >= e) return { error: `${WEEKDAYS[wd]}: horário inválido.` };
      rows.push({ barberId: barber.id, weekday: wd, startMin: s, endMin: e });
    }
    if (ranges.length === 2 && ranges[1][0]! < ranges[0][1]!) {
      return { error: `${WEEKDAYS[wd]}: o segundo turno precisa começar depois do primeiro.` };
    }
  }

  await db.transaction(async (tx) => {
    await tx.delete(workingHours).where(eq(workingHours.barberId, barber.id));
    if (rows.length) await tx.insert(workingHours).values(rows);
  });
  revalidatePath(`/painel/${slug}/horarios`);
  revalidatePath(`/${slug}`, "layout");
  return { ok: "Horários salvos. A agenda pública já foi atualizada." };
}
