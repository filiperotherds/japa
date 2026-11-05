import "server-only";
import { and, asc, eq, gt, inArray, lt } from "drizzle-orm";
import { db } from "@/db";
import { appointments, workingHours, type Organization } from "@/db/schema";
import { addDaysISO, localDateISO, weekdayOfISO, zonedToMs } from "./time";
import type { AgendaDay, AgendaRules } from "./slots";

type OrgRules = Pick<
  Organization,
  "timezone" | "slotMinutes" | "minLeadMinutes" | "bookingWindowDays"
>;

export function agendaRules(org: OrgRules, now = Date.now()): AgendaRules {
  const today = localDateISO(now, org.timezone);
  return {
    slotMinutes: org.slotMinutes,
    earliest: now + org.minLeadMinutes * 60_000,
    latest: zonedToMs(addDaysISO(today, org.bookingWindowDays + 1), 0, org.timezone),
  };
}

/** Expediente e ocupação de um barbeiro por `days` dias a partir de `fromISO`. */
export async function loadAgenda(
  org: OrgRules,
  barberId: string,
  fromISO: string,
  days: number,
): Promise<AgendaDay[]> {
  const tz = org.timezone;
  const rangeStart = zonedToMs(fromISO, 0, tz);
  const rangeEnd = zonedToMs(addDaysISO(fromISO, days), 0, tz);

  const [hours, busy] = await Promise.all([
    db
      .select()
      .from(workingHours)
      .where(eq(workingHours.barberId, barberId))
      .orderBy(asc(workingHours.startMin)),
    db
      .select({ start: appointments.startsAt, end: appointments.endsAt })
      .from(appointments)
      .where(
        and(
          eq(appointments.barberId, barberId),
          inArray(appointments.status, ["confirmed"]),
          lt(appointments.startsAt, new Date(rangeEnd)),
          gt(appointments.endsAt, new Date(rangeStart)),
        ),
      ),
  ]);

  return Array.from({ length: days }, (_, i) => {
    const date = addDaysISO(fromISO, i);
    const weekday = weekdayOfISO(date);
    const dayStart = zonedToMs(date, 0, tz);
    const dayEnd = zonedToMs(addDaysISO(date, 1), 0, tz);
    return {
      date,
      open: hours
        .filter((h) => h.weekday === weekday)
        .map((h) => ({
          start: zonedToMs(date, h.startMin, tz),
          end: zonedToMs(date, h.endMin, tz),
        })),
      busy: busy
        .map((b) => ({ start: b.start.getTime(), end: b.end.getTime() }))
        .filter((b) => b.start < dayEnd && b.end > dayStart),
    };
  });
}
