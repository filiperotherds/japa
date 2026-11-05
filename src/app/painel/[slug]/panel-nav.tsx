"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/components/ui";

export function PanelNav({ items }: { items: { href: string; label: string }[] }) {
  const path = usePathname();
  return (
    <nav className="-mx-1 flex gap-1 overflow-x-auto [scrollbar-width:none] lg:mx-0 lg:flex-col">
      {items.map((it, i) => {
        const active = i === 0 ? path === it.href : path.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cx(
              "shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition",
              active ? "bg-paper text-ink" : "text-paper/70 hover:bg-white/5 hover:text-paper",
            )}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
