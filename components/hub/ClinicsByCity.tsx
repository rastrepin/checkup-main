'use client';

import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Doctor {
  initials: string;
  name: string;
  title: string;
  experience: string;
  operationsCount?: number;
  operationsLabel?: string;
}

interface Price {
  method: string;
  from: string;
}

interface Partner {
  city: string;
  cityName: string;
  clinic: string;
  logo?: string;
  address: string;
  phone: string;
  phoneHref: string;
  hours: string;
  methods: string[];
  doctors: Doctor[];
  prices: Price[];
  subdomainUrl: string | null;
  isPlaceholder?: boolean;
  placeholderData?: {
    externalUrl: string;
    externalPhone: string;
    externalPhoneHref: string;
    note: string;
  };
  skipForDiagnosis?: string[];
}

// ─── Partners dataset ─────────────────────────────────────────────────────────

const ALL_PARTNERS: Partner[] = [
  {
    city: 'kharkiv',
    cityName: 'Харків',
    clinic: 'ON Clinic Харків',
    logo: '/assets/clinics/onclinic-logo.png', // PNG — вже є
    address: 'вул. Молочна, 48 (м. Левада) · 3 відділення',
    phone: '0 800 21 86 16',
    phoneHref: 'tel:+380800218616',
    hours: 'Пн–Пт 8:00–18:00, Сб 8:00–17:00, Нд 8:30–14:00',
    methods: ['Лапароскопічна міомектомія', 'Гістероскопічна міомектомія', 'Гістеректомія'],
    doctors: [
      {
        initials: 'АІ',
        name: 'Афанасьєв Ігор Володимирович',
        title: 'Акушер-гінеколог, к.м.н., вища категорія',
        experience: '34 роки',
      },
      {
        initials: 'СД',
        name: 'Стрюков Дмитро Владиславович',
        title: 'Акушер-гінеколог, к.м.н., вища категорія',
        experience: '24 роки',
      },
    ],
    prices: [
      { method: 'Лапароскопічна міомектомія', from: 'від 26 690 грн' },
      { method: 'Гістероскопічна міомектомія', from: 'від 13 395 грн' },
    ],
    subdomainUrl: 'https://onclinic.check-up.in.ua/kharkiv/mioma-matky',
  },
  {
    city: 'rivne',
    cityName: 'Рівне',
    clinic: 'РОКЛ (Рівненська обласна клінічна лікарня)',
    logo: '/assets/clinics/rokl-logo.svg',
    address: 'пл. Гоголя, 12, Рівне',
    phone: '(050) 200-08-91',
    phoneHref: 'tel:+380502000891',
    hours: 'Пн–Пт: 08:00–18:00',
    methods: ['Лапароскопічна міомектомія', 'Гістероскопічна міомектомія'],
    doctors: [
      {
        initials: 'ТР',
        name: 'Трохимович Руслана Миколаївна',
        title: 'Акушер-гінеколог, вища категорія',
        experience: '26 років',
        operationsCount: 340,
        operationsLabel: 'лапароскопічних міомектомій',
      },
    ],
    prices: [
      { method: 'Лапароскопічна міомектомія', from: 'від 35 000 грн' },
    ],
    subdomainUrl: 'https://rokl.check-up.in.ua/cases/laparoskopichna-miomektomia',
  },
  // MED OK Вінниця — виключена для діагнозу "mioma-matky"
  {
    city: 'vinnytsia',
    cityName: 'Вінниця',
    clinic: 'MED OK',
    logo: '/assets/clinics/medok-logo.png',
    address: '[УТОЧНИТИ]',
    phone: '[УТОЧНИТИ]',
    phoneHref: 'tel:+380',
    hours: '[УТОЧНИТИ]',
    methods: ['Ведення вагітності'],
    doctors: [],
    prices: [],
    subdomainUrl: 'https://medok.check-up.in.ua',
    skipForDiagnosis: ['mioma-matky'],
  },
  {
    city: 'lviv',
    cityName: 'Львів',
    clinic: 'Оксфорд Медікал Львів',
    logo: '/assets/clinics/oxford-medical-logo.svg',
    address: 'пр. В. Чорновола, 45А/9, Львів',
    phone: '+380 50 982 04 75',
    phoneHref: 'tel:+380509820475',
    hours: '[УТОЧНИТИ]',
    methods: ['Лапароскопічна міомектомія', 'Гістероскопічна міомектомія', 'Відкрита міомектомія', 'Гістеректомія'],
    doctors: [],
    prices: [],
    subdomainUrl: null,
    isPlaceholder: true,
    placeholderData: {
      externalUrl: 'https://lviv.oxford-med.com.ua/services/ginecology/',
      externalPhone: '+380 50 982 04 75',
      externalPhoneHref: 'tel:+380509820475',
      note: 'Клініка підключається до платформи — детальна сторінка скоро буде. Поки можна зв\'язатись напряму.',
    },
  },
];

// ─── PartnerCard ──────────────────────────────────────────────────────────────

function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#e8e4dc] shadow-[0_4px_24px_rgba(11,30,47,0.07)]">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-10">

        {/* Logo + Contacts */}
        <div>
          {partner.logo && (
            <img
              src={partner.logo}
              alt={`Логотип ${partner.clinic}`}
              className="h-9 mb-4 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <h3
            className="text-base font-bold text-[#0b1a24] mb-2 leading-snug"
            style={{ fontFamily: "'Fixel Display', system-ui, sans-serif" }}
          >
            {partner.clinic}
          </h3>
          <p className="text-sm text-[#4a5a6b] mb-3 leading-relaxed">{partner.address}</p>
          <div className="space-y-1 text-sm">
            {partner.phone !== '[УТОЧНИТИ]' && (
              <div>
                <a href={partner.phoneHref} className="text-[#005485] font-semibold hover:underline">
                  {partner.phone}
                </a>
              </div>
            )}
            {partner.hours !== '[УТОЧНИТИ]' && (
              <div className="text-[#4a5a6b] text-xs">{partner.hours}</div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="min-w-0">

          {/* Methods */}
          <div className="mb-5">
            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
              Виконують при міомі
            </div>
            <div className="flex flex-wrap gap-2">
              {partner.methods.map((m) => (
                <span
                  key={m}
                  className="bg-[#04D3D9]/[0.08] text-[#005485] text-xs px-2.5 py-1 rounded-full font-medium"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Doctors */}
          {partner.doctors.length > 0 && (
            <div className="mb-5">
              <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                Хірурги
              </div>
              <div className="space-y-2.5">
                {partner.doctors.map((d) => (
                  <div key={d.initials} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#005485] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {d.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#0b1a24] leading-snug">{d.name}</div>
                      <div className="text-xs text-gray-500">
                        {d.title} · {d.experience} досвіду
                        {d.operationsCount && ` · ${d.operationsCount}+ операцій`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prices */}
          {partner.prices.length > 0 && (
            <div className="mb-6">
              <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                Орієнтовні ціни
              </div>
              <div className="space-y-1">
                {partner.prices.map((p) => (
                  <div key={p.method} className="text-sm">
                    <span className="text-[#4a5a6b]">{p.method}:</span>
                    <span className="font-semibold text-[#0b1a24] ml-2">{p.from}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            {partner.subdomainUrl && (
              <a
                href={partner.subdomainUrl}
                className="inline-flex items-center justify-center gap-2 bg-[#005485] hover:bg-[#003a5e] text-white px-6 py-3.5 rounded-full text-sm font-semibold transition"
              >
                Детальніше про клініку →
              </a>
            )}
            <a
              href="#lead-form"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-[#005485] border-[1.5px] border-[#005485]/25 hover:border-[#005485] px-6 py-3.5 rounded-full text-sm font-semibold transition"
            >
              Записатись
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PlaceholderPartnerCard ───────────────────────────────────────────────────

function PlaceholderPartnerCard({ partner }: { partner: Partner }) {
  const pd = partner.placeholderData!;
  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#e8e4dc] shadow-[0_4px_24px_rgba(11,30,47,0.07)]">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-10">

        {/* Logo + Name */}
        <div className="">
          {partner.logo && (
            <img
              src={partner.logo}
              alt={`Логотип ${partner.clinic}`}
              className="h-9 mb-4 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <h3
            className="text-base font-bold text-[#0b1a24] mb-1 leading-snug"
            style={{ fontFamily: "'Fixel Display', system-ui, sans-serif" }}
          >
            {partner.clinic}
          </h3>
          <p className="text-sm text-[#4a5a6b] mb-2">{partner.address}</p>
        </div>

        {/* Details */}
        <div className="min-w-0">

          {/* Methods */}
          <div className="mb-5">
            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
              Виконують при міомі
            </div>
            <div className="flex flex-wrap gap-2">
              {partner.methods.map((m) => (
                <span
                  key={m}
                  className="bg-[#04D3D9]/[0.08] text-[#005485] text-xs px-2.5 py-1 rounded-full font-medium"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm text-[#4a5a6b] leading-relaxed">{pd.note}</p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={pd.externalPhoneHref}
              className="inline-flex items-center justify-center gap-2 bg-[#005485] hover:bg-[#003a5e] text-white px-6 py-3.5 rounded-full text-sm font-semibold transition"
            >
              Зателефонувати: {pd.externalPhone}
            </a>
            <a
              href={pd.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-[#005485] border-[1.5px] border-[#005485]/25 hover:border-[#005485] px-6 py-3.5 rounded-full text-sm font-semibold transition"
            >
              Сайт клініки ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NoPartnerCard ────────────────────────────────────────────────────────────

function NoPartnerCard() {
  return (
    <div className="bg-white rounded-2xl p-8 border border-[#e8e4dc] text-center shadow-[0_4px_24px_rgba(11,30,47,0.07)]">
      <h3
        className="text-lg font-bold text-[#0b1a24] mb-3"
        style={{ fontFamily: "'Fixel Display', system-ui, sans-serif" }}
      >
        У вашому місті поки немає партнерської клініки
      </h3>
      <p className="text-[#4a5a6b] mb-6 max-w-[420px] mx-auto text-sm leading-relaxed">
        Пропонуємо онлайн-консультацію з акушером-гінекологом — оцінка ситуації та план дій.
        Якщо операція потрібна, допоможемо знайти клініку у найближчому місті.
      </p>
      <a
        href="#lead-form"
        className="inline-flex items-center justify-center gap-2 bg-[#005485] hover:bg-[#003a5e] text-white px-7 py-3.5 rounded-full text-sm font-semibold transition"
      >
        Онлайн-консультація →
      </a>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ClinicsByCityProps {
  diagnosis?: string;
  predefinedCity: string | null;
}

export default function ClinicsByCity({ diagnosis = 'mioma-matky', predefinedCity }: ClinicsByCityProps) {
  // Фільтруємо партнерів які мають бути показані для цього діагнозу
  const partners = ALL_PARTNERS.filter(
    (p) => !p.skipForDiagnosis?.includes(diagnosis)
  );

  const initialCity =
    predefinedCity && partners.find((p) => p.city === predefinedCity)
      ? predefinedCity
      : partners[0].city;

  const [selectedCity, setSelectedCity] = useState<string>(initialCity);

  const selectedPartner = partners.find((p) => p.city === selectedCity);

  return (
    <div>
      {/* City strip */}
      <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Оберіть місто">
        {partners.map((p) => (
          <button
            key={p.city}
            role="tab"
            aria-selected={p.city === selectedCity}
            onClick={() => setSelectedCity(p.city)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition
              ${p.city === selectedCity
                ? 'bg-[#005485] text-white shadow-[0_4px_12px_rgba(0,84,133,0.25)]'
                : 'bg-white border border-[#e8e4dc] text-[#0b1a24] hover:border-[#005485]'
              }`}
          >
            {p.cityName}
          </button>
        ))}

        {/* Інше місто */}
        <button
          role="tab"
          aria-selected={selectedCity === 'other'}
          onClick={() => setSelectedCity('other')}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition
            ${selectedCity === 'other'
              ? 'bg-[#005485] text-white'
              : 'bg-white border border-dashed border-gray-400 text-gray-600 hover:border-[#005485]'
            }`}
        >
          Інше місто
        </button>
      </div>

      {/* Card */}
      <div role="tabpanel">
        {selectedCity === 'other' ? (
          <NoPartnerCard />
        ) : selectedPartner?.isPlaceholder ? (
          <PlaceholderPartnerCard partner={selectedPartner} />
        ) : selectedPartner ? (
          <PartnerCard partner={selectedPartner} />
        ) : (
          <NoPartnerCard />
        )}
      </div>
    </div>
  );
}
