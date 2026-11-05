import Link from "next/link";
import { Logo } from "@/components/logo";
import { buttonClass } from "@/components/styles";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-night px-4 text-paper">
      <div className="text-center">
        <Link href="/" aria-label="Navalha, início">
          <Logo className="text-paper [--logo-handle:var(--color-night)]" />
        </Link>
        <p className="mt-10 font-display text-[clamp(96px,20vw,220px)] leading-[0.8] text-pole">404</p>
        <p className="mt-4 font-display text-4xl">Cadeira vazia por aqui.</p>
        <p className="mt-2 text-paper/60">Essa página (ou barbearia) não existe.</p>
        <Link href="/" className={`${buttonClass({ variant: "accent" })} mt-8`}>
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
