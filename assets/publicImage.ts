/** Префикс URL для раздачи файлов (должен совпадать с Express static в handler.js). */
function mediaUrlPath(): string {
  const p =
    typeof process !== 'undefined' && process.env.MEDIA_URL_PATH
      ? String(process.env.MEDIA_URL_PATH)
      : '/media'
  return p.startsWith('/') ? p : `/${p}`
}

/**
 * Публичный базовый URL каталога с PNG (без слэша в конце).
 * Приоритет: PUBLIC_IMAGE_BASE / CDN_BASE → APP_URL + MEDIA_URL_PATH → в браузере origin + MEDIA_URL_PATH.
 */
export function publicImageBase(): string {
  if (typeof process !== 'undefined') {
    const explicit = process.env.PUBLIC_IMAGE_BASE || process.env.CDN_BASE
    if (explicit) return String(explicit).replace(/\/$/, '')
    const appUrl = process.env.APP_URL
    if (appUrl) return `${String(appUrl).replace(/\/$/, '')}${mediaUrlPath()}`
  }
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${mediaUrlPath()}`
  }
  return ''
}

export function publicImageUrl(filename: string | null | undefined): string | null {
  if (!filename) return null
  const base = publicImageBase()
  if (!base) return null
  return `${base}/${filename}`
}
