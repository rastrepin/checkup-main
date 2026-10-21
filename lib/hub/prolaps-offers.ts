import { db } from '@/lib/supabase';
import { formatDoctorName, formatRegalia } from '@/lib/format/doctor';
import {
  BOOKING_NOTES,
  BOOKING_NOTE_DEFAULT,
  CITY_LABELS,
  CITY_ORDER,
  DOCTOR_CONTENT,
  HUB_CLINIC_SLUGS,
  METHODS,
  OFFER_SOURCES,
  type HubOffer,
} from '@/lib/hub/prolaps-content';

// Пропозиції хабу пролапсу з реєстру (Supabase): clinics, services, doctor_services, doctors,
// clinic_branches. Один набір запитів на рівні сторінки; область пропозицій і GEO-блок читають
// той самий результат. Посилання на сайт лікаря чи клініки будується з clinics.website –
// після переїзду лікаря на власний домен зміниться одне поле в реєстрі.

interface ClinicRow { id: string; slug: string; name: string; website: string | null; city: string | null }
interface ServiceRow { slug: string; clinic_id: string; branch_id: string | null; page_slug: string | null }
interface DoctorServiceRow { doctor_slug: string; service_slug: string; branch_id: string | null }
interface DoctorRow {
  slug: string;
  full_name: string;
  photo_url: string | null;
  regalia_line: string | null;
  experience_verb: string | null;
  experience_since: number | null;
  clinic_id: string | null;
}
interface BranchRow { id: string; name_ua: string | null; address_ua: string | null; city: string | null }

function yearsWord(n: number): string {
  const d10 = n % 10;
  const d100 = n % 100;
  if (d10 === 1 && d100 !== 11) return 'рік';
  if (d10 >= 2 && d10 <= 4 && (d100 < 12 || d100 > 14)) return 'роки';
  return 'років';
}

function experienceLine(d: DoctorRow): string | null {
  const fromContent = DOCTOR_CONTENT[d.slug]?.experience;
  if (fromContent) return fromContent;
  if (d.experience_verb && /\d{4}/.test(d.experience_verb)) return d.experience_verb.trim();
  if (d.experience_since) {
    const years = new Date().getFullYear() - d.experience_since;
    if (years > 0) return `${years} ${yearsWord(years)} досвіду`;
  }
  return null;
}

/** «ОН Клінік Харків» + «ОН Клінік (Левада)» → «ОН Клінік Харків Левада». */
function clinicLabel(clinic: ClinicRow, branch: BranchRow | undefined): string {
  const b = branch?.name_ua?.trim();
  if (!b) return clinic.name;
  if (b.startsWith(clinic.name) || !/^ОН Клінік/.test(clinic.name)) return b;
  const inParens = b.match(/\(([^)]+)\)/)?.[1];
  return inParens ? `${clinic.name} ${inParens}` : clinic.name;
}

/** Адреса без назви міста в кінці: місто виводиться окремо. */
function streetOnly(address: string | null | undefined, cityLabel: string): string {
  return (address ?? '').replace(new RegExp(`,\\s*${cityLabel}\\s*$`), '').trim();
}

export async function fetchProlapsOffers(): Promise<HubOffer[]> {
  try {
    const sb = db() as any;
    const serviceSlugs = [...new Set(OFFER_SOURCES.map((s) => s.serviceSlug))];

    const { data: clinicsData } = await sb
      .from('clinics')
      .select('id, slug, name, website, city')
      .in('slug', HUB_CLINIC_SLUGS)
      .eq('is_active', true);
    const clinics = (clinicsData ?? []) as ClinicRow[];
    if (clinics.length === 0) return [];
    const clinicIds = clinics.map((c) => c.id);

    const [{ data: servicesData }, { data: linksData }, { data: doctorsData }] = await Promise.all([
      sb
        .from('services')
        .select('slug, clinic_id, branch_id, page_slug')
        .in('slug', serviceSlugs)
        .in('clinic_id', clinicIds)
        .eq('is_active', true),
      sb
        .from('doctor_services')
        .select('doctor_slug, service_slug, branch_id')
        .in('service_slug', serviceSlugs)
        .eq('is_active', true),
      sb
        .from('doctors')
        .select('slug, full_name, photo_url, regalia_line, experience_verb, experience_since, clinic_id')
        .in('clinic_id', clinicIds)
        .eq('is_active', true),
    ]);
    const services = (servicesData ?? []) as ServiceRow[];
    const links = (linksData ?? []) as DoctorServiceRow[];
    const doctors = (doctorsData ?? []) as DoctorRow[];

    const branchIds = [...new Set(services.map((s) => s.branch_id).filter(Boolean))] as string[];
    const { data: branchesData } = branchIds.length
      ? await sb.from('clinic_branches').select('id, name_ua, address_ua, city').in('id', branchIds)
      : { data: [] };
    const branches = (branchesData ?? []) as BranchRow[];

    const offers = new Map<string, HubOffer>();

    for (const source of OFFER_SOURCES) {
      const clinic = clinics.find((c) => c.slug === source.clinicSlug);
      const method = METHODS.find((m) => m.key === source.method);
      if (!clinic || !clinic.website || !method) continue;
      const service = services.find((s) => s.slug === source.serviceSlug && s.clinic_id === clinic.id);
      if (!service) continue;
      const branch = branches.find((b) => b.id === service.branch_id);

      // Хто виконує: активні зв'язки doctor_services для цієї послуги і філії.
      // Якщо зв'язків немає взагалі, а в клініці один активний лікар (сайт лікаря), це він.
      const clinicDoctors = doctors.filter((d) => d.clinic_id === clinic.id);
      let performers = links
        .filter((l) => l.service_slug === service.slug && l.branch_id === service.branch_id)
        .map((l) => clinicDoctors.find((d) => d.slug === l.doctor_slug))
        .filter((d): d is DoctorRow => Boolean(d));
      if (performers.length === 0 && clinicDoctors.length === 1) performers = clinicDoctors;

      const cityKey = branch?.city ?? clinic.city ?? '';
      const cityLabel = CITY_LABELS[cityKey] ?? '';
      const site = clinic.website.replace(/\/+$/, '');
      const href = service.page_slug ? `${site}/${cityKey}/${service.page_slug}` : `${site}/${service.slug}`;

      for (const d of performers) {
        const id = `${d.slug}@${clinic.slug}`;
        let offer = offers.get(id);
        if (!offer) {
          const content = DOCTOR_CONTENT[d.slug] ?? {};
          const name = formatDoctorName(d.full_name);
          const label = clinicLabel(clinic, branch);
          const street = streetOnly(branch?.address_ua, cityLabel);
          offer = {
            id,
            doctorSlug: d.slug,
            fullName: name,
            level: formatRegalia(d.regalia_line),
            expertise: content.expertise ?? null,
            experience: experienceLine(d),
            clinicSlug: clinic.slug,
            clinicLabel: label,
            clinicName: content.clinicName ?? label,
            location: content.location ?? (street ? `${cityLabel}, ${street}` : cityLabel),
            // Фото – у кожній картці; без фото картка не публікується (Ігор 21.10, ui-kit §6.9, components-map §30.6).
            photo:
              d.photo_url
                ? { src: d.photo_url.startsWith('http') ? d.photo_url : `${site}${d.photo_url}`, alt: name }
                : null,
            // Профіль лікаря – у кожній картці (Ігор 21.10): доктор-бренд – головна сайту лікаря,
            // лікар клініки – сторінка лікаря на піддомені клініки ({site}/{місто}/doctors/{slug}).
            profileLink: { label: name, href: content.profileLink ? `${site}/` : `${site}/${cityKey}/doctors/${d.slug}` },
            cityKey,
            cityLabel,
            bookingNote: BOOKING_NOTES[clinic.slug] ?? BOOKING_NOTE_DEFAULT,
            methods: [],
          };
          offers.set(id, offer);
        }
        if (!offer.methods.some((m) => m.key === method.key)) {
          offer.methods.push({ key: method.key, short: method.short, linkLabel: source.linkLabel, href });
        }
      }
    }

    const cityRank = (k: string) => {
      const i = CITY_ORDER.indexOf(k);
      return i === -1 ? CITY_ORDER.length : i;
    };
    const withPhoto = [...offers.values()].filter((o) => {
      if (!o.photo) console.warn(`[hub-prolaps] картка ${o.doctorSlug} без фото (doctors.photo_url) – не публікується`);
      return Boolean(o.photo);
    });
    return withPhoto.sort(
      (a, b) => cityRank(a.cityKey) - cityRank(b.cityKey) || a.doctorSlug.localeCompare(b.doctorSlug),
    );
  } catch {
    return [];
  }
}
