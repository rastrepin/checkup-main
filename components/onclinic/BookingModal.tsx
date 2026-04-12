'use client';

import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  programName: string;
  price: number;
  branches: Array<{ id: string; name_ua: string; address_ua: string }>;
}

const DATES = [
  'Пн, 14 квітня · 8:00-11:00',
  'Вт, 15 квітня · 8:00-11:00',
  'Ср, 16 квітня · 8:00-11:00',
  'Чт, 17 квітня · 8:00-11:00',
  'Пт, 18 квітня · 8:00-11:00',
  'Сб, 19 квітня · 9:00-12:00',
];

function fmt(n: number) { return n.toLocaleString('uk-UA'); }

export default function BookingModal({ isOpen, onClose, programName, price, branches }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // POST to Supabase leads
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          name,
          phone,
          program_name: programName,
          price,
          source: 'onclinic-kharkiv',
          city: 'kharkiv',
          created_at: new Date().toISOString(),
        }),
      });
    } catch (_) {}
    setSubmitted(true);
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-t-[20px] w-full max-w-[430px] max-h-[90vh] overflow-y-auto p-6 pb-8">
        {submitted ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-[#0b1a24] mb-2">Заявку прийнято!</h3>
            <p className="text-gray-500 text-sm mb-6">Реєстратор зателефонує вам протягом 30 хвилин для підтвердження запису.</p>
            <button onClick={onClose}
              className="w-full py-3 rounded-[10px] bg-[#005485] text-white font-semibold text-sm">
              Закрити
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#0b1a24]">Запис на чекап</h3>
              <button type="button" onClick={onClose} className="text-gray-300 text-2xl leading-none">×</button>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-[10px] p-4 mb-4">
              <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Програма</div>
              <div className="text-[15px] font-bold text-[#0b1a24]">{programName}</div>
              <div className="text-[13px] text-gray-500">ОН Клінік Харків</div>
              <div className="text-[20px] font-bold text-[#005485] mt-1">{fmt(price)} грн</div>
            </div>

            {/* Branch */}
            <label className="block text-[12px] font-semibold text-gray-400 mb-1 mt-3">Філія</label>
            <select className="w-full p-3.5 border-[1.5px] border-gray-200 rounded-[10px] text-[15px] font-[Onest] text-[#0b1a24] mb-2 bg-white" required>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.address_ua}</option>
              ))}
            </select>

            {/* Date */}
            <label className="block text-[12px] font-semibold text-gray-400 mb-1 mt-1">Дата першого візиту</label>
            <select className="w-full p-3.5 border-[1.5px] border-gray-200 rounded-[10px] text-[15px] font-[Onest] text-[#0b1a24] mb-2 bg-white" required>
              {DATES.map(d => <option key={d}>{d}</option>)}
            </select>

            {/* Name + Phone */}
            <label className="block text-[12px] font-semibold text-gray-400 mb-1 mt-1">Ваше ім'я</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Ім'я" required
              className="w-full p-3.5 border-[1.5px] border-gray-200 rounded-[10px] text-[15px] mb-2 focus:outline-none focus:border-[#005485]"
            />
            <label className="block text-[12px] font-semibold text-gray-400 mb-1">Телефон</label>
            <input
              type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="+380..." required
              className="w-full p-3.5 border-[1.5px] border-gray-200 rounded-[10px] text-[15px] mb-3 focus:outline-none focus:border-[#005485]"
            />

            {/* Consent */}
            <label className="flex gap-2.5 items-start mt-1 mb-4 cursor-pointer">
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}
                className="w-5 h-5 min-w-[20px] mt-0.5 accent-[#005485]" />
              <span className="text-[12px] text-gray-400 leading-[1.4]">
                Я даю згоду на обробку персональних даних відповідно до{' '}
                <a href="/privacy" className="text-[#005485]">Політики конфіденційності</a>
              </span>
            </label>

            <button
              type="submit" disabled={!consent || !name || !phone}
              className="block w-full py-4 bg-[#d60242] text-white font-bold text-[16px] rounded-[10px] disabled:opacity-40 disabled:cursor-default"
            >
              Записатися
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
