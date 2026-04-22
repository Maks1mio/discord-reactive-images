<template>
  <v-app dark>
    <v-main>
      <v-container class="py-12" style="max-width: 800px">
        <v-btn text small class="mb-6 dri-muted" nuxt to="/">← Назад</v-btn>

        <h1 class="text-h4 font-weight-bold white--text mb-8">Политика конфиденциальности</h1>

        <div class="dri-legal-body">
          <p>Последнее обновление: {{ lastUpdated }}</p>

          <h2>1. Какие данные мы собираем</h2>
          <p>При авторизации через Discord мы получаем:</p>
          <ul>
            <li>Discord ID</li>
            <li>Имя пользователя и дискриминатор</li>
            <li>URL аватара</li>
            <li>Адрес электронной почты (только для идентификации, не отображается публично)</li>
          </ul>

          <h2>2. Как мы используем данные</h2>
          <p>Данные используются исключительно для:</p>
          <ul>
            <li>Идентификации вашего аккаунта в системе</li>
            <li>Привязки ваших изображений к вашему Discord профилю</li>
            <li>Отображения аватара по умолчанию</li>
          </ul>

          <h2>3. Хранение данных</h2>
          <p>
            Ваши данные хранятся в защищённой базе данных. Загружаемые изображения сохраняются на сервере.
            Данные не передаются третьим лицам и не используются в рекламных целях.
          </p>

          <h2>4. Cookies</h2>
          <p>
            Мы используем куки для хранения сессии авторизации. Куки удаляются при выходе из аккаунта.
            Без куки авторизация невозможна.
          </p>

          <h2>5. Удаление данных</h2>
          <p>
            Вы можете запросить удаление всех ваших данных, написав нам. После удаления восстановление невозможно.
          </p>

          <h2>6. Сторонние сервисы</h2>
          <p>
            Авторизация осуществляется через Discord OAuth2. На передачу данных Discord распространяется
            <a href="https://discord.com/privacy" target="_blank" rel="noopener noreferrer">политика конфиденциальности Discord</a>.
          </p>

          <h2>7. Изменения политики</h2>
          <p>
            Мы можем обновлять данную политику. Актуальная версия всегда доступна на этой странице.
          </p>
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
