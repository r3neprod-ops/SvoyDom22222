export default function SlotBox({
  className = '',
  kind = 'image',
  slotKey,
  fileHint,
  debug = false,
}) {
  if (!debug) {
    return <div className={`slot-box ${className}`} aria-hidden="true" />;
  }

  return (
    <div
      className={`slot-box border border-dashed border-[color:var(--borderStrong)] p-2 ${className}`}
      data-kind={kind}
      data-slot-key={slotKey}
      data-file-hint={fileHint}
      aria-label={slotKey || fileHint || 'slot'}
    >
      <p className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--muted)]">
        {slotKey || 'slot'}
      </p>
      {fileHint && <p className="mt-1 text-[11px] text-[color:var(--muted)]">{fileHint}</p>}
    </div>
  );
}
