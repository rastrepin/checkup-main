'use client';

import { useEffect, useState } from 'react';
import type { CheckupProgram } from '@/lib/types';

export interface BranchLite {
  id: string;
  address_ua: string;
  metro_ua: string | null;
}

interface BookingFlowProps {
  programs: CheckupProgram[];
  branches: BranchLite[];
  clinicId: string;
  clinicSlug: string;
  city: string;
}

type Contact = 'call' | 'telegram' | 'viber';

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `+${digits}`;
  if (digits.length <= 5) return `+${digits.slice(0, 2)} ${digits.slice(2)}`;
  if (digits.length <= 8) return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  if (digits.length <= 10) return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)}`;
  return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
}

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

function fmt(n: number) {
  return n.toLocaleString('uk-UA');
}

/**
 * Кнопка-тригер: серверні секції рендерять <BookCta programSlug=... sourceCta=... />,
 * модал живе один на сторінку (BookingFlow), зв'язок через CustomEvent.
 */
export function BookCta({
  programSlug,
  sourceCta,
  label,
  variant = 'primary',
  className = '',
  selectedAdditionalServices,
}: {
  programSlug?: string;
  sourceCta: string;
  label: string;
  variant?: 'primary' | 'hero';
  className?: string;
  /** Резолвлені назви обраних доп. послуг (AdditionalServices) — опційно,
   *  прокидається в open-booking-flow. Рішення Cowork 29.08.2026 п.2. */
  selectedAdditionalServices?: string[];
}) {
  const base =
    variant === 'hero'
      ? 'inline-flex items-center justify-center min-h-12 px-7 rounded-[10px] bg-[#005485] text-white font-semibold text-base hover:bg-[#004470] transition-colors'
      : 'w-full inline-flex items-center justify-center min-h-12 px-5 rounded-[10px] bg-[#005485] text-white font-semibold text-sm hover:bg-[#004470] transition-colors';
  return (
    <button
      type="button"
      className={`${base} ${className}`}
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent('open-booking-flow', {
            detail: { programSlug: programSlug ?? null, sourceCta, selectedAdditionalServices },
          })
        )
      }
    >
      {label}
    </button>
  );
}

export default function BookingFlow({ programs, branches, clinicId, clinicSlug, city }: BookingFlowProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [sourceCta, setSourceCta] = useState('');
  const [selectedAdditionalServices, setSelectedAdditionalServices] = useState<string[]>([]);
  const [programSlug, setProgramSlug] = useState<string | null>(null);
  const [branchId, setBranchId] = useState<string>(branches[0]?.id ?? '');
  const [dateLabel, setDateLabel] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [contact, setContact] = useState<Contact>('call');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(''); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        programSlug: string | null;
        sourceCta: string;
        selectedAdditionalServices?: string[];
      };
      setProgramSlug(detail.programSlug);
      setSourceCta(detail.sourceCta);
      setSelectedAdditionalServices(detail.selectedAdditionalServices ?? []);
      setStep(1);
      setSubmitted(false);
      setError(null);
      setOpen(true);
    };
    window.addEventListener('open-booking-flow', handler);
    return () => window.removeEventListener('open-booking-flow', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const program = programs.find((p) => p.slug === programSlug) ?? null;
  const branch = branches.find((b) => b.id === branchId) ?? null;

  const phoneDigits = phone.replace(/\D/g, '');
  const canSubmit = name.trim().length >= 2 && phoneDigits.length >= 12 && consent && !submitting;

  const close = () => setOpen(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val && !val.startsWith('+')) val = '+38' + val;
    setPhone(formatPhone(val));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (website !== '') return; // honeypot
    setSubmitting(true);
    setError(null);
    try {
      const params = new URLSearchParams(window.location.search);
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone,
          preferred_contact: contact,
          city,
          clinic_id: clinicId,
          clinic_slug: clinicSlug,
          selected_program_slug: program?.slug ?? null,
          program_name: program?.name_ua ?? null,
          price: program?.price_discount ?? null,
          selected_branch_id: branchId || null,
          branch_address: branch?.address_ua ?? null,
          selected_date_label: dateLabel || null,
          source_page: window.location.pathname,
          source_cta: sourceCta,
          // Обране в AdditionalServices — вираження інтересу, не замовлення (Р30).
          // Колонки під структурований перелік немає (рішення Cowork 29.08.2026 п.3) —
          // передається текстом у comment, той самий рядок іде в Telegram.
          comment:
            selectedAdditionalServices.length > 0
              ? `Додатково цікавить: ${selectedAdditionalServices.join(', ')}`
              : null,
          session_id: getSessionId(),
          utm_source: params.get('utm_source'),
          utm_medium: params.get('utm_medium'),
          utm_campaign: params.get('utm_campaign'),
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

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-6 max-h-[92vh] overflow-y-auto">
        {/* Drag handle (mobile bottom-sheet) */}
        <div className="sm:hidden w-10 h-1 rounded-full bg-gray-300 mx-auto mb-4" />
        <button
          type="button"
          onClick={close}
          aria-label="Закрити"
          className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <div className="text-2xl mb-3">✓</div>
            <h3 className="text-lg font-bold text-[#0b1a24] mb-2">ЗАЯВКУ НАДІСЛАНО</h3>
            <p className="text-sm text-gray-600">
              Менеджер зв&apos;яжеться з вами найближчим часом, допоможе обрати програму та запише на зручний час.
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-6 min-h-12 px-6 rounded-[10px] border border-gray-300 text-sm font-semibold text-[#0b1a24]"
            >
              Закрити
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Крок {step} з 2</p>

            {/* Summary-card */}
            <div className="bg-[#f4f9fb] border border-[#d8e8f0] rounded-[10px] p-4 mb-5">
              {program ? (
                <>
                  <div className="text-sm font-bold text-[#0b1a24]">{program.name_ua}</div>
                  <div className="text-sm text-[#005485] font-semibold mt-0.5">
                    {fmt(program.price_discount)} грн{' '}
                    <span className="text-gray-400 line-through font-normal">{fmt(program.price_regular)} грн</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {[
                      program.consultations_count ? `${program.consultations_count} консультацій` : null,
                      program.analyses_count ? `${program.analyses_count} лабораторних` : null,
                      program.diagnostics_count ? `${program.diagnostics_count} інструментальних` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-600">Адміністратор допоможе обрати програму під ваш вік і потреби.</div>
              )}
            </div>

            {step === 1 ? (
              <>
                {!program && programs.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#0b1a24] mb-2">Програма</label>
                    <div className="space-y-2">
                      {programs.map((p) => (
                        <button
                          key={p.slug}
                          type="button"
                          onClick={() => setProgramSlug(p.slug)}
                          className="w-full text-left border border-gray-200 rounded-[10px] px-4 py-3 text-sm hover:border-[#005485] min-h-11"
                        >
                          <span className="font-semibold">{p.name_ua}</span>
                          <span className="text-gray-500"> · {fmt(p.price_discount)} грн</span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-full text-left border border-dashed border-gray-300 rounded-[10px] px-4 py-3 text-sm text-gray-500 hover:border-[#005485] min-h-11"
                      >
                        Не знаю — порадьте на дзвінку
                      </button>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#0b1a24] mb-2">Філія</label>
                  <div className="space-y-2">
                    {branches.map((b) => (
                      <label
                        key={b.id}
                        className={`flex items-start gap-3 border rounded-[10px] px-4 py-3 cursor-pointer min-h-11 ${
                          branchId === b.id ? 'border-[#005485] bg-[#f4f9fb]' : 'border-gray-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="branch"
                          checked={branchId === b.id}
                          onChange={() => setBranchId(b.id)}
                          className="mt-1"
                        />
                        <span className="text-sm">
                          <span className="font-semibold text-[#0b1a24]">{b.address_ua}</span>
                          {b.metro_ua && <span className="text-gray-500"> · м. {b.metro_ua}</span>}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-semibold text-[#0b1a24] mb-2">
                    Бажаний день <span className="font-normal text-gray-400">(опційно)</span>
                  </label>
                  <input
                    type="text"
                    value={dateLabel}
                    onChange={(e) => setDateLabel(e.target.value)}
                    placeholder="Напр., субота вранці"
                    className="w-full border border-gray-300 rounded-[10px] px-4 py-3 text-base"
                    style={{ fontSize: 16 }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full min-h-12 rounded-[10px] bg-[#005485] text-white font-semibold text-base hover:bg-[#004470] transition-colors"
                >
                  Далі →
                </button>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#0b1a24] mb-2">Ім&apos;я</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    className="w-full border border-gray-300 rounded-[10px] px-4 py-3"
                    style={{ fontSize: 16 }}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#0b1a24] mb-2">Телефон</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="+38 0__ ___ __ __"
                    autoComplete="tel"
                    inputMode="tel"
                    className="w-full border border-gray-300 rounded-[10px] px-4 py-3"
                    style={{ fontSize: 16 }}
                  />
                </div>

                {/* Honeypot */}
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

                <div className="mb-4">
                  <span className="block text-sm font-semibold text-[#0b1a24] mb-2">Спосіб зв&apos;язку</span>
                  <div className="flex gap-2">
                    {(['call', 'telegram', 'viber'] as Contact[]).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setContact(opt)}
                        className={`flex-1 min-h-11 rounded-[10px] border text-sm font-medium ${
                          contact === opt ? 'border-[#005485] bg-[#f4f9fb] text-[#005485]' : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        {opt === 'call' ? 'Дзвінок' : opt === 'telegram' ? 'Telegram' : 'Viber'}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-start gap-3 mb-5 cursor-pointer">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
                  <span className="text-xs text-gray-500">
                    Погоджуюся на обробку персональних даних для запису на обстеження
                  </span>
                </label>

                {error && <p className="text-sm text-[#d60242] mb-3">{error}</p>}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="w-full min-h-12 rounded-[10px] bg-[#d60242] text-white font-semibold text-base disabled:opacity-50 hover:bg-[#b80238] transition-colors"
                >
                  {submitting ? 'Надсилаємо…' : 'Залишити заявку'}
                </button>
                <button type="button" onClick={() => setStep(1)} className="w-full mt-2 min-h-11 text-sm text-gray-500">
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
