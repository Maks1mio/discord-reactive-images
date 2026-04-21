<template>
  <div class="dri-starry-bg">
    <nuxt />
  </div>
</template>

<script>
export default {
  middleware: 'gate',
}
</script>

<style>
html {
  overflow-y: auto !important;
}
</style>
