'use client';
// v2
import { useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';

export type LeadIntent =
  | 'online_consultation'
  | 'choose_method'
  | 'prepare'
  | 'second_opinion'
  | 'understand_symptom';

interface LeadFormProps {
  intent: LeadIntent;
  sourcePage: string;
  sourceQuizId?: string;
  criteriaSelected?: string[];
  readinessStage?: string;
  ctaLabel?: string;
  onSuccess?: () => void;
  className?: string;
}

export default function LeadForm({
  intent,
  sourcePage,
  sourceQuizId,
  criteriaSelected,
  readinessStage,
  ctaLabel = 'Записатись на консультацію',
  onSuccess,
  className = '',
}: LeadFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [contactMethod, setContactMethod] = useState<'call' | 'telegram' | 'viber'>('call');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(''); // honeypot
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = name.trim().length >= 2 && phone.trim().length >= 10 && consent && website === '';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    if (website !== '') return; // honeypot triggered

    setLoading(true);
    setError(null);

    try {
      const { error: dbError } = await supabase.from('leads').insert({
        name: name.trim(),
        phone: phone.trim(),
        city: city.trim() || null,
        contact_method: contactMethod,
        intent,
        source_page: sourcePage,
        source_quiz_id: sourceQuizId || null,
        criteria_selected: criteriaSelected || null,
        readiness_stage: readinessStage || null,
        consent_given: true,
        consent_given_at: new Date().toISOString(),
        status: 'new',
      });

      if (dbError) throw dbError;

      setSubmitted(true);
      onSuccess?.();
    } catch {
      setError('Спробуйте ще раз або зателефонуйте нам');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={`bg-white rounded-[10px] border border-gray-200 p-5 text-center ${className}`}>
        <svg
          className="w-10 h-10 text-[#005485] mx-auto mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="text-[17px] font-bold text-[#0b1a24] mb-1">Заявку отримано!</div>
        <p className="text-[13px] text-gray-500">
          Ми зателефонуємо вам найближчим часом, щоб узгодити деталі консультації.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`bg-white rounded-[10px] border border-gray-200 p-5 ${className}`}>
      {/* Honeypot — прихований */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
      />

      <div className="space-y-3 mb-4">
        <input
          type="text"
          placeholder="Ваше ім'я"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-3.5 border-2 border-gray-200 rounded-[10px] text-[15px] font-sans focus:border-[#005485] focus:outline-none placeholder:text-gray-400"
          aria-label="Ваше ім'я"
        />
        <input
          type="tel"
          placeholder="Номер телефону"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="w-full px-3 py-3.5 border-2 border-gray-200 rounded-[10px] text-[15px] font-sans focus:border-[#005485] focus:outline-none placeholder:text-gray-400"
          aria-label="Номер телефону"
        />
        <input
          type="text"
          placeholder="Ваше місто"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full px-3 py-3.5 border-2 border-gray-200 rounded-[10px] text-[15px] font-sans focus:border-[#005485] focus:outline-none placeholder:text-gray-400"
          aria-label="Ваше місто"
        />
      </div>

      {/* Спосіб зв'язку */}
      <div className="mb-4">
        <div className="text-[13px] text-gray-500 mb-2">Зручний спосіб зв&apos;язку</div>
        <div className="flex gap-2">
          {(['call', 'telegram', 'viber'] as const).map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setContactMethod(method)}
              className={`flex-1 py-2 rounded-[40px] border-2 text-[13px] font-medium transition-colors ${
                contactMethod === method
                  ? 'border-[#005485] bg-[#e8f4fd] text-[#005485] font-semibold'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              {method === 'call' ? 'Дзвінок' : method === 'telegram' ? 'Telegram' : 'Viber'}
            </button>
          ))}
        </div>
      </div>

      {/* Згода */}
      <label className="flex items-start gap-2 mb-4 cursor-pointer">
        <div
          className={`w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
            consent ? 'bg-[#005485] border-[#005485]' : 'border-gray-300'
          }`}
          onClick={() => setConsent(!consent)}
        >
          {consent && (
            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="currentColor">
              <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          )}
        </div>
        <span className="text-[12px] text-gray-500 leading-relaxed">
          Даю згоду на обробку персональних даних відповідно до{' '}
          <a href="/privacy" className="text-[#005485] underline">
            Політики конфіденційності
          </a>
        </span>
      </label>

      {error && (
        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-[8px] text-[13px] text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!isValid || loading}
        className={`w-full py-4 rounded-[10px] text-[15px] font-semibold transition-colors ${
          isValid && !loading
            ? 'bg-[#d60242] text-white hover:bg-[#b5003a] cursor-pointer'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {loading ? 'Відправляємо...' : ctaLabel}
      </button>
    </form>
  );
}
