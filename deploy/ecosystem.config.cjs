const path = require('path')

/** PM2: из каталога deploy/ поднимает приложение из корня репозитория. */
module.exports = {
  apps: [
    {
      name: 'dri',
      cwd: path.join(__dirname, '..'),
      script: 'node_modules/nuxt/bin/nuxt.js',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        /** Смените, если порт занят (nginx проксирует на него) */
        PORT: 3004,
      },
    },
  ],
}
