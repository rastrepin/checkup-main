import type { MdBlock, MdInline } from '@/lib/content/city-md';

// Рендер тексту з MD-файлу міста (lib/content/city-md.ts) на хабі міста і сторінках статі (тип 5).
// Кольори – лише ролі з app/globals.css (ui-kit §3–4). Посилання в тексті – роль 7, підкреслені (ui-kit §6.8).
// Посилання – звичайні <a>: частину адрес (тематичні сторінки, сторінки клінік) віддає Tilda, тому перехід –
// повне завантаження сторінки (як у шапці, components/frame/Header.tsx).

export const MD_P = 'text-text-secondary leading-relaxed mt-4';
export const MD_LINK = 'text-link underline decoration-1 underline-offset-[3px] hover:decoration-2';

export function MdInlines({ parts, linkClass = MD_LINK }: { parts: MdInline[]; linkClass?: string }) {
  return (
    <>
      {parts.map((part, i) => {
        if (part.type === 'bold') return <strong key={i} className="font-semibold text-ink">{part.text}</strong>;
        if (part.type === 'link') {
          return (
            <a key={i} href={part.href} className={linkClass}>
              {part.text}
            </a>
          );
        }
        if (part.type === 'ref') {
          return (
            <sup key={i} className="whitespace-nowrap text-link">
              {' '}[
              {part.n.map((n, j) => (
                <span key={n}>
                  {j > 0 && ', '}
                  <a href={`#source-${n}`} className="hover:underline">
                    {n}
                  </a>
                </span>
              ))}
              ]
            </sup>
          );
        }
        return <span key={i}>{part.text}</span>;
      })}
    </>
  );
}

export default function CityMdBlocks({ blocks }: { blocks: MdBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.type === 'p') {
          return (
            <p key={i} className={MD_P}>
              <MdInlines parts={b.content} />
            </p>
          );
        }
        if (b.type === 'h3') {
          return (
            <h3 key={i} className="text-[20px] font-semibold leading-[1.3] text-ink mt-8">
              <MdInlines parts={b.content} />
            </h3>
          );
        }
        const ListTag = b.type === 'ol' ? 'ol' : 'ul';
        return (
          <ListTag
            key={i}
            className={`mt-4 space-y-2 pl-5 text-text-secondary leading-relaxed ${b.type === 'ol' ? 'list-decimal' : 'list-disc'}`}
          >
            {b.items.map((item, j) => (
              <li key={j}>
                <MdInlines parts={item} />
              </li>
            ))}
          </ListTag>
        );
      })}
    </>
  );
}
