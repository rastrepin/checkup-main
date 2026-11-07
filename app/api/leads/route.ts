import { NextRequest, NextResponse, after } from 'next/server';
import { db } from '@/lib/supabase';

export const runtime = 'nodejs';

// Доставка клініці: після запису в leads передаємо id заявки платформі
// (POST /api/leads/checkup). Платформа читає заявку з бази і шле її в групу клініки
// (clinics.telegram_chat_id) + контрольний чат — той самий шлях, що для піддоменів
// і Tilda. Якщо платформа недоступна, як раніше шлемо заявку в контрольний чат
// звідси (notifyTelegram), щоб її не загубити.
const PLATFORM_ORIGIN = (process.env.LEADS_PLATFORM_ORIGIN ?? 'https://onclinic.check-up.in.ua').replace(/\/+$/, '');

// Тестовий режим автоперевірки (scripts/qa): заявка з зарезервованим номером +380 00 000 00 00
// пишеться в leads зі status = 'test', клініці НЕ передається, іде лише в контрольний чат з позначкою тесту.
// Такого номера в Україні не існує, тож реальний пацієнт його не введе. Відповідь на тестову заявку
// містить те, що сервер зберіг (програма, ціна, послуги з назвами і цінами з бази), – перевірка звіряє це
// з тим, що бачив користувач. GET /api/leads повідомляє перевірці, що тестовий режим є: без нього
// перевірка заявок не відправляє.
const QA_TEST_PHONE_DIGITS = '380000000000';
const QA_TEST_MODE_VERSION = 1;

interface ResolvedService {
  id: string;
  name: string | null;
  price: number | null;
  clinic_id: string | null;
  exams: string[];
}

interface LeadPayload {
  name: string;
  phone: string;
  preferred_contact?: 'call' | 'telegram' | 'viber';
  city: string;
  clinic_id?: string | null;
  clinic_slug?: string | null;
  selected_program_slug?: string | null;
  program_name?: string | null;
  price?: number | null;
  selected_branch_id?: string | null;
  branch_address?: string | null;
  selected_date_label?: string | null;
  source_page: string;
  source_cta?: string | null;
  /** Текстове поле — напр. "Додатково цікавить: ..." з AdditionalServices.
   *  Рішення Cowork 29.08.2026 п.3: без окремої колонки на цю ітерацію. */
  comment?: string | null;
  session_id?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  consent_given: boolean;
  /** «Мій план» (my-plan §5, DATABASE.md 6.1): 2 – запис за планом без програми клініки (Р60). */
  variant?: number | null;
  entry_point?: 'page' | 'quiz' | 'search' | null;
  /** id послуг клініки (clinic_services.id) з правила суми плану. Без назв, причин і факторів (PLATFORM-LINE 7.1). */
  added_service_ids?: string[] | null;
  /** honeypot — має бути порожнім */
  website?: string;
}

/** Telegram-нотифікація: викликається через after() – виконується після відповіді користувачу, функція дочікується відправлення */
function notifyTelegram(lead: LeadPayload, warning?: string, extra: string[] = []): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error('[leads] telegram env missing');
    return Promise.resolve();
  }

  const lines = [
    warning ?? null,
    '🟢 Нова заявка (check-up.in.ua)',
    `Ім'я: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    lead.preferred_contact ? `Зв'язок: ${lead.preferred_contact}` : null,
    lead.program_name ? `Програма: ${lead.program_name}` : null,
    lead.price ? `Ціна: ${lead.price} грн` : null,
    lead.variant === 2 ? `Запис за планом: ${lead.added_service_ids?.length ?? 0} послуг клініки` : null,
    lead.branch_address ? `Філія: ${lead.branch_address}` : null,
    lead.selected_date_label ? `Бажаний день: ${lead.selected_date_label}` : null,
    lead.comment ? lead.comment : null,
    ...extra,
    `Сторінка: ${lead.source_page}`,
    lead.source_cta ? `CTA: ${lead.source_cta}` : null,
  ].filter(Boolean);

  return fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: lines.join('\n') }),
  })
    .then((res) => {
      if (!res.ok) console.error('[leads] telegram', res.status);
    })
    .catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[leads] telegram', msg.split(token).join('***'));
    });
}

/** Послуги клініки за id із заявки: назва, ціна, клініка і обстеження, до яких послуга входить (лише для тестових заявок). */
async function resolveServices(ids: string[]): Promise<ResolvedService[]> {
  if (ids.length === 0) return [];
  try {
    const sb = db() as any;
    const [{ data: svc }, { data: links }] = await Promise.all([
      sb.from('clinic_services').select('id, name_ua, price, clinic_id').in('id', ids),
      sb.from('clinic_service_examinations').select('clinic_service_id, examination_slug, in_price').in('clinic_service_id', ids),
    ]);
    const slugs = [...new Set(((links ?? []) as any[]).filter((l) => l.in_price === true).map((l) => l.examination_slug as string))];
    const { data: exams } = slugs.length > 0 ? await sb.from('examinations').select('slug, name_ua').in('slug', slugs) : { data: [] };
    const examName: Record<string, string> = Object.fromEntries(((exams ?? []) as any[]).map((e) => [e.slug, String(e.name_ua ?? e.slug).trim()]));
    const byId: Record<string, any> = Object.fromEntries(((svc ?? []) as any[]).map((r) => [r.id, r]));
    return ids.map((id) => ({
      id,
      name: byId[id]?.name_ua ?? null,
      price: byId[id]?.price == null ? null : Number(byId[id].price),
      clinic_id: byId[id]?.clinic_id ?? null,
      exams: ((links ?? []) as any[])
        .filter((l) => l.clinic_service_id === id && l.in_price === true)
        .map((l) => examName[l.examination_slug] ?? l.examination_slug),
    }));
  } catch {
    return ids.map((id) => ({ id, name: null, price: null, clinic_id: null, exams: [] }));
  }
}

/** Тестова заявка: лише контрольний чат, з переліком послуг і сумою з бази. Клініці не надсилається. */
function notifyTest(lead: LeadPayload, services: ResolvedService[]): Promise<void> {
  const lines = services.map((s) => `• ${s.name ?? s.id} – ${s.price ?? '?'} грн`);
  if (services.length > 0) lines.push(`Сума послуг з бази: ${services.reduce((a, s) => a + (s.price ?? 0), 0)} грн`);
  return notifyTelegram(lead, '🧪 Тест автоперевірки: клініці не надсилалось', lines);
}

/** Передає заявку платформі для доставки клініці; при збої — запасна копія в контрольний чат. */
async function deliverToClinic(leadId: string, lead: LeadPayload): Promise<void> {
  // Превʼю і локальна розробка не пишуть у групу клініки: тестові заявки — лише в контрольний чат.
  if (process.env.VERCEL_ENV !== 'production') {
    await notifyTelegram(lead, '🧪 Тест (превʼю): клініці не надсилалось');
    return;
  }
  try {
    const res = await fetch(`${PLATFORM_ORIGIN}/api/leads/checkup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: leadId }),
      cache: 'no-store',
    });
    if (res.ok) return;
    console.error('[leads] platform delivery', res.status);
  } catch (err: unknown) {
    console.error('[leads] platform delivery', err instanceof Error ? err.message : String(err));
  }
  await notifyTelegram(lead, '⚠️ Клініці не доставлено автоматично - передайте вручну');
}

/** Перевірка (scripts/qa) питає, чи є тестовий режим, перш ніж відправити тестову заявку. */
export async function GET() {
  return NextResponse.json({ qa_test_mode: QA_TEST_MODE_VERSION, env: process.env.VERCEL_ENV ?? 'local' });
}

export async function POST(req: NextRequest) {
  let body: LeadPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  // Honeypot: тихо приймаємо, нічого не пишемо
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const name = (body.name ?? '').trim();
  const phoneDigits = (body.phone ?? '').replace(/\D/g, '');
  if (name.length < 2 || phoneDigits.length < 12 || !body.consent_given) {
    return NextResponse.json({ error: 'validation failed' }, { status: 422 });
  }
  if (!body.city || !body.source_page) {
    return NextResponse.json({ error: 'missing context' }, { status: 422 });
  }

  // Поля «Мій план»: лише значення з контракту DATABASE.md 6.1, решта відкидається.
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const variant = body.variant === 1 || body.variant === 2 || body.variant === 3 ? body.variant : null;
  const entryPoint = body.entry_point === 'page' || body.entry_point === 'quiz' || body.entry_point === 'search' ? body.entry_point : null;
  const addedServiceIds = Array.isArray(body.added_service_ids)
    ? [...new Set(body.added_service_ids.filter((id) => typeof id === 'string' && UUID.test(id)))].slice(0, 50)
    : [];

  // id генеруємо тут: anon-ключ має право лише на INSERT, повернути id з бази не може.
  const leadId = crypto.randomUUID();
  const isTest = phoneDigits === QA_TEST_PHONE_DIGITS;

  try {
    const { error } = await (db() as any).from('leads').insert({
      id: leadId,
      name,
      phone: `+${phoneDigits}`,
      preferred_contact: body.preferred_contact ?? 'call',
      city: body.city,
      clinic_id: body.clinic_id ?? null,
      clinic_slug: body.clinic_slug ?? null,
      selected_program_slug: body.selected_program_slug ?? null,
      program_name: body.program_name ?? null,
      price: body.price ?? null,
      selected_branch_id: body.selected_branch_id ?? null,
      branch_address: body.branch_address ?? null,
      selected_date_label: body.selected_date_label ?? null,
      source_page: body.source_page,
      source_cta: body.source_cta ?? null,
      comment: body.comment ?? null,
      session_id: body.session_id ?? null,
      utm_source: body.utm_source ?? null,
      utm_medium: body.utm_medium ?? null,
      utm_campaign: body.utm_campaign ?? null,
      variant,
      entry_point: entryPoint,
      added_service_ids: addedServiceIds,
      consent_given: true,
      consent_given_at: new Date().toISOString(),
      status: isTest ? 'test' : 'new',
    });
    if (error) throw error;
  } catch {
    return NextResponse.json({ error: 'db error' }, { status: 500 });
  }

  if (isTest) {
    const services = await resolveServices(addedServiceIds);
    after(() => notifyTest(body, services));
    return NextResponse.json({
      ok: true,
      test: true,
      lead_id: leadId,
      saved: {
        name,
        phone: `+${phoneDigits}`,
        preferred_contact: body.preferred_contact ?? 'call',
        city: body.city,
        clinic_id: body.clinic_id ?? null,
        clinic_slug: body.clinic_slug ?? null,
        program_name: body.program_name ?? null,
        price: body.price ?? null,
        branch_address: body.branch_address ?? null,
        comment: body.comment ?? null,
        source_page: body.source_page,
        source_cta: body.source_cta ?? null,
        variant,
        added_service_ids: addedServiceIds,
      },
      services,
    });
  }

  after(() => deliverToClinic(leadId, body));
  return NextResponse.json({ ok: true });
}
