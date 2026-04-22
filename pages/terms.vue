<template>
  <v-app dark>
    <v-main>
      <v-container class="py-12" style="max-width: 800px">
        <v-btn text small class="mb-6 dri-muted" nuxt to="/">{{ $t('terms.back') }}</v-btn>

        <h1 class="text-h4 font-weight-bold white--text mb-8">{{ $t('terms.title') }}</h1>

        <div class="dri-legal-body">
          <p>{{ $t('terms.lastUpdated', { date: lastUpdated }) }}</p>

          <h2>{{ $t('terms.s1title') }}</h2>
          <p>{{ $t('terms.s1text') }}</p>

          <h2>{{ $t('terms.s2title') }}</h2>
          <p>{{ $t('terms.s2text') }}</p>

          <h2>{{ $t('terms.s3title') }}</h2>
          <p>{{ $t('terms.s3text') }}</p>

          <h2>{{ $t('terms.s4title') }}</h2>
          <p>{{ $t('terms.s4text') }}</p>

          <h2>{{ $t('terms.s5title') }}</h2>
          <p>{{ $t('terms.s5text') }}</p>

          <h2>{{ $t('terms.s6title') }}</h2>
          <p>{{ $t('terms.s6text') }}</p>

          <h2>{{ $t('terms.s7title') }}</h2>
          <p>{{ $t('terms.s7text') }}</p>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, computed } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'TermsPage',
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
</style>
