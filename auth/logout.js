import { Router } from 'express'
import { cookieShouldBeSecure } from '../api/cookies.js'

export default function(ctx) {
  const app = Router()

  app.get('/', async (req, res) => {
    res.clearCookie('user', { secure: cookieShouldBeSecure(), sameSite: 'lax', path: '/' })
    res.redirect(ctx.callbackDomain + (req.query.path || '/'))
  })

  return app
}
