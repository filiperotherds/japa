import Link from "next/link";
import { getUser } from "@/lib/auth/session";
import { signOut } from "@/app/(auth)/actions";
import { Logo } from "./logo";
import { buttonClass } from "./styles";

export async function SiteHeader({ next }: { next?: string }) {
  const user = await getUser();
  const qs = next ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Navalha, início">
          <Logo />
        </Link>
        {user ? (
          <nav className="flex items-center gap-1 text-sm">
            <Link href="/minhas-reservas" className={buttonClass({ variant: "ghost", size: "sm" })}>
              Minhas reservas
            </Link>
            <Link href="/painel" className={`${buttonClass({ variant: "ghost", size: "sm" })} max-sm:hidden`}>
              Painel
            </Link>
            <form action={signOut}>
              <button className={buttonClass({ variant: "outline", size: "sm" })}>Sair</button>
            </form>
          </nav>
        ) : (
          <nav className="flex items-center gap-2">
            <Link href={`/entrar${qs}`} className={buttonClass({ variant: "ghost", size: "sm" })}>
              Entrar
            </Link>
            <Link href={`/cadastro${qs}`} className={buttonClass({ size: "sm" })}>
              Criar conta
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
