'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Branch {
  id: string;
  address_ua: string;
  metro_ua: string | null;
}

interface BookingModalProps {
  programSlug: string;
  programName: string;
  price: number;
  clinicId: string;
  clinicSlug: string;
  clinicName: string;
  city: string;
  onClose: () => void;
}

type PreferredContact = 'call' | 'telegram' | 'viber';

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `+${digits}`;
  if (digits.length <= 5) return `+${digits.slice(0, 2)} ${digits.slice(2)}`;
  if (digits.length <= 8) return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  if (digits.length <= 10) return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)}`;
  return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
}

export default function BookingModal({
  programSlug, programName, price,
  clinicId, clinicSlug, clinicName,
  city, onClose,
}: BookingModalProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredContact, setPreferredContact] = useState<PreferredContact>('call');
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch branches for this clinic
  useEffect(() => {
    const sb = supabase as any;
    sb.from('clinic_branches')
      .select('id, address_ua, metro_ua')
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }: any) => {
        if (data && data.length > 0) {
          setBranches(data);
          setSelectedBranchId(data[0].id);
        }
      });
  }, [clinicId]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const phoneDigits = phone.replace(/\D/g, '');
  const isPhoneValid = phoneDigits.length >= 12;
  const canSubmit = name.trim().length > 0 && isPhoneValid && consent && !submitting;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val && !val.startsWith('+')) val = '+38' + val;
    setPhone(formatPhone(val));
  };

  const selectedBranch = branches.find(b => b.id === selectedBranchId);

  const handleSubmit = async () => {
    if (!canSubmit || honeypot) return;
    setSubmitting(true);
    try {
      const params = new URLSearchParams(window.location.search);
      await (supabase as any).from('leads').insert({
        city,
        clinic_id: clinicId,
        clinic_slug: clinicSlug,
        source_page: window.location.pathname,
        name: name.trim(),
        phone: phoneDigits.length >= 10 ? `+${phoneDigits}` : phone,
        preferred_contact: preferredContact,
        selected_program_slug: programSlug,
        selected_branch_id: selectedBranchId || null,
        program_name: programName,
        price,
        consent_given: true,
        consent_given_at: new Date().toISOString(),
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign'),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true); // show success even on error — don't block user
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full sm:max-w-[480px] bg-white rounded-t-[20px] sm:rounded-2xl overflow-y-auto max-h-[92dvh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
          <span className="text-sm font-semibold text-gray-800">Запис на програму</span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
            aria-label="Закрити"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="px-5 py-5">
          {submitted ? (
            /* Success state */
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-[#e8f4fd] flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="#005485" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Запит прийнято!</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Консультант зателефонує вам протягом робочого дня для підтвердження запису.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 bg-[#005485] text-white rounded-xl text-sm font-semibold hover:bg-[#004070] transition-colors"
              >
                Закрити
              </button>
            </div>
          ) : (
            <>
              {/* Readonly program info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Програма</span>
                  <span className="font-medium text-gray-900 text-right max-w-[60%]">{programName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Клініка</span>
                  <span className="font-medium text-gray-900">{clinicName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ціна</span>
                  <span className="font-bold text-[#005485]">{price.toLocaleString('uk-UA')} грн</span>
                </div>
              </div>

              {/* Branch selector */}
              {branches.length > 1 ? (
                <div className="mb-4">
                  <label className="block text-sm text-gray-500 mb-1.5">Адреса філії</label>
                  <select
                    value={selectedBranchId}
                    onChange={e => setSelectedBranchId(e.target.value)}
                    className="w-full px-3 py-3 border-[1.5px] border-gray-200 rounded-[10px] text-sm text-gray-800 bg-white focus:outline-none focus:border-[#005485]"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.address_ua}{b.metro_ua ? ` (${b.metro_ua})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ) : selectedBranch ? (
                <div className="mb-4 text-sm text-gray-600">
                  <span className="text-gray-500">Адреса: </span>
                  {selectedBranch.address_ua}
                  {selectedBranch.metro_ua && <span className="text-gray-400"> · {selectedBranch.metro_ua}</span>}
                </div>
              ) : null}

              {/* Name */}
              <input
                type="text"
                placeholder="Ваше ім'я"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-3 border-[1.5px] border-gray-200 rounded-[10px] text-[15px] mb-3 focus:border-[#005485] focus:outline-none placeholder:text-gray-400"
              />

              {/* Phone — min 16px font to prevent iOS zoom */}
              <input
                type="tel"
                placeholder="+38 0XX XXX XX XX"
                value={phone}
                onChange={handlePhoneChange}
                style={{ fontSize: '16px' }}
                className="w-full px-3 py-3 border-[1.5px] border-gray-200 rounded-[10px] mb-3 focus:border-[#005485] focus:outline-none placeholder:text-gray-400"
              />

              {/* Honeypot */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={e => setHoneypot(e.target.value)}
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              {/* Preferred contact */}
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-2">Як зв&apos;язатися:</div>
                <div className="flex gap-2">
                  {(['call', 'telegram', 'viber'] as PreferredContact[]).map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setPreferredContact(opt)}
                      className={`px-3 py-2 rounded-full border-[1.5px] text-sm transition-all ${
                        preferredContact === opt
                          ? 'border-[#005485] bg-[#e8f4fd] font-semibold text-[#005485]'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {opt === 'call' ? 'Дзвінок' : opt === 'telegram' ? 'Telegram' : 'Viber'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Consent */}
              <label className="flex items-start gap-2.5 mb-5 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setConsent(!consent)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    consent ? 'bg-[#005485] border-[#005485]' : 'bg-white border-gray-300'
                  }`}
                  aria-checked={consent}
                  role="checkbox"
                >
                  {consent && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
                <span className="text-xs text-gray-500 leading-relaxed">
                  Погоджуюсь з{' '}
                  <a href="/ukr/policy" className="text-[#005485] underline" target="_blank" rel="noopener">
                    Політикою конфіденційності
                  </a>
                </span>
              </label>

              {/* Submit — Crimson, UPPERCASE */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`w-full py-4 rounded-[10px] text-sm font-bold tracking-wide transition-colors ${
                  canSubmit
                    ? 'bg-[#d60242] text-white hover:bg-[#b80238] cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {submitting ? 'ВІДПРАВЛЯЄМО...' : 'ЗАПИСАТИСЯ'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
