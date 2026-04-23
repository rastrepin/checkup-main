/**
 * DescribePainBlock — reusable "Як описати свій біль лікарю" section.
 * Used on: bil-pid-chas-statevoho-aktu, and any future symptom page with pain context.
 */

const PAIN_QUESTIONS = [
  {
    id: 'location',
    label: 'Локалізація',
    body: 'Біль може бути поверхневим (при вході у піхву, на зовнішніх статевих органах) або глибоким (відчувається в нижній частині живота, тазу, попереку при глибокому проникненні). Це принципово різні групи причин — поверхневий біль частіше пов\'язаний з шкірою, слизовою, інфекціями; глибокий — з органами малого тазу.',
  },
  {
    id: 'timing',
    label: 'Час появи',
    body: 'Біль виникає щоразу чи тільки в певні дні циклу (наприклад перед менструацією)? З якого моменту почався — кілька тижнів, місяців, років? Постійно посилюється чи стабільний?',
  },
  {
    id: 'character',
    label: 'Характер',
    body: 'Гострий, ріжучий, тупий, ниючий, печіння, спазм? Чи проходить одразу після завершення акту, чи залишається на години?',
  },
  {
    id: 'context',
    label: 'Контекст',
    body: 'Тільки з певним партнером або у певних позиціях? Тільки під час циклу або у певні фази? З чим ще поєднується (рясні місячні, біль внизу живота поза сексом, виділення, сечовипускання)?',
  },
];

export default function DescribePainBlock() {
  return (
    <section className="px-4 py-8 bg-white" aria-labelledby="describe-pain-heading">
      <div className="max-w-3xl mx-auto">
        <h2 id="describe-pain-heading" className="text-[22px] font-bold text-[#0b1a24] mb-1">
          Як описати свій біль лікарю
        </h2>
        <p className="text-[14px] text-gray-600 mb-5 leading-relaxed">
          Конкретика опису допомагає лікарю значно швидше визначити причину. Коли запишетесь
          на консультацію, спробуйте звернути увагу на кілька моментів.
        </p>

        <div className="space-y-3">
          {PAIN_QUESTIONS.map((q) => (
            <div key={q.id} className="bg-gray-50 rounded-[10px] p-4 border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#04D3D9] mt-2 shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-[14px] font-semibold text-[#0b1a24] mb-1">{q.label}</div>
                  <p className="text-[13px] text-gray-700 leading-relaxed">{q.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 bg-[#e8f4fd] border border-[#005485]/20 rounded-[10px] p-4">
          <p className="text-[13px] text-[#0b1a24] leading-relaxed">
            <span className="font-semibold">Чому це важливо:</span> за тими самими словами
            &ldquo;болить при сексі&rdquo; можуть стояти десятки різних причин. Чим точніше ви опишете
            свій випадок, тим швидше лікар призначить правильні обстеження. Не соромтесь
            говорити деталями — для лікаря це інформація, не неприємна тема.
          </p>
        </div>
      </div>
    </section>
  );
}
