import { db } from '@/lib/supabase';

// Запобіжник контрольного чату (рішення Ігоря 15.11, docs/QA-AFTER-DEPLOY.md, розділ 2).
// TELEGRAM_CHAT_ID має вказувати лише на «тест бот з лідами». Перед кожним надсиланням у нього
// маршрут заявок звіряє його з чатами клінік (clinics.telegram_chat_id). Збіг або невдале читання бази –
// у Telegram нічого не йде. ID чатів у лог і у відповіді не потрапляють.

const CACHE_MS = 5 * 60 * 1000;

let cache: { at: number; chats: string[] } | null = null;

function norm(v: unknown): string {
  return String(v ?? '').trim();
}

/**
 * Чи можна надсилати в контрольний чат.
 * clinicChats – непорожні clinics.telegram_chat_id; null – базу прочитати не вдалося.
 * 'ok' – збігу немає; 'match' – чат збігається з чатом клініки; 'unknown' – немає чату або списку.
 */
export function controlChatVerdict(chatId: string | null | undefined, clinicChats: string[] | null): 'ok' | 'match' | 'unknown' {
  const id = norm(chatId);
  if (!id || clinicChats === null) return 'unknown';
  return clinicChats.some((c) => norm(c) === id) ? 'match' : 'ok';
}

/** Непорожні чати клінік. Кеш до 5 хвилин; помилка не кешується і дає null. */
export async function loadClinicChats(): Promise<string[] | null> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.chats;
  try {
    // Ключ anon: політика «Public read clinics» віддає лише активні клініки (is_active = true).
    // Неактивні рядки цим ключем не читаються – див. звіт до PR (розбіжність).
    const { data, error } = await (db() as any).from('clinics').select('telegram_chat_id').not('telegram_chat_id', 'is', null);
    if (error || !Array.isArray(data)) return null;
    const chats = data.map((r: { telegram_chat_id: unknown }) => norm(r.telegram_chat_id)).filter(Boolean);
    cache = { at: Date.now(), chats };
    return chats;
  } catch {
    return null;
  }
}

/** Вердикт для поточного TELEGRAM_CHAT_ID. */
export async function checkControlChat(): Promise<'ok' | 'match' | 'unknown'> {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!norm(chatId)) return 'unknown';
  return controlChatVerdict(chatId, await loadClinicChats());
}
