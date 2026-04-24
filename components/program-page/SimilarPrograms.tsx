'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PlatformProgram {
  id: string;
  slug: string;
  name_ua: string;
  gender: string;
  age_group: string;
}

export default function SimilarPrograms({
  gender,
  ageGroup,
  currentSlug,
  city,
}: {
  gender: string;
  ageGroup: string;
  currentSlug: string;
  city?: string;
}) {
  const [programs, setPrograms] = useState<PlatformProgram[]>([]);

  useEffect(() => {
    const sb = supabase as any;
    sb.from('platform_programs')
      .select('id, slug, name_ua, gender, age_group')
      .eq('gender', gender)
      .eq('age_group', ageGroup)
      .eq('is_specialized', false)
      .neq('slug', currentSlug)
      .order('sort_order', { ascending: true })
      .then(({ data }: any) => {
        if (data) setPrograms(data);
      });
  }, [gender, ageGroup, currentSlug]);

  if (programs.length === 0) return null;

  const basePath = gender === 'female' ? 'female-checkup' : 'male-checkup';

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Суміжні програми</h2>
      <div className="flex flex-wrap gap-2">
        {programs.map(p => {
          const href = city
            ? `/ukr/${basePath}/${p.slug}/${city}`
            : `/ukr/${basePath}/${p.slug}`;
          return (
            <a
              key={p.id}
              href={href}
              className="px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:border-[#005485] hover:text-[#005485] transition-colors"
            >
              {p.name_ua}
            </a>
          );
        })}
      </div>
    </section>
  );
}
