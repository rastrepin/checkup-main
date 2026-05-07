'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import BookingModal from './BookingModal';

const UNIVERSAL_PROGRAM_ID = 'a3c6b705-ce7a-481a-86f5-43f28a56ed02';

const CITIES: { value: string; label: string }[] = [
  { value: 'kharkiv', label: 'Харків' },
  { value: 'rivne', label: 'Рівне' },
];

interface ClinicOffer {
  programId: string;
  programName: string;
  programSlug: string;
  priceDiscount: number;
  priceRegular: number;
  consultationsCount: number | null;
  analysesCount: number | null;
  diagnosticsCount: number | null;
  clinicId: string;
  clinicName: string;
  clinicSlug: string;
  clinicLogoUrl: string | null;
  sortOrder: number;
}

export default function UniversalClinicOffers() {
  const [city, setCity] = useState('');
  const [offers, setOffers] = useState<ClinicOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingOffer, setBookingOffer] = useState<ClinicOffer | null>(null);

  // Restore city from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get('city');
    if (c) setCity(c);
  }, []);

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    const url = new URL(window.location.href);
    if (newCity) url.searchParams.set('city', newCity);
    else url.searchParams.delete('city');
    window.history.replaceState({}, '', url.toString());
  };

  useEffect(() => {
    if (!city) return;
    setLoading(true);
    setError('');
    setOffers([]);

    (async () => {
      try {
        const sb = supabase as any;

        // Get clinic IDs in chosen city
        const { data: branches } = await sb
          .from('clinic_branches')
          .select('clinic_id')
          .eq('city', city);

        const clinicIds: string[] = [
          ...new Set<string>((branches ?? []).map((b: any) => String(b.clinic_id))),
        ];
        if (clinicIds.length === 0) { setOffers([]); setLoading(false); return; }

        // Get offers for universal program in this city
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
          .eq('platform_program_id', UNIVERSAL_PROGRAM_ID)
          .eq('checkup_programs.is_active', true)
          .eq('checkup_programs.clinics.is_active', true)
          .in('checkup_programs.clinic_id', clinicIds)
          .order('sort_order', { ascending: true });

        if (fetchErr) throw fetchErr;

        const seen = new Set<string>();
        const result: ClinicOffer[] = [];
        for (const row of (rows ?? []) as any[]) {
          const cp = row.checkup_programs;
          const clinic = cp?.clinics;
          if (!cp || !clinic) continue;
          if (seen.has(clinic.id)) continue;
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
            clinicId: clinic.id,
            clinicName: clinic.name,
            clinicSlug: clinic.slug,
            clinicLogoUrl: clinic.logo_url,
            sortOrder: row.sort_order ?? 999,
          });
        }
        result.sort((a, b) => a.sortOrder - b.sortOrder || a.priceDiscount - b.priceDiscount);
        setOffers(result);
      } catch (e: any) {
        console.error('UniversalClinicOffers error:', e);
        setError('Не вдалося завантажити пропозиції клінік. Спробуйте пізніше.');
      } finally {
        setLoading(false);
      }
    })();
  }, [city]);

  return (
    <section className="my-10" id="clinic-section">
      <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
        Де пройти цю програму
      </h2>

      <div className="flex items-center gap-2 mb-5 text-sm text-[var(--text-secondary)]">
        <span>Місто:</span>
        <select
          value={city}
          onChange={e => handleCityChange(e.target.value)}
          className="py-1.5 px-3 border-[1.5px] border-[var(--border-warm)] rounded-lg text-sm font-medium text-[var(--text-primary)] bg-[var(--background)] focus:outline-none focus:border-[var(--teal)]"
        >
          <option value="">Оберіть</option>
          {CITIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {!city && (
        <p className="text-sm text-[var(--text-secondary)] italic">
          Оберіть місто, щоб побачити клініки та ціни.
        </p>
      )}
      {loading && <p className="text-sm text-[var(--text-secondary)]">Завантаження...</p>}
      {error && <p className="text-sm text-[var(--crimson)]">{error}</p>}

      {city && !loading && !error && offers.length === 0 && (
        <div className="bg-gray-50 rounded-xl p-6 text-sm text-[var(--text-secondary)]">
          У цьому місті програма поки недоступна. Оберіть інше місто або{' '}
          <a href="/kontakty" className="underline text-[var(--navy)]">зв'яжіться з нами</a>.
        </div>
      )}

      <div className="space-y-3">
        {offers.map(offer => (
          <div key={offer.programId} className="border-[1.5px] border-[var(--border-warm)] rounded-xl p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2 mb-2">
              {offer.clinicLogoUrl && (
                <img src={offer.clinicLogoUrl} alt={offer.clinicName} className="h-6 object-contain" />
              )}
              <h4 className="text-sm font-bold text-[var(--text-primary)]">{offer.clinicName}</h4>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-2 leading-relaxed">{offer.programName}</p>
            {offer.consultationsCount !== null && (
              <div className="flex gap-3 text-[11px] text-[var(--text-secondary)] mb-3">
                {offer.consultationsCount > 0 && <span>{offer.consultationsCount} консультацій</span>}
                {offer.analysesCount !== null && offer.analysesCount > 0 && <span>{offer.analysesCount} аналізів</span>}
                {offer.diagnosticsCount !== null && offer.diagnosticsCount > 0 && <span>{offer.diagnosticsCount} УЗД/діагн.</span>}
              </div>
            )}
            <div className="text-xl font-extrabold text-[var(--navy)] mb-3">
              {offer.priceDiscount.toLocaleString('uk-UA')}&nbsp;грн
              {offer.priceRegular > offer.priceDiscount && (
                <span className="ml-2 text-sm font-normal text-gray-400 line-through">
                  {offer.priceRegular.toLocaleString('uk-UA')}&nbsp;грн
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setBookingOffer(offer)}
              className="w-full py-3 bg-[var(--navy)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--navy-dark)] transition-colors"
            >
              Записатися
            </button>
          </div>
        ))}
      </div>

      {bookingOffer && (
        <BookingModal
          programSlug={bookingOffer.programSlug}
          programName={bookingOffer.programName}
          price={bookingOffer.priceDiscount}
          clinicId={bookingOffer.clinicId}
          clinicSlug={bookingOffer.clinicSlug}
          clinicName={bookingOffer.clinicName}
          city={city}
          onClose={() => setBookingOffer(null)}
        />
      )}
    </section>
  );
}
