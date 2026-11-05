import "server-only";
import { and, eq, like } from "drizzle-orm";
import type { DB } from "@/db";
import { barbers, workingHours } from "@/db/schema";
import { slugify } from "./tenant";

type Tx = Parameters<Parameters<DB["transaction"]>[0]>[0];

/** Cria o perfil de barbeiro com @handle único na barbearia e expediente padrão (ter–sáb). */
export async function createBarberProfile(tx: Tx | DB, orgId: string, user: { id: string; name: string }) {
  const base = slugify(user.name.split(" ")[0] ?? "") || "barbeiro";
  const taken = new Set(
    (
      await tx
        .select({ handle: barbers.handle })
        .from(barbers)
        .where(and(eq(barbers.orgId, orgId), like(barbers.handle, `${base}%`)))
    ).map((r) => r.handle),
  );
  let handle = base;
  for (let i = 2; taken.has(handle); i++) handle = `${base}-${i}`;

  const [barber] = await tx
    .insert(barbers)
    .values({ orgId, userId: user.id, handle, displayName: user.name })
    .returning();
  await tx.insert(workingHours).values(
    [2, 3, 4, 5, 6].flatMap((weekday) => [
      { barberId: barber.id, weekday, startMin: 9 * 60, endMin: 12 * 60 },
      { barberId: barber.id, weekday, startMin: 13 * 60, endMin: 19 * 60 },
    ]),
  );
  return barber;
}
