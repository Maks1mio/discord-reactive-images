import fs from 'fs'
import express from 'express'
import cookieParser from 'cookie-parser'
import API from './handler_api'
import Auth from './handler_auth'
import { setConfig, setImage } from './handler_ws'
import { getUploadDir, MEDIA_URL_PATH } from '../../api/uploadPaths.js'
import { verifyGateCookie, issueGateCookie, siteGateEnabled } from '../../api/gate.js'

const ctx = {
  setConfig,
  setImage,
}

const app = express()

app.use(cookieParser())

app.post(
  '/access/verify',
  express.json({ limit: '32kb' }),
  (req, res) => {
    if (!siteGateEnabled()) {
      return res.json({ ok: true })
    }
    const expected = process.env.SITE_ACCESS_CODE.trim()
    const code = typeof req.body?.code === 'string' ? req.body.code.trim() : ''
    if (code !== expected) {
      return res.status(401).json({ ok: false, error: 'Неверный код' })
    }
    issueGateCookie(res)
    res.json({ ok: true })
  }
)

app.get('/access/check', (req, res) => {
  if (!siteGateEnabled()) {
    return res.json({ ok: true, enabled: false })
  }
  res.json({ ok: verifyGateCookie(req), enabled: true })
})

const uploadDir = getUploadDir()
fs.mkdirSync(uploadDir, { recursive: true })

app.use(
  MEDIA_URL_PATH,
  express.static(uploadDir, {
    maxAge: '7d',
    index: false,
    immutable: true,
    setHeaders(res) {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    },
  })
)

app.use('/api', API(ctx))
app.use('/auth', Auth(ctx))

export default app
