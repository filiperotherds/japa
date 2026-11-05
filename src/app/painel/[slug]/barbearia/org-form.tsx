"use client";

import { useActionState } from "react";
import { Field, FormMessage, Input, Select, SubmitButton, Textarea } from "@/components/ui";
import type { Organization } from "@/db/schema";
import { saveOrg } from "./actions";

export function OrgForm({ org }: { org: Organization }) {
  const [state, action] = useActionState(saveOrg, undefined);
  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="slug" value={org.slug} />
      <section className="space-y-4 rounded-3xl border border-line bg-white p-5 sm:p-6">
        <h2 className="font-display text-3xl">Página pública</h2>
        <Field label="Nome">
          <Input name="name" defaultValue={org.name} required maxLength={80} />
        </Field>
        <Field label="Sobre a barbearia">
          <Textarea name="description" defaultValue={org.description ?? ""} maxLength={600} rows={3} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Endereço">
            <Input name="address" defaultValue={org.address ?? ""} />
          </Field>
          <Field label="Cidade">
            <Input name="city" defaultValue={org.city ?? ""} placeholder="São Paulo, SP" />
          </Field>
          <Field label="Telefone">
            <Input name="phone" defaultValue={org.phone ?? ""} />
          </Field>
          <Field label="Instagram da barbearia">
            <Input name="instagram" defaultValue={org.instagram ? `@${org.instagram}` : ""} placeholder="@suabarbearia" />
          </Field>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-line bg-white p-5 sm:p-6">
        <h2 className="font-display text-3xl">Regras da agenda</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Grade de horários" hint="De quanto em quanto tempo os horários começam.">
            <Select name="slotMinutes" defaultValue={String(org.slotMinutes)}>
              {[10, 15, 20, 30, 60].map((n) => (
                <option key={n} value={n}>
                  A cada {n} min
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Antecedência mínima (min)" hint="Evita reserva para daqui a 5 minutos.">
            <Input name="minLeadMinutes" type="number" min={0} max={2880} defaultValue={org.minLeadMinutes} />
          </Field>
          <Field label="Abrir agenda para os próximos (dias)">
            <Input name="bookingWindowDays" type="number" min={7} max={180} defaultValue={org.bookingWindowDays} />
          </Field>
          <Field label="Cliente pode cancelar até (horas antes)">
            <Input name="cancelHours" type="number" min={0} max={72} defaultValue={org.cancelHours} />
          </Field>
        </div>
      </section>

      <div className="space-y-3">
        <FormMessage state={state} />
        <SubmitButton>Salvar</SubmitButton>
      </div>
    </form>
  );
}
