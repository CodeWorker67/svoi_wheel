# Колесо фортуны — ВПН ДЛЯ СВОИХ

Telegram Mini App (React + Vite). API: бэкенд **SpeedGamer020326** (`/api/wheel/*`).

## Локальный запуск

1. Поднимите `web_api` SpeedGamer (порт **8080** по умолчанию).
2. В `svoi_wheel`: `npm install && npm run dev` (порт **5175**, прокси `/api` → `127.0.0.1:8080`).
3. В `.env` бота: `WHEEL_MINIAPP_URL=https://<ваш-ngrok-5175>`.
4. В BotFather: Menu Button / Web App → тот же HTTPS URL.

## Попытки

- **+1** за оплату подписки на **90 дней** (3 месяца).
- **+1** за каждые **7** оплативших друзей по партнёрской ссылке.

## Prod

`npm run build` → статика в `dist/`. Разместите на HTTPS и укажите URL в `WHEEL_MINIAPP_URL`.
