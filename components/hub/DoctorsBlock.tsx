// DoctorsBlock — верифіковані хірурги по міомі матки
// v4: тільки лікарі з повними даними (без placeholder)

interface Doctor {
  id: string;
  initials: string;
  name: string;
  specialty: string;
  category: string;
  experienceYears: number;
  operationsCount?: number;
  operationsLabel?: string;
  city: string;
  clinic: string;
  methods: string[];
  profileUrl: string;
}

const DOCTORS: Doctor[] = [
  {
    id: 'trokhymovych-rm',
    initials: 'ТР',
    name: 'Трохимович Руслана Миколаївна',
    specialty: 'Акушер-гінеколог',
    category: 'вища категорія',
    experienceYears: 26,
    operationsCount: 340,
    operationsLabel: 'лапароскопічних міомектомій',
    city: 'Рівне',
    clinic: 'РОКЛ',
    methods: ['Лапароскопічна міомектомія', 'Гістероскопічна міомектомія'],
    profileUrl: 'https://rokl.check-up.in.ua/doctors/trokhymovych-ruslana',
  },
  {
    id: 'afanasiev-iv',
    initials: 'АІ',
    name: 'Афанасьєв Ігор Володимирович',
    specialty: 'Акушер-гінеколог',
    category: 'к.м.н., вища категорія',
    experienceYears: 34,
    city: 'Харків',
    clinic: 'ON Clinic',
    methods: ['Лапароскопічна міомектомія', 'Гістероскопічна міомектомія', 'Гістеректомія'],
    profileUrl: 'https://onclinic.check-up.in.ua/kharkiv/doctors/afanasiev?case=mioma-matky',
  },
  {
    id: 'striukov-dv',
    initials: 'СД',
    name: 'Стрюков Дмитро Владиславович',
    specialty: 'Акушер-гінеколог',
    category: 'к.м.н., вища категорія',
    experienceYears: 24,
    city: 'Харків',
    clinic: 'ON Clinic',
    methods: ['Лапароскопічна міомектомія', 'Гістеректомія'],
    profileUrl: 'https://onclinic.check-up.in.ua/kharkiv/doctors/striukov?case=mioma-matky',
  },
];

function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#e8e4dc]">
      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-12 h-12 rounded-full bg-[#005485] text-white flex items-center justify-center font-bold text-base shrink-0"
          aria-label={`Аватар ${doctor.name}`}
        >
          {doctor.initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="text-[15px] font-bold text-[#0b1a24] leading-snug mb-0.5"
            style={{ fontFamily: "'Fixel Display', system-ui, sans-serif" }}
          >
            {doctor.name}
          </h3>
          <p className="text-xs text-gray-500">
            {doctor.specialty}, {doctor.category}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-1 text-sm mb-4">
        <div>
          <span className="text-gray-500">Досвід:</span>{' '}
          <strong className="text-[#0b1a24]">{doctor.experienceYears} р.</strong>
        </div>
        {doctor.operationsCount && (
          <div>
            <span className="text-gray-500">Операцій:</span>{' '}
            <strong className="text-[#0b1a24]">{doctor.operationsCount}+</strong>{' '}
            <span className="text-gray-500 text-xs">{doctor.operationsLabel}</span>
          </div>
        )}
        <div>
          <span className="text-gray-500">Місто:</span>{' '}
          <span className="text-[#0b1a24]">{doctor.city} · {doctor.clinic}</span>
        </div>
      </div>

      {/* Methods */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {doctor.methods.map((m) => (
          <span key={m} className="bg-gray-100 text-gray-600 text-[11px] px-2 py-0.5 rounded-full">
            {m}
          </span>
        ))}
      </div>

      {/* Profile link */}
      <a
        href={doctor.profileUrl}
        className="text-sm font-semibold text-[#005485] hover:text-[#003a5e] transition"
      >
        Повний профіль →
      </a>
    </div>
  );
}

export default function DoctorsBlock() {
  return (
    <section className="py-12 md:py-16" aria-labelledby="doctors-heading">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <h2
          id="doctors-heading"
          className="font-bold text-[22px] md:text-[28px] text-[#0b1a24] mb-4 tracking-tight"
          style={{ fontFamily: "'Fixel Display', system-ui, sans-serif" }}
        >
          Хірурги, що виконують операції з міоми
        </h2>
        <p className="text-base text-[#4a5a6b] mb-8 max-w-[640px]">
          Лікарі проходять верифікацію досвіду та профільних операцій. Повний профіль
          лікаря — на сторінці клініки.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {DOCTORS.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </div>
    </section>
  );
}
