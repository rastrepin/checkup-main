// /turkey/acibadem – чернетка (?drafts=1), у lib/seo/approved-routes.json немає (TURKEY-MIGRATION.md v0.6, розділ 3).
import TurkeyClinicPage, { turkeyClinicMetadata } from '../_clinic-page';

export const revalidate = 3600;

export const metadata = turkeyClinicMetadata('acibadem');

export default function Page() {
  return <TurkeyClinicPage clinicKey="acibadem" />;
}
