import pg from 'pg'
import { secretbox, randomBytes } from 'tweetnacl'
import jwt from 'jsonwebtoken'
import { oauthCallbackDomain, cookieShouldBeSecure } from './cookies.js'

const { Pool } = pg

export const database = new Pool({
  host: process.env.DB_HOST,
  port: +(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
})

const tablePrefix = process.env.DB_TABLE_PREFIX || 'DRI_'
export const tables = {
  configs: `${tablePrefix}configs`,
  images: `${tablePrefix}images`,
  overrides: `${tablePrefix}overrides`,
}

export async function query(statement, values) {
  const result = await database.query(statement, values)
  return { results: result.rows, fields: result.fields }
}

export const callbackDomain = oauthCallbackDomain()

export { cookieShouldBeSecure }

/**
 * Scopes редиректа https://discord.com/oauth2/authorize (вход на сайт).
 * По умолчанию без `rpc`: у многих приложений Discord возвращает invalid_scope в браузере.
 * Сам scope `rpc` для голоса/RPC запрашивается у клиента Discord командой AUTHORIZE в assets/discordrpc.ts (после ws://127.0.0.1:6463).
 * Если вашему приложению Discord разрешён rpc в веб-OAuth: DISCORD_WEB_OAUTH_SCOPES="identify email rpc"
 */
export const discordScopes = (
  process.env.DISCORD_WEB_OAUTH_SCOPES || 'identify email'
).trim()

export function nonce() {
  const word_characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''

  for (let i = 0; i < 32; i++) {
    result += word_characters[parseInt(Math.random() * word_characters.length, 10)]
  }

  return result
}

const naclKey = () => Buffer.from(process.env.NACL_KEY, 'base64')
const jwtKey = () => Buffer.from(process.env.JWT_KEY, 'base64')

export function encrypt(obj) {
  const message = Buffer.from(JSON.stringify(obj))
  const nonce = randomBytes(secretbox.nonceLength)
  const box = secretbox(message, nonce, naclKey())
  return Buffer.from([...nonce, ...box]).toString('base64')
}

export function decrypt(str) {
  const data = Buffer.from(str, 'base64')
  const nonce = data.slice(0, secretbox.nonceLength)
  const message = secretbox.open(data.slice(secretbox.nonceLength), nonce, naclKey())
  return JSON.parse(Buffer.from(message).toString('utf-8'))
}

export async function encodeJWT(obj) {
  return jwt.sign(obj, jwtKey(), {
    algorithm: 'HS256',
    expiresIn: '7d',
  })
}

export async function decodeJWT(token) {
  return jwt.verify(token, jwtKey(), {
    algorithms: ['HS256'],
  })
}


export async function getImages(broadcaster_id, guest_id) {
  const ret = {}

  const { results } = await query(`SELECT inactive, speaking FROM ${tables.images} WHERE discord_id = $1`, [guest_id])
  if (results && results.length) {
    ret.inactive = results[0].inactive
    ret.speaking = results[0].speaking
  }

  if (broadcaster_id) {
    const { results } = await query(
      `SELECT inactive, speaking FROM ${tables.overrides} WHERE broadcaster_discord_id = $1 AND guest_discord_id = $2`,
      [broadcaster_id, guest_id]
    )
    if (results && results.length) {
      ret.inactiveOverride = results[0].inactive
      ret.speakingOverride = results[0].speaking
    }
  }

  return ret
}
