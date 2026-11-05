"use client";

import { useActionState } from "react";
import { Field, FormMessage, Input, Select, SubmitButton } from "@/components/ui";
import { addBlock } from "./actions";

export function BlockForm({ slug, day, barbers }: { slug: string; day: string; barbers: { id: string; name: string }[] }) {
  const [state, action] = useActionState(addBlock, undefined);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="slug" value={slug} />
      {barbers.length > 1 ? (
        <Field label="Barbeiro" className="sm:col-span-2">
          <Select name="barberId" required>
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </Field>
      ) : (
        <input type="hidden" name="barberId" value={barbers[0].id} />
      )}
      <Field label="Dia">
        <Input type="date" name="date" defaultValue={day} required />
      </Field>
      <Field label="Motivo">
        <Input name="note" placeholder="Almoço, folga…" maxLength={120} />
      </Field>
      <Field label="Das">
        <Input type="time" name="start" step={300} required />
      </Field>
      <Field label="Até">
        <Input type="time" name="end" step={300} required />
      </Field>
      <div className="space-y-3 sm:col-span-2">
        <FormMessage state={state} />
        <SubmitButton>Bloquear</SubmitButton>
      </div>
    </form>
  );
}
