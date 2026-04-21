import jwt from 'jsonwebtoken'
import { cookieShouldBeSecure } from './cookies.js'

export function siteGateEnabled() {
  const c = process.env.SITE_ACCESS_CODE
  return typeof c === 'string' && c.trim().length > 0
}

function gateSecret() {
  const raw = process.env.ACCESS_COOKIE_SECRET || process.env.JWT_KEY
  if (!raw) {
    throw new Error('ACCESS_COOKIE_SECRET or JWT_KEY must be set when SITE_ACCESS_CODE is set')
  }
  return Buffer.from(raw, 'base64')
}

export function verifyGateCookie(req) {
  if (!siteGateEnabled()) return true
  const token = req.cookies && req.cookies.site_gate
  if (!token) return false
  try {
    jwt.verify(token, gateSecret(), { algorithms: ['HS256'] })
    return true
  } catch {
    return false
  }
}

export function issueGateCookie(res) {
  const token = jwt.sign({ gate: true }, gateSecret(), {
    algorithm: 'HS256',
    expiresIn: '30d',
  })
  res.cookie('site_gate', token, {
    httpOnly: true,
    secure: cookieShouldBeSecure(),
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  })
}
