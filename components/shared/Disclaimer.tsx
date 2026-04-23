interface DisclaimerProps {
  variant?: 'full' | 'short';
  className?: string;
}

export default function Disclaimer({ variant = 'full', className = '' }: DisclaimerProps) {
  if (variant === 'short') {
    return (
      <p className={`text-[12px] text-gray-500 leading-relaxed ${className}`}>
        Матеріал носить інформаційний характер і не замінює консультацію лікаря.
      </p>
    );
  }

  return (
    <div
      className={`bg-gray-50 border border-gray-200 rounded-[10px] p-4 text-[13px] text-gray-600 leading-relaxed ${className}`}
      role="note"
      aria-label="Медична відмова від відповідальності"
    >
      <div className="font-semibold text-[#0b1a24] mb-2">Дисклеймер</div>
      <p className="mb-2">
        Ця сторінка — інформаційний матеріал платформи check-up.in.ua. Вона не замінює консультацію
        лікаря.
      </p>
      <p className="mb-2">
        Діагноз встановлює тільки лікар після огляду, УЗД та за показаннями — додаткових
        обстежень. Метод лікування обирається індивідуально з урахуванням вашої медичної
        історії, типу та розміру вузлів, симптомів та життєвих пріоритетів.
      </p>
      <p>
        Цифри та факти на цій сторінці — з авторитетних медичних джерел, актуальних на дату
        останнього оновлення. Якщо ви помітили неточність або застарілу інформацію — повідомте
        нам на{' '}
        <a href="mailto:editor@check-up.in.ua" className="text-[#005485] underline">
          editor@check-up.in.ua
        </a>
        . Ми оновлюємо контент за участі практикуючих лікарів.
      </p>
      <p className="mt-2 font-medium">
        Платформа check-up.in.ua не надає медичну допомогу. Ми допомагаємо орієнтуватись у
        варіантах та знаходити лікаря для консультації.
      </p>
    </div>
  );
}
