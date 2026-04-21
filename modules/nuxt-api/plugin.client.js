import Cookie from 'cookie'
import jwt_decode from 'jwt-decode'

function readUserCookie() {
  const cookies = Cookie.parse(document.cookie || '')
  const jwt = cookies['user'] || null
  if (!jwt) return null
  try {
    const decoded = jwt_decode(jwt)
    const user = { jwt, ...decoded }
    if (Date.now() / 1000 >= (user.exp || 0)) {
      return null
    }
    return user
  } catch (_) {
    document.cookie = 'user=; Path=/; Max-Age=0'
    return null
  }
}

/** JWT на каждый запрос из cookie — иначе после логина / HMR в теле уходит старый null и API отвечает «Must be logged in». */
function apiSegment(apiPath) {
  return new Proxy(() => {}, {
    get(_target, prop, _receiver) {
      return apiSegment([...apiPath, prop])
    },
    async apply(_target, _thisArg, argumentsList) {
      const cookies = Cookie.parse(document.cookie || '')
      const jwt = cookies['user'] || null

      const r = await fetch('/api', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify({
          method: apiPath,
          arguments: argumentsList,
          jwt,
        }),
      })

      let d = {}
      try {
        d = await r.json()
      } catch (_) {}

      if (!r.ok) {
        throw new Error(d.error || r.statusText || 'API error')
      }
      return d
    },
  })
}

export default function (_ctx, inject) {
  const user = readUserCookie()

  inject('<%= options.variable %>', apiSegment([]))

  inject('user', user)
}
