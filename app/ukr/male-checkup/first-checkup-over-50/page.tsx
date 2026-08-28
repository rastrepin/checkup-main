import { Metadata } from 'next';
import ProgramPage from '@/components/program-page/ProgramPage';
import { maleFullFiftyPlus } from '@/lib/programs/data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `${maleFullFiftyPlus.title}`,
  description: maleFullFiftyPlus.description,
  robots: { index: false, follow: false }, // freeze 09.08.2026 (Ihor) — старий Program Page, поза Типом 5/5a
};

export default function Page() {
  return <ProgramPage program={maleFullFiftyPlus} basePath="male-checkup" />;
}
