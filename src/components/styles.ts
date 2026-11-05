// Utilitários de classe compartilhados entre Server e Client Components.

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

const btn = {
  base: "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
  size: { sm: "h-9 px-4 text-sm", md: "h-11 px-5 text-[15px]", lg: "h-13 px-7 text-base" },
  variant: {
    primary: "bg-ink text-paper hover:bg-ink/85",
    accent: "bg-pole text-white hover:bg-pole/90",
    outline: "border border-ink/20 bg-transparent text-ink hover:border-ink hover:bg-ink/5",
    ghost: "text-ink hover:bg-ink/5",
    danger: "text-pole hover:bg-pole/10",
  },
};

export type BtnProps = { variant?: keyof typeof btn.variant; size?: keyof typeof btn.size };

export function buttonClass({ variant = "primary", size = "md" }: BtnProps = {}) {
  return cx(btn.base, btn.size[size], btn.variant[variant]);
}
