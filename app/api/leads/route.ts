import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

export const runtime = 'nodejs';

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
  /** honeypot — має бути порожнім */
  website?: string;
}

/** Telegram-нотифікація: fire-and-forget, ніколи не блокує відповідь користувачу */
function notifyTelegram(lead: LeadPayload) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const lines = [
    '🟢 Нова заявка (check-up.in.ua)',
    `Ім'я: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    lead.preferred_contact ? `Зв'язок: ${lead.preferred_contact}` : null,
    lead.program_name ? `Програма: ${lead.program_name}` : null,
    lead.price ? `Ціна: ${lead.price} грн` : null,
    lead.branch_address ? `Філія: ${lead.branch_address}` : null,
    lead.selected_date_label ? `Бажаний день: ${lead.selected_date_label}` : null,
    lead.comment ? lead.comment : null,
    `Сторінка: ${lead.source_page}`,
    lead.source_cta ? `CTA: ${lead.source_cta}` : null,
  ].filter(Boolean);

  fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: lines.join('\n') }),
  }).catch(() => { /* fire-and-forget */ });
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

  try {
    const { error } = await (db() as any).from('leads').insert({
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
      consent_given: true,
      consent_given_at: new Date().toISOString(),
      status: 'new',
    });
    if (error) throw error;
  } catch {
    return NextResponse.json({ error: 'db error' }, { status: 500 });
  }

  notifyTelegram(body);
  return NextResponse.json({ ok: true });
}
