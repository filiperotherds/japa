// Motor de disponibilidade. Puro (sem I/O): roda no servidor para validar a reserva
// e no navegador para desenhar a agenda quando o cliente troca de serviço.

export type Interval = { start: number; end: number };

export type AgendaDay = {
  date: string; // YYYY-MM-DD no fuso da barbearia
  open: Interval[]; // expediente
  busy: Interval[]; // reservas e bloqueios
};

export type AgendaRules = {
  slotMinutes: number;
  earliest: number; // agora + antecedência mínima
  latest: number; // fim da janela de reservas
};

export const overlaps = (a: Interval, b: Interval) => a.start < b.end && b.start < a.end;

/** Horários de início em que um serviço de `durationMin` cabe inteiro, sem conflito. */
export function bookableStarts(day: AgendaDay, durationMin: number, rules: AgendaRules) {
  const step = rules.slotMinutes * 60_000;
  const dur = durationMin * 60_000;
  const starts: number[] = [];
  for (const win of day.open) {
    for (let t = win.start; t + dur <= win.end; t += step) {
      if (t < rules.earliest || t > rules.latest) continue;
      const slot = { start: t, end: t + dur };
      if (day.busy.some((b) => overlaps(slot, b))) continue;
      starts.push(t);
    }
  }
  return starts;
}

export type GridCell = { start: number; state: "free" | "busy" | "past" };

/** Grade fixa (de `slotMinutes`) dentro do expediente, para a visão da agenda inteira. */
export function gridCells(day: AgendaDay, rules: AgendaRules, now: number): GridCell[] {
  const step = rules.slotMinutes * 60_000;
  const cells: GridCell[] = [];
  for (const win of day.open) {
    for (let t = win.start; t + step <= win.end; t += step) {
      const slot = { start: t, end: t + step };
      const state = day.busy.some((b) => overlaps(slot, b)) ? "busy" : t < now ? "past" : "free";
      cells.push({ start: t, state });
    }
  }
  return cells;
}

/** Junta reservas encostadas/sobrepostas para exibir blocos "Ocupado" contínuos. */
export function mergeIntervals(list: Interval[]) {
  const sorted = [...list].sort((a, b) => a.start - b.start);
  const out: Interval[] = [];
  for (const i of sorted) {
    const last = out[out.length - 1];
    if (last && i.start <= last.end) last.end = Math.max(last.end, i.end);
    else out.push({ ...i });
  }
  return out;
}
