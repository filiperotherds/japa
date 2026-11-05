import Link from "next/link";
import { requireMember } from "@/lib/tenant";
import { signOut } from "@/app/(auth)/actions";
import { Logo } from "@/components/logo";
import { PanelNav } from "./panel-nav";

export const metadata = { title: "Painel" };

export default async function PanelLayout({ children, params }: LayoutProps<"/painel/[slug]">) {
  const { slug } = await params;
  const { org, role, barber, user } = await requireMember(slug);
  const base = `/painel/${slug}`;
  const items = [
    { href: base, label: "Agenda" },
    ...(barber
      ? [
          { href: `${base}/perfil`, label: "Meu perfil" },
          { href: `${base}/horarios`, label: "Meus horários" },
        ]
      : []),
    ...(role === "owner"
      ? [
          { href: `${base}/equipe`, label: "Equipe" },
          { href: `${base}/servicos`, label: "Serviços" },
          { href: `${base}/barbearia`, label: "Barbearia" },
        ]
      : []),
  ];

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="border-b border-line bg-night text-paper lg:sticky lg:top-0 lg:h-dvh lg:border-b-0">
        <div className="flex h-full flex-col gap-4 p-4 lg:p-5">
          <div className="flex items-center justify-between gap-3">
            <Link href="/painel" aria-label="Painel">
              <Logo className="text-paper [--logo-handle:var(--color-night)]" />
            </Link>
            <Link href={`/${slug}`} className="text-xs text-paper/60 underline underline-offset-4 hover:text-paper lg:hidden">
              Ver página
            </Link>
          </div>
          <div className="rounded-xl bg-white/5 px-3 py-2.5">
            <p className="truncate text-sm font-semibold">{org.name}</p>
            <p className="text-xs text-paper/50">{role === "owner" ? "Dono" : "Barbeiro"} · {user.name.split(" ")[0]}</p>
          </div>
          <PanelNav items={items} />
          <div className="mt-auto hidden space-y-1 text-sm lg:block">
            <Link href={`/${slug}`} target="_blank" className="block rounded-lg px-3 py-2 text-paper/70 hover:bg-white/5 hover:text-paper">
              Ver página pública ↗
            </Link>
            <form action={signOut}>
              <button className="w-full rounded-lg px-3 py-2 text-left text-paper/70 hover:bg-white/5 hover:text-paper">Sair</button>
            </form>
          </div>
        </div>
      </aside>
      <div className="min-w-0 px-4 py-8 sm:px-8 lg:py-10">{children}</div>
    </div>
  );
}
