'use client';

import { useState } from 'react';

// TODO: replace with Supabase when tables are ready
const CITIES = [
  {
    slug: 'rivne',
    name: 'Рівне',
    clinic: 'РОКЛ ім. Юрія Семенюка',
    clinicUrl: null,
    address: 'вул. Київська, 78г',
    methods: [
      {
        label: 'Лапароскопічна міомектомія',
        url: 'https://rokl.check-up.in.ua/cases/laparoskopichna-miomektomia',
      },
      {
        label: 'Гістероскопічна міомектомія',
        url: 'https://rokl.check-up.in.ua/cases/gisteroskopichne-vydalennya',
      },
    ],
    doctor: 'Трохимович Руслана Миколаївна',
    doctorUrl: 'https://rokl.check-up.in.ua/doctors/trokhymovych-ruslana?case=gisteroskopichne-vydalennya',
  },
  {
    slug: 'kharkiv',
    name: 'Харків',
    clinic: 'ON Clinic',
    clinicUrl: null,
    address: 'вул. Ярослава Мудрого, 30а',
    methods: [
      {
        label: 'Лапароскопічна міомектомія',
        url: 'https://onclinic.check-up.in.ua/kharkiv/mioma-laparoskopichna-miomektomiia',
      },
      { label: 'Гістероскопічна міомектомія', url: null },
      { label: 'Гістеректомія', url: null },
    ],
    doctor: 'Афанасьєв (ПІБ уточнити)', // TODO: замінити на повне ПІБ
    doctorUrl: 'https://onclinic.check-up.in.ua/kharkiv/doctors/afanasiev?case=mioma-matky',
  },
];

const ALL_CITIES = ['Дніпро', 'Львів', 'Одеса', 'Київ', 'Вінниця', 'Запоріжжя', 'Суми'];

export default function ClinicCitySelector() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');

  const matchedCity = CITIES.find((c) => c.slug === selectedCity);
  const isNoPartner =
    selectedCity !== null && !CITIES.find((c) => c.slug === selectedCity);

  const handleCityInput = (val: string) => {
    setInputValue(val);
    const norm = val.trim().toLowerCase();
    const found = CITIES.find((c) => c.name.toLowerCase().includes(norm));
    if (found) setSelectedCity(found.slug);
    else if (norm.length > 2) setSelectedCity('__unknown__');
    else setSelectedCity(null);
  };

  return (
    <section className="px-4 py-12 md:py-16 bg-gray-50" aria-labelledby="clinics-heading">
      <div className="max-w-7xl mx-auto">
        <h2 id="clinics-heading" className="font-display font-bold text-[22px] md:text-[26px] text-text-primary mb-4 md:mb-5 tracking-tight">
          Клініки по містах
        </h2>
        <p className="text-[13px] text-gray-500 mb-4">
          Оберіть своє місто, щоб побачити партнерську клініку та доступні методи.
        </p>

        {/* Chip-селектор міст */}
        <div className="flex flex-wrap gap-2 mb-4">
          {CITIES.map((city) => (
            <button
              key={city.slug}
              type="button"
              onClick={() => setSelectedCity(selectedCity === city.slug ? null : city.slug)}
              className={`px-4 py-2 rounded-[40px] border-2 text-[13px] font-medium transition-colors ${
                selectedCity === city.slug
                  ? 'border-[#005485] bg-[#e8f4fd] text-[#005485]'
                  : 'border-gray-200 bg-white text-[#0b1a24] hover:border-gray-300'
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>

        {/* Пошук по іншому місту */}
        <input
          type="text"
          placeholder="Інше місто..."
          value={inputValue}
          onChange={(e) => handleCityInput(e.target.value)}
          className="w-full px-3 py-3 border-2 border-gray-200 rounded-[10px] text-[14px] focus:border-[#005485] focus:outline-none placeholder:text-gray-400 mb-4"
          aria-label="Пошук вашого міста"
        />

        {/* Результат — партнерська клініка */}
        {matchedCity && (
          <div className="bg-white border border-[#005485]/30 rounded-[10px] p-4">
            <div className="text-[11px] text-[#005485] uppercase tracking-wide font-semibold mb-2">
              Партнер у {matchedCity.name}
            </div>
            <div className="text-[16px] font-bold text-[#0b1a24] mb-0.5">{matchedCity.clinic}</div>
            <div className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-3">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {matchedCity.address}
            </div>
            <div className="mb-3">
              <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-1.5">
                Доступні методи
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matchedCity.methods.map((m) =>
                  m.url ? (
                    <a
                      key={m.label}
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#e8f4fd] text-[#005485] text-[11px] font-semibold px-2.5 py-1 rounded-full hover:bg-[#d0e8f5] transition-colors"
                    >
                      {m.label} →
                    </a>
                  ) : (
                    <span
                      key={m.label}
                      className="bg-[#e8f4fd] text-[#005485] text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    >
                      {m.label}
                    </span>
                  )
                )}
              </div>
            </div>
            {matchedCity.doctor && (
              <div className="text-[12px] text-gray-600">
                Провідний фахівець:{' '}
                {matchedCity.doctorUrl ? (
                  <a
                    href={matchedCity.doctorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#005485] hover:underline"
                  >
                    {matchedCity.doctor} →
                  </a>
                ) : (
                  <strong>{matchedCity.doctor}</strong>
                )}
              </div>
            )}
          </div>
        )}

        {/* Міст без партнера */}
        {isNoPartner && (
          <div className="bg-amber-50 border border-amber-200 rounded-[10px] p-4">
            <p className="text-[13px] text-amber-900 mb-3">
              У вашому місті поки немає партнерської клініки на платформі. Ви можете
              записатись на онлайн-консультацію з акушером-гінекологом — лікар оцінить ваш
              випадок за наявними документами та допоможе скласти план дій.
            </p>
            <a
              href="#lead-form"
              className="inline-block px-4 py-2.5 bg-[#005485] text-white text-[13px] font-semibold rounded-[10px] hover:bg-[#004070] transition-colors"
            >
              Онлайн-консультація
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
