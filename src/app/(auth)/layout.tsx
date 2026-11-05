import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_minmax(0,560px)]">
      <aside className="relative hidden overflow-hidden bg-night text-paper lg:block">
        <div className="pole-stripes absolute inset-y-0 left-0 w-3" />
        <div className="flex h-full flex-col justify-between p-12">
          <Link href="/" aria-label="Navalha, início">
            <Logo className="text-paper" />
          </Link>
          <p className="font-display text-[clamp(56px,6vw,96px)] leading-[0.85]">
            A cadeira
            <br />
            certa,
            <br />
            <span className="text-pole">na hora certa.</span>
          </p>
          <p className="max-w-sm text-sm text-paper/60">
            Veja a agenda inteira do seu barbeiro, escolha um horário livre e pronto. Sem áudio no WhatsApp.
          </p>
        </div>
      </aside>
      <main className="flex flex-col px-4 py-8 sm:px-10">
        <Link href="/" className="lg:hidden" aria-label="Navalha, início">
          <Logo />
        </Link>
        <div className="m-auto w-full max-w-sm py-10">{children}</div>
      </main>
    </div>
  );
}
