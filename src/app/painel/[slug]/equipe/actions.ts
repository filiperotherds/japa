"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { barbers, invites } from "@/db/schema";
import { requireMember } from "@/lib/tenant";
import { createBarberProfile } from "@/lib/barbers";

const owner = (slug: string) => requireMember(slug, ["owner"]);

export async function createInvite(fd: FormData) {
  const slug = String(fd.get("slug"));
  const { org, user } = await owner(slug);
  await db.insert(invites).values({
    orgId: org.id,
    token: randomBytes(18).toString("base64url"),
    createdBy: user.id,
    expiresAt: new Date(Date.now() + 7 * 86_400_000),
  });
  revalidatePath(`/painel/${slug}/equipe`);
}

export async function revokeInvite(fd: FormData) {
  const slug = String(fd.get("slug"));
  const { org } = await owner(slug);
  await db
    .delete(invites)
    .where(and(eq(invites.id, String(fd.get("id"))), eq(invites.orgId, org.id), isNull(invites.usedAt)));
  revalidatePath(`/painel/${slug}/equipe`);
}

export async function toggleBarber(fd: FormData) {
  const slug = String(fd.get("slug"));
  const { org } = await owner(slug);
  await db
    .update(barbers)
    .set({ active: fd.get("active") === "1" })
    .where(and(eq(barbers.id, String(fd.get("id"))), eq(barbers.orgId, org.id)));
  revalidatePath(`/painel/${slug}`, "layout");
  revalidatePath(`/${slug}`);
}

export async function becomeBarber(fd: FormData) {
  const slug = String(fd.get("slug"));
  const { org, user, barber } = await owner(slug);
  if (!barber) await createBarberProfile(db, org.id, user);
  revalidatePath(`/painel/${slug}`, "layout");
  redirect(`/painel/${slug}/perfil`);
}
