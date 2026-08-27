import { createClient } from '@supabase/supabase-js';

// Lazy singleton — не ініціалізується під час build без env vars
let _client: ReturnType<typeof createClient> | null = null;

export function db() {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Supabase env vars missing');
    _client = createClient(url, key);
  }
  return _client;
}

// Backward compat для клієнтських компонентів
export const supabase = new Proxy(
  {} as ReturnType<typeof createClient>,
  { get: (_target, prop) => db()[prop as keyof ReturnType<typeof createClient>] }
);

// leads.clinic_id не має hard FK (LEADS-TRANSPORT-STANDARD п.2/п.7) — застарілий
// або невідповідний id не має права заблокувати INSERT ліда. Викликати ЛИШЕ
// після того, як лід вже збережено: це best-effort збагачення для UI/сповіщень
// (напр. clinics.telegram_chat_id), не критичний шлях. Будь-яка помилка тут —
// null, лід вже в базі з сирим clinic_id.
export async function resolveClinicName(clinicId: string | null | undefined): Promise<string | null> {
  if (!clinicId) return null;
  try {
    const { data, error } = await (db() as any)
      .from('clinics')
      .select('name')
      .eq('id', clinicId)
      .single();
    if (error || !data) return null;
    return data.name ?? null;
  } catch {
    return null;
  }
}
