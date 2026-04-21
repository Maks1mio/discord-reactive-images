# Деплой DRI на Ubuntu (PM2 + nginx + HTTPS)


## 2. Клонирование и зависимости

```bash
cd /var/www
git clone https://github.com/Maks1mio/discord-reactive-images.git discord-reactive-images
cd discord-reactive-images
corepack enable 2>/dev/null || true
yarn install --frozen-lockfile
```

## 3. Переменные окружения

```bash
cp .env.example .env
nano .env
```

Обязательно:

| Переменная | Пример |
|------------|--------|
| `NODE_ENV` | `production` |
| `APP_URL` | `https://dri.maks1mio.su` |
| `DISCORD_ID` / `DISCORD_SECRET` | из Discord Developer Portal |
| `NACL_KEY` / `JWT_KEY` | base64, сгенерировать локально и не менять после прод-логинов |
| `DB_*` | ваш PostgreSQL |
| `UPLOAD_DIR` | например `/var/www/discord-reactive-images/uploads/images` |

Создайте каталог загрузок:

```bash
mkdir -p uploads/images
chown -R www-data:www-data uploads   # или пользователь, под которым крутится Node
```

В **Discord Developer Portal → OAuth2 → Redirects** добавьте:

- `https://dri.maks1mio.su/auth/discord/callback`

Для локального RPC оставьте также `http://localhost:3000/...` при необходимости.

## 4. Сборка

```bash
yarn build
```

## 5. PM2

Порт по умолчанию в `deploy/ecosystem.config.cjs` — **3004** (чтобы не конфликтовать с другими процессами). При необходимости поменяйте `PORT` и тот же порт в nginx.

```bash
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup   # выполнить выведенную команду systemd
```

Проверка: `curl -sI http://127.0.0.1:3004` — должен ответить Nuxt.

## 6. nginx

```bash
apt install -y nginx
cp deploy/nginx-dri.conf.example /etc/nginx/sites-available/dri.maks1mio.su
ln -sf /etc/nginx/sites-available/dri.maks1mio.su /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

## 7. HTTPS (Let’s Encrypt)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d dri.maks1mio.su
```

Certbot допишет `listen 443 ssl` и сертификаты; при необходимости включите редирект HTTP→HTTPS в конфиге certbot.

## 8. Обновление после `git push`

```bash
cd /var/www/discord-reactive-images
git pull
yarn install --frozen-lockfile
yarn build
pm2 restart dri
```

---

Если что-то не открывается: `pm2 logs dri`, `journalctl -u nginx -e`, проверка firewall (`ufw allow 80,443/tcp`).
