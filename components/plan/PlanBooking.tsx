'use client';

// Форма «Записатися за цим планом» (docs/ux/specs/2026-11-my-plan.md v0.4 §8в). Поля і кроки – як у BookingFlow:
// крок 1 – філія і бажаний день, крок 2 – ім'я, телефон, спосіб зв'язку, згода. Кроку вибору клініки (клініку обрано
// в плані) і «Доповнення» немає. Над полями – підсумок: клініка, кількість досліджень, сума.
// POST /api/leads; honeypot і згода обов'язкові. У заявці: clinic_slug, clinic_id, added_service_ids (id послуг клініки
// з правила суми), price (сума), variant = 2, entry_point, філія, бажаний день. Назви плану, прибраних рядків і
// факторів ризику в заявці немає (PLATFORM-LINE 7.1).

import { useEffect, useRef, useState } from 'react';
import { buttonClass } from '@/components/frame/Button';
import { countText } from '@/components/frame/ProgramCard';
import type { PlanBranch } from '@/lib/plan/data';
import { MY_PLAN_CONFIG } from '@/lib/plan/config';
import { fmtUah } from '@/lib/plan/texts';

type Contact = 'call' | 'telegram' | 'viber';

function formatPhone(value: string): string {
  const d = value.replace(/\D/g, '');
  if (d.length === 0) return '';
  if (d.length <= 2) return `+${d}`;
  if (d.length <= 5) return `+${d.slice(0, 2)} ${d.slice(2)}`;
  if (d.length <= 8) return `+${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`;
  if (d.length <= 10) return `+${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)}`;
  return `+${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10, 12)}`;
}

function sessionId(): string {
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

export interface PlanBookingRequest {
  clinicId: string;
  clinicSlug: string;
  clinicName: string;
  branches: PlanBranch[];
  serviceIds: string[];
  price: number;
  items: number;
}

export default function PlanBooking({ city, request, onClose }: { city: string; request: PlanBookingRequest; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [branchId, setBranchId] = useState<string>(request.branches[0]?.id ?? '');
  const [dateLabel, setDateLabel] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [contact, setContact] = useState<Contact>('call');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const title = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    title.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const branch = request.branches.find((b) => b.id === branchId) ?? null;
  const digits = phone.replace(/\D/g, '');
  const canSubmit = name.trim().length >= 2 && digits.length >= 12 && consent && !submitting;

  const submit = async () => {
    if (!canSubmit || website !== '') return;
    setSubmitting(true);
    setError(null);
    try {
      const q = new URLSearchParams(window.location.search);
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone,
          preferred_contact: contact,
          city,
          clinic_id: request.clinicId,
          clinic_slug: request.clinicSlug,
          price: request.price,
          added_service_ids: request.serviceIds,
          variant: MY_PLAN_CONFIG.leadVariant,
          entry_point: MY_PLAN_CONFIG.entryPoint,
          selected_branch_id: branchId || null,
          branch_address: branch?.address ?? null,
          selected_date_label: dateLabel.trim() || null,
          source_page: window.location.pathname,
          source_cta: 'my_plan_book',
          session_id: sessionId(),
          utm_source: q.get('utm_source'),
          utm_medium: q.get('utm_medium'),
          utm_campaign: q.get('utm_campaign'),
          consent_given: true,
          website,
        }),
      });
      if (!res.ok) throw new Error('submit failed');
      setSubmitted(true);
    } catch {
      setError('Не вдалося надіслати. Спробуйте ще раз.');
    } finally {
      setSubmitting(false);
    }
  };

  const field = 'w-full border border-[var(--border-strong)] rounded-[var(--radius-md)] px-4 py-3 text-[16px]';
  const label = 'block text-sm font-semibold text-ink mb-2';

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="plan-booking-title">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-xl)] p-6 max-h-[92vh] overflow-y-auto">
        <button type="button" onClick={onClose} aria-label="Закрити" className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center text-text-secondary hover:text-ink">
          ✕
        </button>
        {submitted ? (
          <div className="text-center py-8">
            <h3 id="plan-booking-title" ref={title} tabIndex={-1} className="text-lg font-bold text-ink mb-2 outline-none">
              ЗАЯВКУ НАДІСЛАНО
            </h3>
            <p className="text-sm text-text-secondary">Менеджер зв&apos;яжеться з вами найближчим часом і запише на зручний час.</p>
            <button type="button" onClick={onClose} className={`${buttonClass({ variant: 'secondary', size: 'md' })} mt-6`}>
              Закрити
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-1">Крок {step} з 2</p>
            {/* Підсумок: клініка, кількість досліджень, сума (§8в) */}
            <div className="bg-bg-muted border border-[var(--border)] rounded-[var(--radius-md)] p-4 mb-5">
              <h3 id="plan-booking-title" ref={title} tabIndex={-1} className="text-[17px] font-bold text-ink outline-none">
                {request.clinicName}
              </h3>
              <p className="mt-1 text-[14px] text-text-secondary">{countText(request.items, ['дослідження', 'дослідження', 'досліджень'])}</p>
              <p className="mt-1 text-[17px] font-bold text-ink">{fmtUah(request.price)}</p>
            </div>

            {step === 1 ? (
              <>
                {request.branches.length > 0 && (
                  <fieldset className="mb-4">
                    <legend className={label}>Філія</legend>
                    <div className="space-y-2">
                      {request.branches.map((b) => (
                        <label
                          key={b.id}
                          className={`flex items-start gap-3 border rounded-[var(--radius-md)] px-4 py-3 cursor-pointer min-h-11 ${
                            branchId === b.id ? 'border-link bg-brand-primary-soft' : 'border-[var(--border)]'
                          }`}
                        >
                          <input type="radio" name="pb-branch" checked={branchId === b.id} onChange={() => setBranchId(b.id)} className="mt-1" />
                          <span className="text-sm">
                            <span className="font-semibold text-ink">{b.address}</span>
                            {b.metro && <span className="text-text-secondary"> · м. {b.metro}</span>}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}
                <div className="mb-5">
                  <label htmlFor="pb-date" className={label}>
                    Бажаний день <span className="font-normal text-text-secondary">(опційно)</span>
                  </label>
                  <input id="pb-date" type="text" value={dateLabel} onChange={(e) => setDateLabel(e.target.value)} placeholder="Напр., субота вранці" className={field} />
                </div>
                <button type="button" onClick={() => setStep(2)} className={buttonClass({ variant: 'structural', size: 'lg', fullWidth: true })}>
                  Далі →
                </button>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <label htmlFor="pb-name" className={label}>Ім&apos;я</label>
                  <input id="pb-name" type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} />
                </div>
                <div className="mb-4">
                  <label htmlFor="pb-phone" className={label}>Телефон</label>
                  <input
                    id="pb-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      let v = e.target.value;
                      if (v && !v.startsWith('+')) v = '+38' + v;
                      setPhone(formatPhone(v));
                    }}
                    placeholder="+38 0__ ___ __ __"
                    autoComplete="tel"
                    inputMode="tel"
                    className={field}
                  />
                </div>
                <input
                  type="text"
                  name="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute opacity-0 pointer-events-none h-0 w-0"
                />
                <fieldset className="mb-4">
                  <legend className={label}>Спосіб зв&apos;язку</legend>
                  <div className="flex gap-2">
                    {(['call', 'telegram', 'viber'] as Contact[]).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        aria-pressed={contact === opt}
                        onClick={() => setContact(opt)}
                        className={`flex-1 min-h-11 rounded-[var(--radius-md)] border text-sm font-medium ${
                          contact === opt ? 'border-link bg-brand-primary-soft text-link' : 'border-[var(--border)] text-text-secondary'
                        }`}
                      >
                        {opt === 'call' ? 'Дзвінок' : opt === 'telegram' ? 'Telegram' : 'Viber'}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label className="flex items-start gap-3 mb-5 cursor-pointer">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
                  <span className="text-xs text-text-secondary">
                    Погоджуюся на{' '}
                    <a href="/ukr/policy" target="_blank" rel="noopener" className="text-link underline">
                      обробку персональних даних
                    </a>{' '}
                    для запису на обстеження
                  </span>
                </label>
                {error && (
                  <p role="alert" className="text-sm text-[var(--danger)] mb-3">
                    {error}
                  </p>
                )}
                <button type="button" onClick={submit} disabled={!canSubmit} className={`${buttonClass({ variant: 'booking', size: 'lg', fullWidth: true })} disabled:opacity-50`}>
                  {submitting ? 'Надсилаємо…' : 'Залишити заявку'}
                </button>
                <button type="button" onClick={() => setStep(1)} className="mt-3 w-full min-h-11 text-sm font-semibold text-link underline">
                  ← Назад
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
