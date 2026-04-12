'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Branch {
  id: string;
  name_ua: string;
  address_ua: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  programName: string;
  price: number;
  branches: Branch[];
}

const DATES = [
  'Пн, 14 квітня · ранок',
  'Вт, 15 квітня · ранок',
  'Ср, 16 квітня · ранок',
  'Чт, 17 квітня · ранок',
  'Пт, 18 квітня · ранок',
  'Сб, 19 квітня · ранок',
];

function fmt(n: number) { return n.toLocaleString('uk-UA'); }

export default function BookingModal({ isOpen, onClose, programName, price, branches }: Props) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [branchIdx, setBranchIdx] = useState(0);
  const [dateIdx, setDateIdx] = useState(0);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          programName,
          price,
          branchId: branches[branchIdx]?.id,
          branchAddress: branches[branchIdx]?.address_ua,
          dateLabel: DATES[dateIdx],
          source: 'onclinic-kharkiv',
          city: 'kharkiv',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        setError('Помилка при записі. Спробуйте ще раз.');
        setLoading(false);
        return;
      }

      router.push(`/cabinet/preview/${data.token}`);
    } catch (_) {
      setError('Помилка зв\'язку. Перевірте інтернет.');
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-t-[20px] w-full max-w-[430px] max-h-[90vh] overflow-y-auto p-6 pb-8">
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
          <select
            value={branchIdx}
            onChange={e => setBranchIdx(Number(e.target.value))}
            className="w-full p-3.5 border-[1.5px] border-gray-200 rounded-[10px] text-[15px] text-[#0b1a24] mb-2 bg-white"
            required
          >
            {branches.map((b, i) => (
              <option key={b.id} value={i}>{b.address_ua}</option>
            ))}
          </select>

          {/* Date */}
          <label className="block text-[12px] font-semibold text-gray-400 mb-1 mt-1">Бажана дата першого візиту</label>
          <select
            value={dateIdx}
            onChange={e => setDateIdx(Number(e.target.value))}
            className="w-full p-3.5 border-[1.5px] border-gray-200 rounded-[10px] text-[15px] text-[#0b1a24] mb-2 bg-white"
            required
          >
            {DATES.map((d, i) => <option key={i} value={i}>{d}</option>)}
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
              Я даю згоду на обробку персональних даних відповідно до{" "}
              <a href="/privacy" className="text-[#005485]">Політики конфіденційності</a>
            </span>
          </label>

          {error && <p className="text-[13px] text-[#d60242] mb-3">{error}</p>}

          <button
            type="submit"
            disabled={!consent || !name || !phone || loading}
            className="block w-full py-4 bg-[#d60242] text-white font-bold text-[16px] rounded-[10px] disabled:opacity-40 disabled:cursor-default"
          >
            {loading ? 'Відправляємо...' : 'Записатися'}
          </button>
        </form>
      </div>
    </div>
  );
}
