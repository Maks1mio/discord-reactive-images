import bodyParser from 'body-parser'
import { API } from '../../.nuxt/nuxt-api.js'
import { decodeJWT } from '../../api'
import { siteGateEnabled, verifyGateCookie } from '../../api/gate.js'

const parser = bodyParser.json({
  limit: '50mb',
})

/** Без пакета `cookie` (v1+ ломает Webpack 4 из‑за `?.` в node_modules). */
function parseCookieHeader(header) {
  const out = {}
  if (!header || typeof header !== 'string') return out
  for (const segment of header.split(';')) {
    const eq = segment.indexOf('=')
    if (eq === -1) continue
    const k = segment.slice(0, eq).trim()
    let v = segment.slice(eq + 1).trim()
    try {
      v = decodeURIComponent(v)
    } catch (_) {}
    out[k] = v
  }
  return out
}

/** JWT из body или cookie (cookie-parser и ручной разбор заголовка — иногда req.cookies пустой в цепочке Nuxt). */
function pickJwtString(req) {
  const fromBody = req.body && req.body.jwt
  if (typeof fromBody === 'string' && fromBody.trim()) {
    return fromBody.trim()
  }
  if (req.cookies && req.cookies.user) {
    return String(req.cookies.user).trim()
  }
  const raw = req.headers && req.headers.cookie
  if (!raw) return null
  const u = parseCookieHeader(raw).user
  return typeof u === 'string' && u.trim() ? u.trim() : null
}

export default (globalState) => {
  return async (req, resp, _next) => {
    const err = await new Promise((resolve) => parser(req, resp, resolve))
    if (err) {
      console.error(err)
      resp.writeHead(500)
      resp.end(JSON.stringify({ error: err.message }))
      return
    }

    if (!req.body.method || !req.body.method.length) {
      resp.writeHead(400)
      resp.end(JSON.stringify({ error: 'Invalid request' }))
      return
    }

    let $user = null
    const jwtRaw = pickJwtString(req)
    if (jwtRaw) {
      try {
        $user = await decodeJWT(jwtRaw)
      } catch (_) {}
    }

    if (siteGateEnabled() && !verifyGateCookie(req) && !$user) {
      resp.writeHead(403)
      resp.setHeader('Content-Type', 'application/json')
      resp.end(JSON.stringify({ error: 'Требуется код доступа' }))
      return
    }

    const api = API(globalState, $user)

    const key = req.body.method.join('.')
    if (!(key in api)) {
      resp.writeHead(404)
      resp.end()
      return
    }

    try {
      const result = await api[key](...req.body.arguments)
      resp.end(JSON.stringify(result))
    } catch (err) {
      console.error(err)
      resp.writeHead(500)
      resp.end(JSON.stringify({ error: err.message }))
    }
  }
}
