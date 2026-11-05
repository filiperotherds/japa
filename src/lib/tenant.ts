import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { barbers, memberships, organizations } from "@/db/schema";
import { requireUser } from "./auth/session";

// Rotas de primeiro nível que não podem virar slug de barbearia.
export const RESERVED_SLUGS = new Set([
  "api", "entrar", "cadastro", "sair", "inicio", "painel", "convite", "minhas-reservas",
  "nova-barbearia", "conta", "sobre", "precos", "ajuda", "termos", "privacidade",
  "admin", "app", "uploads", "_next", "static", "favicon.ico", "robots.txt", "sitemap.xml",
]);

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " e ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export const getOrgBySlug = cache(async (slug: string) => {
  const [org] = await db.select().from(organizations).where(eq(organizations.slug, slug)).limit(1);
  return org ?? null;
});

export type Role = "owner" | "barber";

/**
 * Garante que o usuário logado pertence à barbearia (e, se pedido, com o papel certo).
 * Toda leitura/escrita do painel passa por aqui: é a fronteira entre tenants.
 */
export const requireMember = cache(async (slug: string, roles?: Role[]) => {
  const user = await requireUser(`/painel/${slug}`);
  const org = await getOrgBySlug(slug);
  if (!org) notFound();
  const [membership] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.orgId, org.id), eq(memberships.userId, user.id)))
    .limit(1);
  if (!membership) notFound();
  if (roles && !roles.includes(membership.role)) redirect(`/painel/${slug}`);
  const [barber] = await db
    .select()
    .from(barbers)
    .where(and(eq(barbers.orgId, org.id), eq(barbers.userId, user.id)))
    .limit(1);
  return { user, org, role: membership.role, barber: barber ?? null };
});
