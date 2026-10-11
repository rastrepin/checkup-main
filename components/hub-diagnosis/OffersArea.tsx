'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import {
  CITY_LABELS,
  CITY_ORDER,
  METHODS,
  METHOD_BUTTON_LABEL,
  METHOD_EVENT,
  OFFERS_ANCHOR,
  UNSURE_LABEL,
  type HubOffer,
  type MethodKey,
} from '@/lib/hub/prolaps-content';

// Область пропозицій хабу діагнозу: лікарі за методом і містом, запис із картки.
// Усі картки є в статичному HTML; фільтри лише ховають зайві. Новий компонент (не спільний):
// наявні форми репо пишуть у таблицю leads потоку чекапів, а заявки хабу йдуть у потік клінік.

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005485]';
const UNSURE = 'unsure';

/** Кнопка картки операції: вмикає фільтр методу і веде до області пропозицій. */
export function MethodOffersLink({ method }: { method: MethodKey }) {
  return (
    <a
      href={`#${OFFERS_ANCHOR}`}
      onClick={() => window.dispatchEvent(new CustomEvent(METHOD_EVENT, { detail: method }))}
      className={`${FOCUS} inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-[10px] border-2 border-[#005485] text-[#005485] text-[15px] font-semibold hover:bg-[#e8f4fd] transition-colors`}
    >
      {METHOD_BUTTON_LABEL}
    </a>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`${FOCUS} min-h-[40px] px-4 py-2 rounded-[40px] border-2 text-[14px] transition-colors ${
        active
          ? 'border-[#005485] bg-[#e8f4fd] text-[#005485] font-semibold'
          : 'border-gray-200 bg-white text-gray-700 font-medium hover:border-[#005485]'
      }`}
    >
      {children}
    </button>
  );
}

function BookingForm({ offer, initialMethod }: { offer: HubOffer; initialMethod: MethodKey | null }) {
  const preset =
    initialMethod && offer.methods.some((m) => m.key === initialMethod)
      ? initialMethod
      : offer.methods.length === 1
        ? offer.methods[0].key
        : '';
  const [choice, setChoice] = useState<string>(preset);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+380');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(''); // honeypot
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  const digits = phone.replace(/\D/g, '');
  const phoneOk = (digits.length === 12 && digits.startsWith('380')) || (digits.length === 10 && digits.startsWith('0'));
  const valid = name.trim().length >= 2 && phoneOk && consent && choice !== '';

  const chosen = offer.methods.find((m) => m.key === choice);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!valid || loading) return;
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams(window.location.search);
      const res = await fetch('/api/leads/hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone,
          consent_given: true,
          clinic_slug: offer.clinicSlug,
          preferred_doctor: offer.doctorSlug,
          method: choice === UNSURE ? null : choice,
          utm_source: params.get('utm_source'),
          utm_medium: params.get('utm_medium'),
          utm_campaign: params.get('utm_campaign'),
          utm_content: params.get('utm_content'),
          utm_term: params.get('utm_term'),
          referrer: document.referrer || null,
          website,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSent(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center py-6" role="status">
        <p className="text-[17px] font-bold text-[#0b1a24] uppercase tracking-[0.04em]">Заявку надіслано</p>
        <p className="text-[15px] text-gray-600 leading-relaxed mt-3">
          Адміністратор клініки зателефонує вам протягом робочого дня та підтвердить час прийому.
        </p>
      </div>
    );
  }

  const input =
    'w-full px-3 py-3.5 border-2 border-gray-200 rounded-[10px] text-[16px] text-[#0b1a24] focus:border-[#005485] focus:outline-none';

  return (
    <form onSubmit={submit} noValidate>
      <p className="text-[14px] text-gray-600 leading-relaxed">
        {offer.fullName} · {chosen ? `${chosen.short} · ` : ''}
        {offer.clinicLabel}, {offer.cityLabel}
      </p>

      {/* Honeypot – прихований */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <fieldset className="mt-5">
        <legend className="text-[14px] font-semibold text-[#0b1a24] mb-2">Операція, яка вас цікавить</legend>
        <div className="space-y-2">
          {[...offer.methods.map((m) => ({ value: m.key as string, label: m.short })), { value: UNSURE, label: UNSURE_LABEL }].map(
            (o) => (
              <label
                key={o.value}
                className={`flex items-center gap-3 min-h-[44px] px-3 py-2 rounded-[10px] border-2 cursor-pointer text-[15px] ${
                  choice === o.value ? 'border-[#005485] bg-[#e8f4fd] text-[#005485] font-semibold' : 'border-gray-200 text-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="method"
                  value={o.value}
                  checked={choice === o.value}
                  onChange={() => setChoice(o.value)}
                  className="accent-[#005485] w-4 h-4 shrink-0"
                />
                {o.label}
              </label>
            ),
          )}
        </div>
      </fieldset>

      <div className="mt-5 space-y-3">
        <label className="block">
          <span className="block text-[14px] font-semibold text-[#0b1a24] mb-1.5">Прізвище та ім&apos;я</span>
          <input type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required className={input} />
        </label>
        <label className="block">
          <span className="block text-[14px] font-semibold text-[#0b1a24] mb-1.5">Телефон</span>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className={input}
          />
        </label>
      </div>

      <label className="flex items-start gap-3 mt-4 cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="accent-[#005485] w-5 h-5 mt-0.5 shrink-0"
        />
        <span className="text-[13px] text-gray-600 leading-relaxed">
          Я даю згоду на обробку персональних даних відповідно до законодавства України.
        </span>
      </label>

      {error && (
        <p className="mt-4 px-3 py-2 bg-red-50 border border-red-200 rounded-[8px] text-[14px] text-red-700" role="alert">
          Не вдалося надіслати заявку. Спробуйте ще раз.
        </p>
      )}

      <button
        type="submit"
        disabled={!valid || loading}
        className={`${FOCUS} w-full mt-5 py-4 rounded-[10px] text-[16px] font-semibold transition-colors ${
          valid && !loading ? 'bg-[#d60242] text-white hover:bg-[#b50139] cursor-pointer' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        {loading ? 'Надсилаємо' : 'Записатися'}
      </button>
    </form>
  );
}

export default function OffersArea({ offers }: { offers: HubOffer[] }) {
  const [method, setMethod] = useState<MethodKey | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [booking, setBooking] = useState<HubOffer | null>(null);

  useEffect(() => {
    const onMethod = (e: Event) => {
      const key = (e as CustomEvent<MethodKey>).detail;
      if (METHODS.some((m) => m.key === key)) setMethod(key);
    };
    window.addEventListener(METHOD_EVENT, onMethod);
    return () => window.removeEventListener(METHOD_EVENT, onMethod);
  }, []);

  const methodOptions = useMemo(
    () => METHODS.filter((m) => offers.some((o) => o.methods.some((x) => x.key === m.key))),
    [offers],
  );
  const cityOptions = useMemo(() => CITY_ORDER.filter((c) => offers.some((o) => o.cityKey === c)), [offers]);

  const visible = (o: HubOffer) =>
    (!method || o.methods.some((m) => m.key === method)) && (!city || o.cityKey === city);
  const anyVisible = offers.some(visible);

  return (
    <div>
      <div className="mt-8 space-y-4">
        <div>
          <p className="text-[13px] font-semibold text-gray-500 mb-2">Метод</p>
          <div className="flex flex-wrap gap-2">
            <Chip active={method === null} onClick={() => setMethod(null)}>
              Усі методи
            </Chip>
            {methodOptions.map((m) => (
              <Chip key={m.key} active={method === m.key} onClick={() => setMethod(m.key)}>
                {m.short}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-gray-500 mb-2">Місто</p>
          <div className="flex flex-wrap gap-2">
            <Chip active={city === null} onClick={() => setCity(null)}>
              Усі міста
            </Chip>
            {cityOptions.map((c) => (
              <Chip key={c} active={city === c} onClick={() => setCity(c)}>
                {CITY_LABELS[c]}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <ul className="mt-8 grid gap-5 lg:grid-cols-2 list-none">
        {offers.map((o) => (
          <li
            key={o.id}
            hidden={!visible(o)}
            className="bg-white border border-[#e8edf3] rounded-[14px] p-6 flex flex-col"
          >
            <h3 className="text-[20px] font-bold text-[#0b1a24] leading-snug">{o.fullName}</h3>
            {o.level && <p className="text-[15px] text-gray-700 mt-2">{o.level}</p>}
            {o.expertise && <p className="text-[15px] text-gray-700 mt-1">{o.expertise}</p>}
            {o.experience && <p className="text-[15px] text-gray-700 mt-1">{o.experience}</p>}

            <p className="text-[15px] text-[#0b1a24] font-semibold mt-4">{o.clinicLabel}</p>
            <p className="text-[14px] text-gray-600 mt-1">
              {o.cityLabel}
              {o.street ? `, ${o.street}` : ''}
            </p>

            <ul className="mt-4 space-y-3 list-none">
              {o.methods.map((m) => (
                <li key={m.key} hidden={Boolean(method) && m.key !== method}>
                  <p className="text-[14px] font-semibold text-[#0b1a24]">{m.short}</p>
                  <a href={m.href} className={`${FOCUS} text-[14px] text-[#005485] underline hover:no-underline`}>
                    Детальніше на сторінці «{m.linkLabel}»
                  </a>
                </li>
              ))}
            </ul>

            <p className="text-[13px] text-gray-500 leading-relaxed mt-4">{o.bookingNote}</p>
            <div className="mt-auto pt-5">
            <button
              type="button"
              onClick={() => setBooking(o)}
              className={`${FOCUS} w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-[10px] bg-[#005485] text-white text-[16px] font-semibold hover:bg-[#003a5e] transition-colors`}
            >
              Записатися на консультацію
            </button>
            </div>
          </li>
        ))}
      </ul>

      {!anyVisible && (
        <p className="mt-6 text-[15px] text-gray-600">
          У цьому місті поки немає лікарів, які виконують цю операцію. Оберіть інше місто або метод.
        </p>
      )}

      <Modal open={booking !== null} onClose={() => setBooking(null)} title="Записатися на консультацію">
        {booking && <BookingForm key={booking.id} offer={booking} initialMethod={method} />}
      </Modal>
    </div>
  );
}
