export function extractUrlFromBackground(backgroundImage) {
  if (!backgroundImage) return null;
  const match = String(backgroundImage).match(/url\((['"]?)(.*?)\1\)/i);
  return match?.[2] || null;
}

export function withBuilderImageParams(src, { width, quality = 70, format = 'webp' } = {}) {
  if (!src) return src;

  try {
    const url = new URL(src);
    if (!url.hostname.includes('builder.io')) return src;
    if (width) url.searchParams.set('width', String(width));
    if (quality) url.searchParams.set('quality', String(quality));
    if (format) url.searchParams.set('format', format);
    return url.toString();
  } catch {
    return src;
  }
}
