export function extractUrlFromBackground(backgroundImage) {
  if (!backgroundImage) return null;
  const match = String(backgroundImage).match(/url\((['"]?)(.*?)\1\)/i);
  return match?.[2] || null;
}
