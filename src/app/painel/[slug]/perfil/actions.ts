"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { barberPhotos, barbers } from "@/db/schema";
import { requireMember, slugify } from "@/lib/tenant";
import { deleteImage, saveImage, validateImage } from "@/lib/upload";
import { firstError, formObject, instagramHandle, pgErrorCode, type FormState } from "@/lib/forms";

const MAX_PHOTOS = 30;

async function myBarber(slug: string) {
  const ctx = await requireMember(slug);
  if (!ctx.barber) throw new Error("Você não tem perfil de barbeiro nesta barbearia.");
  return { ...ctx, barber: ctx.barber };
}

const year = new Date().getFullYear();
const profileSchema = z.object({
  displayName: z.string().trim().min(2, "Informe seu nome.").max(60),
  handle: z.string().trim().min(2, "O endereço do perfil é curto demais.").max(40),
  bio: z.string().trim().max(500, "Bio com no máximo 500 caracteres.").optional(),
  instagram: z.string().trim().max(100).optional(),
  specialties: z.string().max(400).optional(),
  since: z.union([z.literal(""), z.coerce.number().int().min(1950).max(year)]).optional(),
});

export async function saveProfile(_: FormState, fd: FormData): Promise<FormState> {
  const slug = String(fd.get("slug"));
  const { org, barber } = await myBarber(slug);
  const parsed = profileSchema.safeParse(formObject(fd));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const d = parsed.data;

  const ig = d.instagram ? instagramHandle(d.instagram) : null;
  if (d.instagram && !ig) return { error: "Instagram inválido. Use @seuperfil ou o link do perfil." };
  const handle = slugify(d.handle);
  if (handle.length < 2) return { error: "Endereço do perfil inválido." };

  let avatarUrl = barber.avatarUrl;
  const avatar = fd.get("avatar");
  if (avatar instanceof File && avatar.size > 0) {
    const err = validateImage(avatar);
    if (err) return { error: err };
    avatarUrl = await saveImage(avatar, `${org.id}/avatars`);
  }

  try {
    await db
      .update(barbers)
      .set({
        displayName: d.displayName,
        handle,
        bio: d.bio || null,
        instagram: ig,
        specialties: (d.specialties ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 8)
          .map((s) => s.slice(0, 30)),
        since: typeof d.since === "number" ? d.since : null,
        avatarUrl,
      })
      .where(and(eq(barbers.id, barber.id), eq(barbers.orgId, org.id)));
  } catch (e) {
    if (pgErrorCode(e) === "23505") return { error: "Esse endereço de perfil já é de outro barbeiro da casa." };
    throw e;
  }
  if (avatarUrl !== barber.avatarUrl) await deleteImage(barber.avatarUrl);

  revalidatePath(`/${slug}`, "layout");
  revalidatePath(`/painel/${slug}`, "layout");
  return { ok: "Perfil salvo." };
}

export async function addPhoto(_: FormState, fd: FormData): Promise<FormState> {
  const slug = String(fd.get("slug"));
  const { org, barber } = await myBarber(slug);
  const file = fd.get("photo");
  const err = validateImage(file);
  if (err) return { error: err };
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(barberPhotos)
    .where(eq(barberPhotos.barberId, barber.id));
  if (n >= MAX_PHOTOS) return { error: `Limite de ${MAX_PHOTOS} fotos. Apague alguma antes.` };
  const url = await saveImage(file as File, `${org.id}/portfolio`);
  const caption = String(fd.get("caption") ?? "").trim().slice(0, 120) || null;
  await db.insert(barberPhotos).values({ barberId: barber.id, url, caption });
  revalidatePath(`/painel/${slug}/perfil`);
  revalidatePath(`/${slug}/${barber.handle}`);
  return { ok: "Foto publicada." };
}

export async function deletePhoto(fd: FormData) {
  const slug = String(fd.get("slug"));
  const { barber } = await myBarber(slug);
  const [photo] = await db
    .delete(barberPhotos)
    .where(and(eq(barberPhotos.id, String(fd.get("id"))), eq(barberPhotos.barberId, barber.id)))
    .returning();
  if (photo) await deleteImage(photo.url);
  revalidatePath(`/painel/${slug}/perfil`);
  revalidatePath(`/${slug}/${barber.handle}`);
}
