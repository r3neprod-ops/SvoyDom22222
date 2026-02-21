export default function SectionHeader({ eyebrow, title, subtitle, align = 'left' }) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <header className={`mb-10 max-w-3xl ${alignClass}`}>
      {eyebrow && <p className="mb-3 text-xs uppercase tracking-[0.25em] text-[color:var(--accent)]">{eyebrow}</p>}
      <h2 className="tracking-tight text-3xl leading-[1.1] md:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 text-base leading-[1.625] text-[color:var(--muted)]">{subtitle}</p>}
    </header>
  );
}
