import { NextRequest, NextResponse } from 'next/server';
import { HUB_PATH, HUB_SOURCE_CTA, OFFER_SOURCES, type MethodKey } from '@/lib/hub/prolaps-content';

export const runtime = 'nodejs';

// Заявки з хабу діагнозу (область пропозицій) ідуть тим самим шляхом, що із сайту лікаря
// і піддомену клініки: POST /api/leads/onclinic платформи → onclinic_leads → Telegram-група
// клініки за clinic_slug. Цей маршрут лише пересилає заявку сервер-сервер, бо ендпоінт
// платформи не приймає запити з браузера іншого домену. У базу тут нічого не пишеться.
// Наявний /api/leads (таблиця leads, потік чекапів) не змінюється.

const PLATFORM_ORIGIN = (process.env.LEADS_PLATFORM_ORIGIN ?? 'https://onclinic.check-up.in.ua').replace(/\/+$/, '');

interface HubLeadPayload {
  name?: string;
  phone?: string;
  consent_given?: boolean;
  clinic_slug?: string;
  preferred_doctor?: string;
  /** Ключ методу або null – «Ще не знаю, потрібна консультація». */
  method?: MethodKey | null;
  session_id?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  referrer?: string | null;
  /** honeypot – має бути порожнім */
  website?: string;
}

function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('0')) digits = `38${digits}`;
  return digits.length === 12 && digits.startsWith('380') ? `+${digits}` : null;
}

export async function POST(req: NextRequest) {
  let body: HubLeadPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  // Honeypot: тихо приймаємо, нікуди не пересилаємо
  if (body.website) return NextResponse.json({ ok: true });

  const name = (body.name ?? '').trim();
  const phone = normalizePhone(body.phone ?? '');
  if (name.length < 2 || !phone || body.consent_given !== true) {
    return NextResponse.json({ error: 'validation failed' }, { status: 422 });
  }

  // Клініка і метод – лише з переліку пропозицій хабу; case_slug визначає сервер.
  const clinicSlug = (body.clinic_slug ?? '').trim();
  const clinicSources = OFFER_SOURCES.filter((s) => s.clinicSlug === clinicSlug);
  if (clinicSources.length === 0) {
    return NextResponse.json({ error: 'unknown clinic' }, { status: 422 });
  }
  const source = body.method ? clinicSources.find((s) => s.method === body.method) : undefined;
  if (body.method && !source) {
    return NextResponse.json({ error: 'unknown method' }, { status: 422 });
  }
  const doctor = (body.preferred_doctor ?? '').trim();
  if (!/^[a-z0-9-]{2,80}$/.test(doctor)) {
    return NextResponse.json({ error: 'unknown doctor' }, { status: 422 });
  }

  const payload = {
    name,
    phone,
    contact_channels: ['call'],
    consent_given: true,
    consultation_intent: source ? 'case_confirmed' : 'diagnosis_clarification',
    case_slug: source?.serviceSlug ?? null,
    preferred_doctor: doctor,
    clinic_slug: clinicSlug,
    source_cta: HUB_SOURCE_CTA,
    source_page: HUB_PATH,
    session_id: body.session_id ?? null,
    utm_source: body.utm_source ?? null,
    utm_medium: body.utm_medium ?? null,
    utm_campaign: body.utm_campaign ?? null,
    utm_content: body.utm_content ?? null,
    utm_term: body.utm_term ?? null,
    referrer: body.referrer ?? null,
  };

  try {
    const res = await fetch(`${PLATFORM_ORIGIN}/api/leads/onclinic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': req.headers.get('user-agent') ?? 'check-up.in.ua hub',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) {
      console.error('[leads/hub] platform', res.status, clinicSlug);
      return NextResponse.json({ error: 'lead not accepted' }, { status: 502 });
    }
  } catch (err: unknown) {
    console.error('[leads/hub] platform', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'lead not accepted' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
