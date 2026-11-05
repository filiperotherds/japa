"use client";

import { useState } from "react";
import { cx } from "@/components/ui";

const TABS = [
  {
    key: "barbeiros",
    label: "Barbeiros",
    color: "text-cream",
    lead: "Sua agenda, seu perfil, seu Instagram.",
    points: [
      "Perfil com bio, especialidades, portfólio e botão pro seu Instagram",
      "Você define seus turnos e bloqueia folgas em dois toques",
      "Vê nome, serviço, WhatsApp e recado de cada cliente",
      "Um link só seu pra colocar na bio",
    ],
  },
  {
    key: "donos",
    label: "Donos",
    color: "text-pole",
    lead: "A casa inteira numa tela.",
    points: [
      "Convide barbeiros por link, sem cadastro manual",
      "Agenda do dia de todos os barbeiros lado a lado",
      "Serviços, preços, antecedência e regra de cancelamento",
      "Pause um barbeiro sem perder o histórico",
    ],
  },
  {
    key: "clientes",
    label: "Clientes",
    color: "text-sky",
    lead: "Vê, escolhe, reserva. Sem esperar resposta.",
    points: [
      "A agenda completa do barbeiro: livre, ocupado e fechado",
      "Escolhe o serviço e só aparecem horários que cabem",
      "Uma conta vale pra qualquer barbearia do Navalha",
      "Cancela pelo celular dentro do prazo da casa",
    ],
  },
];

export function AudienceTabs() {
  const [active, setActive] = useState(0);
  const tab = TABS[active];
  return (
    <div>
      <p className="mb-2 font-mono text-xs uppercase tracking-[0.25em] text-paper/50">Feito pra</p>
      <div role="tablist" className="flex flex-wrap gap-x-6 gap-y-1">
        {TABS.map((t, i) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={cx(
              "font-display text-[clamp(52px,10vw,132px)] leading-[0.9] transition-colors",
              i === active ? t.color : "text-paper/15 hover:text-paper/35",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="mt-10 grid gap-8 border-t border-white/10 pt-8 md:grid-cols-[1fr_1.4fr]">
        <p className="font-display text-4xl leading-[0.95] sm:text-5xl">{tab.lead}</p>
        <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {tab.points.map((p, i) => (
            <li key={p} className="flex gap-3 text-paper/80">
              <span className="font-mono text-xs text-paper/40">0{i + 1}</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
