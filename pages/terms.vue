<template>
  <v-app dark>
    <v-main>
      <v-container class="py-12" style="max-width: 800px">
        <v-btn text small class="mb-6 dri-muted" nuxt to="/">← Назад</v-btn>

        <h1 class="text-h4 font-weight-bold white--text mb-8">Условия использования</h1>

        <div class="dri-legal-body">
          <p>Последнее обновление: {{ lastUpdated }}</p>

          <h2>1. Принятие условий</h2>
          <p>
            Используя сервис Discord Reactive Images («Сервис»), вы соглашаетесь с настоящими Условиями использования.
            Если вы не согласны — не используйте Сервис.
          </p>

          <h2>2. Описание сервиса</h2>
          <p>
            Сервис позволяет загружать изображения и формировать ссылки для использования в качестве браузерных
            источников (Browser Source) в OBS Studio и других программах стриминга. Изображения отображаются в
            зависимости от голосовой активности в Discord.
          </p>

          <h2>3. Ваши данные</h2>
          <p>
            При входе через Discord мы получаем ваш Discord ID, имя пользователя и аватар. Эти данные используются
            исключительно для идентификации и отображения ваших настроек. Мы не передаём их третьим лицам.
          </p>

          <h2>4. Загружаемые изображения</h2>
          <p>
            Вы несёте ответственность за загружаемые изображения. Запрещено загружать материалы, нарушающие
            авторские права, содержащие насилие, материалы для взрослых или иной незаконный контент.
          </p>

          <h2>5. Доступность сервиса</h2>
          <p>
            Мы не гарантируем бесперебойную работу сервиса и вправе прекратить или изменить его без предварительного
            уведомления.
          </p>

          <h2>6. Ограничение ответственности</h2>
          <p>
            Сервис предоставляется «как есть». Мы не несём ответственности за убытки, возникшие в результате
            использования или невозможности использования Сервиса.
          </p>

          <h2>7. Изменения условий</h2>
          <p>
            Мы можем обновлять настоящие условия. Актуальная версия всегда доступна на этой странице.
            Продолжая использовать Сервис после изменений, вы принимаете новые условия.
          </p>
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
    const lastUpdated = computed(() => {
      return new Date().toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })
    })
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
