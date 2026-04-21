require('dotenv').config()

const colors = require('vuetify/es5/util/colors').default

module.exports = {
  // Target (https://go.nuxtjs.dev/config-target)
  target: 'server',
  ssr: false,

  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    htmlAttrs: {
      lang: 'ru',
    },
    title: 'Discord Reactive Images',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Визуализация голосового чата Discord в OBS через браузерный источник.' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: ['~/assets/stars.scss'],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
  ],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    ['@nuxt/typescript-build', {
      typeCheck: false,
    }],
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
    '@nuxtjs/composition-api/module',
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    '@nuxtjs/redirect-module',
    '~/modules/nuxt-api',
  ],

  serverMiddleware: {
  },

  env: {
    DISCORD_ID: process.env.DISCORD_ID,
    APP_URL: process.env.APP_URL || '',
    /** Явный базовый URL картинок; если пусто — собирается из APP_URL + MEDIA_URL_PATH или из origin в браузере. */
    PUBLIC_IMAGE_BASE: process.env.PUBLIC_IMAGE_BASE || process.env.CDN_BASE || '',
    CDN_BASE: process.env.PUBLIC_IMAGE_BASE || process.env.CDN_BASE || '',
    /** Публичный префикс (тот же, что в api/uploadPaths.js и Express static). */
    MEDIA_URL_PATH: process.env.MEDIA_URL_PATH || '/media',
    PROMO_VIDEO_URL: process.env.PROMO_VIDEO_URL || '',
    /** «1», если задан SITE_ACCESS_CODE — показать форму кода и middleware (сам код не попадает в бандл). */
    SITE_GATE_ENABLED:
      process.env.SITE_ACCESS_CODE && String(process.env.SITE_ACCESS_CODE).trim() ? '1' : '',
  },

  redirect: [
    { from: '^/manage', to: '/' },
  ],

  // Vuetify module configuration (https://go.nuxtjs.dev/config-vuetify)
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: true,
      options: { customProperties: true },
      themes: {
        dark: {
          primary: '#ffffff',
          accent: colors.grey.darken2,
          secondary: colors.grey.darken4,
          info: colors.blue.lighten2,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
          anchor: '#ffffff',
        }
      }
    }
  },

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
    extend(config, { isClient }) {
      // Extend only webpack config for client-bundle
      if (isClient) {
        config.devtool = 'source-map'
      }
    }
  }
}
