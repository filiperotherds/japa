"use client";

import { useActionState, useState } from "react";
import { Field, FormMessage, Input, SubmitButton } from "@/components/ui";
import { createOrg } from "./actions";

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " e ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

export function CreateOrgForm({ host }: { host: string }) {
  const [state, action] = useActionState(createOrg, undefined);
  const [name, setName] = useState(state?.fields?.name ?? "");
  const [slug, setSlug] = useState(state?.fields?.slug ?? "");
  const [touched, setTouched] = useState(false);
  const shown = touched ? slug : slugify(name);

  return (
    <form action={action} className="space-y-5">
      <Field label="Nome da barbearia">
        <Input name="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} placeholder="Barbearia do Zé" />
      </Field>
      <Field label="Endereço da página" hint={`${host}/${shown || "sua-barbearia"}`}>
        <Input
          name="slug"
          value={shown}
          onChange={(e) => {
            setTouched(true);
            setSlug(slugify(e.target.value));
          }}
          maxLength={48}
        />
      </Field>
      <Field label="Cidade">
        <Input name="city" defaultValue={state?.fields?.city} placeholder="Belo Horizonte, MG" />
      </Field>
      <label className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4">
        <input type="checkbox" name="iCut" defaultChecked className="mt-1 h-5 w-5 accent-ink" />
        <span>
          <span className="block font-semibold">Eu também corto</span>
          <span className="text-sm text-ink-2">Cria seu perfil de barbeiro com agenda própria. Dá para mudar depois.</span>
        </span>
      </label>
      <FormMessage state={state} />
      <SubmitButton size="lg" className="w-full" pending="Abrindo as portas…">
        Criar barbearia
      </SubmitButton>
    </form>
  );
}
