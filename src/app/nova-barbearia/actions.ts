"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { memberships, organizations, services } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { createBarberProfile } from "@/lib/barbers";
import { RESERVED_SLUGS, slugify } from "@/lib/tenant";
import { firstError, formObject, pgErrorCode, type FormState } from "@/lib/forms";

const schema = z.object({
  name: z.string().trim().min(2, "Dê um nome para a barbearia.").max(80),
  slug: z.string().trim().max(48).optional(),
  city: z.string().trim().max(80).optional(),
  iCut: z.string().optional(),
});

const STARTER_SERVICES = [
  { name: "Corte", durationMin: 40, priceCents: 5000 },
  { name: "Barba", durationMin: 30, priceCents: 3500 },
  { name: "Corte + Barba", durationMin: 60, priceCents: 8000 },
];

export async function createOrg(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser("/nova-barbearia");
  const fields = formObject(fd);
  const parsed = schema.safeParse(fields);
  if (!parsed.success) return { error: firstError(parsed.error), fields };
  const { name, city, iCut } = parsed.data;
  const slug = slugify(parsed.data.slug || name);
  if (slug.length < 3) return { error: "O endereço precisa de pelo menos 3 letras.", fields };
  if (RESERVED_SLUGS.has(slug)) return { error: "Esse endereço é reservado. Escolha outro.", fields };

  try {
    await db.transaction(async (tx) => {
      const [org] = await tx.insert(organizations).values({ slug, name, city: city || null }).returning();
      await tx.insert(memberships).values({ orgId: org.id, userId: user.id, role: "owner" });
      await tx.insert(services).values(STARTER_SERVICES.map((s, i) => ({ ...s, orgId: org.id, sort: i + 1 })));
      if (iCut) await createBarberProfile(tx, org.id, user);
    });
  } catch (e) {
    if (pgErrorCode(e) === "23505") return { error: `navalha/${slug} já está em uso. Tente outro endereço.`, fields };
    throw e;
  }
  redirect(`/painel/${slug}`);
}
