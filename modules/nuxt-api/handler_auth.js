import { Router } from 'express'
import cookieParser from 'cookie-parser'

/**
 * Auth() из .nuxt/nuxt-api.js нельзя вызывать при загрузке модуля — файла ещё нет на этапе `nuxt build`.
 */
export default function (globalState) {
  const app = Router()
  app.use(cookieParser())

  let innerRouter = null
  let initPromise = null

  function ensureAuthRoutes() {
    if (innerRouter) return Promise.resolve(innerRouter)
    if (!initPromise) {
      initPromise = import('../../.nuxt/nuxt-api.js').then(({ Auth }) => {
        const methods = Auth(globalState)
        const inner = Router()
        for (const [path, handlerFactory] of Object.entries(methods || {})) {
          inner.use('/' + path, handlerFactory())
        }
        innerRouter = inner
        return inner
      })
    }
    return initPromise
  }

  app.use((req, res, next) => {
    ensureAuthRoutes()
      .then((inner) => inner(req, res, next))
      .catch(next)
  })

  return app
}
