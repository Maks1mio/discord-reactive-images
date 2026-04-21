import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import imagemin from 'imagemin'
import pngquant from 'imagemin-pngquant'
import { getUploadDir } from './uploadPaths.js'

export default async function (ctx, { image: imageBase64, user, purpose }) {
  if (!ctx.$user) throw new Error('Must be logged in')

  if (!['inactive', 'speaking'].includes(purpose)) {
    throw new Error('Invalid purpose')
  }

  if (!imageBase64) {
    if (ctx.$user.id === user) {
      await ctx.query(`UPDATE ${ctx.tables.images} SET ${purpose} = NULL WHERE discord_id = $1`, [user])
    } else {
      await ctx.query(
        `UPDATE ${ctx.tables.overrides} SET ${purpose} = NULL WHERE broadcaster_discord_id = $1 AND guest_discord_id = $2`,
        [ctx.$user.id, user]
      )
    }
    ctx.setImage(ctx.$user.id, user, purpose, null)
    return null
  }

  const imageBuffer = Buffer.from(imageBase64, 'base64')

  const rawImage = await sharp(imageBuffer)
    .trim()
    .resize({
      width: 1920,
      height: 1080,
      fit: 'inside',
      withoutEnlargement: true,
      kernel: 'lanczos3',
    })
    .png()
    .toBuffer()

  const image = await imagemin.buffer(rawImage, {
    plugins: [
      pngquant({
        quality: [0.6, 0.9],
      }),
    ],
  })

  const hash = crypto.createHash('sha256')
  hash.update(image)
  const filename = `${hash.digest('hex')}.png`

  const uploadDir = getUploadDir()
  await fs.mkdir(uploadDir, { recursive: true })
  await fs.writeFile(path.join(uploadDir, filename), image)

  if (ctx.$user.id === user) {
    await ctx.query(
      `
      INSERT INTO ${ctx.tables.images} (discord_id, filename, ${purpose}) VALUES ($1, '', $2)
      ON CONFLICT (discord_id)
      DO UPDATE SET ${purpose} = EXCLUDED.${purpose}
    `,
      [user, filename]
    )
  } else {
    await ctx.query(
      `
      INSERT INTO ${ctx.tables.overrides} (broadcaster_discord_id, guest_discord_id, ${purpose}) VALUES ($1, $2, $3)
      ON CONFLICT (broadcaster_discord_id, guest_discord_id)
      DO UPDATE SET ${purpose} = EXCLUDED.${purpose}
    `,
      [ctx.$user.id, user, filename]
    )
  }

  ctx.setImage(ctx.$user.id, user, purpose, filename)

  return filename
}
