'use client';

import { useState } from 'react';
import { useQuiz, type PreferredContact } from './QuizContext';
import { IconCheck, IconCheckCircle } from './icons';
import { supabase } from '@/lib/supabase';

function formatPhone(value: string): string {
  // Remove everything except digits
  const digits = value.replace(/\D/g, '');

  // Start with +38
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `+${digits}`;
  if (digits.length <= 3) return `+${digits.slice(0, 2)} ${digits.slice(2)}`;
  if (digits.length <= 6) return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  if (digits.length <= 8) return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)}`;
  if (digits.length <= 10) return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)}`;
  return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
}

interface ContactFormProps {
  sourcePage: string;
  clinicSlug: string;
  city: string;
}

export default function ContactForm({ sourcePage, clinicSlug, city }: ContactFormProps) {
  const {
    phase, name, phone, preferredContact, consentGiven,
    setName, setPhone, setPreferredContact, setConsentGiven, setPhase,
    gender, age, tags, selectedProgram, selectedBranchId,
  } = useQuiz();

  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (phase !== 'contacts') return null;

  const phoneDigits = phone.replace(/\D/g, '');
  const isPhoneValid = phoneDigits.length >= 12; // +380XXXXXXXXX
  const canSubmit = name.trim().length > 0 && isPhoneValid && consentGiven && !submitting;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Auto-prepend +38 if user starts typing
    if (val && !val.startsWith('+')) {
      val = '+38' + val;
    }
    setPhone(formatPhone(val));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (honeypot) return; // Bot trap

    setSubmitting(true);

    try {
      // Get UTM from URL
      const params = new URLSearchParams(window.location.search);

      await (supabase as any).from('leads').insert({
        city,
        clinic_slug: clinicSlug,
        source_page: sourcePage,
        name: name.trim(),
        phone: phoneDigits.length >= 10 ? `+${phoneDigits}` : phone,
        preferred_contact: preferredContact,
        quiz_answers: { gender, age, tags },
        selected_program_slug: selectedProgram?.slug || null,
        selected_branch_id: selectedBranchId,
        consent_given: true,
        consent_given_at: new Date().toISOString(),
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign'),
      });

      setPhase('confirmed');
    } catch {
      // Silent fail — form still transitions
      setPhase('confirmed');
    } finally {
      setSubmitting(false);
    }
  };

  const contactOptions: { value: PreferredContact; label: string }[] = [
    { value: 'call', label: 'Зателефонувати' },
    { value: 'telegram', label: 'Telegram' },
    { value: 'viber', label: 'Viber' },
  ];

  return (
    <div>
      {/* Progress bar */}
      <div className="h-[3px] bg-gray-100 mb-5">
        <div className="h-[3px] bg-[#04D3D9] transition-[width] duration-300" style={{ width: '80%' }} />
      </div>

      <button
        onClick={() => setPhase('branch')}
        className="text-[#005485] text-sm py-2 mb-2 cursor-pointer bg-transparent border-none"
      >
        &larr; Філія
      </button>

      <h2 className="text-lg font-bold mb-1">Останній крок</h2>
      <p className="text-[13px] text-gray-500 mb-4">
        Вкажіть контакти для підтвердження запису
      </p>

      {/* Cabinet teaser */}
      <div className="bg-[#f0f7ff] rounded-[10px] p-3.5 mb-4 border border-[#d0e4f5]">
        <div className="text-[13px] font-semibold text-[#005485] mb-1.5">В особистому кабінеті:</div>
        <div className="text-xs text-gray-700 leading-relaxed space-y-1">
          {['Ваша програма та склад обстежень', 'Дата та час візитів', 'Підготовка до обстеження', 'Дані лікарів', 'Результати та рекомендації'].map(item => (
            <div key={item} className="flex items-center gap-1.5">
              <IconCheckCircle size={14} className="text-[#005485] shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Name input */}
      <input
        type="text"
        placeholder="Ваше ім'я"
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-full px-3 py-3.5 border-2 border-gray-200 rounded-[10px] text-[15px] mb-2.5 focus:border-[#005485] focus:outline-none placeholder:text-gray-400"
      />

      {/* Phone input */}
      <input
        type="tel"
        placeholder="+38 0XX XXX XX XX"
        value={phone}
        onChange={handlePhoneChange}
        className="w-full px-3 py-3.5 border-2 border-gray-200 rounded-[10px] text-[15px] mb-2.5 focus:border-[#005485] focus:outline-none placeholder:text-gray-400"
      />

      {/* Honeypot — hidden from users */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={e => setHoneypot(e.target.value)}
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        tabIndex={-1}
        autoComplete="off"
      />

      {/* Preferred contact */}
      <div className="mb-4">
        <div className="text-[13px] text-gray-500 mb-2">Як зв'язатися:</div>
        <div className="flex gap-2">
          {contactOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setPreferredContact(opt.value)}
              className={`px-3 py-2 rounded-full border-2 text-sm transition-all duration-150 ${preferredContact === opt.value
                ? 'border-[#005485] bg-[#e8f4fd] font-semibold'
                : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Consent checkbox */}
      <label className="flex items-start gap-2 mb-4 cursor-pointer">
        <div
          onClick={() => setConsentGiven(!consentGiven)}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${consentGiven ? 'bg-[#005485] border-[#005485]' : 'bg-white border-gray-300'
            }`}
        >
          {consentGiven && <IconCheck size={14} />}
        </div>
        <span className="text-xs text-gray-500 leading-relaxed">
          Я даю згоду на обробку персональних даних відповідно до{' '}
          <a href="/ukr/policy" className="text-[#005485] underline" target="_blank" rel="noopener">
            Політики конфіденційності
          </a>
        </span>
      </label>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`w-full py-4 rounded-[10px] text-base font-semibold text-white transition-colors ${canSubmit
          ? 'bg-[#d60242] cursor-pointer hover:bg-[#b80238]'
          : 'bg-[#d1d5db] cursor-default'
          }`}
      >
        {submitting ? 'Відправляємо...' : 'Підтвердити запис'}
      </button>
    </div>
  );
}
