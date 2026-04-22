<template>
  <v-app dark :class="tutorialClass" class="dri-app">
    <v-app-bar app flat color="transparent" class="dri-app-bar px-4 px-md-8">
      <v-toolbar-title class="d-flex align-center">
        <nuxt-link to="/" exact class="dri-brand text-h6 font-weight-bold white--text text-decoration-none">
          DRI
        </nuxt-link>
      </v-toolbar-title>
      <div class="d-none d-sm-flex align-center ml-8">
        <nuxt-link to="/" exact class="dri-nav-link dri-nav-link--active mr-6">{{ $t('nav.home') }}</nuxt-link>
      </div>
      <v-spacer />

      <div class="d-flex align-center mr-3">
        <v-btn
          x-small text
          :color="$i18n.locale === 'ru' ? 'white' : 'grey'"
          class="lang-btn"
          @click="$i18n.setLocale('ru')"
        >RU</v-btn>
        <span class="grey--text mx-1" style="opacity:0.4">|</span>
        <v-btn
          x-small text
          :color="$i18n.locale === 'en' ? 'white' : 'grey'"
          class="lang-btn"
          @click="$i18n.setLocale('en')"
        >EN</v-btn>
      </div>

      <template v-if="$user">
        <v-btn text class="mr-2" color="white" outlined rounded @click="setTutorial(1)">{{ $t('nav.tutorial') }}</v-btn>
        <v-avatar size="36" class="ml-2">
          <img :src="`https://cdn.discordapp.com/avatars/${$user.id}/${$user.avatar}.png?size=64`" alt="" />
        </v-avatar>
        <span class="ml-3 d-none d-md-inline text-body-2">{{ $user.username }}#{{ $user.discriminator }}</span>
        <v-btn class="ml-3" rounded outlined color="white" :href="logout()">{{ $t('nav.logout') }}</v-btn>
      </template>

    </v-app-bar>

   <v-main :class="{ 'dri-main-landing': !$user }">
      <v-container :fluid="!!$user" :class="$user ? 'py-8 py-md-12' : 'py-6 px-4'">
        <v-row v-if="!$user" justify="center" align="center" class="hero-row">
          <v-col cols="12" sm="11" md="9" lg="8" xl="7" class="d-flex flex-column align-center text-center px-4">
            <video
              v-if="promoVideoUrl"
              class="hero-video mb-10"
              :src="promoVideoUrl"
              muted
              autoplay
              loop
              playsinline
            />
            <h1 class="text-h4 text-md-h3 font-weight-bold mb-3">{{ $t('hero.title') }}</h1>
            <p class="text-h6 font-weight-medium mb-6 dri-muted">{{ $t('hero.subtitle') }}</p>
            <p v-if="!showGateForm" class="text-body-1 mb-10 mx-auto dri-hero-text">
              {{ $t('hero.description') }}
              <a href="https://streamkit.discord.com/overlay" target="_blank" rel="noopener noreferrer">Discord Streamkit</a>.
            </p>

            <v-alert v-if="showGateForm && needGateHint" type="info" text dense outlined class="mb-6 dri-panel">
              {{ $t('hero.gateHint') }}
            </v-alert>

            <template v-if="showGateForm">
              <v-text-field
                v-model="accessCode"
                :label="$t('gate.accessCode')"
                type="password"
                outlined
                dark
                hide-details="auto"
                class="mb-4"
                style="max-width: 360px"
                autocomplete="off"
                @keyup.enter="submitAccess"
              />
              <v-btn class="dri-btn-light px-10" x-large depressed :loading="gateSubmitting" @click="submitAccess">
                {{ $t('gate.continue') }}
              </v-btn>
              <v-alert v-if="gateError" type="error" text dense outlined class="mt-4 dri-panel">{{ gateError }}</v-alert>
            </template>

            <template v-else>
              <v-btn class="dri-btn-light px-10" x-large depressed :href="login('discord')">{{ $t('hero.login') }}</v-btn>
              <div class="mt-4 text-caption dri-muted">{{ $t('hero.needDiscord') }}</div>
            </template>
          </v-col>
        </v-row>

        <v-row v-else>
          <v-col v-if="showGateForm" cols="12" sm="10" md="8" lg="6" class="mx-auto">
            <v-card class="dri-panel" flat outlined>
              <v-card-title class="text-h6 font-weight-bold">{{ $t('gate.title') }}</v-card-title>
              <v-card-text>
                <v-alert v-if="needGateHint" type="info" text dense outlined class="mb-4 dri-panel" border="left">
                  {{ $t('gate.hint') }}
                </v-alert>
                <p class="text-body-2 dri-muted mb-4">{{ $t('gate.description') }}</p>
                <v-text-field
                  v-model="accessCode"
                  :label="$t('gate.accessCode')"
                  type="password"
                  outlined
                  dark
                  hide-details="auto"
                  class="mb-4"
                  autocomplete="off"
                  @keyup.enter="submitAccess"
                />
                <v-btn class="dri-btn-light" block large depressed :loading="gateSubmitting" @click="submitAccess">
                  {{ $t('gate.continue') }}
                </v-btn>
                <v-alert v-if="gateError" type="error" text dense outlined class="mt-4 dri-panel">{{ gateError }}</v-alert>
              </v-card-text>
            </v-card>
          </v-col>
          <template v-else>
          <v-col cols="12">
            <v-alert v-if="error" class="mb-4 dri-panel" type="error" outlined border="left">
              {{ error }}
            </v-alert>
          </v-col>
          <v-col cols="12" md="4" lg="6" order-md="last">
            <v-card class="mb-4 links dri-panel" flat>
              <v-card-title class="text-h6 font-weight-bold">{{ $t('links.title') }}</v-card-title>
              <v-card-text>
                <v-text-field
                  v-for="l in links"
                  :key="`link-${l.value}`"
                  :class="l.class"
                  dark
                  outlined
                  dense
                  :label="l.label"
                  :value="l.value"
                  readonly
                  hide-details
                  class="mb-3"
                >
                  <template slot="append">
                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn icon small @click.prevent="copyText(l.value)" v-bind="attrs" v-on="on">
                          <v-icon small>mdi-content-copy</v-icon>
                        </v-btn>
                      </template>
                      <span>{{ $t('links.copy') }}</span>
                    </v-tooltip>
                  </template>
                  <template slot="append-outer">
                    <v-dialog
                      width="800"
                      :value="tutorial === 13 && l.settings && l.settings.id === '00000000000000001'"
                      eager
                    >
                      <template v-slot:activator="{ on: dialogO, attrs: dialogA }">
                        <v-tooltip top>
                          <template v-slot:activator="{ on: tooltipO, attrs: tooltipA }">
                            <v-btn
                              class="source-settings"
                              icon
                              small
                              v-bind="{ ...dialogA, ...tooltipA }"
                              v-on="{ ...dialogO, ...tooltipO }"
                              :disabled="!l.settings"
                            >
                              <v-icon small>mdi-cog</v-icon>
                            </v-btn>
                          </template>
                          <span>{{ $t('links.settings') }}</span>
                        </v-tooltip>
                      </template>

                      <v-card v-if="l.settings" class="source-settings-modal dri-panel">
                        <v-card-title class="justify-center">{{ $t('links.settingsModal', { name: l.settings.name }) }}</v-card-title>
                        <v-card-text>
                          <v-row justify="center">
                            <v-col cols="12" sm="6">
                              <image-upload
                                class="inactive-image"
                                :title="$t('images.inactive')"
                                v-model="l.settings.inactive"
                                :fallback="l.settings.speaking"
                                :base="l.settings.inactiveBase"
                                :user="l.settings.id"
                                purpose="inactive"
                              />
                            </v-col>
                            <v-col cols="12" sm="6">
                              <image-upload
                                class="speaking-image"
                                :title="$t('images.speaking')"
                                v-model="l.settings.speaking"
                                :fallback="l.settings.inactive"
                                :base="l.settings.speakingBase"
                                :user="l.settings.id"
                                purpose="speaking"
                              />
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-dialog>
                  </template>
                </v-text-field>

                <div class="text-caption links-warning dri-muted">{{ $t('links.warning') }}</div>
              </v-card-text>
            </v-card>

            <v-card class="config dri-panel" flat>
              <v-card-title class="text-h6 font-weight-bold">{{ $t('config.title') }}</v-card-title>
              <v-card-text>
                <v-form @submit.prevent="saveConfig">
                  <v-checkbox
                    class="bounce"
                    dark
                    :label="$t('config.bounce')"
                    v-model="config.bounce"
                    hide-details
                  />
                  <v-checkbox
                    class="include-self"
                    dark
                    :label="$t('config.includeSelf')"
                    v-model="config.includeSelf"
                    hide-details
                  />

                  <v-slider
                    class="mt-4 image-spacing"
                    dark
                    :label="$t('config.spacing')"
                    v-model="config.gapPercentage"
                    min="-500"
                    max="50"
                    thumb-label
                    hide-details
                  />

                  <v-btn class="mt-6 dri-btn-light" block large depressed type="submit" :disabled="configSaving" :loading="configSaving">
                    {{ $t('config.apply') }}
                  </v-btn>

                  <v-alert v-if="configError" class="mt-4" type="error" outlined dense>
                    {{ configError }}
                  </v-alert>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4" lg="3">
            <image-upload
              class="inactive-image"
              :title="$t('images.inactive')"
              v-model="currentImages.inactive"
              :fallback="currentImages.speaking"
              :base="currentImages.base"
              :user="$user.id"
              purpose="inactive"
            />
          </v-col>
          <v-col cols="12" sm="6" md="4" lg="3">
            <image-upload
              class="speaking-image"
              :title="$t('images.speaking')"
              v-model="currentImages.speaking"
              :fallback="currentImages.inactive"
              :base="currentImages.base"
              :user="$user.id"
              purpose="speaking"
            />
          </v-col>
          </template>
        </v-row>
      </v-container>
    </v-main>

    <v-footer class="dri-footer transparent pt-8 pb-12">
      <v-container>
        <div class="text-caption text-center dri-muted">
          {{ $t('footer.original') }}
          <a href="https://twitter.com/Fugiman" target="_blank" rel="noopener noreferrer" class="white--text">Fugi</a>.
          <a href="https://github.com/Fugiman/discord-reactive-images" target="_blank" rel="noopener noreferrer" class="white--text"
            >{{ $t('footer.sourceCode') }}</a
          >.
          <a href="https://paypal.me/fugiman" target="_blank" rel="noopener noreferrer" class="white--text">{{ $t('footer.support') }}</a>.
        </div>
        <div class="text-caption text-center mt-2" style="opacity: 0.45">
          <nuxt-link to="/terms" class="white--text">{{ $t('footer.terms') }}</nuxt-link>
          &nbsp;·&nbsp;
          <nuxt-link to="/privacy" class="white--text">{{ $t('footer.privacy') }}</nuxt-link>
        </div>
      </v-container>
    </v-footer>

    <v-overlay v-if="tutorial > 0" opacity="0.92">
      <tutorial-step :step="1" bottom>{{ $t('tutorial.step1') }}</tutorial-step>
      <tutorial-step :step="2" activator=".inactive-image" right>{{ $t('tutorial.step2') }}</tutorial-step>
      <tutorial-step :step="3" activator=".inactive-image .v-file-input" right>{{ $t('tutorial.step3') }}</tutorial-step>
      <tutorial-step :step="4" activator=".inactive-image .image-upload-save" right>{{ $t('tutorial.step4') }}</tutorial-step>
      <tutorial-step :step="5" activator=".inactive-image .image-upload-revert" right>{{ $t('tutorial.step5') }}</tutorial-step>
      <tutorial-step :step="6" activator=".speaking-image" right>{{ $t('tutorial.step6') }}</tutorial-step>
      <tutorial-step :step="7" activator=".speaking-image" right>{{ $t('tutorial.step7') }}</tutorial-step>
      <tutorial-step :step="8" activator=".links" left>{{ $t('tutorial.step8') }}</tutorial-step>
      <tutorial-step :step="9" activator=".links .group-source" left>{{ $t('tutorial.step9') }}</tutorial-step>
      <tutorial-step :step="10" activator=".links .self-source" left>{{ $t('tutorial.step10') }}</tutorial-step>
      <tutorial-step :step="11" activator=".links .other-source" left>{{ $t('tutorial.step11') }}</tutorial-step>
      <tutorial-step :step="12" activator=".links .other-source .source-settings" left>{{ $t('tutorial.step12') }}</tutorial-step>
      <tutorial-step :step="13" activator="" bottom>{{ $t('tutorial.step13') }}</tutorial-step>
      <tutorial-step :step="14" activator=".links .links-warning" left>{{ $t('tutorial.step14') }}</tutorial-step>
      <tutorial-step :step="15" activator=".config" left>{{ $t('tutorial.step15') }}</tutorial-step>
      <tutorial-step :step="16" activator=".config .bounce" left>{{ $t('tutorial.step16') }}</tutorial-step>
      <tutorial-step :step="17" activator=".config .include-self" left>{{ $t('tutorial.step17') }}</tutorial-step>
      <tutorial-step :step="18" activator=".config .image-spacing" left>{{ $t('tutorial.step18') }}</tutorial-step>
      <tutorial-step :step="19" activator=".config .v-btn" left>{{ $t('tutorial.step19') }}</tutorial-step>
      <tutorial-step :step="20" activator=".dri-footer" final top>{{ $t('tutorial.step20') }}</tutorial-step>
    </v-overlay>
  </v-app>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  useContext,
  useStore,
  toRefs,
  reactive,
  ref,
  onMounted,
} from '@nuxtjs/composition-api'
import { useDiscordRPC } from '~/assets/discordrpc'
import { publicImageUrl } from '~/assets/publicImage'

const DEMO_EMBED_AVATAR = 'https://cdn.discordapp.com/embed/avatars/2.png'

interface State {
  tutorial: Number
}

interface Link {
  label: string
  value: string
  class?: string
  settings?: {
    id: string
    name: string
    speaking?: string
    inactive?: string
    speakingBase: string
    inactiveBase: string
  }
}

export default defineComponent({
  setup() {
    // @ts-ignore
    const { $api, $user, $route, app } = useContext()
    const store = useStore<State>()

    const t = (key: string, params?: any) => app.i18n.t(key, params) as string

    const promoVideoUrl = process.env.PROMO_VIDEO_URL || ''
    const gateEnabled = process.env.SITE_GATE_ENABLED === '1'
    const gateOk = ref(!gateEnabled)
    const accessCode = ref('')
    const gateError = ref<string | null>(null)
    const gateSubmitting = ref(false)

    const login = (platform: string) => `/auth/${platform}/login?path=${encodeURIComponent($route?.fullPath || '/')}`
    const logout = () => `/auth/logout?path=${encodeURIComponent($route?.fullPath || '/')}`

    const tutorial = computed(() => store.state.tutorial)
    const tutorialClass = computed(() =>
      tutorial.value ? `tutorial-${tutorial.value.toString().padStart(2, '0')}` : null
    )
    const setTutorial = (step: number) => store.commit('setTutorial', step)

    const needGateHint = computed(() => $route?.query?.need_gate === '1')
    const showGateForm = computed(() => gateEnabled && !gateOk.value)

    const siteOrigin = computed(() => {
      if (typeof window !== 'undefined') return window.location.origin
      return (process.env.APP_URL || '').replace(/\/$/, '') || ''
    })

    async function submitAccess() {
      gateError.value = null
      gateSubmitting.value = true
      try {
        const origin = typeof window !== 'undefined' ? window.location.origin : ''
        const r = await fetch(`${origin}/access/verify`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: accessCode.value }),
        })
        const d = await r.json().catch(() => ({}))
        if (!r.ok) {
          gateError.value = (d as { error?: string })?.error || t('gate.wrongCode')
          return
        }
        gateOk.value = true
      } catch (_) {
        gateError.value = t('gate.checkError')
      } finally {
        gateSubmitting.value = false
      }
    }

    onMounted(async () => {
      if (!gateEnabled) return
      try {
        const origin = typeof window !== 'undefined' ? window.location.origin : ''
        const r = await fetch(`${origin}/access/check`, { credentials: 'include' })
        const d = await r.json().catch(() => ({}))
        if ((d as { ok?: boolean }).ok) gateOk.value = true
      } catch (_) {}
    })

    if (!$user) {
      return {
        login,
        logout,
        tutorial,
        tutorialClass,
        setTutorial,
        promoVideoUrl,
        gateOk,
        accessCode,
        gateError,
        gateSubmitting,
        needGateHint,
        showGateForm,
        submitAccess,
      }
    }

    const { members, config, error } = useDiscordRPC()

    const data = reactive({
      configError: null as string | null,
      configSaving: false,
    })

    const currentImages = ref({
      inactive: null as string | null,
      speaking: null as string | null,
      base: '',
    })
    $api.get_image($user.id).then((v: any) => {
      currentImages.value = {
        ...v,
        base: `https://cdn.discordapp.com/avatars/${$user.id}/${$user.avatar}.png?size=1024`,
      }
    })

    const otherMembers = computed(() => members.value.filter((m) => m.id !== config.value.id))

    const links = computed(() => {
      const _locale = app.i18n.locale
      const origin = siteOrigin.value
      const r: Link[] = [
        {
          label: t('links.groupSource'),
          value: `${origin}/group`,
          class: 'group-source',
        },
        {
          label: t('links.selfSource'),
          value: `${origin}/individual/${$user && $user.id}`,
          class: 'self-source',
        },
      ]

      if (tutorial.value > 0) {
        r.push({
          label: t('links.individualSource', { name: 'ДругА' }),
          value: `${origin}/individual/00000000000000001`,
          class: 'other-source',
          settings: {
            id: '00000000000000001',
            name: 'ДругА',
            speakingBase: DEMO_EMBED_AVATAR,
            inactiveBase: DEMO_EMBED_AVATAR,
          },
        })
        r.push({
          label: t('links.individualSource', { name: 'ДругБ' }),
          value: `${origin}/individual/00000000000000002`,
          class: 'other-source',
          settings: {
            id: '00000000000000002',
            name: 'ДругБ',
            speakingBase: DEMO_EMBED_AVATAR,
            inactiveBase: DEMO_EMBED_AVATAR,
          },
        })
        return r
      }

      for (const m of otherMembers.value) {
        r.push({
          label: t('links.individualSource', { name: m.name }),
          value: `${origin}/individual/${m.id}`,
          settings: {
            id: m.id,
            name: m.name,
            speaking: m.rawImages?.speakingOverride,
            inactive: m.rawImages?.inactiveOverride,
            speakingBase:
              publicImageUrl(m.rawImages?.speaking) ||
              publicImageUrl(m.rawImages?.inactive) ||
              `https://cdn.discordapp.com/avatars/${m.id}/${m.avatar}.png?size=1024`,
            inactiveBase:
              publicImageUrl(m.rawImages?.inactive) ||
              publicImageUrl(m.rawImages?.speaking) ||
              `https://cdn.discordapp.com/avatars/${m.id}/${m.avatar}.png?size=1024`,
          },
        })
      }

      return r
    })

    return {
      login,
      logout,
      error,
      config,
      ...toRefs(data),
      tutorial,
      tutorialClass,
      setTutorial,
      currentImages,
      otherMembers,
      links,
      promoVideoUrl,
      gateOk,
      accessCode,
      gateError,
      gateSubmitting,
      needGateHint,
      showGateForm,
      submitAccess,
      copyText(text: string) {
        navigator.clipboard.writeText(text)
      },
      async saveConfig() {
        data.configSaving = true
        try {
          await $api.set_config({
            includeSelf: config.value.includeSelf,
            bounce: config.value.bounce,
            gapPercentage: config.value.gapPercentage,
          })
          data.configError = null
        } catch (err: any) {
          data.configError = err?.message || String(err)
        }
        data.configSaving = false
      },
    }
  },
})
</script>

<style>
.inactive-image .v-image {
  filter: brightness(50%);
}

.dri-app .v-application--wrap {
  background: transparent !important;
}

.dri-app-bar {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.dri-hero-text {
  max-width: 560px;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.65;
}

.dri-hero-text a {
  color: #ffffff !important;
  text-decoration: underline;
}

.dri-main-landing {
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;
}
.dri-main-landing .v-main__wrap {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-video {
  display: block;
  margin: 0 auto 40px;
  max-width: 100%;
  max-height: 420px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.dri-footer a {
  text-decoration: underline;
}

.lang-btn {
  min-width: 0 !important;
  padding: 0 6px !important;
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.04em !important;
}

.tutorial-02 .inactive-image,
.tutorial-03 .inactive-image .v-file-input,
.tutorial-04 .inactive-image .image-upload-save,
.tutorial-05 .inactive-image .image-upload-revert,
.tutorial-06 .speaking-image,
.tutorial-07 .speaking-image,
.tutorial-08 .links,
.tutorial-09 .links .group-source,
.tutorial-10 .links .self-source,
.tutorial-11 .links .other-source,
.tutorial-12 .links .other-source .source-settings,
.tutorial-13 .source-settings-modal,
.tutorial-14 .links .links-warning,
.tutorial-15 .config,
.tutorial-16 .config .bounce,
.tutorial-17 .config .include-self,
.tutorial-18 .config .image-spacing,
.tutorial-19 .config .v-btn,
.tutorial-20 .dri-footer {
  z-index: 6 !important;
  position: relative !important;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.35) !important;
  border-radius: 12px !important;
  pointer-events: none !important;
}

.tutorial-13 .v-overlay {
  z-index: 5 !important;
}
.tutorial-13 .v-dialog__content {
  z-index: 6 !important;
}
.tutorial-13 .v-dialog {
  overflow: visible !important;
}
</style>

<style scoped>
.title-link {
  color: inherit !important;
  text-decoration: none;
}
</style>
