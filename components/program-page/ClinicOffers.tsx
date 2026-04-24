'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import BookingModal from './BookingModal';

interface ClinicOffer {
  programId: string;
  programName: string;
  programSlug: string;
  priceDiscount: number;
  priceRegular: number;
  consultationsCount: number | null;
  analysesCount: number | null;
  diagnosticsCount: number | null;
  clinicName: string;
  clinicSlug: string;
  clinicLogoUrl: string | null;
  sortOrder: number;
}

const CITIES: { value: string; label: string }[] = [
  { value: 'kharkiv', label: 'Харків' },
  { value: 'rivne', label: 'Рівне' },
];

export default function ClinicOffers({
  gender,
  ageGroup,
}: {
  gender: string;
  ageGroup: string;
}) {
  const [city, setCity] = useState('');
  const [bookingOffer, setBookingOffer] = useState<ClinicOffer | null>(null);
  const [platformProgramId, setPlatformProgramId] = useState<string | null>(null);
  const [offers, setOffers] = useState<ClinicOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Read city from URL search params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cityParam = params.get('city');
    if (cityParam) setCity(cityParam);
  }, []);

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    const url = new URL(window.location.href);
    if (newCity) url.searchParams.set('city', newCity);
    else url.searchParams.delete('city');
    window.history.replaceState({}, '', url.toString());
  };

  // Step 1: find platform_program_id by gender + age_group (not by slug)
  useEffect(() => {
    if (!gender || !ageGroup) return;
    const sb = supabase as any;
    sb.from('platform_programs')
      .select('id')
      .eq('gender', gender)
      .eq('age_group', ageGroup)
      .eq('is_specialized', false)
      .single()
      .then(({ data, error: err }: any) => {
        if (!err && data) setPlatformProgramId(data.id);
        else console.warn('platform_program not found for', gender, ageGroup, err);
      });
  }, [gender, ageGroup]);

  // Step 2: fetch offers when city and platformProgramId are ready
  useEffect(() => {
    if (!city || !platformProgramId) { setOffers([]); return; }
    setLoading(true);
    setError('');

    (async () => {
      try {
        const sb = supabase as any;

        // Get clinic IDs active in this city (via clinic_branches.city)
        const { data: branches } = await sb
          .from('clinic_branches')
          .select('clinic_id')
          .eq('city', city)
          .eq('is_active', true);

        const clinicIds: string[] = [...new Set(
          (branches ?? []).map((b: any) => b.clinic_id)
        )];

        if (clinicIds.length === 0) { setOffers([]); setLoading(false); return; }

        // Fetch platform_program_offers for this program + these clinics
        const { data: rows, error: fetchErr } = await sb
          .from('platform_program_offers')
          .select(`
            sort_order,
            checkup_programs!inner (
              id, name_ua, slug,
              price_discount, price_regular,
              consultations_count, analyses_count, diagnostics_count,
              is_active, clinic_id,
              clinics!inner ( id, name, slug, logo_url, is_active )
            )
          `)
          .eq('platform_program_id', platformProgramId)
          .eq('checkup_programs.is_active', true)
          .eq('checkup_programs.clinics.is_active', true)
          .in('checkup_programs.clinic_id', clinicIds)
          .order('sort_order', { ascending: true });

        if (fetchErr) throw fetchErr;

        // Deduplicate: 1 card per clinic, take first match by sort_order
        // No slug filtering — platform_program_offers already contains the correct offers
        const seen = new Set<string>();
        const result: ClinicOffer[] = [];

        for (const row of (rows ?? []) as any[]) {
          const cp = row.checkup_programs;
          const clinic = cp?.clinics;
          if (!cp || !clinic) continue;
          if (seen.has(clinic.id)) continue;         // 1 per clinic
          seen.add(clinic.id);
          result.push({
            programId: cp.id,
            programName: cp.name_ua,
            programSlug: cp.slug,
            priceDiscount: cp.price_discount,
            priceRegular: cp.price_regular,
            consultationsCount: cp.consultations_count,
            analysesCount: cp.analyses_count,
            diagnosticsCount: cp.diagnostics_count,
            clinicName: clinic.name,
            clinicSlug: clinic.slug,
            clinicLogoUrl: clinic.logo_url,
            sortOrder: row.sort_order ?? 999,
          });
        }

        result.sort((a, b) => a.sortOrder - b.sortOrder || a.priceDiscount - b.priceDiscount);
        setOffers(result);
      } catch (e: any) {
        console.error('ClinicOffers error:', e);
        setError('Не вдалося завантажити пропозиції клінік. Спробуйте пізніше.');
      } finally {
        setLoading(false);
      }
    })();
  }, [city, platformProgramId]);

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
          onChange={e => handleCityChange(e.target.value)}
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

      {city && !loading && !error && offers.length === 0 && (
        <div className="bg-gray-50 rounded-xl p-6 text-sm text-gray-500">
          У цьому місті програма поки недоступна. Оберіть інше місто або{' '}
          <a href="/kontakty" className="underline text-[#005485]">зв&apos;яжіться з нами</a>.
        </div>
      )}

      {/* Offer cards — 1 per clinic */}
      <div className="space-y-3">
        {offers.map(offer => (
          <div
            key={offer.programId}
            className="border-[1.5px] border-gray-200 rounded-xl p-4"
          >
            {/* Clinic header */}
            <div className="flex items-center gap-2 mb-2">
              {offer.clinicLogoUrl && (
                <img
                  src={offer.clinicLogoUrl}
                  alt={offer.clinicName}
                  className="h-6 object-contain"
                />
              )}
              <h4 className="text-sm font-bold text-gray-900">{offer.clinicName}</h4>
            </div>

            {/* Program name */}
            <p className="text-xs text-gray-600 mb-2 leading-relaxed">{offer.programName}</p>

            {/* Counts — only if consultations_count is not null */}
            {offer.consultationsCount !== null && (
              <div className="flex gap-3 text-[11px] text-gray-500 mb-3">
                {offer.consultationsCount > 0 && (
                  <span>{offer.consultationsCount} консультацій</span>
                )}
                {offer.analysesCount !== null && offer.analysesCount > 0 && (
                  <span>{offer.analysesCount} аналізів</span>
                )}
                {offer.diagnosticsCount !== null && offer.diagnosticsCount > 0 && (
                  <span>{offer.diagnosticsCount} УЗД/діагн.</span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="text-xl font-extrabold text-[#005485] mb-3">
              {offer.priceDiscount.toLocaleString('uk-UA')}&nbsp;грн
              {offer.priceRegular > offer.priceDiscount && (
                <span className="ml-2 text-