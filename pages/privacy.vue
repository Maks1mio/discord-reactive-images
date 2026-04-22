<template>
  <v-app dark>
    <v-main>
      <v-container class="py-12" style="max-width: 800px">
        <v-btn text small class="mb-6 dri-muted" nuxt to="/">{{ $t('privacy.back') }}</v-btn>

        <h1 class="text-h4 font-weight-bold white--text mb-8">{{ $t('privacy.title') }}</h1>

        <div class="dri-legal-body">
          <p>{{ $t('privacy.lastUpdated', { date: lastUpdated }) }}</p>

          <h2>{{ $t('privacy.s1title') }}</h2>
          <p>{{ $t('privacy.s1intro') }}</p>
          <ul>
            <li>{{ $t('privacy.s1li1') }}</li>
            <li>{{ $t('privacy.s1li2') }}</li>
            <li>{{ $t('privacy.s1li3') }}</li>
            <li>{{ $t('privacy.s1li4') }}</li>
          </ul>

          <h2>{{ $t('privacy.s2title') }}</h2>
          <p>{{ $t('privacy.s2intro') }}</p>
          <ul>
            <li>{{ $t('privacy.s2li1') }}</li>
            <li>{{ $t('privacy.s2li2') }}</li>
            <li>{{ $t('privacy.s2li3') }}</li>
          </ul>

          <h2>{{ $t('privacy.s3title') }}</h2>
          <p>{{ $t('privacy.s3text') }}</p>

          <h2>{{ $t('privacy.s4title') }}</h2>
          <p>{{ $t('privacy.s4text') }}</p>

          <h2>{{ $t('privacy.s5title') }}</h2>
          <p>{{ $t('privacy.s5text') }}</p>

          <h2>{{ $t('privacy.s6title') }}</h2>
          <p>
            {{ $t('privacy.s6text') }}
            <a href="https://discord.com/privacy" target="_blank" rel="noopener noreferrer">{{ $t('privacy.s6link') }}</a>.
          </p>

          <h2>{{ $t('privacy.s7title') }}</h2>
          <p>{{ $t('privacy.s7text') }}</p>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, computed } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'PrivacyPage',
  layout: 'empty',
  setup() {
    const lastUpdated = computed(() =>
      new Date().toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })
    )
    return { lastUpdated }
  },
})
</script>

<style scoped>
.dri-legal-body {
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.8;
}
.dri-legal-body h2 {
  color: #fff;
  font-size: 1.15rem;
  font-weight: 600;
  margin: 2rem 0 0.75rem;
}
.dri-legal-body p {
  margin-bottom: 1rem;
}
.dri-legal-body ul {
  margin: 0 0 1rem 1.5rem;
}
.dri-legal-body li {
  margin-bottom: 0.25rem;
}
.dri-legal-body a {
  color: #fff;
}
</style>
