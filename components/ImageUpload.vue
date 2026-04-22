<template>
  <v-card flat class="dri-panel">
    <v-card-title class="text-subtitle-1 font-weight-bold"> {{ title }} </v-card-title>
    <v-card-text>
      <v-img class="mb-4" :src="imagePreview" max-height="min(1080px, calc(98vh - 400px))" :aspect-ratio="9 / 16" contain />

      <v-file-input
        v-model="imageFile"
        dark
        outlined
        dense
        :label="$t('imageUpload.newImage')"
        prepend-icon="mdi-camera"
        accept="image/*"
        show-size
      />

      <v-btn
        class="image-upload-save dri-btn-light"
        block
        depressed
        :disabled="!imageData || imageSaving"
        :loading="imageSaving"
        @click="setImage"
      >
        {{ $t('imageUpload.save') }}
      </v-btn>

      <v-btn
        class="mt-3 image-upload-revert"
        block
        outlined
        color="white"
        :disabled="!value || imageSaving"
        :loading="imageSaving"
        @click="clearImage"
      >
        {{ $t('imageUpload.reset') }}
      </v-btn>

      <v-alert v-if="error" class="mt-4" type="error">
        {{ error }}
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, computed, useContext, watch, toRefs, reactive } from '@nuxtjs/composition-api'
import { publicImageUrl } from '~/assets/publicImage'

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true,
    },
    value: {
      type: String,
    },
    fallback: {
      type: String,
    },
    base: {
      type: String,
      required: true,
    },
    user: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    // @ts-ignore
    const { $api } = useContext()

    const data = reactive({
      error: null as string | null,
      imageFile: <File | null>null,
      imageDataURL: '',
      imageSaving: false,
    })

    const imagePreview = computed(
      () =>
        data.imageDataURL ||
        (props.value && publicImageUrl(props.value)) ||
        (props.fallback && publicImageUrl(props.fallback)) ||
        props.base
    )

    const imageData = computed(() => (data.imageDataURL ? data.imageDataURL.replace(/^.*?;base64,/, '') : null))

    watch(
      () => data.imageFile,
      (v) => {
        if (!v) {
          data.imageDataURL = ''
          return
        }

        const reader = new FileReader()
        reader.addEventListener('load', () => {
          data.imageDataURL = <string>reader.result
        })
        reader.addEventListener('error', () => {
          data.imageDataURL = ''
        })
        reader.readAsDataURL(v)
      }
    )

    const _setImage = async (v: string | null) => {
      data.imageSaving = true

      try {
        const image = await $api.set_image({
          image: v,
          user: props.user,
          purpose: props.purpose,
        })

        emit('input', image)
        data.imageFile = null
        data.error = null
      } catch (err: any) {
        data.error = err?.message || String(err)
      }

      data.imageSaving = false
    }

    return {
      ...toRefs(data),
      imagePreview,
      imageData,
      async setImage() {
        if (!imageData.value) return
        await _setImage(imageData.value)
      },
      async clearImage() {
        if (!props.value) return
        await _setImage(null)
      },
    }
  },
})
</script>
