import Link from 'next/link';
import type { MdBlock, MdInline } from '@/lib/content/city-md';

// Рендер тексту з MD-файлу міста (lib/content/city-md.ts) у стилях сторінок типу 5 (хаб міста).
// Класи – ті самі, що в розділах хабу; нових кольорів немає.

const P = 'text-gray-700 leading-relaxed mt-4';
const LINK = 'text-[#005485] hover:underline';

function Inline({ parts }: { parts: MdInline[] }) {
  return (
    <>
      {parts.map((part, i) => {
        if (part.type === 'bold') return <strong key={i}>{part.text}</strong>;
        if (part.type === 'link') {
          return part.href.startsWith('/') ? (
            <Link key={i} href={part.href} className={LINK}>
              {part.text}
            </Link>
          ) : (
            <a key={i} href={part.href} className={LINK}>
              {part.text}
            </a>
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
            <p key={i} className={P}>
              <Inline parts={b.content} />
            </p>
          );
        }
        if (b.type === 'h3') {
          return (
            <h3 key={i} className="text-lg font-semibold text-[#0b1a24] mt-8">
              <Inline parts={b.content} />
            </h3>
          );
        }
        const ListTag = b.type === 'ol' ? 'ol' : 'ul';
        return (
          <ListTag key={i} className={`mt-4 space-y-2 pl-5 text-gray-700 leading-relaxed ${b.type === 'ol' ? 'list-decimal' : 'list-disc'}`}>
            {b.items.map((item, j) => (
              <li key={j}>
                <Inline parts={item} />
              </li>
            ))}
          </ListTag>
        );
      })}
    </>
  );
}
