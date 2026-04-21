/**
 * Флаг Secure для Set-Cookie: только при реальном HTTPS.
 * Если NODE_ENV=production, но APP_URL — http://localhost, Secure=true ломает OAuth (cookie login не сохраняется).
 */
export function cookieShouldBeSecure() {
  if (process.env.NODE_ENV !== 'production') return false
  const u = (process.env.APP_URL || '').trim().toLowerCase()
  if (!u) return true
  return u.startsWith('https://')
}
