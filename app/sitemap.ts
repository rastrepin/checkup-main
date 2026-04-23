import type { MetadataRoute } from 'next';

const BASE = 'https://check-up.in.ua';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    // ── Харків (UA) ──
    { url: `${BASE}/ukr/kharkiv`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/ukr/female-checkup/kharkiv`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/ukr/female-checkup/do-30-rokiv/kharkiv`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/ukr/female-checkup/30-40-rokiv/kharkiv`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/ukr/female-checkup/40-50-rokiv/kharkiv`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/ukr/female-checkup/vid-50-rokiv/kharkiv`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/ukr/male-checkup/kharkiv`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/ukr/male-checkup/do-30-rokiv/kharkiv`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/ukr/male-checkup/30-40-rokiv/kharkiv`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/ukr/male-checkup/40-50-rokiv/kharkiv`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/ukr/male-checkup/vid-50-rokiv/kharkiv`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },

    // ── Харків (RU) ──
    { url: `${BASE}/kharkov`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/female-checkup/kharkov`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/female-checkup/do-30-let/kharkov`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/female-checkup/30-40-let/kharkov`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/female-checkup/40-50-let/kharkov`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/female-checkup/ot-50-let/kharkov`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/male-checkup/kharkov`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/male-checkup/do-30-let/kharkov`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/male-checkup/30-40-let/kharkov`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/male-checkup/40-50-let/kharkov`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/male-checkup/ot-50-let/kharkov`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ];
}
