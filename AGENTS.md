<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Тестові заявки і перевірка після деплою (рішення Ігоря 15.11.2026)

Повні правила – `docs/QA-AFTER-DEPLOY.md`.

- `TELEGRAM_CHAT_ID` ніколи не вказує на чат клініки чи партнера, лише на групу «тест бот з лідами».
- Тестові заявки ніколи не йдуть у робочі чати клінік чи на пошту клінік.
- Масове надсилання тестових заявок у Telegram не вмикати без рішення Ігоря.
- Будь-яка зміна перевірки після деплою, маршруту заявок чи цих змінних – лише через PR і лише зі згоди Ігоря.
