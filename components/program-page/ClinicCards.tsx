'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Gender, AgeRange } from '@/lib/programs/data';

interface ClinicCard {
  clinicId: string;
  clinicName: string;
  branchesCount: number;
  programName: string;
  priceDiscount: number;
  priceRegular: number;
  analysesCount: number | null;
  programSlug: string;
  city: string;
}

const CITIES = [
  { value: 'kharkiv', label: 'Харків' },
  { value: 'rivne', label: 'Рівне' },
];

// Map AgeRange → age_group values in Supabase
function ageGroupFilter(ageRange: AgeRange): string[] {
  if (ageRange === 'do-30') return ['do-30', 'any'];
  if (ageRange === '30-40') return ['30-40', 'any'];
  if (ageRange === '40-50') return ['40-50', 'any']; // 'after-40' is legacy for 50+, not 40-50
  if (ageRange === '50+') return ['50+', 'after-40', 'any'];
  return ['any'];
}

export default function ClinicCards({
  gender,
  ageRange,
  programType,
}: {
  gender: Gender;
  ageRange: AgeRange;
  programType: 'full' | 'regular';
}) {
  const [city, setCity] = useState('');
  const [cards, setCards] = useState<ClinicCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cityParam = params.get('city');
    if (cityParam) setCity(cityParam);
  }, []);

  useEffect(() => {
    if (!city) { setCards([]); return; }
    setLoading(true);
    setError('');

    (async () => {
      try {
        const sb = supabase as any;

        // 1. Get active clinics in selected city
        const { data: clinics, error: clinicErr } = await sb
          .from('clinics')
          .select('id, name')
          .eq('city', city)
          .eq('is_active', true);

        if (clinicErr) throw clinicErr;
        if (!clinics || clinics.length === 0) {
          setCards([]);
          setLoading(false);
          return;
        }

        const clinicIds = clinics.map((c: { id: string }) => c.id);

        // 2. Get branch counts per clinic
        const { data: branches } = await sb
          .from('clinic_branches')
          .select('clinic_id')
          .in('clinic_id', clinicIds)
          .eq('is_active', true);

        const branchCount: Record<string, number> = {};
        for (const b of (branches ?? [])) {
          branchCount[b.clinic_id] = (branchCount[b.clinic_id] ?? 0) + 1;
        }

        // 3. Get programs filtered by gender + age_group + is_active
        const ageValues = ageGroupFilter(ageRange);
        const { data: programs, error: progErr } = await sb
          .from('checkup_programs')
          .select('id, name_ua, price_regular, price_discount, analyses_count, clinic_id, slug, age_group')
          .in('clinic_id', clinicIds)
          .or(`gender.eq.${gender},gender.is.null`)
          .in('age_group', ageValues)
          .eq('is_active', true)
          .eq('is_specialized', false)
          .filter('slug', programType === 'regular' ? 'ilike' : 'not.ilike', '%regular-%')
          .order('price_discount', { ascending: true });

        if (progErr) throw progErr;

        // 4. One card per clinic — take the cheapest, prefer exact age match over 'any'
        const clinicMap = Object.fromEntries(
          clinics.map((c: { id: string; name: string }) => [c.id, c.name])
        );

        const seen = new Set<string>();
        const result: ClinicCard[] = [];

        // Sort: exact match first (age_group !== 'any'), then by price
        const sorted = [...(programs ?? [])].sort((a: any, b: any) => {
          const aExact = a.age_group !== 'any' ? 0 : 1;
          const bExact = b.age_group !== 'any' ? 0 : 1;
          if (aExact !== bExact) return aExact - bExact;
          return a.price_discount - b.price_discount;
        });

        for (const p of sorted as any[]) {
          if (seen.has(p.clinic_id)) continue;
          seen.add(p.clinic_id);
          result.push({
            clinicId: p.clinic_id,
            clinicName: clinicMap[p.clinic_id] ?? '',
            branchesCount: branchCount[p.clinic_id] ?? 1,
            programName: p.name_ua,
            priceDiscount: p.price_discount,
            priceRegular: p.price_regular,
            analysesCount: p.analyses_count,
            programSlug: p.slug,
            city,
          });
        }

        setCards(result);
      } catch {
        setError('Не вдалося завантажити клініки. Спробуйте пізніше.');
      } finally {
        setLoading(false);
      }
    })();
  }, [city, gender, ageRange, programType]);

  return (
    <section className="my-10" id="clinics">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Де пройти цю програму
      </h2>

      {/* City selector */}
      <div className="flex items-center gap-2 mb-5 text-sm text-gray-500">
        <span>Місто:</span>
        <select
          value={city}
          onChange={e => setCity(e.target.value)}
          className="py-1.5 px-3 border-[1.5px] border-gray-200 rounded-lg text-sm font-medium text-gray-800 bg-white focus:outline-none focus:border-[#04D3D9]"
        >
          <option value="">Оберіть</option>
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

      {loading && <p className="text-sm text-gray-500">Завантаження...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {city && !loading && !error && cards.length === 0 && (
        <div className="bg-gray-50 rounded-xl p-6 text-sm text-gray-500">
          У цьому місті програма поки недоступна. Оберіть інше місто або <a href="/kontakty" className="underline text-[#005485]">зв'яжіться з нами</a>.
        </div>
      )}

      {/* One card per clinic */}
      <div className="space-y-3">
        {cards.map((card) => (
          <div
            key={card.clinicId}
            className="border-[1.5px] border-gray-200 rounded-xl p-4"
          >
            <h4 className="text-sm font-bold text-gray-900 mb-0.5">
              {card.clinicName}
            </h4>
            <p className="text-[11px] text-gray-500 mb-2">
              {card.branchesCount > 1
                ? `${card.branchesCount} філії`
                : '1 філія'}
            </p>
            <div className="text-xs text-gray-700 leading-relaxed mb-3 p-2.5 bg-gray-50 rounded-md">
              {card.programName}
              {card.analysesCount ? ` · ${card.analysesCount} досліджень` : ''}
            </div>
            <div className="text-xl font-extrabold text-[#005485] mb-3">
              {card.priceDiscount.toLocaleString('uk-UA')}&nbsp;грн
              {card.priceRegular > card.priceDiscount && (
                <span className="ml-2 text-sm font-normal text-gray-400 line-through">
                  {card.priceRegular.toLocaleString('uk-UA')}&nbsp;грн
                </span>
              )}
            </div>
            <a
              href={`/ukr/${card.city}?program=${card.programSlug}`}
              className="block w-full text-center py-3 bg-[#005485] text-white rounded-xl text-sm font-semibold hover:bg-[#004070] transition-colors"
            >
              Записатися
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
