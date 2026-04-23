// TODO: replace with Supabase when tables are ready (sorted by experience_years DESC)

const DOCTORS = [
  {
    id: 'trokhymovych-rm',
    name: 'Трохимович Руслана Миколаївна',
    specialty: 'Акушер-гінеколог',
    category: 'вища категорія',
    experience_years: 26,
    operations_count: 340,
    operations_label: 'лапароскопічних міомектомій',
    city: 'Рівне',
    clinic: 'РОКЛ',
    methods: ['Лапароскопічна міомектомія', 'Гістероскопічна міомектомія'],
    profile_url: 'https://rokl.check-up.in.ua/doctors/trokhymovych-ruslana',
  },
  {
    id: 'doctor-kharkiv-1',
    name: 'Афанасьєв [ПІБ уточнити]', // TODO: замінити на повне ПІБ
    specialty: 'Акушер-гінеколог',
    category: null,
    experience_years: null,
    operations_count: null,
    operations_label: null,
    city: 'Харків',
    clinic: 'ON Clinic',
    methods: ['Лапароскопічна міомектомія'],
    profile_url: 'https://onclinic.check-up.in.ua/kharkiv/doctors/afanasiev?case=mioma-matky',
  },
];

function DoctorCard({
  doctor,
}: {
  doctor: (typeof DOCTORS)[0];
}) {
  const initials = doctor.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('');

  return (
    <div className="bg-white border border-gray-200 rounded-[10px] p-4 flex gap-3">
      {/* Avatar */}
      <div
        className="w-[52px] h-[52px] rounded-full bg-[#005485] flex items-center justify-center text-white font-bold text-[16px] shrink-0"
        aria-label={`Аватар лікаря ${doctor.name}`}
      >
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-bold text-[#0b1a24] leading-snug">{doctor.name}</div>
        <div className="text-[12px] text-gray-500 mb-2">
          {doctor.specialty}
          {doctor.category ? `, ${doctor.category}` : ''}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
          {doctor.experience_years !== null && (
            <span className="text-[12px] text-gray-600">
              Досвід: <strong>{doctor.experience_years} р.</strong>
            </span>
          )}
          {doctor.operations_count !== null && (
            <span className="text-[12px] text-gray-600">
              <strong>{doctor.operations_count}+</strong> {doctor.operations_label}
            </span>
          )}
        </div>

        <div className="text-[12px] text-gray-500 mb-2">
          {doctor.city} · {doctor.clinic}
        </div>

        <div className="flex flex-wrap gap-1 mb-2">
          {doctor.methods.map((m) => (
            <span
              key={m}
              className="bg-gray-100 text-gray-600 text-[11px] px-2 py-0.5 rounded-full"
            >
              {m}
            </span>
          ))}
        </div>

        {doctor.profile_url ? (
          <a
            href={doctor.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] text-[#005485] font-semibold hover:underline"
          >
            Повний профіль →
          </a>
        ) : (
          <span className="text-[12px] text-gray-300">
            Профіль — TODO: додати після наповнення Supabase
          </span>
        )}
      </div>
    </div>
  );
}

export default function DoctorsByMethod() {
  return (
    <section className="px-4 py-12 md:py-16 bg-white" aria-labelledby="doctors-heading">
      <div className="max-w-7xl mx-auto">
        <h2 id="doctors-heading" className="font-display font-bold text-[22px] md:text-[26px] text-text-primary mb-4 md:mb-5 tracking-tight">
          Лікарі по методах
        </h2>
        <p className="text-[13px] text-gray-500 mb-4">
          Лікарі згруповані за методом, у якому вони спеціалізуються. Усі проходять
          верифікацію досвіду та профільних операцій.
        </p>

        <div className="space-y-3 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-4 md:space-y-0">
          {DOCTORS.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
        <p className="text-[11px] text-gray-400 mt-3">
          * TODO: замінити фактичними даними лікарів з Supabase (таблиця `doctors`)
        </p>
      </div>
    </section>
  );
}
