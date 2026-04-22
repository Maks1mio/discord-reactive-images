<template>
  <v-app dark class="dri-app">
    <v-main class="d-flex align-center justify-center fill-height pa-6">
      <div class="text-center" style="max-width: 420px">
        <h1 class="text-h5 font-weight-bold mb-4 white--text">
          {{ error.statusCode === 404 ? $t('error.notFound') : $t('error.errorTitle') }}
        </h1>
        <p class="dri-muted text-body-2 mb-8">
          {{ error.statusCode === 404 ? $t('error.notFoundHint') : $t('error.errorHint') }}
        </p>
        <v-btn class="dri-btn-light px-8" depressed nuxt to="/">{{ $t('error.home') }}</v-btn>
      </div>
    </v-main>
  </v-app>
</template>

<script>
export default {
  layout: 'empty',
  props: {
    error: {
      type: Object,
      default: null,
    },
  },
  head() {
    const title = this.error.statusCode === 404 ? this.$t('error.notFound') : this.$t('error.errorTitle')
    return { title }
  },
}
</script>

<style scoped>
.dri-muted {
  color: rgba(255, 255, 255, 0.55);
}
</style>
