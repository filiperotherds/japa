"use client";

import { useActionState, useState } from "react";
import { Avatar } from "@/components/avatar";
import { ImageInput } from "@/components/image-input";
import { Button, Field, FormMessage, Input, SubmitButton, Textarea } from "@/components/ui";
import type { Barber } from "@/db/schema";
import { addPhoto, saveProfile } from "./actions";

export function ProfileForm({ slug, barber, origin }: { slug: string; barber: Barber; origin: string }) {
  const [state, action] = useActionState(saveProfile, undefined);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="slug" value={slug} />
      <ImageInput name="avatar" max={600}>
        {({ preview, busy, pick }) => (
          <div className="flex items-center gap-4">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <Avatar name={barber.displayName} src={barber.avatarUrl} size={80} />
            )}
            <Button type="button" variant="outline" size="sm" onClick={pick} disabled={busy}>
              {busy ? "Preparando…" : "Trocar foto"}
            </Button>
          </div>
        )}
      </ImageInput>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome no perfil">
          <Input name="displayName" defaultValue={barber.displayName} required maxLength={60} />
        </Field>
        <Field label="Endereço do perfil" hint={`${origin}/${slug}/${barber.handle}`}>
          <Input name="handle" defaultValue={barber.handle} required maxLength={40} />
        </Field>
      </div>
      <Field label="Instagram" hint="Aparece como botão no seu perfil. Pode colar o link ou escrever @seuperfil.">
        <Input name="instagram" defaultValue={barber.instagram ? `@${barber.instagram}` : ""} placeholder="@seuperfil" />
      </Field>
      <Field label="Bio">
        <Textarea name="bio" defaultValue={barber.bio ?? ""} maxLength={500} rows={4} placeholder="Seu estilo, o que você faz melhor, como prefere receber referências…" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
        <Field label="Especialidades" hint="Separe por vírgula. Ex.: Degradê, Barba, Freestyle">
          <Input name="specialties" defaultValue={barber.specialties.join(", ")} />
        </Field>
        <Field label="Corta desde">
          <Input name="since" type="number" min={1950} max={new Date().getFullYear()} defaultValue={barber.since ?? ""} placeholder="2018" />
        </Field>
      </div>
      <FormMessage state={state} />
      <SubmitButton>Salvar perfil</SubmitButton>
    </form>
  );
}

export function PhotoForm({ slug }: { slug: string }) {
  // nonce remonta o seletor após publicar, limpando a prévia
  const [nonce, setNonce] = useState(0);
  const [state, action] = useActionState(async (prev: Awaited<ReturnType<typeof addPhoto>>, fd: FormData) => {
    const res = await addPhoto(prev, fd);
    if (res?.ok) setNonce((n) => n + 1);
    return res;
  }, undefined);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="slug" value={slug} />
      <ImageInput key={nonce} name="photo">
        {({ preview, busy, pick }) => (
          <div className="flex flex-wrap items-end gap-3">
            <button
              type="button"
              onClick={pick}
              className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-dashed border-line bg-paper text-sm text-ink-2 hover:border-ink"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="h-full w-full object-cover" />
              ) : busy ? (
                "…"
              ) : (
                "+ Foto"
              )}
            </button>
            <div className="min-w-48 flex-1 space-y-3">
              <Input name="caption" placeholder="Legenda (opcional)" maxLength={120} />
              <SubmitButton size="sm" disabled={!preview} pending="Enviando…">
                Publicar no portfólio
              </SubmitButton>
            </div>
          </div>
        )}
      </ImageInput>
      <FormMessage state={state} />
    </form>
  );
}
