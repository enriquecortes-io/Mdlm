// Convierte URL de Google Drive a URL del proxy interno
export function convertGDriveUrl(url: string, width = 1200, quality = 80): string {
  if (!url) return url;
  if (url.startsWith("/api/image")) return url;
  if (url.startsWith("/api/drive")) return url;

  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return `/api/drive?id=${match[1]}&w=${width}`;
    }
  }

  return url;
}
