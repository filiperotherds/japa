import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
export const MAX_IMAGE_BYTES = 3.5 * 1024 * 1024;

export function validateImage(file: unknown): string | null {
  if (!(file instanceof File) || file.size === 0) return "Escolha uma imagem.";
  if (!TYPES[file.type]) return "Use JPG, PNG ou WEBP.";
  if (file.size > MAX_IMAGE_BYTES) return "Imagem muito grande (máx. 3,5 MB).";
  return null;
}

/**
 * Produção: Vercel Blob (BLOB_READ_WRITE_TOKEN, criado ao conectar um Blob store ao projeto).
 * Dev sem token: grava em public/uploads.
 */
export async function saveImage(file: File, folder: string) {
  const name = `${folder}/${randomUUID()}.${TYPES[file.type]}`;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(name, file, { access: "public", contentType: file.type });
    return blob.url;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("Configure um Vercel Blob store (BLOB_READ_WRITE_TOKEN) para enviar imagens.");
  }
  const dest = path.join(process.cwd(), "public", "uploads", name);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

export async function deleteImage(url: string | null | undefined) {
  if (!url || !process.env.BLOB_READ_WRITE_TOKEN || !url.startsWith("https://")) return;
  const { del } = await import("@vercel/blob");
  await del(url).catch(() => {});
}
