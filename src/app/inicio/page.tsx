import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { memberships } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";

// Destino padrão pós-login: equipe vai para o painel, cliente para as reservas.
export default async function HomeRedirect() {
  const user = await requireUser();
  const [m] = await db.select({ id: memberships.id }).from(memberships).where(eq(memberships.userId, user.id)).limit(1);
  redirect(m ? "/painel" : "/minhas-reservas");
}
