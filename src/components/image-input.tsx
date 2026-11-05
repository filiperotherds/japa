"use client";

import { useId, useState, type ReactNode } from "react";

// Reduz a foto no navegador (fotos de celular passam fácil de 5 MB) antes de enviar.
async function downscale(file: File, max: number): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
  if (!blob || blob.size >= file.size) return file;
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
}

export function ImageInput({
  name,
  max = 1600,
  children,
  onReady,
}: {
  name: string;
  max?: number;
  children: (state: { preview: string | null; busy: boolean; pick: () => void }) => ReactNode;
  onReady?: () => void;
}) {
  const id = useId();
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const pick = () => document.getElementById(id)?.click();

  return (
    <>
      <input
        id={id}
        type="file"
        name={name}
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={async (e) => {
          const input = e.currentTarget;
          const file = input.files?.[0];
          if (!file) return;
          setBusy(true);
          const small = await downscale(file, max);
          const dt = new DataTransfer();
          dt.items.add(small);
          input.files = dt.files;
          setPreview(URL.createObjectURL(small));
          setBusy(false);
          onReady?.();
        }}
      />
      {children({ preview, busy, pick })}
    </>
  );
}
