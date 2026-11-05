"use client";

import { useActionState } from "react";
import { Field, FormMessage, Input, Select, SubmitButton } from "@/components/ui";
import type { Service } from "@/db/schema";
import { saveService } from "./actions";

export function ServiceForm({ slug, service }: { slug: string; service?: Service }) {
  const [state, action] = useActionState(saveService, undefined);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-[1fr_110px_120px]">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="id" value={service?.id ?? ""} />
      <Field label="Serviço">
        <Input name="name" defaultValue={service?.name} required placeholder="Corte" />
      </Field>
      <Field label="Duração (min)">
        <Input name="durationMin" type="number" min={5} max={480} step={5} defaultValue={service?.durationMin ?? 30} required />
      </Field>
      <Field label="Preço (R$)">
        <Input
          name="price"
          inputMode="decimal"
          defaultValue={service ? (service.priceCents / 100).toFixed(2).replace(".", ",") : ""}
          placeholder="50,00"
          required
        />
      </Field>
      <Field label="Descrição" className="sm:col-span-2">
        <Input name="description" defaultValue={service?.description ?? ""} placeholder="Opcional" maxLength={200} />
      </Field>
      {service ? (
        <Field label="Status">
          <Select name="active" defaultValue={service.active ? "1" : "0"}>
            <option value="1">Ativo</option>
            <option value="0">Oculto</option>
          </Select>
        </Field>
      ) : (
        <div />
      )}
      <div className="flex flex-wrap items-center gap-3 sm:col-span-3">
        <SubmitButton size="sm" variant={service ? "primary" : "accent"}>{service ? "Salvar" : "Adicionar serviço"}</SubmitButton>
        <div className="empty:hidden">
          <FormMessage state={state} />
        </div>
      </div>
    </form>
  );
}
