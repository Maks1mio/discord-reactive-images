import fetch from 'node-fetch'
import { stringify } from 'querystring'
import { Router } from 'express'
import { siteGateEnabled, verifyGateCookie } from '../api/gate.js'
import { cookieShouldBeSecure } from '../api/cookies.js'

export default function (ctx) {
  const app = Router()
  const secure = cookieShouldBeSecure()

  app.get('/login', async (req, res) => {
    if (siteGateEnabled() && !verifyGateCookie(req)) {
      return res.redirect(`${ctx.callbackDomain}/?need_gate=1`)
    }

    const n = ctx.nonce()

    res.cookie(
      'login',
      ctx.encrypt({
        path: req.query.path || '/',
        nonce: n,
      }),
      { httpOnly: true, secure, sameSite: 'lax', path: '/' }
    )

    res.redirect(
      `https://discord.com/oauth2/authorize?${stringify({
        client_id: process.env.DISCORD_ID,
        redirect_uri: `${ctx.callbackDomain}/auth/discord/callback`,
        response_type: 'code',
        scope: ctx.discordScopes,
        state: n,
        prompt: 'consent',
      })}`
    )
  })

  app.get('/callback', async (req, res) => {
    try {
      if (!req.cookies.login) {
        res
          .status(400)
          .send(
            'Нет cookie входа — откройте главную и нажмите «Войти» заново. Не смешивайте localhost и 127.0.0.1: хост в адресе должен совпадать с redirect в Discord Portal.'
          )
        return
      }
      let cookie
      try {
        cookie = ctx.decrypt(req.cookies.login)
      } catch (e) {
        console.error('OAuth decrypt failed (проверьте NACL_KEY в .env, тот же ключ что при установке cookie /login):', e)
        res.status(400).send('Сессия входа недействительна — откройте сайт и войдите снова.')
        return
      }
      res.clearCookie('login', { httpOnly: true, secure, sameSite: 'lax', path: '/' })

      if (cookie.nonce !== req.query.state) {
        console.log('Mismatched nonce!', cookie.nonce, req.query.state)
        res.status(400).send('Неверный state — попробуйте войти снова.')
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
      res.redirect(ctx.callbackDomain + (cookie.path || '/'))
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
