import Link from 'next/link';

export default function CausesBlock() {
  return (
    <section className="px-4 py-8 bg-gray-50" aria-labelledby="causes-heading">
      <div className="max-w-3xl mx-auto">
        <h2 id="causes-heading" className="text-[22px] font-bold text-[#0b1a24] mb-1">
          Що це може бути
        </h2>
        <p className="text-[14px] text-gray-600 mb-5 leading-relaxed">
          Причин рясних місячних кілька, і вони дуже різні. Далі — найпоширеніші, з
          підказкою, коли яка імовірніша.
        </p>

        <div className="space-y-3">
          {/* 4.1 Міома */}
          <div className="bg-white border border-gray-200 rounded-[10px] p-4">
            <h3 className="text-[15px] font-bold text-[#0b1a24] mb-2">Міома матки</h3>
            <p className="text-[13px] text-gray-700 leading-relaxed mb-2">
              Найчастіша структурна причина рясних місячних — міома, доброякісне
              новоутворення у стінці матки або її порожнині. Підозра на міому виникає,
              коли рясні чи тривалі місячні поєднуються з тиском внизу живота, частим
              сечовипусканням, візуальним збільшенням живота. Підтвердити чи виключити
              міому допомагає звичайне УЗД органів малого тазу.
            </p>
            <p className="text-[13px] text-[#005485] font-medium mb-1">
              Якщо рясні місячні + міома у висновку УЗД — у вас є чіткий план дій.
            </p>
            <Link
              href="/cases/mioma-matky"
              className="text-[13px] font-semibold text-[#005485] hover:underline"
            >
              Міома матки — методи лікування, клініки, ціни →
            </Link>
          </div>

          {/* 4.2 Аденоміоз */}
          <div className="bg-white border border-gray-200 rounded-[10px] p-4">
            <h3 className="text-[15px] font-bold text-[#0b1a24] mb-2">Аденоміоз</h3>
            <p className="text-[13px] text-gray-700 leading-relaxed mb-2">
              При аденоміозі ендометрій проникає у м&apos;язовий шар матки. Матка стає більш
              &quot;напруженою&quot;, місячні стають не тільки рясними, а й особливо болісними.
              Типовий вік — 35-50 років. Діагноз ставлять за УЗД та клінічною картиною,
              при потребі — МРТ.
            </p>
            <span className="text-[12px] text-gray-300 cursor-not-allowed">
              Аденоміоз — план дій{' '}
              <span className="text-[11px]">[скоро]</span>
            </span>
          </div>

          {/* 4.3 Поліпи */}
          <div className="bg-white border border-gray-200 rounded-[10px] p-4">
            <h3 className="text-[15px] font-bold text-[#0b1a24] mb-2">Поліпи ендометрія</h3>
            <p className="text-[13px] text-gray-700 leading-relaxed mb-2">
              Поліпи — невеликі утворення слизової матки. Зазвичай доброякісні, але можуть
              бути причиною не тільки рясних місячних, а й кровомазання між циклами та
              проблем з зачаттям. Діагноз підтверджується гістероскопією.
            </p>
            <span className="text-[12px] text-gray-300 cursor-not-allowed">
              Поліпи ендометрія — методи лікування{' '}
              <span className="text-[11px]">[скоро]</span>
            </span>
          </div>

          {/* 4.4 Гормональні дисбаланси */}
          <div className="bg-white border border-gray-200 rounded-[10px] p-4">
            <h3 className="text-[15px] font-bold text-[#0b1a24] mb-2">Гормональні дисбаланси</h3>
            <p className="text-[13px] text-gray-700 leading-relaxed">
              Порушення балансу естрогену і прогестерону. Буває у перименопаузі (після 40),
              при СПКЯ, при дисфункції щитоподібної залози. Часто супроводжується
              нерегулярністю циклу, припливами, змінами ваги. Обстеження — аналізи крові
              на гормони (ФСГ, ЛГ, естрадіол, прогестерон, ТТГ, Т4).
            </p>
          </div>

          {/* 4.5 Порушення згортання */}
          <div className="bg-white border border-gray-200 rounded-[10px] p-4">
            <h3 className="text-[15px] font-bold text-[#0b1a24] mb-2">
              Порушення згортання крові
            </h3>
            <p className="text-[13px] text-gray-700 leading-relaxed">
              Рідкісна, але важлива причина — особливо у молодих жінок. Хвороба
              Віллебранда та інші коагулопатії іноді дебютують рясними місячними вже у
              підлітковому віці. Сигнали: місячні рясні з підліткового віку, часті носові
              кровотечі, легкі синці без причин. Обстеження — коагулограма.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
