'use client';

import { buttonClass } from '@/components/frame/Button';

import { useEffect, useState } from 'react';
import type { CheckupProgram } from '@/lib/types';
import { priceDiscount } from '@/lib/programs/price';
import { countText } from '@/components/frame/ProgramCard';
import { formatPrice, type Currency } from '@/lib/format/price';
import { fillLabel, mergeLabels, type PluralForms } from '@/lib/format/labels';

export interface BranchLite {
  id: string;
  address_ua: string;
  metro_ua: string | null;
  /** Готова адреса для показу (мова сторінки). Немає – address_ua (ui-kit v1.16.1 §6.14 п. 2). */
  address?: string;
  /** Готове метро для показу. undefined – metro_ua; null – метро немає. */
  metro?: string | null;
}

/** Словник підписів (ui-kit v1.16.1 §6.14 п. 1; components-map v7.5 §30.3). Дефолти – українські. */
export interface BookingFlowLabels {
  /** aria-label кнопки закриття. */
  close: string;
  successTitle: string;
  successTextProgram: string;
  successTextNoProgram: string;
  successClose: string;
  otherProgram: string;
  /** {step} – номер кроку. */
  step: string;
  consultations: PluralForms;
  analyses: PluralForms;
  diagnostics: PluralForms;
  additionalChosen: string;
  noProgramHint: string;
  programLabel: string;
  dontKnow: string;
  branchLabel: string;
  dateLabel: string;
  dateOptional: string;
  datePlaceholder: string;
  next: string;
  nameLabel: string;
  phoneLabel: string;
  phonePlaceholder: string;
  contactLabel: string;
  contactCall: string;
  consentBefore: string;
  consentLink: string;
  consentAfter: string;
  error: string;
  submit: string;
  submitting: string;
  back: string;
  /** У коментар заявки, не на екран. {list} – обрані послуги через кому. */
  leadAdditional: string;
}

export const BOOKING_FLOW_LABELS: BookingFlowLabels = {
  close: 'Закрити',
  successTitle: 'ЗАЯВКУ НАДІСЛАНО',
  successTextProgram: "Менеджер зв'яжеться з вами найближчим часом, підтвердить склад програми і запише на зручний час.",
  successTextNoProgram: "Менеджер зв'яжеться з вами найближчим часом, допоможе обрати програму та запише на зручний час.",
  successClose: 'Закрити',
  otherProgram: '← Інша програма',
  step: 'Крок {step} з 2',
  consultations: ['консультація', 'консультації', 'консультацій'],
  analyses: ['аналіз', 'аналізи', 'аналізів'],
  diagnostics: ['обстеження', 'обстеження', 'обстежень'],
  additionalChosen: 'Додатково обрано:',
  noProgramHint: 'Адміністратор допоможе обрати програму під ваш вік і потреби.',
  programLabel: 'Програма',
  dontKnow: 'Не знаю – порадьте на дзвінку',
  branchLabel: 'Філія',
  dateLabel: 'Бажаний день',
  dateOptional: '(опційно)',
  datePlaceholder: 'Напр., субота вранці',
  next: 'Далі →',
  nameLabel: "Ім'я",
  phoneLabel: 'Телефон',
  phonePlaceholder: '+38 0__ ___ __ __',
  contactLabel: "Спосіб зв'язку",
  contactCall: 'Дзвінок',
  consentBefore: 'Погоджуюся на',
  consentLink: 'обробку персональних даних',
  consentAfter: 'для запису на обстеження',
  error: 'Не вдалося надіслати. Спробуйте ще раз.',
  submit: 'Залишити заявку',
  submitting: 'Надсилаємо…',
  back: '← Назад',
  leadAdditional: 'Додатково цікавить: {list}',
};

interface BookingFlowProps {
  programs: CheckupProgram[];
  branches: BranchLite[];
  clinicId: string;
  clinicSlug: string;
  city: string;
  /** Живі лічильники складу за slug програми (lib/programs/composition.ts),
   *  переважають застарілі checkup_programs.consultations_count/analyses_count/
   *  diagnostics_count у картці підсумку. Опційно — сторінки без Type5a-складу
   *  (каталог міста) не передають, картка лишається на старих полях програми.
   *  Задача Cowork "Форма запису" (29.08.2026), п.2. */
  programsComposition?: Record<string, { consultations: number; analyses: number; diagnostics: number }>;
  /** Підписи: передаються лише змінені ключі, решта – українські дефолти. */
  labels?: Partial<BookingFlowLabels>;
  /** Валюта цін у формі, дефолт 'UAH'. */
  currency?: Currency;
  /** Посилання «обробку персональних даних», дефолт '/ukr/policy'. */
  policyHref?: string;
  /** Готові назви програм для показу: slug → назва. Немає – program.name_ua (ui-kit v1.16.1 §6.14 п. 2). */
  programNames?: Record<string, string>;
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
  /** secondary – «Записатися» в картці, коли програм на сторінці 2+ (age-page-zones v0.7.1 §4.1, ui-kit §6.1). */
  variant?: 'primary' | 'hero' | 'crimson' | 'secondary';
  className?: string;
  /** Резолвлені назви обраних доп. послуг (AdditionalServices) — опційно,
   *  прокидається в open-booking-flow. Рішення Cowork 29.08.2026 п.2. */
  selectedAdditionalServices?: string[];
}) {
  // ui-kit v1.1 §8: crimson (--brand-accent) – УСІ кнопки запису основного домену.
  // 'primary' і 'crimson' – одна роль (booking); 'crimson' лишається як аліас на один реліз.
  // 'hero' – кнопка темного hero: біла (роль 12). Радіус lg 12px (ui-kit §2.7).
  const base =
    variant === 'hero'
      ? `${buttonClass({ variant: 'hero', size: 'lg' })}`
      : variant === 'secondary'
        ? `${buttonClass({ variant: 'secondary', size: 'lg', fullWidth: true })}`
        : `${buttonClass({ variant: 'booking', size: 'lg', fullWidth: true })}`;
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

export default function BookingFlow({
  programs,
  branches,
  clinicId,
  clinicSlug,
  city,
  programsComposition,
  labels,
  currency = 'UAH',
  policyHref = '/ukr/policy',
  programNames,
}: BookingFlowProps) {
  const L = mergeLabels(BOOKING_FLOW_LABELS, labels);
  const programName = (p: CheckupProgram) => programNames?.[p.slug] ?? p.name_ua;
  const branchAddress = (b: BranchLite) => b.address ?? b.address_ua;
  const branchMetro = (b: BranchLite) => (b.metro !== undefined ? b.metro : b.metro_ua);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [sourceCta, setSourceCta] = useState('');
  const [selectedAdditionalServices, setSelectedAdditionalServices] = useState<string[]>([]);
  const [programSlug, setProgramSlug] = useState<string | null>(null);
  // Форма відкрита зі списку програм (age-page-zones v0.7.1 §7): «← Інша програма» повертає до списку.
  const [fromPicker, setFromPicker] = useState(false);
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
        fromPicker?: boolean;
      };
      // Кілька клінік на сторінці – по модалу на клініку: модал відкривається лише для своїх програм.
      if (detail.programSlug && programs.length > 0 && !programs.some((p) => p.slug === detail.programSlug)) return;
      setProgramSlug(detail.programSlug);
      setFromPicker(Boolean(detail.fromPicker));
      setSourceCta(detail.sourceCta);
      setSelectedAdditionalServices(detail.selectedAdditionalServices ?? []);
      setStep(1);
      setSubmitted(false);
      setError(null);
      setOpen(true);
    };
    window.addEventListener('open-booking-flow', handler);
    return () => window.removeEventListener('open-booking-flow', handler);
  }, [programs]);

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
          program_name: program ? programName(program) : null,
          price: program?.price_discount ?? null,
          selected_branch_id: branchId || null,
          branch_address: branch ? branchAddress(branch) : null,
          selected_date_label: dateLabel || null,
          source_page: window.location.pathname,
          source_cta: sourceCta,
          // Обране в AdditionalServices — вираження інтересу, не замовлення (Р30).
          // Колонки під структурований перелік немає (рішення Cowork 29.08.2026 п.3) —
          // передається текстом у comment, той самий рядок іде в Telegram.
          comment:
            selectedAdditionalServices.length > 0
              ? fillLabel(L.leadAdditional, { list: selectedAdditionalServices.join(', ') })
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
      setError(L.error);
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
          aria-label={L.close}
          className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <div className="text-2xl mb-3">✓</div>
            <h3 className="text-lg font-bold text-[#0b1a24] mb-2">{L.successTitle}</h3>
            <p className="text-sm text-gray-600">{program ? L.successTextProgram : L.successTextNoProgram}</p>
            <button
              type="button"
              onClick={close}
              className="mt-6 min-h-12 px-6 rounded-[10px] border border-gray-300 text-sm font-semibold text-[#0b1a24]"
            >
              {L.successClose}
            </button>
          </div>
        ) : (
          <>
            {fromPicker && step === 1 && (
              <button
                type="button"
                onClick={() => {
                  close();
                  window.dispatchEvent(new CustomEvent('open-program-picker'));
                }}
                className="-ml-1 mb-2 min-h-11 px-1 text-[15px] font-semibold text-link"
              >
                {L.otherProgram}
              </button>
            )}
            {/* «Крок 1 з 2» – без капсу і трекінгу, 13px 600, --text-secondary (НОРМАТИВ 14.11, А.2). */}
            <p className="text-[13px] font-semibold text-text-secondary mb-1">{fillLabel(L.step, { step })}</p>

            {/* Summary-card */}
            <div className="bg-[#f4f9fb] border border-[#d8e8f0] rounded-[10px] p-4 mb-5">
              {program ? (
                <>
                  <div className="text-sm font-bold text-[#0b1a24]">{programName(program)}</div>
                  {/* Закреслена ціна і «−N%» – лише коли ціна в клініці більша за ціну до сплати (lib/programs/price.ts, А.1). */}
                  <div className="text-sm text-[#005485] font-semibold mt-0.5">
                    {formatPrice(program.price_discount, currency)}
                    {(() => {
                      const disc = priceDiscount(program.price_regular, program.price_discount);
                      return disc ? (
                        <>
                          {' '}
                          <span className="text-gray-400 line-through font-normal">{formatPrice(disc.regular, currency)}</span>{' '}
                          <span className="text-gray-500 font-normal">−{disc.pct}%</span>
                        </>
                      ) : null;
                    })()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {(() => {
                      const live = programsComposition?.[program.slug];
                      const consultations = live ? live.consultations : program.consultations_count;
                      const analyses = live ? live.analyses : program.analyses_count;
                      const diagnostics = live ? live.diagnostics : program.diagnostics_count;
                      return [
                        consultations ? countText(consultations, L.consultations) : null,
                        analyses ? countText(analyses, L.analyses) : null,
                        diagnostics ? countText(diagnostics, L.diagnostics) : null,
                      ]
                        .filter(Boolean)
                        .join(' · ');
                    })()}
                  </div>
                  {selectedAdditionalServices.length > 0 && (
                    <div className="text-xs text-[#0b1a24] mt-2 pt-2 border-t border-[#d8e8f0]">
                      <span className="font-semibold">{L.additionalChosen}</span> {selectedAdditionalServices.join(', ')}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-gray-600">{L.noProgramHint}</div>
              )}
            </div>

            {step === 1 ? (
              <>
                {!program && programs.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#0b1a24] mb-2">{L.programLabel}</label>
                    <div className="space-y-2">
                      {programs.map((p) => (
                        <button
                          key={p.slug}
                          type="button"
                          onClick={() => setProgramSlug(p.slug)}
                          className="w-full text-left border border-gray-200 rounded-[10px] px-4 py-3 text-sm hover:border-[#005485] min-h-11"
                        >
                          <span className="font-semibold">{programName(p)}</span>
                          <span className="text-gray-500"> · {formatPrice(p.price_discount, currency)}</span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-full text-left border border-dashed border-gray-300 rounded-[10px] px-4 py-3 text-sm text-gray-500 hover:border-[#005485] min-h-11"
                      >
                        {L.dontKnow}
                      </button>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#0b1a24] mb-2">{L.branchLabel}</label>
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
                          <span className="font-semibold text-[#0b1a24]">{branchAddress(b)}</span>
                          {branchMetro(b) && <span className="text-gray-500"> · {branchMetro(b)}</span>}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-semibold text-[#0b1a24] mb-2">
                    {L.dateLabel} <span className="font-normal text-gray-400">{L.dateOptional}</span>
                  </label>
                  <input
                    type="text"
                    value={dateLabel}
                    onChange={(e) => setDateLabel(e.target.value)}
                    placeholder={L.datePlaceholder}
                    className="w-full border border-gray-300 rounded-[10px] px-4 py-3 text-base"
                    style={{ fontSize: 16 }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full min-h-12 rounded-[10px] bg-[#005485] text-white font-semibold text-base hover:bg-[#004470] transition-colors"
                >
                  {L.next}
                </button>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#0b1a24] mb-2">{L.nameLabel}</label>
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
                  <label className="block text-sm font-semibold text-[#0b1a24] mb-2">{L.phoneLabel}</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder={L.phonePlaceholder}
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
                  <span className="block text-sm font-semibold text-[#0b1a24] mb-2">{L.contactLabel}</span>
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
                        {opt === 'call' ? L.contactCall : opt === 'telegram' ? 'Telegram' : 'Viber'}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-start gap-3 mb-5 cursor-pointer">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
                  <span className="text-xs text-gray-500">
                    {L.consentBefore}{' '}
                    <a href={policyHref} target="_blank" rel="noopener" className="text-[#005485] underline">
                      {L.consentLink}
                    </a>{' '}
                    {L.consentAfter}
                  </span>
                </label>

                {error && <p className="text-sm text-[#d60242] mb-3">{error}</p>}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="w-full min-h-12 rounded-[10px] bg-[#d60242] text-white font-semibold text-base disabled:opacity-50 hover:bg-[#b80238] transition-colors"
                >
                  {submitting ? L.submitting : L.submit}
                </button>
                <button type="button" onClick={() => setStep(1)} className="w-full mt-2 min-h-11 text-sm text-gray-500">
                  {L.back}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
