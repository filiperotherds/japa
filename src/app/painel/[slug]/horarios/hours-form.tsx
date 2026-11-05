"use client";

import { useActionState, useState } from "react";
import { cx, FormMessage, Input, SubmitButton } from "@/components/ui";
import { fmtMinutes, WEEKDAYS } from "@/lib/time";
import { saveHours } from "./actions";

type Range = { startMin: number; endMin: number };
const ORDER = [1, 2, 3, 4, 5, 6, 0]; // semana começa na segunda

export function HoursForm({ slug, initial }: { slug: string; initial: Record<number, Range[]> }) {
  const [state, action] = useActionState(saveHours, undefined);
  const [on, setOn] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(ORDER.map((wd) => [wd, (initial[wd]?.length ?? 0) > 0])),
  );
  const val = (wd: number, i: number, k: keyof Range) => {
    const r = initial[wd]?.[i];
    return r ? fmtMinutes(r[k]) : "";
  };

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="slug" value={slug} />
      <ul className="divide-y divide-line rounded-3xl border border-line bg-white">
        {ORDER.map((wd) => (
          <li key={wd} className="grid gap-3 p-4 sm:grid-cols-[140px_1fr] sm:items-center">
            <label className="flex items-center gap-3 font-semibold">
              <input
                type="checkbox"
                name={`d${wd}_on`}
                checked={on[wd]}
                onChange={(e) => setOn((s) => ({ ...s, [wd]: e.target.checked }))}
                className="h-5 w-5 accent-ink"
              />
              {WEEKDAYS[wd]}
            </label>
            <div className={cx("flex flex-wrap items-center gap-2", !on[wd] && "pointer-events-none opacity-35")}>
              <div className="w-[7.5rem]"><Input type="time" name={`d${wd}_s1`} defaultValue={val(wd, 0, "startMin") || "09:00"} aria-label="Início" /></div>
              <span className="text-ink-2">–</span>
              <div className="w-[7.5rem]"><Input type="time" name={`d${wd}_e1`} defaultValue={val(wd, 0, "endMin") || "12:00"} aria-label="Fim" /></div>
              <span className="px-1 text-xs text-ink-2">e</span>
              <div className="w-[7.5rem]"><Input type="time" name={`d${wd}_s2`} defaultValue={val(wd, 1, "startMin") || (initial[wd]?.length ? "" : "13:00")} aria-label="Início do 2º turno" /></div>
              <span className="text-ink-2">–</span>
              <div className="w-[7.5rem]"><Input type="time" name={`d${wd}_e2`} defaultValue={val(wd, 1, "endMin") || (initial[wd]?.length ? "" : "19:00")} aria-label="Fim do 2º turno" /></div>
              {!on[wd] && <span className="text-sm text-ink-2">Folga</span>}
            </div>
          </li>
        ))}
      </ul>
      <p className="text-sm text-ink-2">O intervalo entre os dois turnos (almoço) aparece como fechado na agenda. Deixe o 2º turno vazio para um turno só.</p>
      <FormMessage state={state} />
      <SubmitButton>Salvar horários</SubmitButton>
    </form>
  );
}
