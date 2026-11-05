// Marca: lâmina de navalha estilizada + nome em display condensado.
export function Logo({ className = "", mark = true }: { className?: string; mark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {mark && (
        <svg viewBox="0 0 32 32" aria-hidden className="h-7 w-7">
          <rect x="1" y="1" width="30" height="30" rx="8" fill="currentColor" />
          <path d="M8 21.5 22.5 7l2.5 2.5-11 11.5H8z" fill="var(--color-pole)" />
          <path d="M8 21.5h6l-3 3.5H8z" fill="var(--logo-handle, #F4EFE6)" />
        </svg>
      )}
      <span className="font-display text-[26px] leading-none tracking-tight">Navalha</span>
    </span>
  );
}
