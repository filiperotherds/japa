// Avatar com fallback de iniciais em cor estável derivada do nome.
const TONES = ["#D7372A", "#1F4FA8", "#2F6B4F", "#B7791F", "#6B3FA0", "#15130F"];

export function Avatar({
  name,
  src,
  size = 48,
  className = "",
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  const tone = TONES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];
  const style = { width: size, height: size };
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} style={style} className={`shrink-0 rounded-full object-cover ${className}`} />;
  }
  return (
    <span
      aria-label={name}
      style={{ ...style, background: tone, fontSize: size * 0.38 }}
      className={`grid shrink-0 place-items-center rounded-full font-display text-white ${className}`}
    >
      {initials}
    </span>
  );
}
