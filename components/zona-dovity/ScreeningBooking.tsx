'use client';

// Запис на «Скринінг здоров'я 40+» до партнера платформи з картки InstitutionList.
// Лід одразу йде в заклад (/api/leads → leads + Telegram), нічого не утримується (принцип монетизації).
// Кнопка – booking (роль 3); помилка – текстом, не crimson.

import { useState, type FormEvent } from 'react';
import { buttonClass } from '@/components/frame/Button';
import { Modal } from '@/components/ui/Modal';

export const SCREENING_PROGRAM_NAME = "Скринінг здоров'я 40+";

function getSessionId(): string {
  try {
    const KEY = 'cu_session_id';
    let sid = window.sessionStorage.getItem(KEY);
    if (!sid) {
      sid = crypto.randomUUID();
      window.sessionStorage.setItem(KEY, sid);
    }
    return sid;
  } catch {
    return '';
  }
}

type Contact = 'call' | 'telegram' | 'viber';

export default function ScreeningBookCta({
  clinicSlug,
  clinicName,
  city = 'kharkiv',
  sourceCta = 'screening40_institution',
}: {
  clinicSlug: string;
  clinicName: string;
  city?: string;
  sourceCta?: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+380');
  const [contact, setContact] = useState<Contact>('call');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const digits = phone.replace(/\D/g, '');
  const canSubmit = name.trim().length >= 2 && digits.length >= 12 && consent && state !== 'sending';

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setState('sending');
    const params = new URLSearchParams(window.location.search);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone,
          preferred_contact: contact,
          city,
          clinic_slug: clinicSlug,
          program_name: SCREENING_PROGRAM_NAME,
          source_page: window.location.pathname,
          source_cta: sourceCta,
          comment: `Запис на ${SCREENING_PROGRAM_NAME} (оплата Дія.Карткою)`,
          session_id: getSessionId(),
          utm_source: params.get('utm_source'),
          utm_medium: params.get('utm_medium'),
          utm_campaign: params.get('utm_campaign'),
          consent_given: true,
          website,
        }),
      });
      setState(res.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  }

  return (
    <>
      <button type="button" className={buttonClass({ variant: 'booking', size: 'md' })} onClick={() => setOpen(true)}>
        Записатися
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Запис на скринінг: ${clinicName}`}>
        {state === 'done' ? (
          <div className="text-center py-4">
            <p className="text-[17px] font-bold text-ink">Заявку надіслано</p>
            <p className="mt-2 text-[15px] text-text-secondary">
              {clinicName} зв&apos;яжеться з вами, щоб узгодити день візиту. Оплата скринінгу – Дія.Карткою.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" tabIndex={-1} aria-hidden="true" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше ім'я"
              aria-label="Ваше ім'я"
              className="w-full px-3 py-3.5 border-2 border-[var(--border)] rounded-[var(--radius-md)] text-[15px] focus:border-[var(--link)] focus:outline-none"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Номер телефону"
              aria-label="Номер телефону"
              className="w-full px-3 py-3.5 border-2 border-[var(--border)] rounded-[var(--radius-md)] text-[15px] focus:border-[var(--link)] focus:outline-none"
            />
            <div className="flex gap-2" role="group" aria-label="Як з вами зв'язатися">
              {(['call', 'telegram', 'viber'] as Contact[]).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setContact(opt)}
                  aria-pressed={contact === opt}
                  className={`flex-1 min-h-11 rounded-[var(--radius-md)] border-2 text-[14px] font-semibold ${contact === opt ? 'border-[var(--link)] text-link' : 'border-[var(--border)] text-text-secondary'}`}
                >
                  {opt === 'call' ? 'Дзвінок' : opt === 'telegram' ? 'Telegram' : 'Viber'}
                </button>
              ))}
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
              <span className="text-xs text-gray-500">
                Погоджуюся на{' '}
                <a href="/ukr/policy" target="_blank" rel="noopener" className="text-link underline">
                  обробку персональних даних
                </a>{' '}
                для запису на обстеження
              </span>
            </label>
            {state === 'error' && <p className="text-sm text-ink">Не вдалося надіслати. Спробуйте ще раз.</p>}
            <button type="submit" disabled={!canSubmit} className={`${buttonClass({ variant: 'booking', size: 'lg', fullWidth: true })} disabled:opacity-50`}>
              {state === 'sending' ? 'Надсилаємо…' : 'Надіслати заявку'}
            </button>
          </form>
        )}
      </Modal>
    </>
  );
}
