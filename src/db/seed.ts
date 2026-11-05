import type { DB } from "./index";
import * as s from "./schema";
import { hashPassword } from "../lib/auth/password";
import { addDaysISO, localDateISO, weekdayOfISO, zonedToMs } from "../lib/time";

// Barbearia de demonstração. Todas as contas usam a senha DEMO_PASSWORD.
export const DEMO_PASSWORD = "demo1234";
const TZ = "America/Sao_Paulo";

export async function seed(db: DB) {
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  // "Cliente Demo" fica de fora da agenda gerada para poder testar reservas
  const [rafa, diego, jonas, , ...clients] = await db
    .insert(s.users)
    .values([
      { name: "Rafael Nogueira", email: "rafa@example.com", passwordHash },
      { name: "Diego Almeida", email: "diego@example.com", passwordHash },
      { name: "Jonas Pereira", email: "jonas@example.com", passwordHash },
      { name: "Cliente Demo", email: "cliente@example.com", phone: "(11) 90000-0000", passwordHash },
      { name: "Bruno Costa", email: "bruno@example.com", passwordHash },
      { name: "Lucas Martins", email: "lucas@example.com", passwordHash },
      { name: "Thiago Rocha", email: "thiago@example.com", passwordHash },
    ])
    .returning();

  const [org] = await db
    .insert(s.organizations)
    .values({
      slug: "casa-brava",
      name: "Casa Brava Barbearia",
      description:
        "Barbearia de bairro desde 2016. Corte clássico, degradê na navalha e barba com toalha quente. Café passado na hora, sempre.",
      address: "Rua Augusta, 1200",
      city: "São Paulo, SP",
      phone: "(11) 3000-0000",
      instagram: "demo.casabrava",
      timezone: TZ,
    })
    .returning();

  await db.insert(s.memberships).values([
    { orgId: org.id, userId: rafa.id, role: "owner" },
    { orgId: org.id, userId: diego.id, role: "barber" },
    { orgId: org.id, userId: jonas.id, role: "barber" },
  ]);

  const svc = await db
    .insert(s.services)
    .values([
      { orgId: org.id, name: "Corte", durationMin: 40, priceCents: 5000, sort: 1, description: "Tesoura ou máquina, lavagem e finalização." },
      { orgId: org.id, name: "Degradê na navalha", durationMin: 50, priceCents: 6000, sort: 2, description: "Fade com acabamento na navalha." },
      { orgId: org.id, name: "Barba", durationMin: 30, priceCents: 3500, sort: 3, description: "Toalha quente, navalha e balm." },
      { orgId: org.id, name: "Corte + Barba", durationMin: 60, priceCents: 8000, sort: 4, description: "O combo completo." },
      { orgId: org.id, name: "Pigmentação", durationMin: 30, priceCents: 4000, sort: 5 },
      { orgId: org.id, name: "Sobrancelha", durationMin: 15, priceCents: 1500, sort: 6 },
    ])
    .returning();

  const team = await db
    .insert(s.barbers)
    .values([
      {
        orgId: org.id,
        userId: rafa.id,
        handle: "rafa",
        displayName: "Rafa Nogueira",
        bio: "Fundador da Casa Brava. 10 anos de tesoura, especialista em corte clássico e barba desenhada. Atendo com hora marcada.",
        instagram: "demo.rafa.casabrava",
        specialties: ["Corte clássico", "Barba", "Navalha"],
        since: 2014,
      },
      {
        orgId: org.id,
        userId: diego.id,
        handle: "diego",
        displayName: "Diego Almeida",
        bio: "Degradê é comigo. Fade do zero ao alto, freestyle e desenho. Manda referência no direct.",
        instagram: "demo.diego.fade",
        specialties: ["Degradê", "Freestyle", "Pigmentação"],
        since: 2018,
      },
      {
        orgId: org.id,
        userId: jonas.id,
        handle: "jonas",
        displayName: "Jonas Pereira",
        bio: "Cabelo crespo e cacheado, corte infantil e platinado. Paciência de sobra pra primeira vez.",
        instagram: "demo.jonas.crespo",
        specialties: ["Crespo e cacheado", "Infantil", "Platinado"],
        since: 2020,
      },
    ])
    .returning();

  const hm = (h: number, m = 0) => h * 60 + m;
  const schedule: Record<number, [number, number][]> = {
    0: [[hm(9), hm(12)], [hm(13), hm(19)]], // rafa: ter–sáb
    1: [[hm(10), hm(14)], [hm(15), hm(20)]], // diego: seg–sex
    2: [[hm(9), hm(13)], [hm(14), hm(18)]], // jonas: qua–dom
  };
  const days: Record<number, number[]> = { 0: [2, 3, 4, 5, 6], 1: [1, 2, 3, 4, 5], 2: [0, 3, 4, 5, 6] };
  await db.insert(s.workingHours).values(
    team.flatMap((b, i) =>
      days[i].flatMap((weekday) =>
        schedule[i].map(([startMin, endMin]) => ({ barberId: b.id, weekday, startMin, endMin })),
      ),
    ),
  );

  // Agenda semi-cheia nos próximos 10 dias (PRNG determinístico).
  let state = 42;
  const rand = () => ((state = (state * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
  const today = localDateISO(Date.now(), TZ);
  const rows: (typeof s.appointments.$inferInsert)[] = [];
  for (let d = -3; d < 10; d++) {
    const date = addDaysISO(today, d);
    const weekday = weekdayOfISO(date);
    team.forEach((b, i) => {
      if (!days[i].includes(weekday)) return;
      for (const [startMin, endMin] of schedule[i]) {
        for (let t = startMin; t + 30 <= endMin; t += 30) {
          if (rand() > 0.42) continue;
          const service = svc[Math.floor(rand() * 4)];
          const end = t + service.durationMin;
          if (end > endMin) continue;
          rows.push({
            orgId: org.id,
            barberId: b.id,
            clientId: clients[Math.floor(rand() * clients.length)].id,
            serviceId: service.id,
            serviceName: service.name,
            priceCents: service.priceCents,
            startsAt: new Date(zonedToMs(date, t, TZ)),
            endsAt: new Date(zonedToMs(date, end, TZ)),
          });
          t = Math.ceil(end / 30) * 30 - 30;
        }
      }
    });
  }
  await db.insert(s.appointments).values(rows);
}
