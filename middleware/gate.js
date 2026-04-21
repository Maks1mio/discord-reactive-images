/** Маршруты браузерных источников OBS — без кода доступа (cookie site_gate). */
function isWidgetRoute(path) {
  if (path === '/group') return true
  if (path.startsWith('/individual/')) return true
  return false
}

export default async function ({ route, redirect }) {
  if (process.env.SITE_GATE_ENABLED !== '1') {
    return
  }
  if (process.server) {
    return
  }
  if (isWidgetRoute(route.path)) {
    return
  }
  try {
    const r = await fetch(`${window.location.origin}/access/check`, { credentials: 'include' })
    const d = await r.json()
    if (d.ok) return
    if (route.path === '/') return
    return redirect('/')
  } catch (_) {
    if (route.path !== '/') return redirect('/')
  }
}
