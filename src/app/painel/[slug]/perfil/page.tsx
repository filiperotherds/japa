import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { barberPhotos } from "@/db/schema";
import { requireMember } from "@/lib/tenant";
import { buttonClass } from "@/components/styles";
import { deletePhoto } from "./actions";
import { PhotoForm, ProfileForm } from "./forms";

export default async function ProfilePage({ params }: PageProps<"/painel/[slug]/perfil">) {
  const { slug } = await params;
  const { barber } = await requireMember(slug);
  if (!barber) redirect(`/painel/${slug}`);
  const photos = await db.select().from(barberPhotos).where(eq(barberPhotos.barberId, barber.id)).orderBy(desc(barberPhotos.createdAt));
  const host = (await headers()).get("host") ?? "";

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-2">Meu perfil</p>
          <h1 className="font-display text-5xl leading-none sm:text-6xl">Sua vitrine</h1>
          <p className="mt-2 text-ink-2">É isso que o cliente vê antes de reservar com você.</p>
        </div>
        <Link href={`/${slug}/${barber.handle}`} target="_blank" className={buttonClass({ variant: "outline", size: "sm" })}>
          Ver como cliente ↗
        </Link>
      </header>

      <section className="rounded-3xl border border-line bg-white p-5 sm:p-6">
        <ProfileForm slug={slug} barber={barber} origin={host} />
      </section>

      <section className="mt-8 rounded-3xl border border-line bg-white p-5 sm:p-6">
        <h2 className="font-display text-3xl">Portfólio</h2>
        <p className="mb-4 text-sm text-ink-2">Seus melhores cortes, em grade, como no Instagram.</p>
        <PhotoForm slug={slug} />
        {photos.length > 0 && (
          <ul className="mt-6 grid grid-cols-3 gap-2">
            {photos.map((p) => (
              <li key={p.id} className="group relative aspect-square overflow-hidden rounded-lg bg-paper-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.caption ?? ""} className="h-full w-full object-cover" />
                <form action={deletePhoto} className="absolute top-1.5 right-1.5">
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="id" value={p.id} />
                  <button
                    aria-label="Apagar foto"
                    className="grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white opacity-100 transition hover:bg-pole sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    ×
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
