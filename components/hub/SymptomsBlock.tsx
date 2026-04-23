import Link from 'next/link';

export default function SymptomsBlock() {
  return (
    <section className="px-4 py-12 md:py-16 bg-white h-full" aria-labelledby="symptoms-heading">
      <div className="max-w-2xl mx-auto md:max-w-none">
        <h2 id="symptoms-heading" className="font-display font-bold text-[22px] md:text-[26px] text-text-primary mb-4 md:mb-5 tracking-tight">
          Симптоми — коли потрібне лікування
        </h2>

        <div className="text-[14px] text-[#0b1a24] leading-relaxed space-y-3 mt-4">
          <p>
            Міома роками може нічим себе не проявляти. Але певні симптоми — чіткий
            сигнал, що вузол впливає на організм і варто звернутись до лікаря.
          </p>
          <p>
            У більшості жінок прояви пов&apos;язані з кровотечею або з тиском на сусідні
            органи. Рясні або надто тривалі місячні — найчастіший прояв. Якщо прокладок
            вистачає на годину, якщо виходять великі згустки, якщо через менструацію ви
            планово беретеся за лікарняний — йдеться не про &quot;просто рясні&quot;, а про
            ситуацію, в якій велика крововтрата створює анемію. Анемія сама по собі
            потребує лікування, навіть до розгляду міоми.
          </p>
          <p>
            Тиск на сусідні органи — другий типовий сценарій. Постійний тиск або тяжкість
            внизу живота, часте сечовипускання (при тому що сечовий міхур не повний),
            запори або труднощі з дефекацією — все це може означати, що вузол став
            достатньо великим, щоб зміщувати сусідні структури. Біль під час статевого
            акту трапляється при певному розташуванні вузлів. При субмукозних вузлах або
            вузлах у гирлі труби можуть з&apos;явитись проблеми із зачаттям.
          </p>
        </div>

        <div className="mt-4">
          <Link
            href="/careway/simptomy/ryasni-misyachni"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#005485] hover:underline"
          >
            Детальніше: Рясні місячні — що це може бути
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Червоні прапорці */}
        <div
          className="mt-5 bg-red-50 border border-red-200 rounded-[10px] p-4"
          role="alert"
          aria-label="Невідкладна ситуація"
        >
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-4 h-4 text-red-600 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="text-[13px] font-bold text-red-700 uppercase tracking-wide">
              Червоні прапорці — невідкладно
            </span>
          </div>
          <p className="text-[13px] text-red-800 leading-relaxed">
            Раптовий гострий біль внизу живота з нудотою та гарячкою — можлива ознака
            перекруту ніжки вузла або некрозу. Це стан, що потребує{' '}
            <strong>негайної медичної допомоги: швидка, не плановий запис</strong>.{' '}
            <span className="text-red-600">[Mayo Clinic]</span>
          </p>
        </div>
      </div>
    </section>
  );
}
