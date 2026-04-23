'use client';

import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type NodeType = 'submucosal' | 'intramural' | 'subserosal' | 'unknown';
type PregnancyPlan = 'soon' | 'later' | 'none' | 'difficulty';

interface Recommendation {
  method: string;
  methodSlug: string;
  note: string;
  partnerInCity?: {
    clinicName: string;
    doctorName: string;
    priceFrom: string;
    caseUrl: string;
  };
  nearestCity?: {
    name: string;
    distanceKm: number;
    clinicName: string;
  };
}

interface Props {
  predefinedCity: string | null;
}

// ─── Partners dataset ─────────────────────────────────────────────────────────

const CITY_PARTNERS: Record<string, {
  clinicName: string;
  doctorName: string;
  laparoPrice: string;
  hysteroPrice: string;
  laparoCaseUrl: string;
  hysteroCaseUrl: string;
}> = {
  kharkiv: {
    clinicName: 'ON Clinic Харків',
    doctorName: 'Афанасьєв І.В.',
    laparoPrice: '26 690 грн',
    hysteroPrice: '13 395 грн',
    laparoCaseUrl: 'https://onclinic.check-up.in.ua/kharkiv/mioma-laparoskopichna-miomektomiia',
    hysteroCaseUrl: 'https://onclinic.check-up.in.ua/kharkiv/gisteroskopia-polipektomia',
  },
  rivne: {
    clinicName: 'РОКЛ Рівне',
    doctorName: 'Трохимович Р.М.',
    laparoPrice: '35 000 грн',
    hysteroPrice: 'уточнюйте',
    laparoCaseUrl: 'https://rokl.check-up.in.ua/cases/laparoskopichna-miomektomia',
    hysteroCaseUrl: 'https://rokl.check-up.in.ua/cases/laparoskopichna-miomektomia',
  },
  lviv: {
    clinicName: 'Оксфорд Медікал Львів',
    doctorName: 'Уточнюйте',
    laparoPrice: 'уточнюйте',
    hysteroPrice: 'уточнюйте',
    laparoCaseUrl: 'https://lviv.oxford-med.com.ua/services/ginecology/',
    hysteroCaseUrl: 'https://lviv.oxford-med.com.ua/services/ginecology/',
  },
};

// Nearest partner for cities without one (city → nearest partner city)
const NEAREST_PARTNER: Record<string, { city: string; cityName: string; distanceKm: number; clinicName: string }> = {
  poltava: { city: 'kharkiv', cityName: 'Харкові', distanceKm: 140, clinicName: 'ON Clinic' },
  sumy: { city: 'kharkiv', cityName: 'Харкові', distanceKm: 170, clinicName: 'ON Clinic' },
  kremenchuk: { city: 'kharkiv', cityName: 'Харкові', distanceKm: 185, clinicName: 'ON Clinic' },
  zhytomyr: { city: 'rivne', cityName: 'Рівному', distanceKm: 130, clinicName: 'РОКЛ' },
  lutsk: { city: 'rivne', cityName: 'Рівному', distanceKm: 75, clinicName: 'РОКЛ' },
  ternopil: { city: 'lviv', cityName: 'Львові', distanceKm: 120, clinicName: 'Оксфорд Медікал' },
  ivano_frankivsk: { city: 'lviv', cityName: 'Львові', distanceKm: 130, clinicName: 'Оксфорд Медікал' },
};

// ─── Recommendation logic ─────────────────────────────────────────────────────

function getRecommendation(nodeType: NodeType, pregnancyPlan: PregnancyPlan, city: string | null): Recommendation {
  // Визначаємо метод
  let method = '';
  let methodSlug = '';
  let note = '';

  if (nodeType === 'submucosal') {
    method = 'Гістероскопічна міомектомія';
    methodSlug = 'histeroskopichna-miomektomia';
    note = 'Субмукозний вузол знаходиться в порожнині матки — гістероскопія найефективніший метод. Без розрізів, виписка того ж дня.';
  } else if (nodeType === 'unknown') {
    method = 'Спочатку УЗД + консультація';
    methodSlug = 'diagnostic-first';
    note = 'Тип вузла визначається на УЗД. Рекомендуємо спочатку отримати висновок, і тоді лікар підбере метод.';
  } else if (['intramural', 'subserosal'].includes(nodeType) && pregnancyPlan === 'soon') {
    method = 'Лапароскопічна міомектомія';
    methodSlug = 'laparoskopichna-miomektomia';
    note = 'При плануванні вагітності матку необхідно зберегти. Лапароскопія — стандарт для інтрамуральних та субсерозних вузлів.';
  } else if (['intramural', 'subserosal'].includes(nodeType) && pregnancyPlan === 'difficulty') {
    method = 'Лапароскопічна міомектомія';
    methodSlug = 'laparoskopichna-miomektomia';
    note = 'Міома може заважати зачаттю або виношуванню. Видалення вузла часто покращує шанси на вагітність.';
  } else if (['intramural', 'subserosal'].includes(nodeType) && pregnancyPlan === 'later') {
    method = 'Лапароскопічна міомектомія';
    methodSlug = 'laparoskopichna-miomektomia';
    note = 'Матка зберігається, фертильність — також. Після операції вагітність планують через 6–12 місяців.';
  } else {
    // none — не планує
    method = 'Лапароскопічна міомектомія або гістеректомія';
    methodSlug = 'histerectomia-or-laparoscopy';
    note = 'Якщо вагітність не планується, варіанти ширші — від лапароскопії до гістеректомії. Вибір залежить від розміру вузла та симптомів.';
  }

  // Визначаємо партнера
  const partnerData = city && CITY_PARTNERS[city];
  if (partnerData && city !== 'vinnytsia') {
    const isHystero = methodSlug === 'histeroskopichna-miomektomia';
    return {
      method,
      methodSlug,
      note,
      partnerInCity: {
        clinicName: partnerData.clinicName,
        doctorName: partnerData.doctorName,
        priceFrom: isHystero ? partnerData.hysteroPrice : partnerData.laparoPrice,
        caseUrl: isHystero ? partnerData.hysteroCaseUrl : partnerData.laparoCaseUrl,
      },
    };
  }

  // Найближче місто
  const nearest = city ? NEAREST_PARTNER[city] : null;
  if (nearest) {
    return { method, methodSlug, note, nearestCity: { name: nearest.cityName, distanceKm: nearest.distanceKm, clinicName: nearest.clinicName } };
  }

  return { method, methodSlug, note };
}

// ─── Step data ────────────────────────────────────────────────────────────────

const NODE_OPTIONS: { value: NodeType; label: string; hint: string }[] = [
  { value: 'submucosal', label: 'Субмукозний', hint: 'росте в порожнині матки' },
  { value: 'intramural', label: 'Інтрамуральний', hint: 'росте у стінці матки' },
  { value: 'subserosal', label: 'Субсерозний', hint: 'росте зовні матки' },
  { value: 'unknown', label: 'Не знаю', hint: 'не було УЗД або не сказали тип' },
];

const PREGNANCY_OPTIONS: { value: PregnancyPlan; label: string }[] = [
  { value: 'soon', label: 'Планую найближчим часом' },
  { value: 'later', label: 'Можливо, пізніше' },
  { value: 'none', label: 'Не планую' },
  { value: 'difficulty', label: 'Є проблеми з зачаттям' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
      <span className="font-medium text-gray-700">Крок {step} з 2</span>
      <span>·</span>
      <span>~20 сек</span>
      <div className="ml-auto flex gap-1">
        <div className={`h-1 w-8 rounded-full ${step >= 1 ? 'bg-[#005485]' : 'bg-gray-200'}`} />
        <div className={`h-1 w-8 rounded-full ${step >= 2 ? 'bg-[#005485]' : 'bg-gray-200'}`} />
      </div>
    </div>
  );
}

function QuizResult({ rec, onReset }: { rec: Recommendation; onReset: () => void }) {
  return (
    <div className="space-y-4">
      {/* Method recommendation */}
      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Рекомендовано</div>
        <div
          className="text-lg font-semibold text-[#0b1a24] mb-1"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
        >
          {rec.method}
        </div>
        <p className="text-sm text-[#4a5a6b] leading-relaxed">{rec.note}</p>
      </div>

      {/* Сценарій A: партнер є у місті */}
      {rec.partnerInCity && (
        <div className="bg-[#e8f9fa] rounded-xl p-4">
          <div className="text-xs text-[#005485] font-semibold mb-1">{rec.partnerInCity.clinicName}</div>
          <div className="text-sm text-[#0b1a24] mb-0.5">Хірург: {rec.partnerInCity.doctorName}</div>
          <div className="text-sm font-semibold text-[#005485] mb-3">від {rec.partnerInCity.priceFrom}</div>
          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href={rec.partnerInCity.caseUrl}
              className="inline-flex items-center justify-center gap-1.5 bg-[#005485] hover:bg-[#003a5e] text-white text-xs font-semibold px-4 py-2.5 rounded-full transition"
            >
              Детальніше про метод →
            </a>
            <a
              href="#lead-form"
              className="inline-flex items-center justify-center gap-1.5 bg-transparent text-[#005485] border border-[#005485]/25 hover:border-[#005485] text-xs font-semibold px-4 py-2.5 rounded-full transition"
            >
              Записатись
            </a>
          </div>
        </div>
      )}

      {/* Сценарій Б: є найближче місто */}
      {!rec.partnerInCity && rec.nearestCity && (
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-[#4a5a6b] mb-3">
            У вашому місті партнера немає. Найближче:{' '}
            <strong className="text-[#0b1a24]">{rec.nearestCity.name} ({rec.nearestCity.distanceKm} км)</strong>{' '}
            — {rec.nearestCity.clinicName}.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href="#lead-form"
              className="inline-flex items-center justify-center gap-1.5 bg-[#005485] hover:bg-[#003a5e] text-white text-xs font-semibold px-4 py-2.5 rounded-full transition"
            >
              Онлайн-консультація →
            </a>
            <a
              href="#clinics"
              className="inline-flex items-center justify-center gap-1.5 bg-transparent text-[#005485] border border-[#005485]/25 hover:border-[#005485] text-xs font-semibold px-4 py-2.5 rounded-full transition"
            >
              Клініки в Україні
            </a>
          </div>
        </div>
      )}

      {/* Сценарій В: нічого не знайдено */}
      {!rec.partnerInCity && !rec.nearestCity && (
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-[#4a5a6b] mb-3">
            У вашому регіоні партнерська клініка поки не підключена. Пропонуємо
            онлайн-консультацію з акушером-гінекологом — оцінка ситуації та план дій.
          </p>
          <a
            href="#lead-form"
            className="inline-flex items-center justify-center gap-1.5 bg-[#005485] hover:bg-[#003a5e] text-white text-xs font-semibold px-4 py-2.5 rounded-full transition"
          >
            Онлайн-консультація →
          </a>
        </div>
      )}

      <button
        onClick={onReset}
        className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition"
      >
        ← Пройти заново
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function InlineQuiz({ predefinedCity }: Props) {
  const [step, setStep] = useState<1 | 2 | 'result'>(1);
  const [nodeType, setNodeType] = useState<NodeType | null>(null);
  const [pregnancyPlan, setPregnancyPlan] = useState<PregnancyPlan | null>(null);
  const [rec, setRec] = useState<Recommendation | null>(null);

  const handleNodeSelect = (val: NodeType) => {
    setNodeType(val);
    setStep(2);
  };

  const handlePregnancySelect = (val: PregnancyPlan) => {
    setPregnancyPlan(val);
    const recommendation = getRecommendation(nodeType!, val, predefinedCity);
    setRec(recommendation);
    setStep('result');
  };

  const handleReset = () => {
    setStep(1);
    setNodeType(null);
    setPregnancyPlan(null);
    setRec(null);
  };

  return (
    <div className="bg-white border border-[#e8e4dc] rounded-2xl p-6 md:p-7 shadow-[0_4px_24px_rgba(11,30,47,0.06)] max-w-[540px]">

      {/* Step 1 */}
      {step === 1 && (
        <div>
          <StepIndicator step={1} />
          <p className="text-sm font-semibold text-[#0b1a24] mb-4">
            Де розташований вузол за УЗД?
          </p>
          <div className="space-y-2">
            {NODE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleNodeSelect(opt.value)}
                className="w-full flex items-center justify-between gap-3 p-3.5 bg-gray-50 hover:bg-[#005485]/[0.05] border border-gray-200 hover:border-[#005485]/30 rounded-xl text-left transition group"
              >
                <div>
                  <div className="text-sm font-semibold text-[#0b1a24] group-hover:text-[#005485]">
                    {opt.label}
                  </div>
                  <div className="text-xs text-gray-500">{opt.hint}</div>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#005485] shrink-0 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div>
          <StepIndicator step={2} />
          <p className="text-sm font-semibold text-[#0b1a24] mb-4">
            Плани на вагітність?
          </p>
          <div className="space-y-2">
            {PREGNANCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handlePregnancySelect(opt.value)}
                className="w-full flex items-center justify-between gap-3 p-3.5 bg-gray-50 hover:bg-[#005485]/[0.05] border border-gray-200 hover:border-[#005485]/30 rounded-xl text-left transition group"
              >
                <span className="text-sm font-medium text-[#0b1a24] group-hover:text-[#005485]">
                  {opt.label}
                </span>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#005485] shrink-0 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(1)}
            className="mt-3 text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition"
          >
            ← Назад
          </button>
        </div>
      )}

      {/* Result */}
      {step === 'result' && rec && (
        <QuizResult rec={rec} onReset={handleReset} />
      )}

    </div>
  );
}
