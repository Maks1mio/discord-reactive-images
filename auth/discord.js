import fetch from 'node-fetch'
import { stringify } from 'querystring'
import { Router } from 'express'
import { siteGateEnabled, verifyGateCookie } from '../api/gate.js'
import { cookieShouldBeSecure } from '../api/cookies.js'

const OAUTH_STATE_TTL_MS = 15 * 60 * 1000

/** state → { path, ts } — если cookie login не дошла, callback всё равно валидирует state (один процесс; при нескольких воркерах нужен общий store). */
const pendingOAuth = new Map()

function prunePendingOAuth() {
  const now = Date.now()
  for (const [k, v] of pendingOAuth) {
    if (now - v.ts > OAUTH_STATE_TTL_MS) pendingOAuth.delete(k)
  }
}

/**
 * Как в Discord Portal: client_id, response_type, redirect_uri, scope с «+», затем state и prompt.
 * Не querystring.stringify — иначе scope даёт %20 вместо «+».
 */
function discordAuthorizeQuery(ctx, state) {
  const redirectUri = `${ctx.callbackDomain}/auth/discord/callback`
  const scopePlus = String(ctx.discordScopes || '')
    .trim()
    .split(/\s+/)
    .join('+')
  return [
    `client_id=${encodeURIComponent(process.env.DISCORD_ID)}`,
    `response_type=code`,
    `redirect_uri=${encodeURIComponent(redirectUri)}`,
    `scope=${scopePlus}`,
    `state=${encodeURIComponent(state)}`,
    `prompt=consent`,
  ].join('&')
}

export default function (ctx) {
  const app = Router()
  const secure = cookieShouldBeSecure()

  app.get('/login', async (req, res) => {
    if (siteGateEnabled() && !verifyGateCookie(req)) {
      return res.redirect(`${ctx.callbackDomain}/?need_gate=1`)
    }

    const n = ctx.nonce()
    const path = req.query.path || '/'
    prunePendingOAuth()
    pendingOAuth.set(n, { path, ts: Date.now() })

    res.cookie(
      'login',
      ctx.encrypt({
        path,
        nonce: n,
      }),
      { httpOnly: true, secure, sameSite: 'lax', path: '/' }
    )

    res.redirect(`https://discord.com/oauth2/authorize?${discordAuthorizeQuery(ctx, n)}`)
  })

  app.get('/callback', async (req, res) => {
    try {
      const state = typeof req.query.state === 'string' ? req.query.state : ''
      if (!state) {
        res.status(400).send('Нет параметра state — начните вход с сайта.')
        return
      }

      let returnPath = '/'
      let stateOk = false

      if (req.cookies.login) {
        try {
          const cookie = ctx.decrypt(req.cookies.login)
          res.clearCookie('login', { httpOnly: true, secure, sameSite: 'lax', path: '/' })
          if (cookie.nonce === state) {
            stateOk = true
            returnPath = cookie.path || '/'
            pendingOAuth.delete(state)
          }
        } catch (e) {
          console.error('OAuth decrypt login cookie:', e)
          res.clearCookie('login', { httpOnly: true, secure, sameSite: 'lax', path: '/' })
        }
      }

      if (!stateOk && pendingOAuth.has(state)) {
        const row = pendingOAuth.get(state)
        pendingOAuth.delete(state)
        stateOk = true
        returnPath = row.path || '/'
      }

      if (!stateOk) {
        res.status(400).send('Неверный или устаревший state — войдите снова.')
        return
      }

      const tokenResp = await fetch(`https://discord.com/api/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: stringify({
          client_id: process.env.DISCORD_ID,
          client_secret: process.env.DISCORD_SECRET,
          code: req.query.code,
          grant_type: 'authorization_code',
          redirect_uri: `${ctx.callbackDomain}/auth/discord/callback`,
          scope: ctx.discordScopes,
        }),
      })
      const tokenData = await tokenResp.json()

      if (!tokenResp.ok) {
        console.log('Bad token response', tokenData)
        res.status(400).send('Discord не выдал токен — проверьте redirect в Portal и DISCORD_SECRET.')
        return
      }

      const userResp = await fetch(`https://discord.com/api/users/@me`, {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      })
      const userData = await userResp.json()

      if (!userResp.ok || !userData.id) {
        console.log('Bad user response', userData)
        res.status(400).send()
        return
      }

      const jwt = await ctx.encodeJWT({
        id: userData.id,
        token: tokenData.access_token,
        username: userData.username,
        discriminator: userData.discriminator,
        avatar: userData.avatar,
      })

      res.cookie('user', jwt, { secure, sameSite: 'lax', path: '/' })
      res.redirect(ctx.callbackDomain + returnPath)
    } catch (e) {
      console.error('Discord OAuth /callback:', e)
      if (!res.headersSent) {
        res
          .status(500)
          .send(
            process.env.NODE_ENV === 'development'
              ? `Ошибка сервера: ${e && e.message ? e.message : e}. Проверьте JWT_KEY (base64, достаточная длина для HS256).`
              : 'Ошибка сервера при входе.'
          )
      }
    }
  })

  return app
}
