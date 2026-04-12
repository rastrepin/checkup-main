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
