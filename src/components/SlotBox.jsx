export default function SlotBox({
  className = '',
  kind = 'image',
  slotKey,
  fileHint,
  debug = false,
  backgroundImage = null,
  children = null,
}) {
  if (!debug) {
    const style = backgroundImage ? {
      backgroundImage,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: 'cover',
    } : {};

    // Use slot-box-with-image class when backgroundImage is provided
    // This prevents the placeholder gradient from overlaying the actual image
    const slotClass = backgroundImage
      ? `slot-box-with-image ${className}`
      : `slot-box ${className}`;

    return (
      <div className={slotClass} aria-hidden="true" style={style}>
        {children}
      </div>
    );
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
