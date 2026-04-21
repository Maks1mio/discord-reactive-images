import path from 'path'

/** Публичный префикс URL (Express static), без изменения env по умолчанию */
export const MEDIA_URL_PATH = process.env.MEDIA_URL_PATH || '/media'

/** Абсолютный путь к каталогу с PNG на сервере */
export function getUploadDir() {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads', 'images')
}
