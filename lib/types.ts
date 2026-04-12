export interface Clinic {
  id: string;
  slug: string;
  name: string;
  city: string;
  logo_url: string | null;
  accent_color: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ClinicBranch {
  id: string;
  clinic_id: string;
  name_ua: string;
  name_ru: string;
  address_ua: string;
  address_ru: string;
  metro_ua: string | null;
  metro_ru: string | null;
  schedule: {
    mon_fri: string;
    sat: string;
    sun: string;
  };
  lat: number | null;
  lng: number | null;
  sort_order: number;
}

export interface CheckupProgram {
  id: string;
  clinic_id: string;
  slug: string;
  name_ua: string;
  name_ru: string;
  gender: 'female' | 'male' | null;
  age_group: 'do-30' | '30-40' | '40-50' | '50+' | 'after-40' | 'any' | null;
  price_regular: number;
  price_discount: number;
  consultations_count: number | null;
  analyses_count: number | null;
  diagnostics_count: number | null;
  composition: Record<string, unknown>;
  is_specialized: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface Lead {
  id: string;
  city: string;
  clinic_slug: string | null;
  source_page: string;
  name: string;
  phone: string;
  preferred_contact: 'call' | 'telegram' | 'viber' | null;
  quiz_answers: {
    gender?: string;
    age?: string;
    tags?: string[];
  } | null;
  selected_program_slug: string | null;
  selected_branch_id: string | null;
  selected_date: string | null;
  consent_given: boolean;
  consent_given_at: string | null;
  status: 'new' | 'contacted' | 'booked' | 'completed' | 'cancelled';
  created_at: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

export type Locale = 'ua' | 'ru';
