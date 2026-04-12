'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Gender } from '@/lib/programs/data';

interface ClinicWithProgram {
  clinicId: string;
  clinicName: string;
  city: string;
  programName: string;
  priceDiscount: number;
  priceRegular: number;
  analysesCount: number | null;
  programSlug: string;
}

const CITIES = [
  { value: 'kharkiv', label: 'Харків' },
  { value: 'rivne', label: 'Рівне' },
];

export default function ClinicCards({ gender }: { gender: Gender }) {
  const [city, setCity] = useState('');
  const [results, setResults] = useState<ClinicWithProgram[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cityParam = params.get('city');
    if (cityParam) setCity(cityParam);
  }, []);

  useEffect(() => {
    if (!city) { setResults([]); return; }
    setLoading(true);
    setError('');

    (async () => {
      try {
        const { data: clinics, error: clinicErr } = await supabase
          .from('clinics')
          .select('id, name')
          .eq('city', city)
          .eq('is_active', true);

        if (clinicErr) throw clinicErr;
        if (!clinics || clinics.length === 0) { setResults([]); setLoading(false); return; }

        const ids = clinics.map((c: { id: string }) => c.id);

        const { data: programs, error: progErr } = await supabase
          .from('checkup_programs')
          .select('id, name_ua, price_regular, price_discount, analyses_count, clinic_id, slug')
          .in('clinic_id', ids)
          .eq('is_specialized', false)
          .eq('is_active', true)
          .or(`gender.eq.${gender},gender.is.null`)
          .order('price_discount', { ascending: true });

        if (progErr) throw progErr;

        const clinicMap = Object.fromEntries(
          (clinics as { id: string; name: string }[]).map(c => [c.id, c.name])
        );

        const mapped: ClinicWithProgram[] = (programs ?? []).map((p: {
          clinic_id: string;
          name_ua: string;
          price_discount: number;
          price_regular: number;
          analyses_count: number | null;
          slug: string;
        }) => ({
          clinicId: p.clinic_id,
          clinicName: clinicMap[p.clinic_id] ?? '',
          city,
          programName: p.name_ua,
          priceDiscount: p.price_discount,
          priceRegular: p.price_regular,
          analysesCount: p.analyses_count,
          programSlug: p.slug,
        }));

        setResults(mapped);
      } catch {
        setError('Не вдалося завантажити клініки. Спробуйте пізніше.');
      } finally {
        setLoading(false);
      }
    })();
  }, [city, gender]);

  return (
    <section className="my-10">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Де пройти програму
      </h2>

      <div className="mb-6">
        <label htmlFor="city-select" className="block text-sm text-gray-600 mb-1">
          Оберіть місто
        </label>
        <select
          id="city-select"
          value={city}
          onChange={e => setCity(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white w-56"
        >
          <option value="">— Оберіть місто —</option>
          {CITIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {!city && (
        <p className="text-sm text-gray-500 italic">
          Оберіть місто, щоб побачити клініки та ціни.
        </p>
      )}

      {loading && (
        <p className="text-sm text-gray-500">Завантаження...</p>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {city && !loading && !error && results.length === 0 && (
        <div className="bg-gray-50 rounded-xl p-6 text-sm text-gray-500">
          Поки що клінік у цьому місті немає. Програма стандартна — можна пройти в будь-якій клініці-партнері check-up.in.ua.
        </div>
      )}

      {results.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {results.map((r, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-xl p-5 hover:border-teal-400 transition-colors"
            >
              <p className="text-xs font-medium text-teal-600 uppercase tracking-wide mb-1">
                {r.clinicName}
              </p>
              <p className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                {r.programName}
              </p>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-lg font-bold text-gray-900">
                  {r.priceDiscount.toLocaleString('uk-UA')}&nbsp;грн
                </span>
                {r.priceRegular > r.priceDiscount && (
                  <span className="text-sm text-gray-400 line-through">
                    {r.priceRegular.toLocaleString('uk-UA')}&nbsp;грн
                  </span>
                )}
              </div>
              {r.analysesCount && (
                <p className="text-xs text-gray-500 mb-3">{r.analysesCount} досліджень</p>
              )}
              <a
                href={`/ukr/${r.city}?program=${r.programSlug}`}
                className="block w-full text-center bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Записатися
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
