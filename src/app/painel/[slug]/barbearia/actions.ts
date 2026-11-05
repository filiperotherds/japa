"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import { requireMember } from "@/lib/tenant";
import { firstError, formObject, instagramHandle, type FormState } from "@/lib/forms";

const schema = z.object({
  name: z.string().trim().min(2, "Nome muito curto.").max(80),
  description: z.string().trim().max(600).optional(),
  address: z.string().trim().max(120).optional(),
  city: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(30).optional(),
  instagram: z.string().trim().max(100).optional(),
  slotMinutes: z.coerce.number().refine((n) => [10, 15, 20, 30, 60].includes(n), "Intervalo inválido."),
  minLeadMinutes: z.coerce.number().int().min(0).max(2880),
  bookingWindowDays: z.coerce.number().int().min(7, "Mínimo de 7 dias.").max(180),
  cancelHours: z.coerce.number().int().min(0).max(72),
});

export async function saveOrg(_: FormState, fd: FormData): Promise<FormState> {
  const slug = String(fd.get("slug"));
  const { org } = await requireMember(slug, ["owner"]);
  const parsed = schema.safeParse(formObject(fd));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const d = parsed.data;
  const ig = d.instagram ? instagramHandle(d.instagram) : null;
  if (d.instagram && !ig) return { error: "Instagram inválido." };
  await db
    .update(organizations)
    .set({
      ...d,
      description: d.description || null,
      address: d.address || null,
      city: d.city || null,
      phone: d.phone || null,
      instagram: ig,
    })
    .where(eq(organizations.id, org.id));
  revalidatePath(`/${slug}`, "layout");
  revalidatePath(`/painel/${slug}`, "layout");
  return { ok: "Dados da barbearia salvos." };
}
