function trimBase(s) {
  return String(s || '').replace(/\/$/, '')
}

/** Тот же базовый URL, что и OAuth redirect/callback (см. api/index.js). */
export function oauthCallbackDomain() {
  if (process.env.NODE_ENV === 'production') {
    return trimBase(process.env.APP_URL || 'https://dri.maks1mio.su')
  }
  return trimBase(process.env.APP_URL_LOCAL || 'http://localhost:3000')
}

/**
 * Secure только если callback идёт по https (прод, ngrok).
 * Не завязываем на NODE_ENV+APP_URL иначе при NODE_ENV=production в .env и http://localhost cookie login не уходит на callback.
 */
export function cookieShouldBeSecure() {
  return oauthCallbackDomain().toLowerCase().startsWith('https://')
}
